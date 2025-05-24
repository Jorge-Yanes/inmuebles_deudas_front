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
  const location =
    asset.city || asset.province || asset.municipio_catastro || asset.provincia_catastro || "ubicación desconocida"
  const size = asset.sqm
    ? `${asset.sqm}m²`
    : asset.superficie_construida_m2
      ? `${asset.superficie_construida_m2}m²`
      : ""

  let title = `${type} en ${location}`
  if (size) title += ` de ${size}`
  if (asset.rooms) title += `, ${asset.rooms} hab.`

  return title
}

// Función para generar una descripción para la propiedad
export function generateDescription(asset: Asset): string {
  const type = propertyTypeLabels[asset.property_type] || asset.property_type

  // Obtener dirección completa
  const address = getFullAddress(asset)
  const city = asset.city || asset.municipio_catastro || "ciudad no disponible"
  const province = asset.province || asset.provincia_catastro || "provincia no disponible"

  let description = `${type} ubicado en ${address}, ${city}, ${province}.`

  if (asset.sqm) description += ` Superficie de ${asset.sqm}m².`
  else if (asset.superficie_construida_m2)
    description += ` Superficie construida de ${asset.superficie_construida_m2}m².`

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

// Función para obtener la dirección completa
export function getFullAddress(asset: Asset): string {
  // Primero intentamos usar la dirección ya formateada si existe
  if (asset.address) return asset.address

  // Si no, intentamos usar la dirección del catastro
  if (asset.direccion_texto_catastro) return asset.direccion_texto_catastro

  // Si no, construimos la dirección a partir de los componentes individuales
  const components = []

  // Intentamos primero con los datos de catastro
  if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
    components.push(`${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`)
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
  }
  // Si no hay datos de catastro, usamos los datos generales
  else if (asset.street_type && asset.street_no) {
    components.push(`${asset.street_type} ${asset.street_no}`)
    if (asset.numero) {
      components.push(asset.numero)
    }
    if (asset.floor) {
      components.push(`Planta ${asset.floor}`)
    }
    if (asset.door) {
      components.push(`Puerta ${asset.door}`)
    }
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
