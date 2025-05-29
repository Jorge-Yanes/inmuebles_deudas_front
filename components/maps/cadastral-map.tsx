"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import { MapTypeSelector, type MapType } from "./map-type-selector"
import { getCadastralMapUrl, getLocationForMap } from "@/lib/utils"
import type { Asset } from "@/types/asset"
import GoogleMapBase from "./google-map-base"

interface CadastralMapProps {
  asset?: Asset
  reference?: string
  postalCode?: string
  height?: string | number
}

export default function CadastralMap({ asset, reference, postalCode, height = "100%" }: CadastralMapProps) {
  const { user } = useAuth()
  const [mapType, setMapType] = useState<MapType>("cadastral")

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }

  // Obtener datos de ubicación del asset o parámetros
  const locationData = useMemo(() => {
    if (asset) {
      return getLocationForMap(asset)
    }
    return {
      address: "",
      postalCode: postalCode || "",
      city: "",
      province: "",
      fullLocation: postalCode ? `${postalCode}, España` : "",
    }
  }, [asset, postalCode])

  const cadastralRef = asset?.cadastral_reference || reference || ""
  const hasCadastralData = !!cadastralRef
  const hasLocationData = !!(locationData.fullLocation || locationData.postalCode)

  if (!hasCadastralData && !hasLocationData) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <div className="text-center">
          <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
          <p className="text-sm text-muted-foreground mt-1">Se requiere referencia catastral o código postal</p>
        </div>
      </div>
    )
  }

  // Mostrar mapa estándar para usuarios no admin o cuando se selecciona
  if (mapType === "standard" && hasLocationData) {
    return (
      <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
        <MapTypeSelector onChange={setMapType} currentType={mapType} hasCadastralData={hasCadastralData} />

        <GoogleMapBase assets={asset ? [asset] : []} height="100%" showMarkers={true} className="w-full h-full" />
      </div>
    )
  }

  // Mapa catastral por defecto para admins
  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      <MapTypeSelector onChange={setMapType} currentType={mapType} hasCadastralData={hasCadastralData} />

      {hasCadastralData ? (
        <>
          <iframe
            src={getCadastralMapUrl(cadastralRef)}
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            allowFullScreen
            aria-hidden="false"
            tabIndex={0}
            title={`Mapa catastral - ${cadastralRef}`}
            loading="lazy"
          />

          {/* Información catastral */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-700">
            <div className="font-medium">Ref. Catastral</div>
            <div className="font-mono">{cadastralRef}</div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-muted">
          <div className="text-center">
            <p className="text-muted-foreground">Referencia catastral no disponible</p>
            {cadastralRef && <p className="text-sm text-muted-foreground mt-1 font-mono">{cadastralRef}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
