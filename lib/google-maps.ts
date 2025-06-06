"use client"

import { useEffect, useState } from "react"
import type { google } from "@/types/google-maps"

// Singleton para gestionar la carga de Google Maps
class GoogleMapsService {
  private static instance: GoogleMapsService
  private _isLoaded = false
  private _error: string | null = null
  private _loadPromise: Promise<void> | null = null
  private _googleMaps: typeof google.maps | null = null

  private constructor() {
    // Constructor privado para singleton
  }

  public static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService()
    }
    return GoogleMapsService.instance
  }

  public get isLoaded(): boolean {
    return this._isLoaded
  }

  public get error(): string | null {
    return this._error
  }

  public get googleMaps(): typeof google.maps {
    if (!this._googleMaps) {
      throw new Error("Google Maps no está cargado")
    }
    return this._googleMaps
  }

  public loadGoogleMaps(): Promise<void> {
    if (this._loadPromise) {
      return this._loadPromise
    }

    this._loadPromise = new Promise<void>(async (resolve, reject) => {
      // Si ya está cargado, resolver inmediatamente
      if (window.google?.maps) {
        this._googleMaps = window.google.maps
        this._isLoaded = true
        resolve()
        return
      }

      // 1. Fetch API key from our secure server endpoint
      let apiKey: string
      try {
        const response = await fetch("/api/maps/key")
        if (!response.ok) {
          const errorBody = await response.json()
          throw new Error(errorBody.error || "Failed to fetch Google Maps API key")
        }
        const data = await response.json()
        apiKey = data.apiKey
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error fetching API key"
        this._error = errorMessage
        reject(new Error(errorMessage))
        return
      }

      if (!apiKey) {
        const error = "No se ha proporcionado una API key para Google Maps desde el servidor"
        this._error = error
        reject(new Error(error))
        return
      }

      // 2. Callback para cuando se cargue la API
      const callbackName = `googleMapsCallback_${Date.now()}`
      window[callbackName as keyof Window] = () => {
        if (window.google?.maps) {
          this._googleMaps = window.google.maps
          this._isLoaded = true
          resolve()
        } else {
          const error = "Error al cargar Google Maps API"
          this._error = error
          reject(new Error(error))
        }
        // Limpiar callback
        delete window[callbackName as keyof Window]
      }

      // 3. Crear script para cargar la API directamente desde Google
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=places,geometry`
      script.async = true
      script.defer = true
      script.onerror = () => {
        const error = "Error al cargar el script de Google Maps"
        this._error = error
        reject(new Error(error))
      }

      document.head.appendChild(script)
    })

    return this._loadPromise
  }

  // Crear un mapa de Google Maps
  public createMap(element: HTMLElement, options: google.maps.MapOptions = {}): google.maps.Map {
    if (!this._isLoaded || !this._googleMaps) {
      throw new Error("Google Maps no está cargado")
    }

    const defaultOptions: google.maps.MapOptions = {
      zoom: 10,
      center: { lat: 40.4168, lng: -3.7038 }, // Madrid por defecto
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      mapTypeId: this._googleMaps.MapTypeId.ROADMAP,
    }

    return new this._googleMaps.Map(element, { ...defaultOptions, ...options })
  }

  // Crear un marcador en el mapa
  public createMarker(
    map: google.maps.Map,
    position: google.maps.LatLngLiteral,
    options: google.maps.MarkerOptions = {},
  ): google.maps.Marker {
    if (!this._isLoaded || !this._googleMaps) {
      throw new Error("Google Maps no está cargado")
    }

    const defaultOptions: google.maps.MarkerOptions = {
      map,
      position,
      animation: this._googleMaps.Animation.DROP,
    }

    return new this._googleMaps.Marker({ ...defaultOptions, ...options })
  }

  // Crear una ventana de información
  public createInfoWindow(content: string, options: google.maps.InfoWindowOptions = {}): google.maps.InfoWindow {
    if (!this._isLoaded || !this._googleMaps) {
      throw new Error("Google Maps no está cargado")
    }

    return new this._googleMaps.InfoWindow({ content, ...options })
  }

  // Geocodificar una dirección para obtener coordenadas
  public async geocodeAddress(address: string): Promise<google.maps.LatLngLiteral | null> {
    if (!this._isLoaded || !this._googleMaps) {
      throw new Error("Google Maps no está cargado")
    }

    try {
      const geocoder = new this._googleMaps.Geocoder()
      const result = await new Promise<google.maps.GeocoderResult[] | null>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === this._googleMaps.GeocoderStatus.OK && results && results.length > 0) {
            resolve(results)
          } else {
            console.warn(`Geocodificación fallida para: ${address}. Status: ${status}`)
            resolve(null)
          }
        })
      })

      if (result && result[0]?.geometry?.location) {
        const location = result[0].geometry.location
        return { lat: location.lat(), lng: location.lng() }
      }
      return null
    } catch (error) {
      console.error("Error en geocodificación:", error)
      return null
    }
  }

  // Método específico para crear mapas thumbnail optimizados
  public createThumbnailMap(element: HTMLElement, center: google.maps.LatLngLiteral, zoom = 16): google.maps.Map {
    if (!this._isLoaded || !this._googleMaps) {
      throw new Error("Google Maps no está cargado")
    }

    const thumbnailOptions: google.maps.MapOptions = {
      zoom,
      center,
      mapTypeId: this._googleMaps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      gestureHandling: "none",
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
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
        {
          featureType: "administrative",
          elementType: "labels",
          stylers: [{ visibility: "simplified" }],
        },
      ],
    }

    return new this._googleMaps.Map(element, thumbnailOptions)
  }

  // Geocodificar una dirección con componentes específicos para mayor precisión
  public async geocodeAddressWithComponents(
    formattedAddress: string,
    components: {
      route?: string // tipo_via + nombre_via
      street_number?: string // numero_portal
      locality?: string // municipio
      administrative_area_level_1?: string // provincia
      postal_code?: string // codigo_postal
      country?: string // país
    },
  ): Promise<google.maps.LatLngLiteral | null> {
    if (!this._isLoaded || !this._googleMaps) {
      throw new Error("Google Maps no está cargado")
    }

    try {
      const geocoder = new this._googleMaps.Geocoder()

      // Construir componentes para geocodificación precisa
      const componentFilters: google.maps.GeocoderComponentRestrictions = {}

      if (components.country) {
        componentFilters.country = components.country
      }

      if (components.postal_code) {
        componentFilters.postalCode = components.postal_code
      }

      if (components.administrative_area_level_1) {
        componentFilters.administrativeArea = components.administrative_area_level_1
      }

      if (components.locality) {
        componentFilters.locality = components.locality
      }

      const result = await new Promise<google.maps.GeocoderResult[] | null>((resolve, reject) => {
        geocoder.geocode(
          {
            address: formattedAddress,
            componentRestrictions: Object.keys(componentFilters).length > 0 ? componentFilters : undefined,
          },
          (results, status) => {
            if (status === this._googleMaps.GeocoderStatus.OK && results && results.length > 0) {
              resolve(results)
            } else {
              console.warn(`Geocodificación precisa fallida para: ${formattedAddress}. Status: ${status}`)
              resolve(null)
            }
          },
        )
      })

      if (result && result[0]?.geometry?.location) {
        const location = result[0].geometry.location
        return { lat: location.lat(), lng: location.lng() }
      }
      return null
    } catch (error) {
      console.error("Error en geocodificación precisa:", error)
      return null
    }
  }
}

// Hook para usar Google Maps en componentes React
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapsService = GoogleMapsService.getInstance()

  useEffect(() => {
    if (mapsService.isLoaded) {
      setIsLoaded(true)
      return
    }

    mapsService
      .loadGoogleMaps()
      .then(() => {
        setIsLoaded(true)
      })
      .catch((err) => {
        setError(err.message || "Error al cargar Google Maps")
      })
  }, [])

  return {
    isLoaded,
    error,
    mapsService,
  }
}

export default GoogleMapsService
