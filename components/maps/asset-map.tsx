"use client"

import { useEffect, useState, useMemo } from "react"
import { useFieldPermissions } from "@/context/field-permissions-context"
import { useAuth } from "@/context/auth-context"
import type { Asset } from "@/types/asset"
import { MapTypeSelector, type MapType } from "./map-type-selector"

interface AssetMapProps {
  asset?: Asset
  assets?: Asset[]
  height?: string | number
}

export default function AssetMap({ asset, assets = [], height = "100%" }: AssetMapProps) {
  const { hasViewPermission } = useFieldPermissions()
  const { user } = useAuth()
  const [mapType, setMapType] = useState<MapType>("standard")
  const [loading, setLoading] = useState(false)

  // Create stable style object
  const mapStyle = useMemo(() => {
    return typeof height === "number" ? { height: `${height}px` } : { height }
  }, [height])

  // Combine and filter assets in one step
  const assetsWithLocation = useMemo(() => {
    const combinedAssets = asset ? [asset, ...assets] : [...assets]
    return combinedAssets.filter((a) => a?.zip_code || a?.cadastral_reference)
  }, [asset, assets])

  // Check for cadastral data
  const hasCadastralData = useMemo(() => {
    return assetsWithLocation.some((a) => a?.cadastral_reference)
  }, [assetsWithLocation])

  // Check for cadastral permission
  const hasCadastralPermission = useMemo(() => {
    return hasViewPermission("cadastral_reference")
  }, [hasViewPermission])

  // Determine map URL
  const mapUrl = useMemo(() => {
    if (assetsWithLocation.length === 0) return ""

    const firstAsset = assetsWithLocation[0]
    const location = firstAsset.zip_code || "Spain"
    const encodedQuery = encodeURIComponent(`${location}, Spain`)
    return `https://www.openstreetmap.org/export/embed.html?bbox=-10.0,35.0,5.0,44.0&layer=mapnik&marker=40.416775,-3.70379&query=${encodedQuery}`
  }, [assetsWithLocation])

  // Determine if we should show cadastral map
  const showCadastralMap = useMemo(() => {
    return user?.role === "admin" && mapType === "cadastral" && hasCadastralPermission && hasCadastralData
  }, [user?.role, mapType, hasCadastralPermission, hasCadastralData])

  // Find first asset with cadastral reference
  const firstAssetWithCadastral = useMemo(() => {
    if (!showCadastralMap) return null
    return assetsWithLocation.find((a) => a?.cadastral_reference) || null
  }, [showCadastralMap, assetsWithLocation])

  // Simulate loading effect once on mount
  useEffect(() => {
    let mounted = true

    setLoading(true)
    const timer = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 500)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  // Handle empty state
  if (assetsWithLocation.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
      </div>
    )
  }

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }

  // Render the map
  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      {user?.role === "admin" && (
        <MapTypeSelector
          onChange={setMapType}
          currentType={mapType}
          hasCadastralData={hasCadastralData && hasCadastralPermission}
        />
      )}

      {showCadastralMap && firstAssetWithCadastral ? (
        <iframe
          src={`https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${firstAssetWithCadastral.cadastral_reference}`}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title="Mapa catastral"
          loading="lazy"
        />
      ) : (
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title="Mapa de ubicación"
          loading="lazy"
        />
      )}
    </div>
  )
}
