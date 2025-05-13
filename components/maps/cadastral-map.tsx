"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { MapTypeSelector, type MapType } from "./map-type-selector"

interface CadastralMapProps {
  reference: string
  postalCode?: string
  height?: string | number
}

export default function CadastralMap({ reference, postalCode, height = "100%" }: CadastralMapProps) {
  const { user } = useAuth()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mapUrl, setMapUrl] = useState("")
  const [mapType, setMapType] = useState<MapType>("cadastral")

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }
  const hasCadastralData = !!reference

  useEffect(() => {
    if (!postalCode && mapType === "standard") {
      setError(true)
      setLoading(false)
      return
    }

    if (mapType === "standard" && postalCode) {
      setLoading(true)
      setError(false)

      // For OpenStreetMap, we'll use a direct iframe to their map
      const encodedQuery = encodeURIComponent(`${postalCode}, Spain`)
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=-10.0,35.0,5.0,44.0&layer=mapnik&marker=40.416775,-3.70379&query=${encodedQuery}`

      setMapUrl(url)

      // Simulate loading delay
      const timer = setTimeout(() => {
        setLoading(false)
      }, 500)

      return () => clearTimeout(timer)
    }

    setLoading(false)
  }, [postalCode, mapType])

  // For non-admin users, always show standard map if postal code is available
  useEffect(() => {
    if (user?.role !== "admin" && postalCode) {
      setMapType("standard")
    }
  }, [user, postalCode])

  if (!reference && !postalCode) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
      </div>
    )
  }

  if (loading && mapType === "standard") {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }

  // For non-admin users or when standard map is selected
  if (mapType === "standard" && postalCode) {
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
          title={`Mapa de ${postalCode}`}
          loading="lazy"
          onError={() => setError(true)}
        />
      </div>
    )
  }

  // Default to cadastral map for admins or when no postal code is available
  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      <MapTypeSelector onChange={setMapType} currentType={mapType} hasCadastralData={hasCadastralData} />

      {!error ? (
        <iframe
          src={`https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${reference}`}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          allowFullScreen
          aria-hidden="false"
          tabIndex={0}
          title={`Mapa catastral de referencia ${reference}`}
          loading="lazy"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex items-center justify-center h-full w-full bg-muted">
          <p className="text-muted-foreground">No se pudo cargar el mapa catastral</p>
        </div>
      )}
    </div>
  )
}
