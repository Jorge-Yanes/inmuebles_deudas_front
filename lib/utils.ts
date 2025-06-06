import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Asset } from "@/types/asset"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency.
 * @param amount The number to format.
 * @param currency The currency code (e.g., 'EUR', 'USD'). Defaults to 'EUR'.
 * @param locale The locale to use for formatting. Defaults to 'es-ES'.
 * @returns The formatted currency string.
 */
export function formatCurrency(amount: number | undefined | null, currency = "EUR", locale = "es-ES"): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "N/A"
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Gets a human-readable property type.
 * @param typeCode The property type code (e.g., 'PISO', 'CASA').
 * @returns The human-readable property type or the original code if not found.
 */
export function getPropertyType(typeCode: string | undefined | null): string {
  if (!typeCode) return "Desconocido"
  const propertyTypes: { [key: string]: string } = {
    PISO: "Piso",
    CASA: "Casa",
    CHALET: "Chalet",
    LOCAL: "Local Comercial",
    OFICINA: "Oficina",
    GARAJE: "Garaje",
    TERRENO: "Terreno",
    NAVE: "Nave Industrial",
    // Add more types as needed
  }
  return propertyTypes[typeCode.toUpperCase()] || typeCode
}

/**
 * Formats a surface area.
 * @param superficie The surface area in square meters.
 * @returns The formatted surface area string (e.g., "120 m²").
 */
export function getSuperficie(superficie: number | undefined | null): string {
  if (superficie === undefined || superficie === null || isNaN(superficie)) {
    return "N/A"
  }
  return `${superficie} m²`
}

/**
 * Extracts latitude and longitude for map display.
 * Assumes asset has 'latitude' and 'longitude' or 'lat' and 'lon' or 'coordenadas_catastro'.
 * @param asset The asset object.
 * @returns An object with lat and lng, or null if coordinates are not found.
 */
export function getLocationForMap(asset: Asset | undefined | null): { lat: number; lng: number } | null {
  if (!asset) return null

  if (typeof asset.latitude === "number" && typeof asset.longitude === "number") {
    return { lat: asset.latitude, lng: asset.longitude }
  }
  if (typeof (asset as any).lat === "number" && typeof (asset as any).lng === "number") {
    return { lat: (asset as any).lat, lng: (asset as any).lng }
  }
  if (
    typeof (asset as any).coordenadas_catastro?.lat === "number" &&
    typeof (asset as any).coordenadas_catastro?.lon === "number"
  ) {
    return { lat: (asset as any).coordenadas_catastro.lat, lng: (asset as any).coordenadas_catastro.lon }
  }
  // Add more checks if coordinates are stored differently
  return null
}

/**
 * Normalizes text by converting to lowercase and removing accents.
 * @param text The text to normalize.
 * @returns The normalized text.
 */
export function normalizeText(text: string | undefined | null): string {
  if (!text) return ""
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

/**
 * Generates a URL for the Spanish Cadastre virtual office.
 * @param cadastralReference The cadastral reference number.
 * @returns The URL to the Sede Electrónica del Catastro.
 */
export function getCadastralMapUrl(cadastralReference: string | undefined | null): string {
  if (!cadastralReference) return "#" // Or a generic search page
  // Example URL, adjust if needed for specific query parameters
  return `https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCBienInmueble.aspx?rc1=${cadastralReference}`
}

/**
 * Generates HTML content for a map marker's info window.
 * @param asset The asset object.
 * @returns HTML string for the info window.
 */
export function generateAssetInfoWindowContent(asset: Asset | undefined | null): string {
  if (!asset) return "<p>Información no disponible</p>"

  const addressParts = [
    asset.tipo_via_catastro,
    asset.nombre_via_catastro,
    asset.numero_portal_catastro,
    asset.bloque_catastro,
    asset.escalera_catastro,
    asset.planta_catastro,
    asset.puerta_catastro,
  ].filter(Boolean)
  const fullAddress = addressParts.join(" ")

  const price = asset.price ? formatCurrency(asset.price) : "Consultar precio"
  const surface = asset.surface_area_m2 ? getSuperficie(asset.surface_area_m2) : ""

  // Basic styling, can be enhanced
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; max-width: 250px;">
      <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${asset.property_type ? getPropertyType(asset.property_type) : "Inmueble"}</h4>
      ${asset.main_image_url ? `<img src="${asset.main_image_url}" alt="Imagen del inmueble" style="width:100%; max-height:120px; object-fit:cover; border-radius:4px; margin-bottom:8px;">` : ""}
      <p style="margin: 0 0 3px 0; color: #555;">${fullAddress || "Dirección no disponible"}</p>
      <p style="margin: 0 0 3px 0; color: #555;">${asset.municipio_catastro || ""}${asset.provincia_catastro ? `, ${asset.provincia_catastro}` : ""}</p>
      <p style="margin: 0 0 8px 0; font-weight: bold; color: #007bff;">${price}</p>
      ${surface ? `<p style="margin: 0; color: #555;">${surface}</p>` : ""}
      ${asset.id ? `<a href="/assets/${asset.id}" target="_blank" style="color: #007bff; text-decoration: none; display: inline-block; margin-top: 5px;">Ver detalles</a>` : ""}
    </div>
  `
}

// You might have other utility functions here.
// Ensure all functions that are used elsewhere are exported.

// Example of a function that might be used for date formatting
export function formatDate(
  date: Date | string | number | undefined | null,
  locale = "es-ES",
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return "N/A"
  try {
    const dateObj = new Date(date)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    }
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj)
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Fecha inválida"
  }
}
