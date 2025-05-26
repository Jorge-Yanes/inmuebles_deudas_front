"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { MapTypeSelector, type MapType } from "./map-type-selector"
import { generateMapUrl, getCadastralMapUrl, getLocationForMap } from "@/lib/utils"
import type { Asset } from "@/types/asset"

interface CadastralMapProps {
  asset?: Asset
  reference?: string
  postalCode?: string
  height?: string | number
}

export default function CadastralMap({ asset, reference, postalCode, height = "100%" }: CadastralMapProps) {
  const { user } = useAuth()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mapUrl, setMapUrl] = useState("")
  const [mapType, setMapType] = useState<MapType>("cadastral")

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }

  // Obtener datos de ubicación del asset o parámetros
  const locationData = asset
    ? getLocationForMap(asset)
    : {
        address: "",
        postalCode: postalCode || "",
        city: "",
        province: "",
        fullLocation: postalCode ? `${postalCode}, España` : "",
      }

  const cadastralRef = asset?.cadastral_reference || reference || ""
  const hasCadastralData = !!cadastralRef
  const hasLocationData = !!(locationData.fullLocation || locationData.postalCode)

  useEffect(() => {
    if (mapType === "standard" && !hasLocationData) {
      setError(true)
      setLoading(false)
      return
    }

    if (mapType === "standard" && hasLocationData) {
      setLoading(true)
      setError(false)

      const url = generateMapUrl(locationData.fullLocation)
      setMapUrl(url)

      const timer = setTimeout(() => {
        setLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    }

    setLoading(false)
  }, [mapType, locationData.fullLocation, hasLocationData])

  // Para usuarios no admin, mostrar mapa estándar si hay datos de ubicación
  useEffect(() => {
    if (user?.role !== "admin" && hasLocationData) {
      setMapType("standard")
    }
  }, [user, hasLocationData])

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

  if (loading && mapType === "standard") {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <div className="text-center">
          <p className="text-muted-foreground">Cargando mapa...</p>
          <p className="text-sm text-muted-foreground mt-1">
            {locationData.city && `${locationData.city}, ${locationData.province}`}
          </p>
        </div>
      </div>
    )
  }

  // Mostrar mapa estándar para usuarios no admin o cuando se selecciona
  if (mapType === "standard" && hasLocationData) {
    return (
      <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
        <MapTypeSelector onChange={setMapType} currentType={mapType} hasCadastralData={hasCadastralData} />

        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title={`Mapa de ubicación - ${locationData.city || locationData.postalCode}`}
          loading="lazy"
          onError={() => setError(true)}
        />

        {/* Información de ubicación */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-700 max-w-[250px]">
          {locationData.address && <div className="font-medium truncate">{locationData.address}</div>}
          <div className="truncate">
            {locationData.city && `${locationData.city}, `}
            {locationData.province}
            {locationData.postalCode && ` (${locationData.postalCode})`}
          </div>
        </div>
      </div>
    )
  }

  // Mapa catastral por defecto para admins
  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      <MapTypeSelector onChange={setMapType} currentType={mapType} hasCadastralData={hasCadastralData} />

      {!error && hasCadastralData ? (
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
            onError={() => setError(true)}
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
            <p className="text-muted-foreground">
              {error ? "No se pudo cargar el mapa catastral" : "Referencia catastral no disponible"}
            </p>
            {cadastralRef && <p className="text-sm text-muted-foreground mt-1 font-mono">{cadastralRef}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
