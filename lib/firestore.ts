// Firestore helper functions and mocks for client-side and server-side code
import type { Asset, AssetFilter } from "@/types/asset"
import { collection, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getUniqueFieldValues } from "@/lib/firestore/property-service"

/**
 * Get available asset types (unique values from Firestore).
 */
export async function getAssetTypes(): Promise<string[]> {
  return getUniqueFieldValues("property_type")
}

/**
 * Get available provinces (unique values from Firestore).
 */
export async function getProvinces(): Promise<string[]> {
  return getUniqueFieldValues("province")
}

/**
 * Get available portfolios (unique values from Firestore).
 */
export async function getPortfolios(): Promise<string[]> {
  return getUniqueFieldValues("portfolio")
}

/**
 * Create a new asset in Firestore.
 */
export async function createAsset(assetData: Partial<Asset>): Promise<void> {
  await addDoc(collection(db, "inmueblesMayo"), assetData)
}

/**
 * Mock sample assets for client-side development or testing.
 */
export const sampleAssets: Asset[] = []

/**
 * Get assets for filtered properties (used in property-service).
 */
export async function getAssets(filters?: AssetFilter): Promise<Asset[]> {
  // This is a stub implementation. Replace with real filtering logic as needed.
  return sampleAssets
}