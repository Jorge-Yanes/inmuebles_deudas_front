import { type NextRequest, NextResponse } from "next/server"
import type { Asset } from "@/types/asset"
import { searchAssets } from "@/lib/algolia"
import { formatAlgoliaFilters } from "@/lib/utils"

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
  console.log("Received search API request.");

  try {
    const body = await req.json()
    const { query = "", filters = {}, pageSize = 20, offset = 0 } = body

    console.log("Search request:", { query, filters, pageSize, offset })

    const formattedFilters = formatAlgoliaFilters(filters)
    console.log("Formatted Algolia filters:", formattedFilters)

    const { hits, nbHits, facets, processingTimeMS } = await searchAssets(query, {
      filters: formattedFilters,
      hitsPerPage: pageSize,
      page: offset / pageSize,
      facets: ['property_type', 'provincia_catastro', 'municipio_catastro'], // Specify facets to retrieve
    });

    console.log("Received hits from Algolia:", hits);
    console.log("Algolia search hits:", hits.length)
    console.log("Algolia facets:", facets)

    console.log("Sending response from search API.");
    const response = {
 assets: hits,
 totalCount: nbHits,
 facets: facets || {}, // Ensure facets is not undefined
      searchTime: Date.now() - Date.now(), // Placeholder
    }
    // TODO: Update the searchTime calculation based on Algolia's response.
    console.log(`Search completed in ${processingTimeMS}ms with ${nbHits} total results.`)

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
