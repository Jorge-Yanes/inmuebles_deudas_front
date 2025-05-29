"use client"

import { useEffect, useRef, useState } from "react"
import { useGoogleMaps } from "@/lib/google-maps"
import type { Asset } from "@/types/asset"
import type { google } from "@/types/google-maps"
import { getLocationForMap, generateAssetInfoWindowContent } from "@/lib/utils"

interface GoogleMapBaseProps {
  assets?: Asset[]
  height?: string | number
  zoom?: number
  center?: { lat: number; lng: number }
  onMapLoad?: (map: google.maps.Map) => void
  showMarkers?: boolean
  className?: string
}

export default function GoogleMapBase({
  assets = [],
  height = "100%",
  zoom = 10,
  center,
  onMapLoad,
  showMarkers = true,
  className = "",
}: GoogleMapBaseProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)

  const { isLoaded, error, mapsService } = useGoogleMaps()
  const [isMapReady, setIsMapReady] = useState(false)

  const mapStyle = typeof height === "number" ? { height: `${height}px` } : { height }

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    const defaultCenter = center || { lat: 40.4168, lng: -3.7038 } // Madrid

    const map = mapsService.createMap(mapRef.current, {
      zoom,
      center: defaultCenter,
    })

    mapInstanceRef.current = map
    infoWindowRef.current = mapsService.createInfoWindow("")

    setIsMapReady(true)
    onMapLoad?.(map)
  }, [isLoaded, center, zoom, mapsService, onMapLoad])

  // Add markers for assets
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !showMarkers) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    assets.forEach(async (asset) => {
      const locationData = getLocationForMap(asset)
      if (!locationData.formattedAddress) return

      try {
        // Usar la geocodificación precisa con componentes
        const components = {
          route:
            asset.tipo_via_catastro && asset.nombre_via_catastro
              ? `${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`
              : undefined,
          street_number: asset.numero_portal_catastro || undefined,
          locality: asset.municipio_catastro || undefined,
          administrative_area_level_1: asset.provincia_catastro || undefined,
          postal_code: asset.codigo_postal_catastro || undefined,
          country: "España",
        }

        // Intentar primero con geocodificación precisa
        let coordinates = await mapsService.geocodeAddressWithComponents(locationData.formattedAddress, components)

        // Si falla, intentar con la dirección completa
        if (!coordinates) {
          coordinates = await mapsService.geocodeAddress(locationData.formattedAddress)
        }

        // Si sigue fallando, intentar con la ubicación general
        if (!coordinates && locationData.fullLocation) {
          coordinates = await mapsService.geocodeAddress(locationData.fullLocation)
        }

        if (!coordinates || !mapInstanceRef.current) return

        const marker = mapsService.createMarker(mapInstanceRef.current, coordinates, {
          title: `${asset.property_type} en ${locationData.city}`,
          animation: google.maps.Animation.DROP,
        })

        // Add click listener for info window
        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            const content = generateAssetInfoWindowContent(asset)
            infoWindowRef.current.setContent(content)
            infoWindowRef.current.open(mapInstanceRef.current, marker)
          }
        })

        markersRef.current.push(marker)

        // Adjust map bounds if multiple assets
        if (assets.length > 1) {
          const bounds = new google.maps.LatLngBounds()
          markersRef.current.forEach((m) => {
            const position = m.getPosition()
            if (position) bounds.extend(position)
          })
          mapInstanceRef.current.fitBounds(bounds)
        } else if (assets.length === 1) {
          // Si solo hay un activo, centrar el mapa en él
          mapInstanceRef.current.setCenter(coordinates)
          mapInstanceRef.current.setZoom(16) // Zoom más cercano para un solo activo
        }
      } catch (error) {
        console.error("Error geocoding address:", error)
      }
    })
  }, [isMapReady, assets, showMarkers, mapsService])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`} style={mapStyle}>
        <div className="text-center">
          <p className="text-muted-foreground">Error al cargar Google Maps</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`} style={mapStyle}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando Google Maps...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-md ${className}`} style={mapStyle}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Google Maps attribution */}
      <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm rounded px-1 py-0.5 text-xs text-gray-600">
        Google Maps
      </div>
    </div>
  )
}
