// This file might become simpler or be removed if VertexAISearchService is used directly by API routes.
// For now, let's assume it's still used to potentially switch strategies.
import {
  type VertexAISearchService,
  getVertexAISearchService,
  RateLimitError,
  type SearchResult,
  type SearchFilters,
  type SearchOptions,
} from "./vertex-ai-service"
import { getAllProperties } from "@/lib/firestore/property-service" // Fallback

interface SearchStrategy {
  search(query: string, filters: SearchFilters, options: SearchOptions): Promise<SearchResult>
  getSuggestions(query: string, userPseudoId?: string): Promise<string[]>
}

class FirestoreSearchStrategy implements SearchStrategy {
  // Basic Firestore fallback (simplified, as Vertex AI is primary)
  async search(query: string, filters: SearchFilters, options: SearchOptions): Promise<SearchResult> {
    console.warn("Using Firestore fallback search strategy.")
    const allProperties = await getAllProperties(options.pageSize || 20) // Simple limit for fallback
    // Implement basic filtering if needed for fallback
    return {
      assets: allProperties,
      totalSize: allProperties.length, // This would be an estimate or require another query
      facets: [],
      searchTimeMs: 0,
    }
  }
  async getSuggestions(query: string): Promise<string[]> {
    console.warn("Using Firestore fallback suggestions.")
    // Basic fallback suggestions
    const common = ["Madrid", "Barcelona", "Piso", "Casa"]
    return common.filter((s) => s.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
  }
}

class VertexAISearchStrategyImpl implements SearchStrategy {
  private vertexService: VertexAISearchService

  constructor() {
    this.vertexService = getVertexAISearchService()
  }

  async search(query: string, filters: SearchFilters, options: SearchOptions): Promise<SearchResult> {
    return this.vertexService.search(query, filters, options)
  }

  async getSuggestions(query: string, userPseudoId?: string): Promise<string[]> {
    return this.vertexService.getSuggestions(query, userPseudoId)
  }
}

export class SearchManager {
  private strategy: SearchStrategy

  constructor(useVertexAI = true) {
    // Forcing Vertex AI, but keeping structure for potential future fallback toggle
    if (useVertexAI && process.env.VERTEX_AI_PROJECT_ID) {
      try {
        this.strategy = new VertexAISearchStrategyImpl()
        console.log("SearchManager initialized with VertexAISearchStrategy.")
      } catch (error) {
        console.error("Failed to initialize VertexAISearchStrategy, falling back to Firestore:", error)
        this.strategy = new FirestoreSearchStrategy()
      }
    } else {
      console.warn("Vertex AI not configured, SearchManager falling back to Firestore.")
      this.strategy = new FirestoreSearchStrategy()
    }
  }

  async search(query: string, filters: SearchFilters = {}, options: SearchOptions = {}): Promise<SearchResult> {
    const startTime = Date.now()
    try {
      const result = await this.strategy.search(query, filters, options)
      this.logSearchAnalytics(query, filters, result, this.strategy.constructor.name)
      return result
    } catch (error) {
      console.error(`SearchManager: ${this.strategy.constructor.name} search failed:`, error)
      // If primary (Vertex) fails, could consider an explicit fallback here if not handled by constructor logic
      // For now, rethrow to be handled by the API route
      if (error instanceof RateLimitError) {
        // Propagate RateLimitError specifically
        return {
          assets: [],
          totalSize: 0,
          facets: [],
          searchTimeMs: Date.now() - startTime,
          error: error.message,
          errorType: "RateLimitError",
        }
      }
      return {
        assets: [],
        totalSize: 0,
        facets: [],
        searchTimeMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown search error",
        errorType: "SearchError",
      }
    }
  }

  async getSuggestions(query: string, userPseudoId?: string): Promise<string[]> {
    try {
      return await this.strategy.getSuggestions(query, userPseudoId)
    } catch (error) {
      console.error(`SearchManager: ${this.strategy.constructor.name} suggestions failed:`, error)
      return [] // Return empty on suggestion error
    }
  }

  private logSearchAnalytics(query: string, filters: SearchFilters, result: SearchResult, strategyName: string) {
    console.log("Search Analytics:", {
      timestamp: new Date().toISOString(),
      strategy: strategyName,
      query,
      filtersCount: Object.keys(filters).length,
      resultsCount: result.assets.length,
      totalReported: result.totalSize,
      searchTimeMs: result.searchTimeMs,
      correctedQuery: result.correctedQuery,
    })
  }
}
