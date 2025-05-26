"use client"

import { useEffect, useState, useMemo } from "react"
import { useFieldPermissions } from "@/context/field-permissions-context"
import { useAuth } from "@/context/auth-context"
import type { Asset } from "@/types/asset"
import { MapTypeSelector, type MapType } from "./map-type-selector"
import { generateMapUrl, getCadastralMapUrl, getLocationForMap } from "@/lib/utils"

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
  const [error, setError] = useState(false)

  // Crear estilo estable
  const mapStyle = useMemo(() => {
    return typeof height === "number" ? { height: `${height}px` } : { height }
  }, [height])

  // Combinar y filtrar activos con ubicación
  const assetsWithLocation = useMemo(() => {
    const combinedAssets = asset ? [asset, ...assets] : [...assets]
    return combinedAssets.filter((a) => {
      return (
        a?.codigo_postal_catastro ||
        a?.municipio_catastro ||
        a?.provincia_catastro ||
        a?.zip_code ||
        a?.cadastral_reference
      )
    })
  }, [asset, assets])

  // Verificar datos catastrales
  const hasCadastralData = useMemo(() => {
    return assetsWithLocation.some((a) => a?.cadastral_reference)
  }, [assetsWithLocation])

  // Verificar permisos catastrales
  const hasCadastralPermission = useMemo(() => {
    return hasViewPermission("cadastral_reference")
  }, [hasViewPermission])

  // Obtener datos de ubicación del primer activo
  const primaryLocationData = useMemo(() => {
    if (assetsWithLocation.length === 0) return null
    return getLocationForMap(assetsWithLocation[0])
  }, [assetsWithLocation])

  // Generar URL del mapa
  const mapUrl = useMemo(() => {
    if (!primaryLocationData?.fullLocation) return ""
    return generateMapUrl(primaryLocationData.fullLocation)
  }, [primaryLocationData])

  // Determinar si mostrar mapa catastral
  const showCadastralMap = useMemo(() => {
    return user?.role === "admin" && mapType === "cadastral" && hasCadastralPermission && hasCadastralData
  }, [user?.role, mapType, hasCadastralPermission, hasCadastralData])

  // Encontrar primer activo con referencia catastral
  const firstAssetWithCadastral = useMemo(() => {
    if (!showCadastralMap) return null
    return assetsWithLocation.find((a) => a?.cadastral_reference) || null
  }, [showCadastralMap, assetsWithLocation])

  // Efecto de carga simulada
  useEffect(() => {
    let mounted = true

    setLoading(true)
    setError(false)

    const timer = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 500)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [mapType, primaryLocationData])

  // Manejar estado vacío
  if (assetsWithLocation.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <div className="text-center">
          <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
          <p className="text-sm text-muted-foreground mt-1">Verifique los campos de dirección catastral</p>
        </div>
      </div>
    )
  }

  // Manejar estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <div className="text-center">
          <p className="text-muted-foreground">Cargando mapa...</p>
          {primaryLocationData && (
            <p className="text-sm text-muted-foreground mt-1">
              {primaryLocationData.city && `${primaryLocationData.city}, ${primaryLocationData.province}`}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Renderizar el mapa
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
        <>
          <iframe
            src={getCadastralMapUrl(firstAssetWithCadastral.cadastral_reference!)}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            aria-hidden="false"
            tabIndex={0}
            title="Mapa catastral"
            loading="lazy"
            onError={() => setError(true)}
          />

          {/* Información catastral */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-700">
            <div className="font-medium">Ref. Catastral</div>
            <div className="font-mono">{firstAssetWithCadastral.cadastral_reference}</div>
          </div>
        </>
      ) : (
        <>
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

          {/* Información de ubicación */}
          {primaryLocationData && (
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-700 max-w-[250px]">
              {primaryLocationData.address && <div className="font-medium truncate">{primaryLocationData.address}</div>}
              <div className="truncate">
                {primaryLocationData.city && `${primaryLocationData.city}, `}
                {primaryLocationData.province}
                {primaryLocationData.postalCode && ` (${primaryLocationData.postalCode})`}
              </div>
              {assetsWithLocation.length > 1 && (
                <div className="text-blue-600 font-medium">+{assetsWithLocation.length - 1} más</div>
              )}
            </div>
          )}
        </>
      )}

      {/* Indicador de error */}
      {error && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
          Error al cargar mapa
        </div>
      )}
    </div>
  )
}
