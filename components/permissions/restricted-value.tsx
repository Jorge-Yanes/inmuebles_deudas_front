"use client"

import type React from "react"
import { useFieldPermissions } from "@/context/field-permissions-context"
import type { Asset } from "@/types/asset"
import { getFieldMetadata } from "@/lib/permissions/field-permissions-service"
import { LockIcon } from "lucide-react"

interface RestrictedValueProps {
  field: keyof Asset
  value: React.ReactNode
  fallback?: React.ReactNode
}

export function RestrictedValue({ field, value, fallback }: RestrictedValueProps) {
  const { hasViewPermission } = useFieldPermissions()
  const metadata = getFieldMetadata(field)

  if (hasViewPermission(field)) {
    return <>{value}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <span className="flex items-center text-muted-foreground text-sm italic">
      <LockIcon className="h-3 w-3 mr-1" />
      {metadata?.sensitive ? "Información restringida" : "No disponible"}
    </span>
  )
}
