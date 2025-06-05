/*import type { Asset } from "@/types/asset"
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
export const sampleAssets: Asset[] = []*/

import type { Asset } from "@/types/asset"
import { normalizeText } from "./utils"

// Import necessary Vertex AI Search client libraries here

// Cache para resultados de búsqueda
const searchCache = new Map<string, { results: Asset[]; timestamp: number }>()
const suggestionsCache = new Map<string, { suggestions: string[]; timestamp: number }>()
const CACHE_EXPIRY = 2 * 60 * 1000 // 2 minutos


// Search assets by any field using cadastral data (calls API endpoint)
// Build a Vertex AI Search filter expression from UI filters
function buildFilterString(filters: Record<string, any>): string {
  const clauses: string[] = [];
  // Exact-match string fields
  if (filters.property_type) {
    clauses.push(`property_type = "${filters.property_type}"`);
  }
  if (filters.marketing_status) {
    clauses.push(`marketing_status = "${filters.marketing_status}"`);
  }
  if (filters.legal_phase) {
    clauses.push(`legal_phase = "${filters.legal_phase}"`);
  }
  if (filters.provincia_catastro) {
    clauses.push(`provincia_catastro = "${filters.provincia_catastro}"`);
  }
  if (filters.municipio_catastro) {
    clauses.push(`municipio_catastro = "${filters.municipio_catastro}"`);
  }
  if (filters.tipo_via_catastro) {
    clauses.push(`tipo_via_catastro = "${filters.tipo_via_catastro}"`);
  }
  // Numeric ranges
  if (filters.minPrice) {
    clauses.push(`price_approx >= ${Number(filters.minPrice)}`);
  }
  if (filters.maxPrice) {
    clauses.push(`price_approx <= ${Number(filters.maxPrice)}`);
  }
  if (filters.minSqm) {
    clauses.push(`superficie_construida_m2 >= ${Number(filters.minSqm)}`);
  }
  if (filters.maxSqm) {
    clauses.push(`superficie_construida_m2 <= ${Number(filters.maxSqm)}`);
  }
  if (filters.minYear) {
    clauses.push(`ano_construccion_inmueble >= ${Number(filters.minYear)}`);
  }
  if (filters.maxYear) {
    clauses.push(`ano_construccion_inmueble <= ${Number(filters.maxYear)}`);
  }
  // Rooms and bathrooms (string or +5)
  if (filters.rooms) {
    if (filters.rooms === '+5') {
      clauses.push(`rooms >= 5`);
    } else {
      clauses.push(`rooms = "${filters.rooms}"`);
    }
  }
  if (filters.bathrooms) {
    if (filters.bathrooms === '+5') {
      clauses.push(`bathrooms >= 5`);
    } else {
      clauses.push(`bathrooms = "${filters.bathrooms}"`);
    }
  }
  // Array fields (property features)
  if (Array.isArray(filters.propertyFeatures) && filters.propertyFeatures.length > 0) {
    filters.propertyFeatures.forEach((feature: string) => {
      clauses.push(`features = "${feature}"`);
    });
  }
  return clauses.join(' AND ');
}

/**
 * Search assets via Vertex AI Search API, with optional filters.
 * query: full-text query (empty string allowed for filter-only searches)
 * filters: map of filter keys to values or arrays
 */
export async function searchAssets(
  query: string,
  filters: Record<string, any> = {}
): Promise<Asset[]> {
  const hasFilters = Object.keys(filters).length > 0;
  // If no query and no filters, nothing to search here
  if (!query.trim() && !hasFilters) {
    return [];
  }
  const normalizedQuery = normalizeText(query.toLowerCase());
  // Use cache key combining query and filters
  const cacheKey = `${normalizedQuery}|${JSON.stringify(filters)}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.results;
  }
  try {
    const body: Record<string, any> = { query };
    const filterExpr = buildFilterString(filters);
    if (filterExpr) body.filter = filterExpr;
    // Optionally adjust pageSize
    body.pageSize = filters.pageSize || 50;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch from search API');
    }
    const payload = await response.json();
    const results: Asset[] = Array.isArray(payload.assets)
      ? payload.assets
      : [];
    searchCache.set(cacheKey, { results, timestamp: Date.now() });
    return results;
  } catch (error) {
    console.error('Error searching assets:', error);
    return [];
  }
}

/**
 * Fetch auto-complete suggestions from backend Vertex AI endpoint.
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query.trim() || query.length < 2) {
    return [];
  }
  const normalizedQuery = normalizeText(query.toLowerCase());
  const cached = suggestionsCache.get(normalizedQuery);
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.suggestions;
  }
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/search/suggest?q=${encodeURIComponent(query)}`
    );
    if (!resp.ok) throw new Error('Suggestion API error');
    const { suggestions } = await resp.json();
    const result = Array.isArray(suggestions) ? suggestions : [];
    suggestionsCache.set(normalizedQuery, { suggestions: result, timestamp: Date.now() });
    return result;
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}

// Clear caches
export function clearSearchCache(): void {
  searchCache.clear()
  suggestionsCache.clear()
}

// Export sample assets for compatibility
export const sampleAssets: Asset[] = []
