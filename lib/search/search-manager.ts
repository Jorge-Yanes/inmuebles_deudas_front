import { VertexAISearchService } from "./vertex-ai-service"
import { getAllProperties } from "@/lib/firestore/property-service"

interface SearchStrategy {
  search(query: string, filters: any, options: any): Promise<any>
}

class FirestoreSearchStrategy implements SearchStrategy {
  async search(query: string, filters: any, options: any) {
    // Fallback to existing Firestore search
    const allProperties = await getAllProperties(1000)

    let results = allProperties

    // Apply text search
    if (query.trim()) {
      const normalizedQuery = query.toLowerCase()
      results = results.filter((asset) => {
        const searchableText = [
          asset.provincia_catastro,
          asset.municipio_catastro,
          asset.tipo_via_catastro,
          asset.nombre_via_catastro,
          asset.property_type,
          asset.reference_code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return searchableText.includes(normalizedQuery)
      })
    }

    // Apply filters
    if (filters.property_type) {
      results = results.filter((asset) => asset.property_type === filters.property_type)
    }

    if (filters.provincia_catastro) {
      results = results.filter((asset) => asset.provincia_catastro === filters.provincia_catastro)
    }

    // Add more filter logic...

    return {
      assets: results.slice(0, options.pageSize || 20),
      totalCount: results.length,
      facets: {},
      searchTime: 0,
    }
  }
}

class VertexAISearchStrategy implements SearchStrategy {
  private vertexService: VertexAISearchService

  constructor() {
    this.vertexService = new VertexAISearchService({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      location: "global",
      dataStoreId: process.env.VERTEX_AI_SEARCH_DATA_STORE_ID!,
      servingConfig: `projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/locations/global/collections/default_collection/dataStores/${process.env.VERTEX_AI_SEARCH_DATA_STORE_ID}/servingConfigs/default_serving_config`,
    })
  }

  async search(query: string, filters: any, options: any) {
    return await this.vertexService.search(query, filters, options)
  }
}

export class SearchManager {
  private primaryStrategy: SearchStrategy
  private fallbackStrategy: SearchStrategy
  private useVertexAI: boolean

  constructor(useVertexAI = true) {
    this.useVertexAI = useVertexAI
    this.primaryStrategy = useVertexAI ? new VertexAISearchStrategy() : new FirestoreSearchStrategy()
    this.fallbackStrategy = new FirestoreSearchStrategy()
  }

  async search(query: string, filters: any = {}, options: any = {}) {
    try {
      // Try primary strategy first
      const result = await this.primaryStrategy.search(query, filters, options)

      // Log search analytics
      this.logSearchAnalytics(query, filters, result, "primary")

      return result
    } catch (error) {
      console.error("Primary search strategy failed:", error)

      // Fallback to secondary strategy
      try {
        const result = await this.fallbackStrategy.search(query, filters, options)
        this.logSearchAnalytics(query, filters, result, "fallback")
        return result
      } catch (fallbackError) {
        console.error("Fallback search strategy failed:", fallbackError)
        throw new Error("Search service unavailable")
      }
    }
  }

  async getSuggestions(query: string): Promise<string[]> {
    if (this.useVertexAI && this.primaryStrategy instanceof VertexAISearchStrategy) {
      try {
        return await (this.primaryStrategy as any).vertexService.getSuggestions(query)
      } catch (error) {
        console.error("Suggestions failed:", error)
      }
    }

    // Fallback suggestions logic
    return this.generateFallbackSuggestions(query)
  }

  private async generateFallbackSuggestions(query: string): Promise<string[]> {
    // Simple suggestion logic based on existing data
    const properties = await getAllProperties(100)
    const suggestions = new Set<string>()

    const normalizedQuery = query.toLowerCase()

    properties.forEach((property) => {
      if (property.provincia_catastro?.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(property.provincia_catastro)
      }
      if (property.municipio_catastro?.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(property.municipio_catastro)
      }
    })

    return Array.from(suggestions).slice(0, 8)
  }

  private logSearchAnalytics(query: string, filters: any, result: any, strategy: string) {
    // Log search metrics for analysis
    console.log("Search Analytics:", {
      query,
      filtersCount: Object.keys(filters).length,
      resultsCount: result.assets?.length || 0,
      searchTime: result.searchTime,
      strategy,
      timestamp: new Date().toISOString(),
    })
  }
}
