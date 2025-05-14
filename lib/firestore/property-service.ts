import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  type Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Asset, AssetFilter } from "@/types/asset"
import type { User } from "@/types/user"
import { normalizeText } from "@/lib/utils"

// Cache for property data to improve performance
const propertyCache = new Map<string, Asset>()
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp | undefined): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined
}

// Convert Firestore document to Asset type
export const convertDocToAsset = (doc: DocumentData): Asset => {
  const data = doc.data()

  // Handle potential data inconsistencies
  const asset: Asset = {
    id: doc.id,
    ndg: data.ndg || "",
    lien: data.lien || undefined,
    property_id: data.property_id || undefined,
    reference_code: data.reference_code || "",
    parcel: data.parcel || undefined,
    cadastral_reference: data.cadastral_reference || undefined,
    property_idh: data.property_idh || undefined,
    property_bank_id: data.property_bank_id || undefined,
    alt_id1: data.alt_id1 || undefined,
    idufir: data.idufir || undefined,
    id_portal_subasta: data.id_portal_subasta || undefined,

    // Property information
    property_type: data.property_type || "OTHER",
    property_general_subtype: data.property_general_subtype || undefined,
    title: data.title || undefined,
    description: data.description || undefined,

    // Location
    province: data.province || "",
    city: data.city || "",
    address: data.address || "",
    numero: data.numero || undefined,
    street_type: data.street_type || undefined,
    street_no: data.street_no || undefined,
    zip_code: data.zip_code || undefined,
    floor: data.floor || undefined,
    door: data.door || undefined,
    comarca: data.comarca || undefined,

    // Physical characteristics
    sqm: data.sqm || 0,
    rooms: data.rooms || undefined,
    bathrooms: data.bathrooms || undefined,
    has_parking: data.has_parking || undefined,
    extras: data.extras || undefined,

    // Financial information
    gbv: data.gbv || undefined,
    auction_base: data.auction_base || undefined,
    deuda: data.deuda || undefined,
    auction_value: data.auction_value || undefined,
    price_approx: data.price_approx || undefined,
    price_to_brokers: data.price_to_brokers || undefined,
    ob: data.ob || undefined,

    // Legal information
    legal_type: data.legal_type || undefined,
    legal_phase: data.legal_phase || undefined,
    tipo_procedimiento: data.tipo_procedimiento || undefined,
    fase_procedimiento: data.fase_procedimiento || undefined,
    fase_actual: data.fase_actual || undefined,

    // Status
    registration_status: data.registration_status || undefined,
    working_status: data.working_status || undefined,
    marketing_status: data.marketing_status || undefined,
    marketing_suspended_reason: data.marketing_suspended_reason || undefined,
    estado_posesion_fisica: data.estado_posesion_fisica || undefined,

    // Dates
    closing_date: convertTimestamp(data.closing_date),
    portfolio_closing_date: convertTimestamp(data.portfolio_closing_date),
    date_under_re_mgmt: convertTimestamp(data.date_under_re_mgmt),
    fecha_subasta: convertTimestamp(data.fecha_subasta),
    fecha_cesion_remate: convertTimestamp(data.fecha_cesion_remate),

    // Additional information
    campania: data.campania || undefined,
    portfolio: data.portfolio || undefined,
    borrower_name: data.borrower_name || undefined,
    hip_under_re_mgmt: data.hip_under_re_mgmt || undefined,
    reference_code_1: data.reference_code_1 || undefined,

    // UI fields
    imageUrl: data.imageUrl || undefined,
    features: data.features || [],
    documents: data.documents || [],
    history: data.history || [],
    createdAt: convertTimestamp(data.createdAt) || new Date(),
  }

  return asset
}

// Get a single property by ID
export async function getPropertyById(id: string, user?: User | null): Promise<Asset | null> {
  try {
    // Check cache first
    if (propertyCache.has(id)) {
      const cachedData = propertyCache.get(id)!
      const cacheTime = cachedData.cacheTime as unknown as number

      // Return cached data if it's still valid
      if (cacheTime && Date.now() - cacheTime < CACHE_EXPIRY) {
        return cachedData
      }
    }

    const propertyDoc = await getDoc(doc(db, "inmuebles", id))

    if (!propertyDoc.exists()) {
      return null
    }

    const asset = convertDocToAsset(propertyDoc)

    // Add to cache with timestamp
    const assetWithCache = {
      ...asset,
      cacheTime: Date.now(),
    }
    propertyCache.set(id, assetWithCache)

    return asset
  } catch (error) {
    console.error("Error fetching property:", error)
    throw new Error("Failed to fetch property details")
  }
}

// Get all properties without any filtering or sorting - avoids index requirements
export async function getAllProperties(limit = 500): Promise<Asset[]> {
  try {
    // Simple query with just a limit - no filtering or sorting
    const propertiesQuery = query(collection(db, "inmuebles"), limit)
    const querySnapshot = await getDocs(propertiesQuery)

    const properties: Asset[] = []

    querySnapshot.forEach((doc) => {
      const asset = convertDocToAsset(doc)
      properties.push(asset)
    })

    return properties
  } catch (error) {
    console.error("Error fetching all properties:", error)
    return []
  }
}

// Get properties with pagination and filtering - Modified to completely avoid composite indexes
export async function getProperties(
  filters?: AssetFilter,
  pageSize = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  user?: User | null,
): Promise<{ properties: Asset[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    console.log("Property service: Getting properties with filters:", filters)

    // To avoid requiring composite indexes, we'll use different strategies:

    // 1. If no filters are applied, we can use orderBy safely
    if (!filters || Object.values(filters).every((v) => !v || v === "ALL")) {
      // No filters, just sort by createdAt
      const simpleQuery = query(collection(db, "inmuebles"), orderBy("createdAt", "desc"), limit(pageSize))

      // Apply pagination for non-filtered queries
      if (lastVisible) {
        const paginatedQuery = query(
          collection(db, "inmuebles"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(pageSize),
        )

        const querySnapshot = await getDocs(paginatedQuery)
        const properties: Asset[] = []
        let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null

        querySnapshot.forEach((doc) => {
          properties.push(convertDocToAsset(doc))
          newLastVisible = doc
        })

        return { properties, lastVisible: newLastVisible }
      }

      const querySnapshot = await getDocs(simpleQuery)
      const properties: Asset[] = []
      let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null

      querySnapshot.forEach((doc) => {
        properties.push(convertDocToAsset(doc))
        newLastVisible = doc
      })

      return { properties, lastVisible: newLastVisible }
    }

    // 2. For filtered queries, we'll fetch all properties and filter client-side
    // This is less efficient but avoids index requirements
    const allProperties = await getAllProperties(500) // Limit to 500 to avoid excessive reads

    // Apply filters client-side
    let filteredProperties = allProperties

    if (filters) {
      filteredProperties = allProperties.filter((asset) => {
        let include = true

        // Apply all filters
        if (filters.property_type && filters.property_type !== "ALL" && asset.property_type !== filters.property_type) {
          include = false
        }

        if (
          include &&
          filters.marketing_status &&
          filters.marketing_status !== "ALL" &&
          asset.marketing_status !== filters.marketing_status
        ) {
          include = false
        }

        if (
          include &&
          filters.legal_phase &&
          filters.legal_phase !== "ALL" &&
          asset.legal_phase !== filters.legal_phase
        ) {
          include = false
        }

        if (include && filters.province && filters.province !== "ALL" && asset.province !== filters.province) {
          include = false
        }

        if (include && filters.city && filters.city !== "ALL" && asset.city !== filters.city) {
          include = false
        }

        // Apply numeric range filters
        if (include && filters.minPrice && asset.price_approx && asset.price_approx < filters.minPrice) {
          include = false
        }

        if (include && filters.maxPrice && asset.price_approx && asset.price_approx > filters.maxPrice) {
          include = false
        }

        if (include && filters.minSqm && asset.sqm && asset.sqm < filters.minSqm) {
          include = false
        }

        if (include && filters.maxSqm && asset.sqm && asset.sqm > filters.maxSqm) {
          include = false
        }

        return include
      })
    }

    // Sort by createdAt manually
    filteredProperties.sort((a, b) => {
      const dateA = a.createdAt?.getTime() || 0
      const dateB = b.createdAt?.getTime() || 0
      return dateB - dateA // Descending order (newest first)
    })

    // Handle pagination manually
    let startIndex = 0
    if (lastVisible) {
      // Find the index of the last visible item
      const lastId = lastVisible.id
      const lastIndex = filteredProperties.findIndex((asset) => asset.id === lastId)
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1
      }
    }

    // Get the current page of results
    const endIndex = startIndex + pageSize
    const pagedProperties = filteredProperties.slice(startIndex, endIndex)

    // Set the last visible doc for pagination
    let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null
    if (pagedProperties.length > 0) {
      const lastId = pagedProperties[pagedProperties.length - 1].id
      // This is a mock last visible document since we're not using Firestore's pagination
      newLastVisible = { id: lastId } as QueryDocumentSnapshot<DocumentData>
    }

    return {
      properties: pagedProperties,
      lastVisible: newLastVisible,
    }
  } catch (error) {
    console.error("Error fetching properties:", error)
    return { properties: [], lastVisible: null }
  }
}

// Get unique values for filters
export async function getUniqueFieldValues(field: string): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "inmuebles"))
    const uniqueValues = new Set<string>()

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data[field]) {
        uniqueValues.add(data[field])
      }
    })

    return Array.from(uniqueValues).sort()
  } catch (error) {
    console.error(`Error fetching unique ${field} values:`, error)
    return []
  }
}

// Get property statistics
export async function getPropertyStats(userId?: string): Promise<{
  totalProperties: number
  totalValue: number
  totalLocations: number
  averageValue: number
}> {
  try {
    const querySnapshot = await getDocs(collection(db, "inmuebles"))

    let totalProperties = 0
    let totalValue = 0
    const locations = new Set<string>()

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      totalProperties++

      if (data.price_approx) {
        totalValue += data.price_approx
      }

      if (data.city) {
        locations.add(data.city)
      }
    })

    const averageValue = totalProperties > 0 ? Math.round(totalValue / totalProperties) : 0

    return {
      totalProperties,
      totalValue,
      totalLocations: locations.size,
      averageValue,
    }
  } catch (error) {
    console.error("Error fetching property stats:", error)
    return {
      totalProperties: 0,
      totalValue: 0,
      totalLocations: 0,
      averageValue: 0,
    }
  }
}

// Search properties by text query - client-side approach
export async function searchProperties(query: string): Promise<Asset[]> {
  try {
    if (!query.trim()) {
      return []
    }

    // Get all properties and filter client-side
    const allProperties = await getAllProperties(500)
    const normalizedQuery = normalizeText(query.toLowerCase())

    // Filter by the search query
    const results = allProperties.filter((asset) => {
      // Search across multiple fields
      const searchableFields = [
        asset.reference_code,
        asset.address,
        asset.city,
        asset.province,
        asset.property_type,
        asset.property_general_subtype,
        asset.marketing_status,
        asset.legal_phase,
        asset.extras,
      ]
        .filter(Boolean)
        .map((field) => normalizeText(field || ""))

      return searchableFields.some((field) => field.includes(normalizedQuery))
    })

    return results
  } catch (error) {
    console.error("Error searching properties:", error)
    return []
  }
}

// Get filtered properties - client-side approach
export async function getFilteredProperties(filters: Record<string, string | undefined>): Promise<Asset[]> {
  try {
    // Convert the filters to the AssetFilter type
    const assetFilters: AssetFilter = {
      property_type: filters.property_type,
      marketing_status: filters.marketing_status,
      legal_phase: filters.legal_phase,
      province: filters.province,
      city: filters.city,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minSqm: filters.minSqm ? Number(filters.minSqm) : undefined,
      maxSqm: filters.maxSqm ? Number(filters.maxSqm) : undefined,
      query: filters.query,
    }

    // Use the getProperties function to get filtered properties
    const result = await getProperties(assetFilters, 100)
    return result.properties
  } catch (error) {
    console.error("Error fetching filtered properties:", error)
    return []
  }
}

// Get provinces
export async function getProvinces(): Promise<string[]> {
  return getUniqueFieldValues("province")
}

// Get cities
export async function getCities(province?: string): Promise<string[]> {
  try {
    // If no province is specified, just get all unique cities
    if (!province || province === "ALL") {
      return getUniqueFieldValues("city")
    }

    // Otherwise, get all properties and filter client-side
    const allProperties = await getAllProperties(500)
    const cities = new Set<string>()

    allProperties.forEach((asset) => {
      if (asset.province === province && asset.city) {
        cities.add(asset.city)
      }
    })

    return Array.from(cities).sort()
  } catch (error) {
    console.error("Error fetching cities:", error)
    return []
  }
}

// Get property types
export async function getPropertyTypes(): Promise<string[]> {
  return getUniqueFieldValues("property_type")
}

// Get marketing statuses
export async function getMarketingStatuses(): Promise<string[]> {
  return getUniqueFieldValues("marketing_status")
}

// Get legal phases
export async function getLegalPhases(): Promise<string[]> {
  return getUniqueFieldValues("legal_phase")
}
