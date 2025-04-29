"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Loading component for the map
function MapLoading() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-muted">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  )
}

// Dynamically import the map component with no SSR
const MapWithNoSSR = dynamic(() => import("./map-component").then((mod) => mod.MapComponent), {
  ssr: false,
  loading: () => <MapLoading />,
})

export default function PostalCodeMap({ postalCode }: { postalCode: string }) {
  const [geoData, setGeoData] = useState<any>(null)
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(false)

        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=Spain&format=geojson&polygon_geojson=1`,
        )

        if (!res.ok) {
          throw new Error(`Error fetching map data: ${res.status}`)
        }

        const data = await res.json()

        if (data.features && data.features.length > 0) {
          setGeoData(data)
        } else {
          // If no specific postal code data, use a default location for Spain
          setGeoData(null)
        }
      } catch (err) {
        console.error("Error loading map data:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (postalCode) {
      fetchData()
    }
  }, [postalCode])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted">
        <p className="text-muted-foreground">Error al cargar el mapa</p>
      </div>
    )
  }

  if (loading) {
    return <MapLoading />
  }

  return <MapWithNoSSR geoData={geoData} postalCode={postalCode} />
}
