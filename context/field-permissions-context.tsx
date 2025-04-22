"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type FieldPermissions, DEFAULT_FIELD_PERMISSIONS } from "@/types/field-permissions"
import { getFieldPermissionsForRole } from "@/lib/permissions/field-permissions-service"
import { useAuth } from "@/context/auth-context"
import type { User } from "@/types/user"

interface FieldPermissionsContextType {
  fieldPermissions: FieldPermissions
  loading: boolean
  hasViewPermission: (fieldName: string) => boolean
  hasEditPermission: (fieldName: string) => boolean
  refreshPermissions: () => Promise<void>
}

const FieldPermissionsContext = createContext<FieldPermissionsContextType>({
  fieldPermissions: {},
  loading: true,
  hasViewPermission: () => false,
  hasEditPermission: () => false,
  refreshPermissions: async () => {},
})

export const useFieldPermissions = () => useContext(FieldPermissionsContext)

export function FieldPermissionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [fieldPermissions, setFieldPermissions] = useState<FieldPermissions>({})
  const [loading, setLoading] = useState(true)

  const loadPermissions = async (user: User | null) => {
    setLoading(true)
    try {
      if (user) {
        const permissions = await getFieldPermissionsForRole(user.role)
        setFieldPermissions(permissions)
      } else {
        setFieldPermissions({})
      }
    } catch (error) {
      console.error("Error loading field permissions:", error)
      // Fall back to default permissions
      setFieldPermissions(user ? DEFAULT_FIELD_PERMISSIONS[user.role] || {} : {})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPermissions(user)
  }, [user])

  const hasViewPermission = (fieldName: string): boolean => {
    if (!user) return false

    // Admins can view all fields
    if (user.role === "admin") return true

    const permission = fieldPermissions[fieldName]
    return permission === "view" || permission === "edit"
  }

  const hasEditPermission = (fieldName: string): boolean => {
    if (!user) return false

    // Admins can edit all fields
    if (user.role === "admin") return true

    return fieldPermissions[fieldName] === "edit"
  }

  const refreshPermissions = async (): Promise<void> => {
    await loadPermissions(user)
  }

  return (
    <FieldPermissionsContext.Provider
      value={{
        fieldPermissions,
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
