"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { MapTypeSelector, type MapType } from "./map-type-selector"
import { generateMapUrl, getCadastralMapUrl } from "@/lib/utils"
import type { Asset } from "@/types/asset"

interface PostalCodeMapProps {
  asset?: Asset
  postalCode?: string
  cadastralReference?: string
  height?: string | number
}

export default function PostalCodeMap({ asset, postalCode, cadastralReference, height = "100%" }: PostalCodeMapProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mapUrl, setMapUrl] = useState("")
  const [mapType, setMapType] = useState<MapType>("standard")

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }

  // Determinar datos de ubicación
  const locationData = asset
    ? {
        postalCode: asset.codigo_postal_catastro || asset.zip_code || postalCode || "",
        cadastralRef: asset.cadastral_reference || cadastralReference || "",
        city: asset.municipio_catastro || asset.city || "",
        province: asset.provincia_catastro || asset.province || "",
        address:
          asset.tipo_via_catastro && asset.nombre_via_catastro
            ? `${asset.tipo_via_catastro} ${asset.nombre_via_catastro} ${asset.numero_portal_catastro || ""}`.trim()
            : "",
      }
    : {
        postalCode: postalCode || "",
        cadastralRef: cadastralReference || "",
        city: "",
        province: "",
        address: "",
      }

  const hasCadastralData = !!locationData.cadastralRef
  const hasLocationData = !!(locationData.postalCode || locationData.city || locationData.address)

  useEffect(() => {
    if (!hasLocationData) {
      setError(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)

    // Construir consulta de ubicación más precisa
    const locationParts = [
      locationData.address,
      locationData.city,
      locationData.province,
      locationData.postalCode,
      "España",
    ].filter(Boolean)

    const locationQuery = locationParts.join(", ")
    const url = generateMapUrl(locationQuery)
    setMapUrl(url)

    // Simular delay de carga
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [locationData.address, locationData.city, locationData.province, locationData.postalCode, hasLocationData])

  if (error || !hasLocationData) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <div className="text-center">
          <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
          {asset && <p className="text-sm text-muted-foreground mt-1">Verifique los campos de dirección catastral</p>}
        </div>
      </div>
    )
  }

  if (loading) {
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

  // Determinar qué mapa mostrar
  const showCadastralMap = user?.role === "admin" && mapType === "cadastral" && hasCadastralData

  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      <MapTypeSelector onChange={setMapType} currentType={mapType} hasCadastralData={hasCadastralData} />

      {showCadastralMap ? (
        <iframe
          src={getCadastralMapUrl(locationData.cadastralRef)}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title={`Mapa catastral - ${locationData.cadastralRef}`}
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
          title={`Mapa de ubicación - ${locationData.city || locationData.postalCode}`}
          loading="lazy"
          onError={() => setError(true)}
        />
      )}

      {/* Información de ubicación */}
      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-gray-700 max-w-[200px] truncate">
        {locationData.address && <div className="font-medium">{locationData.address}</div>}
        <div>
          {locationData.city && `${locationData.city}, `}
          {locationData.province}
          {locationData.postalCode && ` (${locationData.postalCode})`}
        </div>
      </div>
    </div>
  )
}
