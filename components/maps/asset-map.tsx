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
  const [allAssets, setAllAssets] = useState<Asset[]>([])
  const [mapUrl, setMapUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mapType, setMapType] = useState<MapType>("standard")

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }

  // Combine assets only when props change
  useEffect(() => {
    const combinedAssets = asset ? [asset, ...assets] : [...assets]
    setAllAssets(combinedAssets)
  }, [asset, assets])

  // Memoize filtered assets to prevent recalculation on every render
  const assetsWithLocation = useMemo(() => {
    return allAssets.filter((a) => a.zip_code || a.cadastral_reference)
  }, [allAssets])

  // Memoize cadastral data check
  const hasCadastralData = useMemo(() => {
    return assetsWithLocation.some((a) => a.cadastral_reference)
  }, [assetsWithLocation])

  // Memoize cadastral permission check
  const hasCadastralPermission = useMemo(() => {
    return hasViewPermission("cadastral_reference")
  }, [hasViewPermission])

  // Set up the map URL when assets change
  useEffect(() => {
    if (assetsWithLocation.length === 0) {
      setError(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)

    // For simplicity, we'll just use the first asset's location for the map
    const firstAsset = assetsWithLocation[0]
    const location = firstAsset.zip_code || "Spain"

    // Create a map URL for OpenStreetMap
    const encodedQuery = encodeURIComponent(`${location}, Spain`)
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=-10.0,35.0,5.0,44.0&layer=mapnik&marker=40.416775,-3.70379&query=${encodedQuery}`

    setMapUrl(url)

    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [assetsWithLocation])

  // Early return for error or loading states
  if (assetsWithLocation.length === 0 || error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }

  // Determine which map to show based on user role, permissions, and selected map type
  const showCadastralMap =
    user?.role === "admin" && mapType === "cadastral" && hasCadastralPermission && hasCadastralData

  // Find the first asset with cadastral reference if we're showing cadastral map
  const firstAssetWithCadastral = showCadastralMap ? assetsWithLocation.find((a) => a.cadastral_reference) : null

  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      <MapTypeSelector
        onChange={setMapType}
        currentType={mapType}
        hasCadastralData={hasCadastralData && hasCadastralPermission}
      />

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
          title={`Mapa catastral`}
          loading="lazy"
          onError={() => setError(true)}
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
          onError={() => setError(true)}
        />
      )}
    </div>
  )
}
