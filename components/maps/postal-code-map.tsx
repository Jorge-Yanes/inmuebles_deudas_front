"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import { MapTypeSelector, type MapType } from "./map-type-selector"
import { getCadastralMapUrl, getLocationForMap } from "@/lib/utils"
import type { Asset } from "@/types/asset"
import GoogleMapBase from "./google-map-base"

interface PostalCodeMapProps {
  asset?: Asset
  postalCode?: string
  cadastralReference?: string
  height?: string | number
}

export default function PostalCodeMap({ asset, postalCode, cadastralReference, height = "100%" }: PostalCodeMapProps) {
  const { user } = useAuth()
  const [mapType, setMapType] = useState<MapType>("standard")

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }

  // Determinar datos de ubicación
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

  const cadastralRef = asset?.cadastral_reference || cadastralReference || ""
  const hasCadastralData = !!cadastralRef
  const hasLocationData = !!(locationData.fullLocation || locationData.postalCode)

  // Determinar si mostrar mapa catastral
  const showCadastralMap = user?.role === "admin" && mapType === "cadastral" && hasCadastralData

  if (!hasLocationData && !hasCadastralData) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <div className="text-center">
          <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
          {asset && <p className="text-sm text-muted-foreground mt-1">Verifique los campos de dirección catastral</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      <MapTypeSelector onChange={setMapType} currentType={mapType} hasCadastralData={hasCadastralData} />

      {showCadastralMap ? (
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
        <GoogleMapBase assets={asset ? [asset] : []} height="100%" showMarkers={true} className="w-full h-full" />
      )}
    </div>
  )
}
