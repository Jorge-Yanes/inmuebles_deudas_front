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
  FirestoreError,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Asset, AssetFilter } from "@/types/asset"
import type { User } from "@/types/user"
import { normalizeText, generateTitle, generateDescription } from "@/lib/utils"

// Cache for property data to improve performance
const propertyCache = new Map<string, Asset & { cacheTime: number }>()
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

/**
 * Convert Firestore timestamp to Date
 */
const convertTimestamp = (timestamp: Timestamp | undefined): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined
}

/**
 * Convert Firestore document to Asset type
 */
export const convertDocToAsset = (doc: QueryDocumentSnapshot<DocumentData>): Asset => {
  const data = doc.data()

  // Handle potential data inconsistencies with default values
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

  // Generate title and description if not provided
  if (!asset.title) {
    asset.title = generateTitle(asset)
  }

  if (!asset.description) {
    asset.description = generateDescription(asset)
  }

  return asset
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string, user?: User | null): Promise<Asset | null> {
  try {
    // Check cache first
    if (propertyCache.has(id)) {
      const cachedData = propertyCache.get(id)!

      // Return cached data if it's still valid
      if (Date.now() - cachedData.cacheTime < CACHE_EXPIRY) {
        return cachedData
      }
    }

    const propertyDoc = await getDoc(doc(db, "inmuebles", id))

    if (!propertyDoc.exists()) {
      return null
    }

    const asset = convertDocToAsset(propertyDoc as unknown as QueryDocumentSnapshot<DocumentData>)

    // Add to cache with timestamp
    propertyCache.set(id, { ...asset, cacheTime: Date.now() })

    return asset
  } catch (error) {
    console.error("Error fetching property:", error)
    throw new Error(error instanceof FirestoreError ? error.message : "Failed to fetch property details")
  }
}

/**
 * Get properties with pagination and filtering
 */
export async function getProperties(
  filters?: AssetFilter,
  pageSize = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  user?: User | null,
): Promise<{ properties: Asset[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const propertiesRef = collection(db, "inmuebles")
    const queryConstraints: any[] = []

    // Apply filters if provided
    if (filters) {
      if (filters.property_type && filters.property_type !== "ALL") {
        queryConstraints.push(where("property_type", "==", filters.property_type))
      }

      if (filters.marketing_status && filters.marketing_status !== "ALL") {
        queryConstraints.push(where("marketing_status", "==", filters.marketing_status))
      }

      if (filters.legal_phase && filters.legal_phase !== "ALL") {
        queryConstraints.push(where("legal_phase", "==", filters.legal_phase))
      }

      if (filters.province && filters.province !== "ALL") {
        queryConstraints.push(where("province", "==", filters.province))
      }

      if (filters.city && filters.city !== "ALL") {
        queryConstraints.push(where("city", "==", filters.city))
      }

      // Note: For range queries (price, sqm), we'd need composite indexes in Firestore
      // For simplicity, we'll filter these client-side after fetching
    }

    // Add sorting and pagination
    queryConstraints.push(orderBy("createdAt", "desc"))

    if (lastVisible) {
      queryConstraints.push(startAfter(lastVisible))
    }

    queryConstraints.push(limit(pageSize))

    // Execute query
    const q = query(propertiesRef, ...queryConstraints)
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
    throw new Error(error instanceof FirestoreError ? error.message : "Failed to fetch properties")
  }
}

/**
 * Get unique values for a specific field
 */
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

/**
 * Get property statistics
 */
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

/**
 * Search properties by text query
 */
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

/**
 * Get recent properties
 */
export async function getRecentProperties(limit = 3, user?: User | null): Promise<Asset[]> {
  try {
    const propertiesRef = collection(db, "inmuebles")
    const q = query(propertiesRef, orderBy("createdAt", "desc"), limit(limit))
    const querySnapshot = await getDocs(q)

    const properties: Asset[] = []
    querySnapshot.forEach((doc) => {
      properties.push(convertDocToAsset(doc))
    })

    return properties
  } catch (error) {
    console.error("Error fetching recent properties:", error)
    throw new Error(error instanceof FirestoreError ? error.message : "Failed to fetch recent properties")
  }
}

/**
 * Create a new property
 */
export async function createProperty(propertyData: Partial<Asset>): Promise<string> {
  try {
    const propertyRef = collection(db, "inmuebles")

    // Add createdAt timestamp
    const dataToSave = {
      ...propertyData,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(propertyRef, dataToSave)
    return docRef.id
  } catch (error) {
    console.error("Error creating property:", error)
    throw new Error(error instanceof FirestoreError ? error.message : "Failed to create property")
  }
}

/**
 * Update an existing property
 */
export async function updateProperty(id: string, propertyData: Partial<Asset>): Promise<void> {
  try {
    const propertyRef = doc(db, "inmuebles", id)

    // Remove id from data to update
    const { id: _, ...dataToUpdate } = propertyData

    await updateDoc(propertyRef, dataToUpdate)

    // Clear cache for this property
    if (propertyCache.has(id)) {
      propertyCache.delete(id)
    }
  } catch (error) {
    console.error("Error updating property:", error)
    throw new Error(error instanceof FirestoreError ? error.message : "Failed to update property")
  }
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string): Promise<void> {
  try {
    const propertyRef = doc(db, "inmuebles", id)
    await deleteDoc(propertyRef)

    // Clear cache for this property
    if (propertyCache.has(id)) {
      propertyCache.delete(id)
    }
  } catch (error) {
    console.error("Error deleting property:", error)
    throw new Error(error instanceof FirestoreError ? error.message : "Failed to delete property")
  }
}

/**
 * Check if a user has access to a property
 */
export async function checkPropertyAccess(userId: string, propertyId: string): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Get the user's permissions
    // 2. Get the property details
    // 3. Check if the user has access based on property type, province, portfolio, etc.

    // For now, we'll implement a basic check
    const propertyDoc = await getDoc(doc(db, "inmuebles", propertyId))

    if (!propertyDoc.exists()) {
      return false
    }

    // Get user document to check permissions
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      return false
    }

    const userData = userDoc.data()
    const propertyData = propertyDoc.data()

    // Admin has access to everything
    if (userData.role === "admin") {
      return true
    }

    // Check if user has access to this type of property
    if (userData.allowedAssetTypes && userData.allowedAssetTypes.length > 0) {
      if (!userData.allowedAssetTypes.includes(propertyData.property_type)) {
        return false
      }
    }

    // Check if user has access to this province
    if (userData.allowedProvinces && userData.allowedProvinces.length > 0) {
      if (!userData.allowedProvinces.includes(propertyData.province)) {
        return false
      }
    }

    // Check if user has access to this portfolio
    if (userData.allowedPortfolios && userData.allowedPortfolios.length > 0 && propertyData.portfolio) {
      if (!userData.allowedPortfolios.includes(propertyData.portfolio)) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error("Error checking property access:", error)
    return false
  }
}
