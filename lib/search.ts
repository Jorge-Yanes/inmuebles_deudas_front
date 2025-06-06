import type { Asset } from "@/types/asset"

interface SearchFilters {
  property_type?: string
  provincia_catastro?: string
  municipio_catastro?: string
  price_min?: number
  price_max?: number
  surface_min?: number
  surface_max?: number
}

interface SearchOptions {
  pageSize?: number
  offset?: number
}

interface SearchResult {
  assets: Asset[]
  totalCount: number
  facets: Record<string, Array<{ value: string; count: number }>>
  searchTime: number
}

export async function searchAssets(
  query = "",
  filters: SearchFilters = {},
  options: SearchOptions = {},
): Promise<SearchResult> {
  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        filters,
        pageSize: options.pageSize || 20,
        offset: options.offset || 0,
      }),
    })

    if (!response.ok) {
      throw new Error(`Search API returned ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.message || "Search failed")
    }

    return data
  } catch (error) {
    console.error("Error searching assets:", error)
    throw new Error("Failed to fetch from search API")
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    if (!query || query.length < 2) {
      return []
    }

    const response = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
      console.error("Suggestion API error:", response.status)
      return []
    }

    const data = await response.json()
    return data.suggestions || []
  } catch (error) {
    console.error("Error getting search suggestions:", error)
    return []
  }
}

// Utility function to build search URL
export function buildSearchUrl(query: string, filters: SearchFilters = {}): string {
  const params = new URLSearchParams()

  if (query.trim()) {
    params.set("q", query.trim())
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value))
    }
  })

  return `/search${params.toString() ? `?${params.toString()}` : ""}`
}

// Utility function to parse search URL
export function parseSearchUrl(searchParams: URLSearchParams): { query: string; filters: SearchFilters } {
  const query = searchParams.get("q") || ""

  const filters: SearchFilters = {}

  const propertyType = searchParams.get("property_type")
  if (propertyType) filters.property_type = propertyType

  const provincia = searchParams.get("provincia_catastro")
  if (provincia) filters.provincia_catastro = provincia

  const municipio = searchParams.get("municipio_catastro")
  if (municipio) filters.municipio_catastro = municipio

  const priceMin = searchParams.get("price_min")
  if (priceMin) filters.price_min = Number(priceMin)

  const priceMax = searchParams.get("price_max")
  if (priceMax) filters.price_max = Number(priceMax)

  const surfaceMin = searchParams.get("surface_min")
  if (surfaceMin) filters.surface_min = Number(surfaceMin)

  const surfaceMax = searchParams.get("surface_max")
  if (surfaceMax) filters.surface_max = Number(surfaceMax)

  return { query, filters }
}
