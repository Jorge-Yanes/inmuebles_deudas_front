"use client"

import { useFieldPermissions } from "@/context/field-permissions-context"
import CadastralMap from "./cadastral-map"
import PostalCodeMap from "./postal-code-map"
import type { Asset } from "@/types/asset"

interface AssetMapProps {
  asset: Asset
  height?: string | number
}

export default function AssetMap({ asset, height = "100%" }: AssetMapProps) {
  const { hasViewPermission } = useFieldPermissions()

  const hasCadastralPermission = hasViewPermission("cadastral_reference")
  const hasCadastralReference = !!asset.cadastral_reference

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }

  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      {hasCadastralPermission && hasCadastralReference ? (
        <CadastralMap reference={asset.cadastral_reference} />
      ) : (
        <PostalCodeMap postalCode={asset.zip_code || ""} />
      )}
    </div>
  )
}
