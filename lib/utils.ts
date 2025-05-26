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
  const components = []

  // Construir dirección usando solo datos catastrales
  if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
    components.push(`${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`)
  }

  if (asset.numero_portal_catastro) {
    components.push(asset.numero_portal_catastro)
  }

  if (asset.escalera_catastro) {
    components.push(`Esc. ${asset.escalera_catastro}`)
  }

  if (asset.planta_catastro) {
    components.push(`Planta ${asset.planta_catastro}`)
  }

  if (asset.puerta_catastro) {
    components.push(`Puerta ${asset.puerta_catastro}`)
  }

  if (components.length > 0) {
    return components.join(", ")
  }

  // Si no hay suficiente información, devolvemos un mensaje genérico
  return "Dirección no disponible"
}

// Función para formatear valores monetarios en euros
export function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return "N/A"
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

// Función para obtener la superficie como número
export function getSuperficie(asset: Asset): number {
  if (!asset.superficie_construida_m2) return 0
  const superficie = Number.parseFloat(asset.superficie_construida_m2.toString())
  return isNaN(superficie) ? 0 : superficie
}

// Función para calcular el valor de mercado
export function calculateMarketValue(asset: Asset): number {
  const superficie = getSuperficie(asset)
  if (!superficie || !asset.precio_idealista_venta_m2) return 0
  return superficie * asset.precio_idealista_venta_m2
}

// Función para calcular el valor de alquiler de mercado
export function calculateRentalMarketValue(asset: Asset): number {
  const superficie = getSuperficie(asset)
  if (!superficie || !asset.precio_idealista_alquiler_m2) return 0
  return superficie * asset.precio_idealista_alquiler_m2
}
