"use client"

import { useEffect, useRef, useState } from "react"
import { useGoogleMaps } from "@/lib/google-maps"
import type { Asset } from "@/types/asset"
import { getLocationForMap } from "@/lib/utils"

interface PropertyMapThumbnailProps {
  asset: Asset
  width?: number
  height?: number
  zoom?: number
  className?: string
  showInfoWindow?: boolean
}

export default function PropertyMapThumbnailComponent({
  asset,
  width = 300,
  height = 200,
  zoom = 16,
  className = "",
  showInfoWindow = false,
}: PropertyMapThumbnailProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)

  const { isLoaded, error, mapsService } = useGoogleMaps()
  const [isMapReady, setIsMapReady] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [geocodingError, setGeocodingError] = useState<string | null>(null)

  // Geocodificar la dirección del activo
  useEffect(() => {
    if (!isLoaded || !asset) return

    const geocodeAsset = async () => {
      try {
        const locationData = getLocationForMap(asset)

        // Verificar que tenemos los datos mínimos necesarios
        if (!asset.municipio_catastro || !asset.provincia_catastro) {
          setGeocodingError("Datos de ubicación insuficientes")
          return
        }

        // Construir componentes para geocodificación precisa
        const components = {
          route:
            asset.tipo_via_catastro && asset.nombre_via_catastro
              ? `${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`
              : undefined,
          street_number: asset.numero_portal_catastro || undefined,
          locality: asset.municipio_catastro,
          administrative_area_level_1: asset.provincia_catastro,
          postal_code: asset.codigo_postal_catastro || undefined,
          country: "España",
        }

        // Intentar geocodificación precisa primero
        let coords = await mapsService.geocodeAddressWithComponents(locationData.formattedAddress, components)

        // Si falla, intentar con dirección completa
        if (!coords) {
          coords = await mapsService.geocodeAddress(locationData.formattedAddress)
        }

        // Si sigue fallando, intentar solo con municipio y provincia
        if (!coords) {
          const fallbackAddress = `${asset.municipio_catastro}, ${asset.provincia_catastro}, España`
          coords = await mapsService.geocodeAddress(fallbackAddress)
        }

        if (coords) {
          setCoordinates(coords)
          setGeocodingError(null)
        } else {
          setGeocodingError("No se pudo geocodificar la dirección")
        }
      } catch (error) {
        console.error("Error en geocodificación:", error)
        setGeocodingError("Error al obtener coordenadas")
      }
    }

    geocodeAsset()
  }, [isLoaded, asset, mapsService])

  // Inicializar el mapa cuando tenemos las coordenadas
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !coordinates || mapInstanceRef.current) return

    try {
      // Crear el mapa centrado en las coordenadas
      const map = mapsService.createMap(mapRef.current, {
        zoom,
        center: coordinates,
        disableDefaultUI: true, // Ocultar controles para thumbnail
        gestureHandling: "none", // Deshabilitar interacciones
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      })

      mapInstanceRef.current = map

      // Crear marcador en la ubicación exacta
      const marker = mapsService.createMarker(map, coordinates, {
        title: `${asset.property_type} en ${asset.municipio_catastro}`,
        animation: google.maps.Animation.DROP,
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new google.maps.Size(32, 32),
        },
      })

      markerRef.current = marker

      // Crear InfoWindow si se solicita
      if (showInfoWindow) {
        const locationData = getLocationForMap(asset)
        const content = `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 200px;">
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">
              ${asset.property_type}
            </h4>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${locationData.address}
            </p>
            <p style="margin: 0; font-size: 12px; color: #666;">
              ${asset.municipio_catastro}, ${asset.provincia_catastro}
            </p>
          </div>
        `

        infoWindowRef.current = mapsService.createInfoWindow(content)

        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            infoWindowRef.current.open(map, marker)
          }
        })
      }

      setIsMapReady(true)
    } catch (error) {
      console.error("Error creando mapa:", error)
      setGeocodingError("Error al crear el mapa")
    }
  }, [isLoaded, coordinates, zoom, mapsService, asset, showInfoWindow])

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
      }
    }
  }, [])

  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`,
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border rounded ${className}`}
        style={containerStyle}
      >
        <div className="text-center p-2">
          <div className="text-gray-400 mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500">Error al cargar mapa</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border rounded ${className}`}
        style={containerStyle}
      >
        <div className="text-center p-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  if (geocodingError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border rounded ${className}`}
        style={containerStyle}
      >
        <div className="text-center p-2">
          <div className="text-gray-400 mb-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500">Ubicación no disponible</p>
        </div>
      </div>
    )
  }

  if (!coordinates) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border rounded ${className}`}
        style={containerStyle}
      >
        <div className="text-center p-2">
          <div className="animate-pulse">
            <div className="text-gray-400 mb-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Obteniendo ubicación...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden border rounded ${className}`} style={containerStyle}>
      <div ref={mapRef} className="w-full h-full" />

      {/* Overlay para mostrar que es un thumbnail */}
      <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm rounded px-1 py-0.5 text-xs text-gray-600">
        📍
      </div>
    </div>
  )
}

// Exportar con memo para optimizar re-renders
import { memo } from "react"
export const PropertyMapThumbnail = memo(PropertyMapThumbnailComponent)
