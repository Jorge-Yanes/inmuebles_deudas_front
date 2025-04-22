"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { auth } from "@/lib/firebase"
import { getCurrentUser, logoutUser } from "@/lib/auth"
import type { User } from "@/types/user"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  checkPermission: (permission: keyof User["permissions"]) => boolean
  hasAccess: (assetType?: string, province?: string, portfolio?: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  checkPermission: () => false,
  hasAccess: () => false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true)
      try {
        if (firebaseUser) {
          const userData = await getCurrentUser()
          setUser(userData)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error in auth state change:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    // Skip redirection during initial loading
    if (loading) return

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/register", "/forgot-password"]
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    // Admin-only routes
    const adminRoutes = ["/admin"]
    const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

    // Client-only routes
    const clientRoutes = ["/assets", "/search", "/analytics", "/settings"]
    const isClientRoute = clientRoutes.some((route) => pathname.startsWith(route))

    // Redirect unauthenticated users to login
    if (!user && !isPublicRoute) {
      router.push("/login")
      return
    }

    // Redirect authenticated users away from public routes
    if (user && isPublicRoute) {
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/")
      }
      return
    }

    // Redirect non-admin users away from admin routes
    if (user && user.role !== "admin" && isAdminRoute) {
      router.push("/")
      return
    }

    // Redirect pending users to pending page
    if (user && user.role === "pending" && pathname !== "/pending") {
      router.push("/pending")
      return
    }
  }, [loading, user, pathname, router])

  const handleLogout = async () => {
    await logoutUser()
    setUser(null)
    router.push("/login")
  }

  // Check if user has a specific permission
  const checkPermission = (permission: keyof User["permissions"]) => {
    if (!user) return false
    return user.permissions[permission] === true
  }

  // Check if user has access to a specific asset based on type, province, portfolio
  const hasAccess = (assetType?: string, province?: string, portfolio?: string) => {
    if (!user) return false

    // Admins have access to everything
    if (user.role === "admin") return true

    // Check asset type access if specified
    if (assetType && user.allowedAssetTypes && user.allowedAssetTypes.length > 0) {
      if (!user.allowedAssetTypes.includes(assetType)) return false
    }

    // Check province access if specified
    if (province && user.allowedProvinces && user.allowedProvinces.length > 0) {
      if (!user.allowedProvinces.includes(province)) return false
    }

    // Check portfolio access if specified
    if (portfolio && user.allowedPortfolios && user.allowedPortfolios.length > 0) {
      if (!user.allowedPortfolios.includes(portfolio)) return false
    }

    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout: handleLogout,
        checkPermission,
        hasAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
