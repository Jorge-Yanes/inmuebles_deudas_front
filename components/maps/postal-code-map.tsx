"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { MapTypeSelector, type MapType } from "./map-type-selector"

interface PostalCodeMapProps {
  postalCode: string
  cadastralReference?: string
  height?: string | number
}

export default function PostalCodeMap({ postalCode, cadastralReference, height = "100%" }: PostalCodeMapProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [mapUrl, setMapUrl] = useState("")
  const [mapType, setMapType] = useState<MapType>("standard")

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }
  const hasCadastralData = !!cadastralReference

  useEffect(() => {
    if (!postalCode) {
      setError(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(false)

    // For OpenStreetMap, we'll use a direct iframe to their map
    // We'll encode the postal code for Spain
    const encodedQuery = encodeURIComponent(`${postalCode}, Spain`)
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=-10.0,35.0,5.0,44.0&layer=mapnik&marker=40.416775,-3.70379&query=${encodedQuery}`

    setMapUrl(url)

    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [postalCode])

  if (error || !postalCode) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted" style={mapStyle}>
        <p className="text-muted-foreground">No hay código postal disponible</p>
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

  // Determine which map to show based on user role and selected map type
  const showCadastralMap = user?.role === "admin" && mapType === "cadastral" && hasCadastralData

  return (
    <div className="relative w-full overflow-hidden rounded-md" style={mapStyle}>
      <MapTypeSelector onChange={setMapType} currentType={mapType} hasCadastralData={hasCadastralData} />

      {showCadastralMap ? (
        <iframe
          src={`https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${cadastralReference}`}
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
          title={`Mapa de ${postalCode}`}
          loading="lazy"
          onError={() => setError(true)}
        />
      )}
    </div>
  )
}
