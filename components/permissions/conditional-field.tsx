"use client"

import type { ReactNode } from "react"
import { useFieldPermissions } from "@/context/field-permissions-context"

interface ConditionalFieldProps {
  fieldName: string
  children: ReactNode
  fallback?: ReactNode
}

export function ConditionalField({ fieldName, children, fallback }: ConditionalFieldProps) {
  const { hasViewPermission } = useFieldPermissions()
  const hasPermission = hasViewPermission(fieldName)

  if (hasPermission) {
    return <>{children}</>
  }

  return <>{fallback || null}</>
}
