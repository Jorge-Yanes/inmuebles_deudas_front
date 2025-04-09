import type { Asset } from "@/types/asset"
import { sampleAssets } from "./firestore"
import { normalizeText } from "./utils"

// This is a client-side search implementation
// For a production app with large datasets, consider using:
// 1. Firestore queries with composite indexes
// 2. Algolia or similar search service integrated with Firestore
// 3. Server-side search implementation with proper pagination

// Search assets by any field
export async function searchAssets(query: string): Promise<Asset[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  if (!query.trim()) {
    return []
  }

  const normalizedQuery = normalizeText(query)

  // Search across all text fields
  return sampleAssets.filter((asset) => {
    return (
      normalizeText(asset.title).includes(normalizedQuery) ||
      normalizeText(asset.description).includes(normalizedQuery) ||
      normalizeText(asset.location).includes(normalizedQuery) ||
      normalizeText(asset.type).includes(normalizedQuery) ||
      normalizeText(asset.status).includes(normalizedQuery) ||
      normalizeText(asset.owner).includes(normalizedQuery) ||
      // Search in numeric fields by converting to string
      asset.price
        .toString()
        .includes(normalizedQuery) ||
      asset.area.toString().includes(normalizedQuery) ||
      asset.year.toString().includes(normalizedQuery)
    )
  })
}

// Get search suggestions based on partial input
export async function getSearchSuggestions(query: string): Promise<string[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  if (!query.trim()) {
    return []
  }

  const normalizedQuery = normalizeText(query)
  const suggestions = new Set<string>()

  // Extract suggestions from various fields
  sampleAssets.forEach((asset) => {
    // Add location suggestions
    if (normalizeText(asset.location).includes(normalizedQuery)) {
      suggestions.add(asset.location)
    }

    // Add type suggestions
    if (normalizeText(asset.type).includes(normalizedQuery)) {
      suggestions.add(asset.type)
    }

    // Add title word suggestions
    asset.title.split(" ").forEach((word) => {
      if (normalizeText(word).includes(normalizedQuery) && word.length > 3) {
        suggestions.add(word)
      }
    })
  })

  return Array.from(suggestions).slice(0, 5)
}

// Export the sample assets to make them available for modification
export { sampleAssets }
