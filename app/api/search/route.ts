import { type NextRequest, NextResponse } from "next/server"
import { getAllProperties } from "@/lib/firestore/property-service"
import type { Asset } from "@/types/asset"

interface SearchFilters {
  property_type?: string
  provincia_catastro?: string
  municipio_catastro?: string
  price_min?: number
  price_max?: number
  surface_min?: number
  surface_max?: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query = "", filters = {}, pageSize = 20, offset = 0 } = body

    console.log("Search request:", { query, filters, pageSize, offset })

    // Get all properties from Firestore
    const allProperties = await getAllProperties(1000)

    let results = allProperties

    // Apply text search if query provided
    if (query.trim()) {
      const normalizedQuery = query.toLowerCase().trim()
      results = results.filter((asset: Asset) => {
        const searchableText = [
          asset.provincia_catastro,
          asset.municipio_catastro,
          asset.tipo_via_catastro,
          asset.nombre_via_catastro,
          asset.property_type,
          asset.reference_code,
          asset.ndg,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        return searchableText.includes(normalizedQuery)
      })
    }

    // Apply filters
    if (filters.property_type) {
      results = results.filter((asset: Asset) => asset.property_type === filters.property_type)
    }

    if (filters.provincia_catastro) {
      results = results.filter((asset: Asset) => asset.provincia_catastro === filters.provincia_catastro)
    }

    if (filters.municipio_catastro) {
      results = results.filter((asset: Asset) => asset.municipio_catastro === filters.municipio_catastro)
    }

    if (filters.price_min) {
      results = results.filter((asset: Asset) => asset.price_approx && asset.price_approx >= filters.price_min)
    }

    if (filters.price_max) {
      results = results.filter((asset: Asset) => asset.price_approx && asset.price_approx <= filters.price_max)
    }

    if (filters.surface_min) {
      results = results.filter(
        (asset: Asset) => asset.superficie_construida_m2 && asset.superficie_construida_m2 >= filters.surface_min,
      )
    }

    if (filters.surface_max) {
      results = results.filter(
        (asset: Asset) => asset.superficie_construida_m2 && asset.superficie_construida_m2 <= filters.surface_max,
      )
    }

    // Sort results (prioritize properties with price and surface data)
    results.sort((a: Asset, b: Asset) => {
      // Properties with price data first
      if (a.price_approx && !b.price_approx) return -1
      if (!a.price_approx && b.price_approx) return 1

      // Then by price (ascending)
      if (a.price_approx && b.price_approx) {
        return a.price_approx - b.price_approx
      }

      return 0
    })

    // Apply pagination
    const paginatedResults = results.slice(offset, offset + pageSize)

    // Generate facets for filtering
    const facets = generateFacets(results)

    const response = {
      assets: paginatedResults,
      totalCount: results.length,
      facets,
      searchTime: Date.now() - Date.now(), // Placeholder
    }

    console.log(`Search completed: ${paginatedResults.length} results of ${results.length} total`)

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error in search API:", error)
    return NextResponse.json(
      {
        error: "Search failed",
        message: error.message,
        assets: [],
        totalCount: 0,
        facets: {},
      },
      { status: 500 },
    )
  }
}

function generateFacets(assets: Asset[]) {
  const facets: Record<string, Array<{ value: string; count: number }>> = {}

  // Property type facets
  const propertyTypes: Record<string, number> = {}
  assets.forEach((asset) => {
    if (asset.property_type) {
      propertyTypes[asset.property_type] = (propertyTypes[asset.property_type] || 0) + 1
    }
  })

  facets.property_type = Object.entries(propertyTypes)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)

  // Province facets
  const provinces: Record<string, number> = {}
  assets.forEach((asset) => {
    if (asset.provincia_catastro) {
      provinces[asset.provincia_catastro] = (provinces[asset.provincia_catastro] || 0) + 1
    }
  })

  facets.provincia_catastro = Object.entries(provinces)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Limit to top 10

  // Municipality facets
  const municipalities: Record<string, number> = {}
  assets.forEach((asset) => {
    if (asset.municipio_catastro) {
      municipalities[asset.municipio_catastro] = (municipalities[asset.municipio_catastro] || 0) + 1
    }
  })

  facets.municipio_catastro = Object.entries(municipalities)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15) // Limit to top 15

  return facets
}
