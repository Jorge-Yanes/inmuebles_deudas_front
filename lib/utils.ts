import type { Asset } from "@/types/asset"

/**
 * Formats a number as currency in EUR
 * @param value - The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "N/A"

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Gets the property type display name
 * @param type - The property type code
 * @returns Human-readable property type
 */
export function getPropertyType(type: string | null | undefined): string {
  if (!type) return "No especificado"

  const propertyTypes: Record<string, string> = {
    residential: "Residencial",
    commercial: "Comercial",
    industrial: "Industrial",
    land: "Terreno",
    apartment: "Piso",
    house: "Casa",
    villa: "Villa",
    office: "Oficina",
    retail: "Local comercial",
    warehouse: "Almacén",
    garage: "Garaje",
  }

  return propertyTypes[type.toLowerCase()] || type
}

/**
 * Gets formatted surface area with units
 * @param superficie - Surface area in square meters
 * @returns Formatted surface area string
 */
export function getSuperficie(superficie: number | null | undefined): string {
  if (superficie === null || superficie === undefined) return "No disponible"
  return `${superficie.toLocaleString("es-ES")} m²`
}

/**
 * Gets location coordinates for map display
 * @param asset - The asset object
 * @returns Coordinates object for map display
 */
export function getLocationForMap(asset: Asset): { lat: number; lng: number } {
  // Default to center of Spain if no coordinates available
  const defaultLocation = { lat: 40.416775, lng: -3.70379 }

  if (!asset) return defaultLocation

  // Try to get coordinates from the asset
  if (asset.coordinates?.latitude && asset.coordinates?.longitude) {
    return {
      lat: asset.coordinates.latitude,
      lng: asset.coordinates.longitude,
    }
  }

  // Fallback to cadastral reference if available
  if (asset.cadastralReference?.coordinates) {
    return {
      lat: asset.cadastralReference.coordinates.latitude || defaultLocation.lat,
      lng: asset.cadastralReference.coordinates.longitude || defaultLocation.lng,
    }
  }

  return defaultLocation
}

/**
 * Normalizes text for search and comparison
 * @param text - The text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return ""

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^\w\s]/g, "") // Remove special characters
    .trim()
}

/**
 * Gets the URL for the cadastral map
 * @param reference - Cadastral reference
 * @returns URL to the cadastral map
 */
export function getCadastralMapUrl(reference: string | null | undefined): string {
  if (!reference) return ""

  // Format: https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCConCiud.aspx?RefC={REFERENCE}
  return `https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCConCiud.aspx?RefC=${encodeURIComponent(reference)}`
}

/**
 * Generates HTML content for asset info windows on maps
 * @param asset - The asset object
 * @returns HTML string for info window
 */
export function generateAssetInfoWindowContent(asset: Asset): string {
  if (!asset) return ""

  const price = asset.price ? formatCurrency(asset.price) : "Precio no disponible"
  const address = asset.address || "Dirección no disponible"
  const type = getPropertyType(asset.type)
  const superficie = asset.superficie_construida_m2
    ? getSuperficie(asset.superficie_construida_m2)
    : "Superficie no disponible"

  return `
    <div class="info-window">
      <h3 class="text-lg font-semibold">${asset.title || "Propiedad"}</h3>
      <p class="text-base font-medium text-green-600">${price}</p>
      <p class="text-sm">${address}</p>
      <div class="text-xs text-gray-500 mt-1">
        <span>${type}</span> • <span>${superficie}</span>
      </div>
      <a href="/assets/${asset.id}" class="text-sm text-blue-600 hover:underline mt-2 block">
        Ver detalles
      </a>
    </div>
  `
}

/**
 * Utility function to join class names conditionally
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}
