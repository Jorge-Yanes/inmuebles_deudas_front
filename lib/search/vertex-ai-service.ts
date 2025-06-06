import { v1 } from "@google-cloud/discoveryengine"
import type { Asset } from "@/types/asset"

interface SearchConfig {
  projectId: string
  location: string
  dataStoreId: string
  servingConfig: string
}

interface SearchFilters {
  property_type?: string
  provincia_catastro?: string
  municipio_catastro?: string
  price_range?: { min?: number; max?: number }
  surface_range?: { min?: number; max?: number }
  legal_phase?: string
  marketing_status?: string
  construction_year_range?: { min?: number; max?: number }
  rooms?: number
  bathrooms?: number
  has_parking?: boolean
}

interface SearchOptions {
  pageSize?: number
  offset?: number
  sortBy?: "relevance" | "price_asc" | "price_desc" | "date_desc"
  facets?: string[]
}

interface SearchResult {
  assets: Asset[]
  totalCount: number
  facets: Record<string, Array<{ value: string; count: number }>>
  suggestions?: string[]
  searchTime: number
}

export class VertexAISearchService {
  private client: v1.SearchServiceClient
  private config: SearchConfig

  constructor(config: SearchConfig) {
    this.client = new v1.SearchServiceClient()
    this.config = config
  }

  /**
   * Enhanced search with Vertex AI Search
   */
  async search(query: string, filters: SearchFilters = {}, options: SearchOptions = {}): Promise<SearchResult> {
    const startTime = Date.now()

    try {
      const searchRequest = this.buildSearchRequest(query, filters, options)

      const [response] = await this.client.search(searchRequest)

      const assets = this.parseSearchResults(response.results || [])
      const facets = this.parseFacets(response.facets || [])
      const totalCount = response.totalSize || 0

      return {
        assets,
        totalCount,
        facets,
        searchTime: Date.now() - startTime,
      }
    } catch (error) {
      console.error("Vertex AI Search error:", error)
      throw new Error("Search service unavailable")
    }
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(query: string, limit = 10): Promise<string[]> {
    try {
      const request = {
        servingConfig: this.config.servingConfig,
        query,
        queryModel: "searchSuggestions",
        userPseudoId: "anonymous-user",
        maxSuggestions: limit,
      }

      const [response] = await this.client.completeQuery(request)

      return response.querySuggestions?.map((s) => s.suggestion || "") || []
    } catch (error) {
      console.error("Suggestions error:", error)
      return []
    }
  }

  /**
   * Build comprehensive search request
   */
  private buildSearchRequest(query: string, filters: SearchFilters, options: SearchOptions) {
    const request: any = {
      servingConfig: this.config.servingConfig,
      query: query || "*", // Use wildcard for filter-only searches
      pageSize: options.pageSize || 20,
      offset: options.offset || 0,
      queryExpansionSpec: { condition: "AUTO" },
      spellCorrectionSpec: { mode: "AUTO" },
      boostSpec: this.buildBoostSpec(),
      facetSpecs: this.buildFacetSpecs(options.facets),
    }

    // Add filters
    const filterExpression = this.buildFilterExpression(filters)
    if (filterExpression) {
      request.filter = filterExpression
    }

    // Add sorting
    if (options.sortBy && options.sortBy !== "relevance") {
      request.orderBy = this.buildOrderBy(options.sortBy)
    }

    return request
  }

  /**
   * Build filter expression for Vertex AI Search
   */
  private buildFilterExpression(filters: SearchFilters): string {
    const conditions: string[] = []

    // Exact match filters
    if (filters.property_type) {
      conditions.push(`property_type = "${filters.property_type}"`)
    }

    if (filters.provincia_catastro) {
      conditions.push(`provincia_catastro = "${filters.provincia_catastro}"`)
    }

    if (filters.municipio_catastro) {
      conditions.push(`municipio_catastro = "${filters.municipio_catastro}"`)
    }

    if (filters.legal_phase) {
      conditions.push(`legal_phase = "${filters.legal_phase}"`)
    }

    if (filters.marketing_status) {
      conditions.push(`marketing_status = "${filters.marketing_status}"`)
    }

    // Range filters
    if (filters.price_range) {
      if (filters.price_range.min) {
        conditions.push(`price_approx >= ${filters.price_range.min}`)
      }
      if (filters.price_range.max) {
        conditions.push(`price_approx <= ${filters.price_range.max}`)
      }
    }

    if (filters.surface_range) {
      if (filters.surface_range.min) {
        conditions.push(`superficie_construida_m2 >= ${filters.surface_range.min}`)
      }
      if (filters.surface_range.max) {
        conditions.push(`superficie_construida_m2 <= ${filters.surface_range.max}`)
      }
    }

    if (filters.construction_year_range) {
      if (filters.construction_year_range.min) {
        conditions.push(`ano_construccion_inmueble >= ${filters.construction_year_range.min}`)
      }
      if (filters.construction_year_range.max) {
        conditions.push(`ano_construccion_inmueble <= ${filters.construction_year_range.max}`)
      }
    }

    // Numeric filters
    if (filters.rooms) {
      conditions.push(`rooms >= ${filters.rooms}`)
    }

    if (filters.bathrooms) {
      conditions.push(`bathrooms >= ${filters.bathrooms}`)
    }

    if (filters.has_parking !== undefined) {
      conditions.push(`has_parking = ${filters.has_parking}`)
    }

    return conditions.join(" AND ")
  }

  /**
   * Build boost specification for relevance ranking
   */
  private buildBoostSpec() {
    return {
      conditionBoostSpecs: [
        {
          condition: 'marketing_status = "Available"',
          boost: 2.0,
        },
        {
          condition: "price_approx > 0",
          boost: 1.5,
        },
        {
          condition: "superficie_construida_m2 > 0",
          boost: 1.3,
        },
      ],
    }
  }

  /**
   * Build facet specifications
   */
  private buildFacetSpecs(requestedFacets?: string[]) {
    const defaultFacets = [
      "property_type",
      "provincia_catastro",
      "municipio_catastro",
      "legal_phase",
      "marketing_status",
      "rooms",
      "bathrooms",
    ]

    const facets = requestedFacets || defaultFacets

    return facets.map((facet) => ({
      facetKey: {
        key: facet,
        intervals:
          facet.includes("price") || facet.includes("superficie")
            ? [
                { minimum: 0, maximum: 100000 },
                { minimum: 100000, maximum: 300000 },
                { minimum: 300000, maximum: 500000 },
                { minimum: 500000 },
              ]
            : undefined,
      },
      limit: 20,
      excludedFilterKeys: [facet],
    }))
  }

  /**
   * Build order by clause
   */
  private buildOrderBy(sortBy: string): string {
    switch (sortBy) {
      case "price_asc":
        return "price_approx asc"
      case "price_desc":
        return "price_approx desc"
      case "date_desc":
        return "createdAt desc"
      default:
        return ""
    }
  }

  /**
   * Parse search results into Asset objects
   */
  private parseSearchResults(results: any[]): Asset[] {
    return results
      .map((result) => {
        const document = result.document
        let data: any = {}

        if (document?.structData?.fields) {
          // Parse structured data
          for (const [fieldName, field] of Object.entries(document.structData.fields)) {
            data[fieldName] = this.extractFieldValue(field)
          }
        } else if (document?.content?.jsonData) {
          try {
            data = JSON.parse(document.content.jsonData)
          } catch (e) {
            console.warn("Failed to parse JSON data:", e)
          }
        }

        return this.mapToAsset(data, document?.id)
      })
      .filter(Boolean)
  }

  /**
   * Extract field value from Vertex AI Search response
   */
  private extractFieldValue(field: any): any {
    if ("stringValue" in field) return field.stringValue
    if ("numberValue" in field) return field.numberValue
    if ("boolValue" in field) return field.boolValue
    if ("listValue" in field) {
      return field.listValue?.values?.map((v: any) => this.extractFieldValue(v)) || []
    }
    return null
  }

  /**
   * Map raw data to Asset interface
   */
  private mapToAsset(data: any, id?: string): Asset | null {
    try {
      return {
        id: id || data.id,
        ndg: data.ndg || "",
        property_type: data.property_type || data["Property Type"],
        provincia_catastro: data.provincia_catastro,
        municipio_catastro: data.municipio_catastro,
        tipo_via_catastro: data.tipo_via_catastro,
        nombre_via_catastro: data.nombre_via_catastro,
        numero_portal_catastro: data.numero_portal_catastro,
        codigo_postal_catastro: data.codigo_postal_catastro,
        superficie_construida_m2: data.superficie_construida_m2,
        price_approx: Number.parseFloat(data.price_approx) || null,
        precio_idealista_venta_m2: Number.parseFloat(data.precio_idealista_venta_m2) || undefined,
        precio_idealista_alquiler_m2: Number.parseFloat(data.precio_idealista_alquiler_m2) || undefined,
        legal_phase: data.legal_phase,
        marketing_status: data.marketing_status,
        rooms: data.rooms,
        bathrooms: data.bathrooms,
        has_parking: data.has_parking,
        ano_construccion_inmueble: data.ano_construccion_inmueble,
        cadastral_reference: data.cadastral_reference,
        reference_code: data.reference_code,
        // Add other fields as needed
      } as Asset
    } catch (error) {
      console.error("Error mapping asset:", error)
      return null
    }
  }

  /**
   * Parse facets from search response
   */
  private parseFacets(facets: any[]): Record<string, Array<{ value: string; count: number }>> {
    const result: Record<string, Array<{ value: string; count: number }>> = {}

    facets.forEach((facet) => {
      const key = facet.key
      const values =
        facet.values?.map((v: any) => ({
          value: v.value,
          count: v.count || 0,
        })) || []

      result[key] = values
    })

    return result
  }
}
