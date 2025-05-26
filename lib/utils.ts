import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Asset } from "@/types/asset"
import { propertyTypeLabels, legalPhaseLabels } from "@/types/asset"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza un texto eliminando acentos y diacríticos
 * Convierte: "áéíóúüñ" -> "aeiouun"
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

// Función para generar un título descriptivo para la propiedad
export function generateTitle(asset: Asset): string {
  const type = propertyTypeLabels[asset.property_type] || asset.property_type
  const location = asset.municipio_catastro || asset.provincia_catastro || "ubicación desconocida"
  const size = asset.superficie_construida_m2 ? `${asset.superficie_construida_m2}m²` : ""

  let title = `${type} en ${location}`
  if (size) title += ` de ${size}`
  if (asset.rooms) title += `, ${asset.rooms} hab.`

  return title
}

// Función para generar una descripción para la propiedad
export function generateDescription(asset: Asset): string {
  const type = propertyTypeLabels[asset.property_type] || asset.property_type

  // Obtener dirección completa usando SOLO campos catastrales
  const address = getFullAddress(asset)

  let description = `${type} ubicado en ${address}, ${asset.municipio_catastro}, ${asset.provincia_catastro}.`

  if (asset.superficie_construida_m2) description += ` Superficie construida de ${asset.superficie_construida_m2}m².`
  if (asset.rooms) description += ` ${asset.rooms} habitaciones.`
  if (asset.bathrooms) description += ` ${asset.bathrooms} baños.`
  if (asset.extras) description += ` ${asset.extras}.`
  if (asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0") {
    description += ` Año de construcción: ${asset.ano_construccion_inmueble}.`
  }

  if (asset.legal_phase) {
    const phase = legalPhaseLabels[asset.legal_phase] || asset.legal_phase
    description += ` Actualmente en fase legal: ${phase}.`
  }

  return description
}

// Función para obtener la dirección completa usando SOLO campos catastrales
export function getFullAddress(asset: Asset): string {
  const parts: string[] = []

  // Construir dirección usando campos catastrales
  if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
    let address = `${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`

    if (asset.numero_portal_catastro) {
      address += ` ${asset.numero_portal_catastro}`
    }

    parts.push(address)
  }

  // Añadir detalles adicionales si existen
  const details: string[] = []
  if (asset.escalera_catastro) details.push(`Esc. ${asset.escalera_catastro}`)
  if (asset.planta_catastro) details.push(`Planta ${asset.planta_catastro}`)
  if (asset.puerta_catastro) details.push(`Puerta ${asset.puerta_catastro}`)

  if (details.length > 0) {
    parts.push(details.join(", "))
  }

  return parts.join(", ") || "Dirección no disponible"
}

// Función para formatear valores monetarios en euros
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-ES").format(num)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function getPropertyType(asset: Asset): string {
  if (asset.tipo_inmueble) return asset.tipo_inmueble
  if (asset.property_type) return asset.property_type
  return "Inmueble"
}

// Función para obtener la superficie como número
export function getSuperficie(asset: Asset): string {
  if (asset.superficie_construida_m2) {
    return `${asset.superficie_construida_m2}`
  }
  if (asset.surface_area) {
    return `${asset.surface_area}`
  }
  return "N/A"
}

// Función para calcular el valor de mercado
export function calculateMarketValue(asset: Asset): number {
  const superficie = Number.parseFloat(getSuperficie(asset))
  if (!superficie || !asset.precio_idealista_venta_m2) return 0
  return superficie * asset.precio_idealista_venta_m2
}

// Función para calcular el valor de alquiler de mercado
export function calculateRentalMarketValue(asset: Asset): number {
  const superficie = Number.parseFloat(getSuperficie(asset))
  if (!superficie || !asset.precio_idealista_alquiler_m2) return 0
  return superficie * asset.precio_idealista_alquiler_m2
}

export function getLocationForMap(asset: Asset): {
  address: string
  postalCode: string
  city: string
  province: string
  fullLocation: string
} {
  const address = getFullAddress(asset)
  const postalCode = asset.codigo_postal_catastro || asset.zip_code || ""
  const city = asset.municipio_catastro || asset.city || ""
  const province = asset.provincia_catastro || asset.province || ""

  // Construir ubicación completa para búsqueda en mapa
  const locationParts = [address, city, province, "España"].filter(Boolean)
  const fullLocation = locationParts.join(", ")

  return {
    address,
    postalCode,
    city,
    province,
    fullLocation,
  }
}

export function generateMapUrl(location: string, mapType: "osm" | "google" = "osm"): string {
  const encodedLocation = encodeURIComponent(location)

  if (mapType === "google") {
    return `https://maps.google.com/maps?q=${encodedLocation}&output=embed`
  }

  // OpenStreetMap por defecto
  return `https://www.openstreetmap.org/export/embed.html?bbox=-10.0,35.0,5.0,44.0&layer=mapnik&marker=40.416775,-3.70379&query=${encodedLocation}`
}

export function getCadastralMapUrl(reference: string): string {
  return `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${reference}`
}
