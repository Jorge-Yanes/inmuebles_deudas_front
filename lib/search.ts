import type { Asset } from "@/types/asset"
import { sampleAssets } from "./firestore"
import { normalizeText } from "./utils"
import { searchProperties } from "@/lib/firestore/property-service"

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
  if (!query.trim()) {
    return []
  }

  try {
    // Get properties that match the query
    const properties = await searchProperties(query)

    const normalizedQuery = normalizeText(query)
    const suggestions = new Set<string>()

    // Extract suggestions from various fields
    properties.forEach((property) => {
      // Add location suggestions
      if (property.city && normalizeText(property.city).includes(normalizedQuery)) {
        suggestions.add(property.city)
      }

      // Add province suggestions
      if (property.province && normalizeText(property.province).includes(normalizedQuery)) {
        suggestions.add(property.province)
      }

      // Add property type suggestions
      if (property.property_type && normalizeText(property.property_type).includes(normalizedQuery)) {
        suggestions.add(property.property_type)
      }

      // Add reference code suggestions
      if (property.reference_code && normalizeText(property.reference_code).includes(normalizedQuery)) {
        suggestions.add(property.reference_code)
      }

      // Add title word suggestions if title exists
      if (property.title) {
        property.title.split(" ").forEach((word) => {
          if (normalizeText(word).includes(normalizedQuery) && word.length > 3) {
            suggestions.add(word)
          }
        })
      }
    })

    return Array.from(suggestions).slice(0, 5)
  } catch (error) {
    console.error("Error getting search suggestions:", error)
    return []
  }
}

// Export the sample assets to make them available for modification
export { sampleAssets }
