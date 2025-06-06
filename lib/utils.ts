import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Asset } from "@/types/asset" // Assuming Asset type is correctly defined here or imported

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
 * @param typeCode The property type code.
 * @returns The human-readable property type or the original code if not found.
 */
export function getPropertyType(typeCode: any): string {
  if (typeCode === undefined || typeCode === null) {
    return "Desconocido"
  }

  // Ensure typeCode is a string before calling toUpperCase
  const codeAsString = String(typeCode)

  const propertyTypes: { [key: string]: string } = {
    PISO: "Piso",
    CASA: "Casa",
    CHALET: "Chalet",
    LOCAL: "Local Comercial",
    OFICINA: "Oficina",
    GARAJE: "Garaje",
    TERRENO: "Terreno",
    NAVE: "Nave Industrial",
    VIVIENDA: "Vivienda",
    "LOCAL COMERCIAL": "Local Comercial",
    "NAVE INDUSTRIAL": "Nave Industrial",
    SUELO: "Suelo",
    EDIFICIO: "Edificio",
    OTROS: "Otros",
    VIVIENDA_BLOQUE_PISO: "Vivienda en bloque/piso",
    VIVIENDA_PAREADA: "Vivienda pareada",
    PLAZA_GARAJE: "Plaza de garaje",
    TRASTERO: "Trastero",
    DUPLEX: "Dúplex",
    VIVIENDA_AISLADA: "Vivienda aislada",
    "FINCA_RUSTICA/VIVIENDA_AISLADA": "Finca rústica con vivienda aislada",
    CASA_DE_PUEBLO: "Casa de Pueblo",
    VIVIENDA_ADOSADA: "Vivienda adosada",
    PARCELA_VIVIENDA: "Parcela para vivienda",
    OTRO: "Otro",
    HOTEL: "Hotel",
    LAND: "Terreno",
    FINCA_RUSTICA: "Finca rústica",
    APARTAMENTO: "Apartamento",
    // Add more types from your propertyTypeLabels in types/asset.ts or property-service.ts if needed
  }
  // Attempt to match with normalized (uppercase) version of the code
  const upperCode = codeAsString.toUpperCase().replace(/ /g, "_").replace(/\//g, "_")
  return propertyTypes[upperCode] || codeAsString // Return original string if no match
}

/**
 * Formats a surface area.
 * @param superficie The surface area in square meters.
 * @returns The formatted surface area string (e.g., "120 m²").
 */
export function getSuperficie(superficie: string | number | undefined | null): string {
  if (superficie === undefined || superficie === null) {
    return "N/A"
  }
  const numSuperficie = Number.parseFloat(String(superficie))
  if (isNaN(numSuperficie)) {
    return "N/A"
  }
  return `${numSuperficie} m²`
}

/**
 * Extracts latitude and longitude for map display.
 * @param asset The asset object.
 * @returns An object with lat and lng, or null if coordinates are not found.
 */
export function getLocationForMap(asset: Asset | undefined | null): { lat: number; lng: number } | null {
  if (!asset) return null

  // Explicitly check for properties that might exist on Asset type
  // This requires Asset type to be defined with these optional fields
  const assetAny = asset as any

  if (typeof assetAny.latitude === "number" && typeof assetAny.longitude === "number") {
    return { lat: assetAny.latitude, lng: assetAny.longitude }
  }
  if (typeof assetAny.lat === "number" && typeof assetAny.lng === "number") {
    return { lat: assetAny.lat, lng: assetAny.lng }
  }
  if (typeof assetAny.lon === "number" && typeof assetAny.lat === "number") {
    // Swapped order for lon/lat
    return { lat: assetAny.lat, lng: assetAny.lon }
  }
  if (
    assetAny.coordenadas_catastro &&
    typeof assetAny.coordenadas_catastro.lat === "number" &&
    typeof assetAny.coordenadas_catastro.lon === "number"
  ) {
    return { lat: assetAny.coordenadas_catastro.lat, lng: assetAny.coordenadas_catastro.lon }
  }
  if (
    assetAny.coordenadas_catastro &&
    typeof assetAny.coordenadas_catastro.latitude === "number" &&
    typeof assetAny.coordenadas_catastro.longitude === "number"
  ) {
    return { lat: assetAny.coordenadas_catastro.latitude, lng: assetAny.coordenadas_catastro.longitude }
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
    .toString() // Ensure it's a string
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
  return `https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCBienInmueble.aspx?rc1=${encodeURIComponent(cadastralReference)}`
}

/**
 * Generates HTML content for a map marker's info window.
 * @param asset The asset object.
 * @returns HTML string for the info window.
 */
export function generateAssetInfoWindowContent(asset: Asset | undefined | null): string {
  if (!asset) return "<p>Información no disponible</p>"

  const assetAny = asset as any // To access potentially dynamic fields

  const addressParts = [
    asset.tipo_via_catastro,
    asset.nombre_via_catastro,
    asset.numero_portal_catastro,
    assetAny.bloque_catastro, // Assuming these might exist
    asset.escalera_catastro,
    asset.planta_catastro,
    asset.puerta_catastro,
  ].filter(Boolean)
  const fullAddress = addressParts.join(" ") || "Dirección no disponible"

  const price = asset.price_approx ? formatCurrency(asset.price_approx) : "Consultar precio"
  const surface = asset.superficie_construida_m2 ? getSuperficie(asset.superficie_construida_m2) : ""
  const propertyTypeDisplay = asset.property_type ? getPropertyType(asset.property_type) : "Inmueble"

  // Basic styling, can be enhanced
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; max-width: 250px; padding: 5px;">
      <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${propertyTypeDisplay}</h4>
      ${assetAny.imageUrl || assetAny.main_image_url ? `<img src="${assetAny.imageUrl || assetAny.main_image_url}" alt="Imagen del inmueble" style="width:100%; max-height:120px; object-fit:cover; border-radius:4px; margin-bottom:8px;">` : ""}
      <p style="margin: 0 0 3px 0; color: #555;">${fullAddress}</p>
      <p style="margin: 0 0 3px 0; color: #555;">${asset.municipio_catastro || ""}${asset.provincia_catastro ? `, ${asset.provincia_catastro}` : ""}</p>
      <p style="margin: 0 0 8px 0; font-weight: bold; color: #007bff;">${price}</p>
      ${surface ? `<p style="margin: 0; color: #555;">${surface}</p>` : ""}
      ${asset.id ? `<a href="/assets/${asset.id}" target="_blank" style="color: #007bff; text-decoration: none; display: inline-block; margin-top: 5px;">Ver detalles</a>` : ""}
    </div>
  `
}

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
