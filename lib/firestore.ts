import { db } from "@/lib/firebase"
import type { Asset } from "@/types/asset"
import { collection, getDocs, addDoc } from "firebase/firestore"

// This is a placeholder array that will be used as a fallback
// It's exported to maintain compatibility with existing code
export const sampleAssets: Asset[] = []

// Create a new asset
export async function createAsset(assetData: Partial<Asset>) {
  try {
    const assetsRef = collection(db, "properties")

    // Add createdAt timestamp if not provided
    if (!assetData.createdAt) {
      assetData.createdAt = new Date()
    }

    // Add the asset to Firestore
    const docRef = await addDoc(assetsRef, assetData)
    console.log("Asset created with ID:", docRef.id)

    return true
  } catch (error) {
    console.error("Error creating asset:", error)
    return false
  }
}

// Get all unique asset types
export async function getAssetTypes(): Promise<string[]> {
  try {
    const assetsRef = collection(db, "properties")
    const assetsSnapshot = await getDocs(assetsRef)

    const types = assetsSnapshot.docs.map((doc) => doc.data().property_type).filter(Boolean)

    return Array.from(new Set(types)).sort()
  } catch (error) {
    console.error("Error getting asset types:", error)
    return ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "LAND", "PARKING", "STORAGE"]
  }
}

// Get all unique portfolios
export async function getPortfolios(): Promise<string[]> {
  try {
    const assetsRef = collection(db, "properties")
    const assetsSnapshot = await getDocs(assetsRef)

    const portfolios = assetsSnapshot.docs.map((doc) => doc.data().portfolio).filter(Boolean)

    return Array.from(new Set(portfolios)).sort()
  } catch (error) {
    console.error("Error getting portfolios:", error)
    return []
  }
}

// Get all unique provinces
export async function getProvinces() {
  try {
    const assetsRef = collection(db, "properties")
    const assetsSnapshot = await getDocs(assetsRef)

    const provinces = assetsSnapshot.docs.map((doc) => doc.data().province).filter(Boolean)

    return Array.from(new Set(provinces)).sort()
  } catch (error) {
    console.error("Error getting provinces:", error)
    return []
  }
}
