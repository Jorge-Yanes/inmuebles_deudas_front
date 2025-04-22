"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { FieldPermission } from "@/types/field-permissions"
import { getFieldPermissionsByRole } from "@/lib/permissions/field-permissions-service"
import { useAuth } from "@/context/auth-context"
import type { Asset } from "@/types/asset"

interface FieldPermissionsContextType {
  permissions: FieldPermission[]
  loading: boolean
  hasViewPermission: (field: keyof Asset) => boolean
  hasEditPermission: (field: keyof Asset) => boolean
  refreshPermissions: () => Promise<void>
}

const FieldPermissionsContext = createContext<FieldPermissionsContextType>({
  permissions: [],
  loading: true,
  hasViewPermission: () => false,
  hasEditPermission: () => false,
  refreshPermissions: async () => {},
})

export function useFieldPermissions() {
  return useContext(FieldPermissionsContext)
}

export function FieldPermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<FieldPermission[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPermissions = async () => {
    if (!user) {
      setPermissions([])
      setLoading(false)
      return
    }

    try {
      const rolePermissions = await getFieldPermissionsByRole(user.role)
      setPermissions(rolePermissions)
    } catch (error) {
      console.error("Error fetching field permissions:", error)
      setPermissions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPermissions()
  }, [user])

  const hasViewPermission = (field: keyof Asset) => {
    if (!user) return false

    // Admin has view access to all fields
    if (user.role === "admin") return true

    const permission = permissions.find((p) => p.field === field)
    return permission ? permission.level === "view" || permission.level === "edit" : false
  }

  const hasEditPermission = (field: keyof Asset) => {
    if (!user) return false

    // Admin has edit access to all fields
    if (user.role === "admin") return true

    const permission = permissions.find((p) => p.field === field)
    return permission ? permission.level === "edit" : false
  }

  const refreshPermissions = async () => {
    setLoading(true)
    await fetchPermissions()
  }

  return (
    <FieldPermissionsContext.Provider
      value={{
        permissions,
        loading,
        hasViewPermission,
        hasEditPermission,
        refreshPermissions,
      }}
    >
      {children}
    </FieldPermissionsContext.Provider>
  )
}
