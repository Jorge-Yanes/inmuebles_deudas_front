"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

import { getCurrentUser, logout } from "@/lib/auth"
import type { User } from "@/types/user"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    // Redirect unauthenticated users to login page
    if (!loading && !user && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
      router.push("/login")
    }

    // Redirect authenticated users away from login/register pages
    if (!loading && user && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
      router.push("/")
    }
  }, [loading, user, pathname, router])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
