import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  orderBy,
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

// Get properties with pagination and filtering
export async function getProperties(
  filters?: AssetFilter,
  pageSize = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  user?: User | null,
): Promise<{ properties: Asset[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const propertiesQuery = collection(db, "inmuebles")
    const constraints: any[] = []

    // Apply filters if provided
    if (filters) {
      if (filters.property_type && filters.property_type !== "ALL") {
        constraints.push(where("property_type", "==", filters.property_type))
      }

      if (filters.marketing_status && filters.marketing_status !== "ALL") {
        constraints.push(where("marketing_status", "==", filters.marketing_status))
      }

      if (filters.legal_phase && filters.legal_phase !== "ALL") {
        constraints.push(where("legal_phase", "==", filters.legal_phase))
      }

      if (filters.province && filters.province !== "ALL") {
        constraints.push(where("province", "==", filters.province))
      }

      if (filters.city && filters.city !== "ALL") {
        constraints.push(where("city", "==", filters.city))
      }

      // Note: For range queries (price, sqm), we'd need composite indexes in Firestore
      // For simplicity, we'll filter these client-side
    }

    // Add sorting and pagination
    constraints.push(orderBy("createdAt", "desc"))

    if (lastVisible) {
      constraints.push(startAfter(lastVisible))
    }

    constraints.push(limit(pageSize))

    // Execute query
    const q = query(propertiesQuery, ...constraints)
    const querySnapshot = await getDocs(q)

    // Process results
    const properties: Asset[] = []
    let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null

    querySnapshot.forEach((doc) => {
      const asset = convertDocToAsset(doc)

      // Apply client-side filtering for range queries
      let includeAsset = true

      if (filters?.minPrice && asset.price_approx) {
        includeAsset = includeAsset && asset.price_approx >= filters.minPrice
      }

      if (filters?.maxPrice && asset.price_approx) {
        includeAsset = includeAsset && asset.price_approx <= filters.maxPrice
      }

      if (filters?.minSqm && asset.sqm) {
        includeAsset = includeAsset && asset.sqm >= filters.minSqm
      }

      if (filters?.maxSqm && asset.sqm) {
        includeAsset = includeAsset && asset.sqm <= filters.maxSqm
      }

      // Text search
      if (filters?.query && filters.query.trim() !== "") {
        const normalizedQuery = normalizeText(filters.query)
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

        includeAsset = includeAsset && searchableFields.some((field) => field.includes(normalizedQuery))
      }

      if (includeAsset) {
        properties.push(asset)
      }
    })

    // Set the last visible document for pagination
    if (querySnapshot.docs.length > 0) {
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
    }

    return { properties, lastVisible: newLastVisible }
  } catch (error) {
    console.error("Error fetching properties:", error)
    throw new Error("Failed to fetch properties")
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

// Search properties by text query
export async function searchProperties(query: string): Promise<Asset[]> {
  try {
    if (!query.trim()) {
      return []
    }

    const normalizedQuery = normalizeText(query)
    const querySnapshot = await getDocs(collection(db, "inmuebles"))
    const results: Asset[] = []

    querySnapshot.forEach((doc) => {
      const asset = convertDocToAsset(doc)

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

      if (searchableFields.some((field) => field.includes(normalizedQuery))) {
        results.push(asset)
      }
    })

    return results
  } catch (error) {
    console.error("Error searching properties:", error)
    return []
  }
}
