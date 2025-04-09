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
  const location = asset.city || asset.province
  const size = asset.sqm ? `${asset.sqm}m²` : ""

  let title = `${type} en ${location}`
  if (size) title += ` de ${size}`
  if (asset.rooms) title += `, ${asset.rooms} hab.`

  return title
}

// Función para generar una descripción para la propiedad
export function generateDescription(asset: Asset): string {
  const type = propertyTypeLabels[asset.property_type] || asset.property_type
  let description = `${type} ubicado en ${asset.address}, ${asset.city}, ${asset.province}.`

  if (asset.sqm) description += ` Superficie de ${asset.sqm}m².`
  if (asset.rooms) description += ` ${asset.rooms} habitaciones.`
  if (asset.bathrooms) description += ` ${asset.bathrooms} baños.`
  if (asset.extras) description += ` ${asset.extras}.`

  if (asset.legal_phase) {
    const phase = legalPhaseLabels[asset.legal_phase] || asset.legal_phase
    description += ` Actualmente en fase legal: ${phase}.`
  }

  return description
}
