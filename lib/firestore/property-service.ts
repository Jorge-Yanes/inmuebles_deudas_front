import { db } from "@/lib/firebase"
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
  limit,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  updateDoc,
  deleteDoc,
  type QueryConstraint,
} from "firebase/firestore"
import type { Asset, AssetFilter } from "@/types/asset"
import { generateTitle, generateDescription, normalizeText } from "@/lib/utils"

// Cache for property data to improve performance
const propertyCache = new Map<string, Asset>()
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

// Convert Firestore timestamp to Date
const convertTimestamp = (timestamp: Timestamp | undefined): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined
}

// Convert Firestore document to Asset type
const convertDocToAsset = (doc: DocumentData): Asset => {
  const data = doc.data()

  // Handle Firestore Timestamp conversion to Date
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt || new Date()

  const fechaSubasta = data.fecha_subasta instanceof Timestamp ? data.fecha_subasta.toDate() : data.fecha_subasta

  return {
    id: doc.id,
    ndg: data.ndg || "",
    property_id: data.property_id || 0,
    reference_code: data.reference_code || "",
    property_type: data.property_type || "",
    property_general_subtype: data.property_general_subtype || "",
    province: data.province || "",
    city: data.city || "",
    address: data.address || "",
    zip_code: data.zip_code || "",
    floor: data.floor || "",
    door: data.door || "",
    sqm: data.sqm || 0,
    rooms: data.rooms || 0,
    bathrooms: data.bathrooms || 0,
    has_parking: data.has_parking || 0,
    extras: data.extras || "",
    price_approx: data.price_approx || 0,
    auction_base: data.auction_base || 0,
    legal_phase: data.legal_phase || "",
    marketing_status: data.marketing_status || "",
    estado_posesion_fisica: data.estado_posesion_fisica || "",
    fecha_subasta: fechaSubasta,
    imageUrl: data.imageUrl || "/placeholder.svg?height=200&width=400",
    createdAt: createdAt,
    title: data.title || "",
    description: data.description || "",
    cadastral_reference: data.cadastral_reference || "",
  }
}

// Get all properties with optional filtering
export async function getProperties(
  filters?: AssetFilter,
  pageSize = 10,
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<{ assets: Asset[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    const propertiesRef = collection(db, "properties")
    const constraints: QueryConstraint[] = []

    // Add filters if provided
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
      // Note: For range filters (price, sqm), we'd need composite indexes or separate queries
    }

    // Add ordering and pagination
    constraints.push(orderBy("createdAt", "desc"))
    constraints.push(limit(pageSize))

    // Add startAfter if we have a last document
    if (lastDoc) {
      constraints.push(startAfter(lastDoc))
    }

    const q = query(propertiesRef, ...constraints)
    const querySnapshot = await getDocs(q)

    const assets: Asset[] = []
    let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null

    querySnapshot.forEach((doc) => {
      const asset = convertDocToAsset(doc)

      // Generate title and description if not available
      if (!asset.title) {
        asset.title = generateTitle(asset)
      }
      if (!asset.description) {
        asset.description = generateDescription(asset)
      }

      assets.push(asset)
      lastVisible = doc
    })

    return { assets, lastDoc: lastVisible }
  } catch (error) {
    console.error("Error getting properties:", error)
    return { assets: [], lastDoc: null }
  }
}

// Get a single property by ID
export async function getPropertyById(id: string): Promise<Asset | null> {
  try {
    const propertyRef = doc(db, "properties", id)
    const propertyDoc = await getDoc(propertyRef)

    if (!propertyDoc.exists()) {
      return null
    }

    const asset = convertDocToAsset(propertyDoc)

    // Generate title and description if not available
    if (!asset.title) {
      asset.title = generateTitle(asset)
    }
    if (!asset.description) {
      asset.description = generateDescription(asset)
    }

    return asset
  } catch (error) {
    console.error("Error getting property by ID:", error)
    return null
  }
}

// Search properties by query string
export async function searchProperties(query: string): Promise<Asset[]> {
  try {
    // In a production app, you would use a proper search service like Algolia
    // For now, we'll do a simple search across multiple fields
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const normalizedQuery = normalizeText(query)
    const results: Asset[] = []

    querySnapshot.forEach((doc) => {
      const asset = convertDocToAsset(doc)

      // Generate title and description if not available
      if (!asset.title) {
        asset.title = generateTitle(asset)
      }
      if (!asset.description) {
        asset.description = generateDescription(asset)
      }

      // Search across multiple fields
      if (
        normalizeText(asset.title).includes(normalizedQuery) ||
        normalizeText(asset.description).includes(normalizedQuery) ||
        normalizeText(asset.address || "").includes(normalizedQuery) ||
        normalizeText(asset.city || "").includes(normalizedQuery) ||
        normalizeText(asset.province || "").includes(normalizedQuery) ||
        normalizeText(asset.property_type || "").includes(normalizedQuery) ||
        normalizeText(asset.property_general_subtype || "").includes(normalizedQuery) ||
        normalizeText(asset.reference_code || "").includes(normalizedQuery) ||
        normalizeText(asset.extras || "").includes(normalizedQuery)
      ) {
        results.push(asset)
      }
    })

    return results
  } catch (error) {
    console.error("Error searching properties:", error)
    return []
  }
}

// Get property statistics - renamed from getAssetStats to maintain compatibility
export async function getPropertyStats(userId?: string) {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

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

    const totalLocations = locations.size
    const averageValue = totalProperties > 0 ? Math.round(totalValue / totalProperties) : 0

    return {
      totalProperties,
      totalValue,
      totalLocations,
      averageValue,
    }
  } catch (error) {
    console.error("Error getting property stats:", error)
    return {
      totalProperties: 0,
      totalValue: 0,
      totalLocations: 0,
      averageValue: 0,
    }
  }
}

// Get recent assets
export async function getRecentAssets(userId?: string, count = 3) {
  try {
    const propertiesRef = collection(db, "properties")
    const q = query(propertiesRef, orderBy("createdAt", "desc"), limit(count))
    const querySnapshot = await getDocs(q)

    const assets: Asset[] = []
    querySnapshot.forEach((doc) => {
      const asset = convertDocToAsset(doc)

      // Generate title and description if not available
      if (!asset.title) {
        asset.title = generateTitle(asset)
      }
      if (!asset.description) {
        asset.description = generateDescription(asset)
      }

      assets.push(asset)
    })

    return assets
  } catch (error) {
    console.error("Error getting recent assets:", error)
    return []
  }
}

// Get all unique locations (cities)
export async function getLocations(): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const locations = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.city) {
        locations.add(data.city)
      }
    })

    return Array.from(locations).sort()
  } catch (error) {
    console.error("Error getting locations:", error)
    return []
  }
}

// Get all unique provinces
export async function getProvinces(): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const provinces = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.province) {
        provinces.add(data.province)
      }
    })

    return Array.from(provinces).sort()
  } catch (error) {
    console.error("Error getting provinces:", error)
    return []
  }
}

// Get all unique asset types
export async function getAssetTypes(): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const types = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.property_type) {
        types.add(data.property_type)
      }
    })

    return Array.from(types).sort()
  } catch (error) {
    console.error("Error getting asset types:", error)
    return []
  }
}

// Create a new asset
export async function createAsset(assetData: Partial<Asset>): Promise<string | null> {
  try {
    const propertiesRef = collection(db, "properties")

    // Add createdAt timestamp if not provided
    if (!assetData.createdAt) {
      assetData.createdAt = new Date()
    }

    const docRef = await addDoc(propertiesRef, assetData)
    return docRef.id
  } catch (error) {
    console.error("Error creating asset:", error)
    return null
  }
}

// Update an existing asset
export async function updateAsset(id: string, assetData: Partial<Asset>): Promise<boolean> {
  try {
    const propertyRef = doc(db, "properties", id)
    await updateDoc(propertyRef, assetData)
    return true
  } catch (error) {
    console.error("Error updating asset:", error)
    return false
  }
}

// Delete an asset
export async function deleteAsset(id: string): Promise<boolean> {
  try {
    const propertyRef = doc(db, "properties", id)
    await deleteDoc(propertyRef)
    return true
  } catch (error) {
    console.error("Error deleting asset:", error)
    return false
  }
}

// Check if a user has access to an asset
export async function checkAssetAccess(userId: string, assetId: string): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Get the user's permissions from a separate collection
    // 2. Get the asset details
    // 3. Check if the user has access based on asset type, province, portfolio, etc.

    // For now, we'll assume all users have access to all assets
    return true
  } catch (error) {
    console.error("Error checking asset access:", error)
    return false
  }
}

// Get all unique portfolios
export async function getPortfolios(): Promise<string[]> {
  try {
    // In a real implementation, you would query a separate collection for portfolios
    // For now, we'll return some dummy data
    return ["Portfolio A", "Portfolio B", "Portfolio C", "Legacy Assets"]
  } catch (error) {
    console.error("Error getting portfolios:", error)
    return []
  }
}

// Get filtered properties
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
    return result.assets
  } catch (error) {
    console.error("Error fetching filtered properties:", error)
    return []
  }
}

// Get property types
export async function getPropertyTypes(): Promise<string[]> {
  return getAssetTypes()
}

// Get marketing statuses
export async function getMarketingStatuses(): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const statuses = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.marketing_status) {
        statuses.add(data.marketing_status)
      }
    })

    return Array.from(statuses).sort()
  } catch (error) {
    console.error("Error getting marketing statuses:", error)
    return []
  }
}

// Get legal phases
export async function getLegalPhases(): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const phases = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.legal_phase) {
        phases.add(data.legal_phase)
      }
    })

    return Array.from(phases).sort()
  } catch (error) {
    console.error("Error getting legal phases:", error)
    return []
  }
}

// Get cities by province
export async function getCities(province?: string): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    let q = propertiesRef

    if (province && province !== "ALL") {
      q = query(propertiesRef, where("province", "==", province))
    }

    const querySnapshot = await getDocs(q)

    const cities = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.city) {
        cities.add(data.city)
      }
    })

    return Array.from(cities).sort()
  } catch (error) {
    console.error("Error getting cities:", error)
    return []
  }
}

// Get unique field values
export async function getUniqueFieldValues(field: string): Promise<string[]> {
  try {
    const propertiesRef = collection(db, "properties")
    const querySnapshot = await getDocs(propertiesRef)

    const values = new Set<string>()
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data[field]) {
        values.add(data[field])
      }
    })

    return Array.from(values).sort()
  } catch (error) {
    console.error(`Error getting unique ${field} values:`, error)
    return []
  }
}
