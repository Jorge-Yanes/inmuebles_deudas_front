"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix Leaflet icon issues
function fixLeafletIcons() {
  // Fix the default icon paths that are broken in production build
  delete (L.Icon.Default.prototype as any)._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/images/marker-icon-2x.png",
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
  })
}

interface MapComponentProps {
  geoData: any
  postalCode: string
}

export function MapComponent({ geoData, postalCode }: MapComponentProps) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  // Default center for Spain if no specific data
  const defaultCenter: [number, number] = [40.4168, -3.7038] // Madrid coordinates
  const defaultZoom = 6

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: "100%", width: "100%", minHeight: "200px" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {geoData && geoData.features && geoData.features.length > 0 && (
        <>
          <GeoJSON
            data={geoData}
            style={() => ({
              color: "#3b82f6",
              weight: 2,
              fillOpacity: 0.2,
              fillColor: "#93c5fd",
            })}
          />
          <Marker position={[geoData.features[0].geometry.coordinates[1], geoData.features[0].geometry.coordinates[0]]}>
            <Popup>Código postal: {postalCode}</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  )
}
