"use client"

import type React from "react"
import { useFieldPermissions } from "@/context/field-permissions-context"
import type { Asset } from "@/types/asset"

interface ConditionalFieldProps {
  field: keyof Asset
  children: React.ReactNode
  fallback?: React.ReactNode
  editOnly?: boolean
}

export function ConditionalField({ field, children, fallback = null, editOnly = false }: ConditionalFieldProps) {
  const { hasViewPermission, hasEditPermission } = useFieldPermissions()

  if (editOnly) {
    return hasEditPermission(field) ? <>{children}</> : <>{fallback}</>
  }

  return hasViewPermission(field) ? <>{children}</> : <>{fallback}</>
}
