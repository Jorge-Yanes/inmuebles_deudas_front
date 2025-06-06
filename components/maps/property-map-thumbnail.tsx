"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { getLocationForMap } from "@/lib/utils"
import type { Asset } from "@/types/asset"
import { MapPin } from "lucide-react"

interface PropertyMapThumbnailProps {
  asset: Asset
  width?: number
  height?: number
  zoom?: number
  className?: string
}

export function PropertyMapThumbnail({
  asset,
  width = 300,
  height = 200,
  zoom = 15,
  className = "",
}: PropertyMapThumbnailProps) {
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const locationData = getLocationForMap(asset)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!locationData.lat || !locationData.lng) {
      setError(true)
      return
    }

    // Use Google Static Maps API
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (googleMapsApiKey) {
      const url = `https://maps.googleapis.com/maps/api/staticmap?center=${locationData.lat},${locationData.lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${locationData.lat},${locationData.lng}&key=${googleMapsApiKey}`
      setMapUrl(url)
    } else {
      setError(true)
    }
  }, [asset, width, height, zoom, locationData])

  if (error || !mapUrl) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">{locationData.address || "Ubicación no disponible"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`} ref={mapRef}>
      <Image
        src={mapUrl || "/placeholder.svg"}
        alt={`Mapa de ${locationData.address || "la propiedad"}`}
        width={width}
        height={height}
        className="object-cover w-full h-full"
        unoptimized
      />
    </div>
  )
}
