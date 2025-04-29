"use client"

import { useState } from "react"

interface StaticMapProps {
  postalCode?: string
  city?: string
  province?: string
  height?: number
  width?: number
}

export function StaticMap({ postalCode, city, province, height = 200, width = 400 }: StaticMapProps) {
  const [error, setError] = useState(false)

  // Construir la consulta de ubicación
  const location = encodeURIComponent([postalCode, city, province, "España"].filter(Boolean).join(", "))

  // URL de la imagen estática del mapa
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${location}&zoom=14&size=${width}x${height}&markers=color:red%7C${location}&key=YOUR_API_KEY`

  // URL alternativa usando OpenStreetMap (sin API key)
  const osmUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${location}&zoom=14&size=${width}x${height}&markers=${location}`

  // Fallback a una imagen de placeholder si hay error
  const placeholderUrl = `/placeholder.svg?height=${height}&width=${width}&query=mapa de ${location}`

  return (
    <div className="relative w-full h-full min-h-[150px] bg-muted overflow-hidden">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No se pudo cargar el mapa</p>
        </div>
      ) : (
        <img
          src={osmUrl || "/placeholder.svg"}
          alt={`Mapa de ${location}`}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      )}
    </div>
  )
}
