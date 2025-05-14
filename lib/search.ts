import { searchProperties } from "./firestore/property-service"
import { normalizeText } from "./utils"
import type { Asset } from "@/types/asset"

// Search assets by query
export async function searchAssets(query: string): Promise<Asset[]> {
  try {
    if (!query.trim()) {
      return []
    }

    // Use the searchProperties function from property-service
    return await searchProperties(query)
  } catch (error) {
    console.error("Error searching assets:", error)
    return []
  }
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

// Filter assets by criteria
export function filterAssets(assets: Asset[], filters: Record<string, string | number | boolean | undefined>): Asset[] {
  return assets.filter((asset) => {
    // Check each filter
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === "" || value === "ALL") {
        continue
      }

      // Handle special cases
      if (key === "minPrice" && asset.price_approx) {
        if (asset.price_approx < Number(value)) return false
      } else if (key === "maxPrice" && asset.price_approx) {
        if (asset.price_approx > Number(value)) return false
      } else if (key === "minSqm" && asset.sqm) {
        if (asset.sqm < Number(value)) return false
      } else if (key === "maxSqm" && asset.sqm) {
        if (asset.sqm > Number(value)) return false
      } else if (key === "query" && typeof value === "string") {
        // Search in multiple fields
        const normalizedQuery = normalizeText(value)
        const searchableFields = [
          asset.title,
          asset.description,
          asset.address,
          asset.city,
          asset.province,
          asset.property_type,
          asset.property_general_subtype,
          asset.reference_code,
          asset.extras,
        ]
          .filter(Boolean)
          .map((field) => normalizeText(field || ""))

        if (!searchableFields.some((field) => field.includes(normalizedQuery))) {
          return false
        }
      } else {
        // Regular property check
        const assetValue = (asset as any)[key]
        if (assetValue === undefined || assetValue === null) return false
        if (assetValue !== value) return false
      }
    }

    return true
  })
}

// Sort assets by field
export function sortAssets(assets: Asset[], field: keyof Asset, direction: "asc" | "desc" = "asc"): Asset[] {
  return [...assets].sort((a, b) => {
    const valueA = a[field]
    const valueB = b[field]

    // Handle undefined values
    if (valueA === undefined && valueB === undefined) return 0
    if (valueA === undefined) return direction === "asc" ? 1 : -1
    if (valueB === undefined) return direction === "asc" ? -1 : 1

    // Compare dates
    if (valueA instanceof Date && valueB instanceof Date) {
      return direction === "asc" ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime()
    }

    // Compare strings
    if (typeof valueA === "string" && typeof valueB === "string") {
      return direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
    }

    // Compare numbers
    if (typeof valueA === "number" && typeof valueB === "number") {
      return direction === "asc" ? valueA - valueB : valueB - valueA
    }

    // Default comparison
    return 0
  })
}

// Group assets by field
export function groupAssetsByField(assets: Asset[], field: keyof Asset): Record<string, Asset[]> {
  return assets.reduce(
    (groups, asset) => {
      const value = asset[field]
      const key = value ? String(value) : "Unknown"

      if (!groups[key]) {
        groups[key] = []
      }

      groups[key].push(asset)
      return groups
    },
    {} as Record<string, Asset[]>,
  )
}
