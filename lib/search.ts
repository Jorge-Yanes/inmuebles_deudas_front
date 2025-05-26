import type { Asset } from "@/types/asset"
import { normalizeText } from "./utils"
import { searchProperties } from "@/lib/firestore/property-service"

// Cache para sugerencias de búsqueda
const suggestionsCache = new Map<string, { suggestions: string[]; timestamp: number }>()
const CACHE_EXPIRY = 2 * 60 * 1000 // 2 minutos

// Search assets by any field using cadastral data
export async function searchAssets(query: string): Promise<Asset[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (!query.trim()) {
    return []
  }

  try {
    // Use the property service search function
    return await searchProperties(query)
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

  const normalizedQuery = normalizeText(query)

  // Check cache first
  const cached = suggestionsCache.get(normalizedQuery)
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.suggestions
  }

  try {
    // Get properties that match the query
    const properties = await searchProperties(query)
    const suggestions = new Set<string>()

    // Extract suggestions from various cadastral fields
    properties.forEach((property) => {
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
        suggestions.add(property.tipo_via_catastro)
      }

      // Add nombre_via suggestions
      if (property.nombre_via_catastro && normalizeText(property.nombre_via_catastro).includes(normalizedQuery)) {
        suggestions.add(property.nombre_via_catastro)
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

      // Add numero_portal suggestions for exact matches
      if (property.numero_portal_catastro && property.numero_portal_catastro.includes(query)) {
        suggestions.add(`${property.numero_portal_catastro} ${property.nombre_via_catastro || ""}`.trim())
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

// Clear suggestions cache
export function clearSuggestionsCache(): void {
  suggestionsCache.clear()
}
