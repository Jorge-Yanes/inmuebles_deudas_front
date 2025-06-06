import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Asset } from "@/types/asset"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency in EUR for Spanish locale.
 * @param amount The number to format.
 * @param minimumFractionDigits Minimum number of fraction digits.
 * @returns The formatted currency string (e.g., "1.234,56 €").
 */
export function formatCurrency(amount: number | null | undefined, minimumFractionDigits = 2): string {
  if (amount == null) {
    return "-"
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  }).format(amount)
}

/**
 * Gets a human-readable property type in Spanish.
 * @param typeCode The property type code (e.g., "CH", "PI").
 * @returns The Spanish property type string (e.g., "Chalet", "Piso").
 */
export function getPropertyType(typeCode: string | null | undefined): string {
  if (!typeCode) return "No especificado"
  const types: { [key: string]: string } = {
    AC: "Activo Singular",
    CH: "Chalet",
    ED: "Edificio",
    GA: "Garaje",
    LC: "Local",
    OF: "Oficina",
    PI: "Piso",
    PR: "Promoción",
    SU: "Suelo",
    TR: "Trastero",
    // Add more types as needed
  }
  return types[typeCode.toUpperCase()] || typeCode
}

/**
 * Formats surface area with "m²".
 * @param superficie The surface area in square meters.
 * @returns The formatted surface area string (e.g., "120 m²").
 */
export function getSuperficie(superficie: number | null | undefined): string {
  if (superficie == null || superficie === 0) {
    return "-"
  }
  return `${new Intl.NumberFormat("es-ES").format(superficie)} m²`
}

/**
 * Extracts latitude and longitude for map display.
 * @param asset The asset object.
 * @returns An object with lat and lng, or null if not available.
 */
export function getLocationForMap(asset: Asset | null | undefined): { lat: number; lng: number } | null {
  if (!asset) return null

  const lat = asset.latitude ?? asset.latitud_catastro ?? asset.location?.lat
  const lng = asset.longitude ?? asset.longitud_catastro ?? asset.location?.lon

  if (typeof lat === "number" && typeof lng === "number" && !isNaN(lat) && !isNaN(lng)) {
    return { lat, lng }
  }
  return null
}

/**
 * Normalizes text by removing accents, converting to lowercase, and trimming.
 * @param text The text to normalize.
 * @returns The normalized text.
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD") // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
    .trim()
}

/**
 * Generates a URL to the Spanish Cadastral Registry for a given reference.
 * @param cadastralReference The cadastral reference number.
 * @returns The URL to the Sede Electrónica del Catastro.
 */
export function getCadastralMapUrl(cadastralReference: string | null | undefined): string | null {
  if (!cadastralReference) return null
  // Ensure the reference is 14 or 20 characters and alphanumeric
  const cleanedRef = cadastralReference.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  if (!((cleanedRef.length === 14 || cleanedRef.length === 20) && /^[A-Z0-9]+$/.test(cleanedRef))) {
    // console.warn(`Invalid cadastral reference format: ${cadastralReference}`);
    return null
  }
  return `https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCBienInmueble.aspx?rc1=${cleanedRef.substring(0, 7)}&rc2=${cleanedRef.substring(7, 14)}${cleanedRef.length === 20 ? `&rc3=${cleanedRef.substring(14)}` : ""}&pest=rc`
}

/**
 * Generates HTML content for an asset's info window on a map.
 * @param asset The asset object.
 * @returns HTML string for the info window.
 */
export function generateAssetInfoWindowContent(asset: Asset): string {
  const imageUrl = asset.images?.[0]?.url || "/placeholder.svg?width=150&height=100"
  const price = formatCurrency(asset.price_approx, 0)
  const superficie = getSuperficie(asset.superficie_construida_m2)

  return `
    <div style="font-family: Arial, sans-serif; width: 250px;">
      <img src="${imageUrl}" alt="${asset.property_type || "Propiedad"}" style="width:100%; height:120px; object-fit:cover; border-radius:4px;">
      <h3 style="margin: 8px 0 4px; font-size: 16px; font-weight: bold; color: #333;">
        ${getPropertyType(asset.property_type)} en ${asset.address_street || asset.municipio_catastro || "Ubicación desconocida"}
      </h3>
      <p style="margin: 2px 0; font-size: 14px; color: #555;">
        <strong>Precio:</strong> ${price}
      </p>
      <p style="margin: 2px 0; font-size: 14px; color: #555;">
        <strong>Superficie:</strong> ${superficie}
      </p>
      ${asset.referencia_catastral ? `<p style="margin: 2px 0; font-size: 12px; color: #777;">Ref. Catastral: ${asset.referencia_catastral}</p>` : ""}
      <a href="/assets/${asset.id}" target="_blank" style="display: inline-block; margin-top: 8px; font-size: 14px; color: #007bff; text-decoration: none;">
        Ver Detalles
      </a>
    </div>
  `
}

// Example of a more specific utility if needed for search suggestions
export interface SearchSuggestion {
  id: string
  label: string
  type: "location" | "property_type" | "keyword"
  value: string
}

export function createSuggestion(
  label: string,
  type: SearchSuggestion["type"],
  value?: string,
  id?: string,
): SearchSuggestion {
  return {
    id: id || normalizeText(label).replace(/\s+/g, "-") || crypto.randomUUID(),
    label,
    type,
    value: value || label,
  }
}

export const defaultPropertyTypesForSuggestions: SearchSuggestion[] = [
  createSuggestion("Piso", "property_type"),
  createSuggestion("Chalet", "property_type"),
  createSuggestion("Local Comercial", "property_type", "LC"),
  createSuggestion("Oficina", "property_type"),
  createSuggestion("Suelo", "property_type"),
  createSuggestion("Garaje", "property_type"),
]

export const commonLocationsForSuggestions: SearchSuggestion[] = [
  createSuggestion("Madrid", "location"),
  createSuggestion("Barcelona", "location"),
  createSuggestion("Valencia", "location"),
  createSuggestion("Sevilla", "location"),
  createSuggestion("Zaragoza", "location"),
  createSuggestion("Málaga", "location"),
]
