"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet icon issues
function fixLeafletIcons() {
  // Only run on the client
  if (typeof window !== "undefined") {
    // This is needed to fix the marker icon issues with webpack
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/images/marker-icon-2x.png",
      iconUrl: "/images/marker-icon.png",
      shadowUrl: "/images/marker-shadow.png",
    })
  }
}

function FitBounds({ geoData }: { geoData: any }) {
  const map = useMap()

  useEffect(() => {
    if (geoData) {
      const layer = L.geoJSON(geoData)
      map.fitBounds(layer.getBounds())
    }
  }, [geoData, map])

  return null
}

export function MapComponent({ postalCode }: { postalCode: string }) {
  const [geoData, setGeoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fix Leaflet icons on component mount
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  useEffect(() => {
    async function fetchData() {
      if (!postalCode) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(false)

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${postalCode}&country=Spain&format=geojson&polygon_geojson=1`,
        )
        const data = await res.json()
        if (data.features && data.features.length > 0) {
          setGeoData(data.features[0].geometry)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Error fetching postal code data:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [postalCode])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full min-h-[300px] bg-muted">
        <p className="text-muted-foreground">Cargando mapa...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full min-h-[300px] bg-muted">
        <p className="text-muted-foreground">No se pudo cargar el mapa para este código postal</p>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <MapContainer
        center={[40.4168, -3.7038]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoData && (
          <>
            <GeoJSON data={geoData} />
            <FitBounds geoData={geoData} />
          </>
        )}
      </MapContainer>
    </div>
  )
}
