import type { Asset } from "@/types/asset"
import { normalizeText } from "./utils"
import { getAllProperties } from "@/lib/firestore/property-service"

// Cache para resultados de búsqueda
const searchCache = new Map<string, { results: Asset[]; timestamp: number }>()
const suggestionsCache = new Map<string, { suggestions: string[]; timestamp: number }>()
const CACHE_EXPIRY = 2 * 60 * 1000 // 2 minutos

// Search assets by any field using cadastral data
export async function searchAssets(query: string): Promise<Asset[]> {
  if (!query.trim()) {
    return []
  }

  const normalizedQuery = normalizeText(query.toLowerCase())

  // Check cache first
  const cached = searchCache.get(normalizedQuery)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.results
  }

  try {
    // Get all properties and filter client-side
    const allProperties = await getAllProperties(1000)

    const results = allProperties.filter((asset) => {
      // Search across multiple cadastral fields
      const searchableFields = [
        asset.reference_code,
        asset.provincia_catastro,
        asset.municipio_catastro,
        asset.tipo_via_catastro,
        asset.nombre_via_catastro,
        asset.numero_portal_catastro,
        asset.codigo_postal_catastro,
        asset.property_type,
        asset.property_general_subtype,
        asset.marketing_status,
        asset.legal_phase,
        asset.extras,
        asset.uso_predominante_inmueble,
        asset.ndg,
        asset.cadastral_reference,
      ]
        .filter(Boolean)
        .map((field) => normalizeText(field || ""))

      return searchableFields.some((field) => field.includes(normalizedQuery))
    })

    // Cache the results
    searchCache.set(normalizedQuery, {
      results,
      timestamp: Date.now(),
    })

    return results
  } catch (error) {
    console.error("Error searching assets:", error)
    return []
  }
}

// Get search suggestions based on partial input with caching
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query.trim() || query.length < 2) {
    return []
  }

  const normalizedQuery = normalizeText(query.toLowerCase())

  // Check cache first
  const cached = suggestionsCache.get(normalizedQuery)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.suggestions
  }

  try {
    // Get a subset of properties for suggestions
    const allProperties = await getAllProperties(500)
    const suggestions = new Set<string>()

    allProperties.forEach((property) => {
      // Add provincia suggestions
      if (property.provincia_catastro && normalizeText(property.provincia_catastro).includes(normalizedQuery)) {
        suggestions.add(property.provincia_catastro)
      }

      // Add municipio suggestions
      if (property.municipio_catastro && normalizeText(property.municipio_catastro).includes(normalizedQuery)) {
        suggestions.add(property.municipio_catastro)
      }

      // Add tipo_via suggestions
      if (property.tipo_via_catastro && normalizeText(property.tipo_via_catastro).includes(normalizedQuery)) {
        suggestions.add(`${property.tipo_via_catastro} ${property.nombre_via_catastro || ""}`.trim())
      }

      // Add property type suggestions
      if (property.property_type && normalizeText(property.property_type).includes(normalizedQuery)) {
        suggestions.add(property.property_type)
      }

      // Add reference code suggestions
      if (property.reference_code && normalizeText(property.reference_code).includes(normalizedQuery)) {
        suggestions.add(property.reference_code)
      }

      // Add codigo_postal suggestions
      if (property.codigo_postal_catastro && property.codigo_postal_catastro.includes(query)) {
        suggestions.add(property.codigo_postal_catastro)
      }
    })

    const result = Array.from(suggestions).slice(0, 8).sort()

    // Cache the results
    suggestionsCache.set(normalizedQuery, {
      suggestions: result,
      timestamp: Date.now(),
    })

    return result
  } catch (error) {
    console.error("Error getting search suggestions:", error)
    return []
  }
}

// Clear caches
export function clearSearchCache(): void {
  searchCache.clear()
  suggestionsCache.clear()
}

// Export sample assets for compatibility
export const sampleAssets: Asset[] = []
