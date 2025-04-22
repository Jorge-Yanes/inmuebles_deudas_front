"use client"

import type React from "react"
import { useFieldPermissions } from "@/context/field-permissions-context"
import { LockIcon } from "lucide-react"

interface RestrictedValueProps {
  fieldName: string
  value: React.ReactNode
  fallback?: React.ReactNode
}

export function RestrictedValue({
  fieldName,
  value,
  fallback = (
    <span className="text-muted-foreground italic flex items-center gap-1">
      <LockIcon className="h-3 w-3" /> Acceso restringido
    </span>
  ),
}: RestrictedValueProps) {
  const { hasViewPermission } = useFieldPermissions()

  if (!hasViewPermission(fieldName)) {
    return <>{fallback}</>
  }

  return <>{value}</>
}
