import { v1 } from "@google-cloud/discoveryengine"
import type { Asset } from "@/types/asset" // Ensure this Asset type is comprehensive

const MAX_REQUESTS_PER_MINUTE = 280 // Slightly below the 300 limit for buffer
const REQUEST_WINDOW_MS = 60 * 1000 // 1 minute

class RateLimitError extends Error {
  constructor(message = "Search request quota exceeded. Please try again shortly.") {
    super(message)
    this.name = "RateLimitError"
  }
}

interface VertexAISearchConfig {
  projectId: string
  location: string
  dataStoreId: string
  servingConfigId: string // Changed from servingConfig to servingConfigId for clarity
}

export interface SearchFilters {
  property_type?: string | string[]
  provincia_catastro?: string | string[]
  municipio_catastro?: string | string[]
  price_min?: number
  price_max?: number
  surface_min?: number // Assuming superficie_construida_m2 is numeric in Vertex AI
  surface_max?: number
  rooms_min?: number // Assuming rooms is numeric
  bathrooms_min?: number // Assuming bathrooms is numeric
  construction_year_min?: number // Assuming ano_construccion_inmueble is numeric
  construction_year_max?: number
  legal_phase?: string | string[]
  marketing_status?: string | string[]
  // Add other filterable fields as needed, e.g., has_parking?: boolean
}

export interface SearchOptions {
  pageSize?: number
  pageToken?: string // Vertex AI uses pageToken for pagination
  offset?: number // Can also be used, but pageToken is generally preferred
  sortBy?: string // e.g., "price_approx asc", "ano_construccion_inmueble desc"
  facetKeys?: string[]
  userPseudoId?: string // For analytics and personalization
}

export interface SearchResult {
  assets: Asset[]
  totalSize: number
  facets: Array<{
    key: string
    values: Array<{ value: string | { interval: { minValue?: number; maxValue?: number } }; count: number }>
  }>
  nextPageToken?: string
  correctedQuery?: string
  appliedQuery?: string // The query that was actually used by the engine
  searchTimeMs: number
  error?: string // Optional error message for UI
  errorType?: "RateLimitError" | "SearchError" | "GenericError"
}

export class VertexAISearchService {
  private client: v1.SearchServiceClient
  private servingConfigPath: string
  private requestTimestamps: number[] = []

  constructor(config: VertexAISearchConfig) {
    if (!config.projectId || !config.location || !config.dataStoreId || !config.servingConfigId) {
      console.error("Vertex AI Search configuration is incomplete:", config)
      throw new Error(
        "Vertex AI Search configuration is incomplete. Please check environment variables: VERTEX_AI_PROJECT_ID, VERTEX_AI_LOCATION, VERTEX_AI_DATA_STORE_ID, VERTEX_AI_SERVING_CONFIG_ID",
      )
    }
    this.client = new v1.SearchServiceClient()
    // Correctly construct the servingConfigPath
    this.servingConfigPath = `projects/${config.projectId}/locations/${config.location}/collections/default_collection/dataStores/${config.dataStoreId}/servingConfigs/${config.servingConfigId}`
    // If not using 'default_collection', adjust accordingly or use:
    // this.client.projectLocationDataStoreServingConfigPath(config.projectId, config.location, config.dataStoreId, config.servingConfigId)
    // However, the above helper might not work if you have a specific collection. The string path is often more reliable.
    console.log("Vertex AI Serving Config Path:", this.servingConfigPath)
  }

  private async checkRateLimit(): Promise<void> {
    const now = Date.now()
    this.requestTimestamps = this.requestTimestamps.filter((timestamp) => now - timestamp < REQUEST_WINDOW_MS)

    if (this.requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      console.warn(`Vertex AI Search: Rate limit nearly exceeded. ${this.requestTimestamps.length} requests in window.`)
      throw new RateLimitError()
    }
    this.requestTimestamps.push(now)
  }

  private buildFilterString(filters: SearchFilters): string {
    const conditions: string[] = []
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0) || value === "")
        continue

      const fieldName = key
        .replace("_min", "")
        .replace("_max", "")
        // Map UI filter keys to Vertex AI schema field names if they differ
        .replace("surface", "superficie_construida_m2")
        .replace("construction_year", "ano_construccion_inmueble")
        .replace("price", "price_approx") // Assuming price_approx is the numeric field for price range

      if (key.endsWith("_min")) {
        conditions.push(`${fieldName} >= ${value}`)
      } else if (key.endsWith("_max")) {
        conditions.push(`${fieldName} <= ${value}`)
      } else if (Array.isArray(value)) {
        // For array fields, use OR logic for multiple selections of the same facet
        conditions.push(`(${value.map((v) => `${fieldName}: ANY("${v}")`).join(" OR ")})`)
      } else {
        conditions.push(`${fieldName}: ANY("${value}")`)
      }
    }
    const filterStr = conditions.join(" AND ")
    console.log("Vertex AI Filter String:", filterStr)
    return filterStr
  }

  private extractFieldValue(field: any): any {
    if (field === null || field === undefined) return null
    if (field.stringValue !== undefined && field.stringValue !== null) return field.stringValue
    if (field.numberValue !== undefined && field.numberValue !== null) return field.numberValue
    if (field.boolValue !== undefined && field.boolValue !== null) return field.boolValue
    if (field.listValue && field.listValue.values && field.listValue.values.length > 0) {
      return field.listValue.values.map((v: any) => this.extractFieldValue(v))
    }
    if (field.structValue && field.structValue.fields) {
      const nestedObject: { [key: string]: any } = {}
      for (const key in field.structValue.fields) {
        nestedObject[key] = this.extractFieldValue(field.structValue.fields[key])
      }
      return nestedObject
    }
    return null // Default to null if no value type matches
  }

  private mapDocumentToAsset(doc: any): Asset {
    const rawData = doc.structData?.fields
      ? Object.fromEntries(Object.entries(doc.structData.fields).map(([k, v]) => [k, this.extractFieldValue(v)]))
      : doc.jsonData
        ? JSON.parse(doc.jsonData)
        : {}

    // Helper to safely parse numbers that might come as strings
    const safeParseFloat = (val: any): number | null => {
      if (val === null || val === undefined) return null
      const num = Number.parseFloat(String(val))
      return isNaN(num) ? null : num
    }
    const safeParseInt = (val: any): number | null => {
      if (val === null || val === undefined) return null
      const num = Number.parseInt(String(val), 10)
      return isNaN(num) ? null : num
    }
    const safeParseDate = (val: any): Date | null => {
      if (!val) return null
      const date = new Date(val)
      return isNaN(date.getTime()) ? null : date
    }

    const asset: Asset = {
      id: doc.id || rawData.id || crypto.randomUUID(), // Ensure ID exists
      ndg: rawData.ndg ?? null,
      lien: rawData.lien ?? null,
      property_id: rawData.property_id ?? null,
      reference_code: rawData.reference_code ?? null,
      parcel: rawData.parcel ?? null,
      cadastral_reference: rawData.cadastral_reference ?? null,
      idufir: rawData.idufir ?? null,
      property_type: rawData.property_type ?? null,
      property_general_subtype: rawData.property_general_subtype ?? null,
      provincia_catastro: rawData.provincia_catastro ?? null,
      municipio_catastro: rawData.municipio_catastro ?? null,
      tipo_via_catastro: rawData.tipo_via_catastro ?? null,
      nombre_via_catastro: rawData.nombre_via_catastro ?? null,
      numero_portal_catastro: rawData.numero_portal_catastro ?? null,
      escalera_catastro: rawData.escalera_catastro ?? null,
      planta_catastro: rawData.planta_catastro ?? null,
      puerta_catastro: rawData.puerta_catastro ?? null,
      codigo_postal_catastro: rawData.codigo_postal_catastro ?? null,
      direccion_texto_catastro: rawData.direccion_texto_catastro ?? null,
      superficie_construida_m2:
        safeParseFloat(rawData.superficie_construida_m2) ?? rawData.superficie_construida_m2 ?? null,
      sqm: safeParseFloat(rawData.sqm) ?? safeParseFloat(rawData.superficie_construida_m2) ?? null,
      uso_predominante_inmueble: rawData.uso_predominante_inmueble ?? null,
      ano_construccion_inmueble:
        safeParseInt(rawData.ano_construccion_inmueble) ?? rawData.ano_construccion_inmueble ?? null,
      rooms: safeParseInt(rawData.rooms) ?? rawData.rooms ?? null,
      bathrooms: safeParseInt(rawData.bathrooms) ?? rawData.bathrooms ?? null,
      has_parking: typeof rawData.has_parking === "boolean" ? rawData.has_parking : null,
      extras: rawData.extras ?? null,
      gbv: safeParseFloat(rawData.gbv) ?? null,
      auction_base: safeParseFloat(rawData.auction_base) ?? null,
      deuda: safeParseFloat(rawData.deuda) ?? null,
      DEUDA: safeParseFloat(rawData.DEUDA) ?? safeParseFloat(rawData.deuda) ?? null,
      auction_value: safeParseFloat(rawData.auction_value) ?? null,
      price_approx: safeParseFloat(rawData.price_approx) ?? null,
      price_to_brokers: safeParseFloat(rawData.price_to_brokers) ?? null,
      ob: safeParseFloat(rawData.ob) ?? null,
      hv: safeParseFloat(rawData.hv) ?? null,
      purchase_price: safeParseFloat(rawData.purchase_price) ?? null,
      uw_value: safeParseFloat(rawData.uw_value) ?? null,
      hipoges_value_total: safeParseFloat(rawData.hipoges_value_total) ?? null,
      precio_idealista_venta_m2: safeParseFloat(rawData.precio_idealista_venta_m2) ?? null,
      precio_idealista_alquiler_m2: safeParseFloat(rawData.precio_idealista_alquiler_m2) ?? null,
      legal_type: rawData.legal_type ?? null,
      legal_phase: rawData.legal_phase ?? null,
      tipo_procedimiento: rawData.tipo_procedimiento ?? null,
      fase_procedimiento: rawData.fase_procedimiento ?? null,
      fase_actual: rawData.fase_actual ?? null,
      registration_status: rawData.registration_status ?? null,
      working_status: rawData.working_status ?? null,
      marketing_status: rawData.marketing_status ?? null,
      marketing_suspended_reason: rawData.marketing_suspended_reason ?? null,
      estado_posesion_fisica: rawData.estado_posesion_fisica ?? null,
      closing_date: safeParseDate(rawData.closing_date),
      portfolio_closing_date: safeParseDate(rawData.portfolio_closing_date),
      date_under_re_mgmt: safeParseDate(rawData.date_under_re_mgmt),
      fecha_subasta: safeParseDate(rawData.fecha_subasta),
      fecha_cesion_remate: safeParseDate(rawData.fecha_cesion_remate),
      campania: rawData.campania ?? null,
      portfolio: rawData.portfolio ?? null,
      borrower_name: rawData.borrower_name ?? null,
      hip_under_re_mgmt: rawData.hip_under_re_mgmt ?? null,
      latitude: safeParseFloat(rawData.latitude) ?? null,
      longitude: safeParseFloat(rawData.longitude) ?? null,
      images: Array.isArray(rawData.images) ? rawData.images.filter((img) => typeof img === "string") : [],
      createdAt: safeParseDate(rawData.createdAt) ?? new Date(),
      updatedAt: safeParseDate(rawData.updatedAt) ?? new Date(),
    }
    return asset
  }

  async search(query: string, filters: SearchFilters = {}, options: SearchOptions = {}): Promise<SearchResult> {
    await this.checkRateLimit()
    const startTime = Date.now()
    const filterString = this.buildFilterString(filters)

    const request: v1.ISearchRequest = {
      servingConfig: this.servingConfigPath,
      query: query || (filterString ? "*" : ""), // Use "*" if query is empty but filters are present, else empty for no query/no filter
      filter: filterString || undefined, // Pass undefined if empty
      pageSize: options.pageSize || 20,
      pageToken: options.pageToken,
      offset: !options.pageToken ? options.offset : undefined, // Only use offset if pageToken is not present
      orderBy: options.sortBy,
      facetSpecs: options.facetKeys?.map((key) => ({ facetKey: { key, caseInsensitive: true }, limit: 20 })), // Added caseInsensitive and limit
      userPseudoId: options.userPseudoId || "anonymous-user",
      queryExpansionSpec: { condition: "AUTO" },
      spellCorrectionSpec: { mode: "AUTO" },
      // contentSearchSpec: { snippetSpec: { returnSnippet: true } } // Example: if you need snippets
    }
    console.log("Vertex AI Search Request:", JSON.stringify(request, null, 2))

    try {
      const [response] = await this.client.search(request)
      console.log("Vertex AI Search Response:", JSON.stringify(response, null, 2))
      const assets = (response.results || []).map((result) => this.mapDocumentToAsset(result.document!))

      return {
        assets,
        totalSize: response.totalSize || 0,
        facets: (response.facets || []).map((f) => ({
          key: f.key!,
          values: (f.values || []).map((v) => ({
            value:
              v.value ||
              (v.interval ? { interval: { minValue: v.interval.minValue, maxValue: v.interval.maxValue } } : "unknown"),
            count: Number(v.count) || 0,
          })),
        })),
        nextPageToken: response.nextPageToken || undefined,
        correctedQuery: response.correctedQuery || undefined,
        appliedQuery: response.query || undefined,
        searchTimeMs: Date.now() - startTime,
      }
    } catch (error: any) {
      console.error("Vertex AI Search Client Error:", error)
      if (
        error.message?.includes("RESOURCE_EXHAUSTED") ||
        error.code === 8 ||
        error.message?.includes("Quota exceeded")
      ) {
        throw new RateLimitError(
          `Vertex AI Search service is temporarily busy (Quota Exceeded). Please try again. Details: ${error.details || error.message}`,
        )
      }
      throw new Error(`Search failed: ${error.details || error.message}`)
    }
  }

  async getSuggestions(query: string, userPseudoId = "anonymous-user"): Promise<string[]> {
    if (!query.trim()) return []
    // Suggestions might have a different, often higher, quota.
    // For now, we use the same rate limiter but this could be adjusted.
    // await this.checkRateLimit(); // Decide if suggestions need same strict rate limiting

    const request: v1.ICompleteQueryRequest = {
      dataStore: `projects/${process.env.VERTEX_AI_PROJECT_ID}/locations/${process.env.VERTEX_AI_LOCATION}/dataStores/${process.env.VERTEX_AI_DATA_STORE_ID}`,
      // servingConfig: this.servingConfigPath, // Not typically used for completeQuery with dataStore path
      query: query,
      userPseudoId: userPseudoId,
      queryModel: "browse", // 'document' or 'browse'
      maxSuggestions: 10,
    }
    console.log("Vertex AI Suggestion Request:", JSON.stringify(request, null, 2))

    try {
      const [response] = await this.client.completeQuery(request)
      console.log("Vertex AI Suggestion Response:", JSON.stringify(response, null, 2))
      return (response.querySuggestions?.map((s) => s.suggestion).filter(Boolean) as string[]) || []
    } catch (error: any) {
      console.error("Vertex AI Suggestion Client Error:", error)
      if (error.message?.includes("RESOURCE_EXHAUSTED") || error.code === 8) {
        // Don't throw RateLimitError for suggestions to keep UI smoother, just return empty
        console.warn("Vertex AI Suggestion rate limit likely hit.")
        return []
      }
      // Don't throw, just return empty suggestions on other errors too
      return []
    }
  }
}

// Singleton instance
let vertexAISearchServiceInstance: VertexAISearchService | null = null

export function getVertexAISearchService(): VertexAISearchService {
  if (!vertexAISearchServiceInstance) {
    try {
      vertexAISearchServiceInstance = new VertexAISearchService({
        projectId: process.env.VERTEX_AI_PROJECT_ID!,
        location: process.env.VERTEX_AI_LOCATION!, // Ensure this is set
        dataStoreId: process.env.VERTEX_AI_DATA_STORE_ID!,
        servingConfigId: process.env.VERTEX_AI_SERVING_CONFIG_ID!, // Ensure this is set
      })
    } catch (error) {
      console.error("Failed to initialize VertexAISearchService:", error)
      throw error // Re-throw to make it clear initialization failed
    }
  }
  return vertexAISearchServiceInstance
}

export { RateLimitError } // Export the custom error
