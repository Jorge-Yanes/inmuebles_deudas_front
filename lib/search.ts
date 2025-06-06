import type { SearchFilters, SearchOptions, SearchResult } from "@/lib/search/vertex-ai-service" // Use types from Vertex service

export type { SearchFilters, SearchOptions, SearchResult } // Re-export types for convenience

// Calls the enhanced Vertex AI-powered search API
export async function searchAssets(
  query: string,
  filters: SearchFilters = {},
  options: SearchOptions = {},
): Promise<SearchResult> {
  // Ensure return type matches SearchResult
  try {
    const response = await fetch("/api/search/enhanced", {
      // Corrected endpoint
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, filters, options }),
    })

    const responseData: SearchResult = await response.json()

    if (!response.ok) {
      // The API route now includes error type in the response
      const errorType = responseData.errorType || (response.status === 429 ? "RateLimitError" : "GenericError")
      const errorMessage = responseData.error || `Search API error: ${response.statusText}`
      console.error(`Client searchAssets Error (${errorType}):`, errorMessage, responseData)
      // Propagate a SearchResult-like structure with error info
      return {
        assets: [],
        totalSize: 0,
        facets: [],
        searchTimeMs: 0,
        error: errorMessage,
        errorType: errorType as SearchResult["errorType"],
      }
    }
    return responseData
  } catch (error) {
    // Catch network errors or issues with fetch itself
    console.error("Client searchAssets Network/Fetch Error:", error)
    return {
      assets: [],
      totalSize: 0,
      facets: [],
      searchTimeMs: 0,
      error: error instanceof Error ? error.message : "A network error occurred during search.",
      errorType: "GenericError",
    }
  }
}

// Calls the enhanced Vertex AI-powered suggestions API
export async function getSearchSuggestions(query: string, userPseudoId?: string): Promise<string[]> {
  if (!query.trim()) return []
  try {
    const params = new URLSearchParams({ q: query })
    if (userPseudoId) {
      // Pass userPseudoId if available for better personalization
      params.append("userPseudoId", userPseudoId)
    }

    const response = await fetch(`/api/search/suggest/enhanced?${params.toString()}`) // Corrected endpoint
    if (!response.ok) {
      console.error(`Client getSearchSuggestions Error: ${response.status} ${response.statusText}`)
      return [] // Return empty on error, don't break UI
    }
    const suggestions = await response.json()
    return Array.isArray(suggestions) ? suggestions : []
  } catch (error) {
    console.error("Client getSearchSuggestions Network/Fetch Error:", error)
    return []
  }
}

// --- Other utility functions like buildSearchUrl, parseSearchUrl can remain if still used by UI ---
// --- but ensure they align with the SearchFilters and SearchOptions types ---
