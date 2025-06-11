import { type NextRequest, NextResponse } from 'next/server';
import type { Asset } from '@/types/asset';
import { searchAssets, searchClient, ALGOLIA_INDEX_NAME } from '@/lib/algolia'; // Import searchClient and ALGOLIA_INDEX_NAME
import { formatAlgoliaFilters } from '@/lib/utils';

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

    // --- Added Logging Before Algolia Search ---
    console.log("Inspecting searchClient before search:");
    console.log("searchClient appId:", searchClient.appId);
    console.log("searchClient addAlgoliaAgent:", (searchClient as any).addAlgoliaAgent); // Accessing potentially private property for inspection

    const index = searchClient.initIndex(ALGOLIA_INDEX_NAME);
    console.log("Inspecting index object before search:");
    console.log("index indexName:", index.indexName);
    console.log("index settings:", (index as any).settings); // Accessing potentially private property for inspection

    const settings = await index.getSettings();
    console.log("Explicitly fetched index settings:", settings);
    // --- End Added Logging Before Algolia Search ---

    const { hits, nbHits, facets, processingTimeMS } = await searchAssets(query, {
      filters: formattedFilters,
      hitsPerPage: pageSize,
      facets: ['property_type', 'provincia_catastro', 'municipio_catastro'], // Specify facets to retrieve
    });

    console.log("Algolia search response:", { hits, nbHits, facets, processingTimeMS });

    console.log("Received hits from Algolia:", hits);
    console.log("Algolia search hits:", hits.length)
    console.log("Algolia facets:", facets)

    console.log("Sending response from search API.");
    const response = {
      assets: hits,
      totalCount: nbHits,
      facets: facets || {}, // Ensure facets is not undefined
      searchTime: Date.now() - Date.now(), // Placeholder
    };
    console.log("API route response:", response);

    // --- Added Logging After Algolia Search ---
    console.log("Inspecting searchClient after search:");
    console.log("searchClient appId:", searchClient.appId);
    console.log("searchClient addAlgoliaAgent:", (searchClient as any).addAlgoliaAgent);
    console.log("Inspecting index object after search:");
    console.log("index indexName:", index.indexName);
    console.log("index settings:", (index as any).settings);
    // --- End Added Logging After Algolia Search ---

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
