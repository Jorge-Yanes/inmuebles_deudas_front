"use client"

import type React from "react"
import { useFieldPermissions } from "@/context/field-permissions-context"

interface ConditionalFieldProps {
  fieldName: string
  children: React.ReactNode
  fallback?: React.ReactNode
  requireEdit?: boolean
}

export function ConditionalField({ fieldName, children, fallback = null, requireEdit = false }: ConditionalFieldProps) {
  const { hasViewPermission, hasEditPermission } = useFieldPermissions()

  const hasPermission = requireEdit ? hasEditPermission(fieldName) : hasViewPermission(fieldName)

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
