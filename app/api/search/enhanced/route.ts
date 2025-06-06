import { type NextRequest, NextResponse } from "next/server"
import { SearchManager } from "@/lib/search/search-manager"
import {
  RateLimitError,
  type SearchFilters,
  type SearchOptions,
  type SearchResult,
} from "@/lib/search/vertex-ai-service"
import { v4 as uuidv4 } from "uuid"

const searchManager = new SearchManager(true) // Initialize SearchManager, true to attempt Vertex AI

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      query = "",
      filters = {},
      options = {},
    } = body as { query?: string; filters?: SearchFilters; options?: SearchOptions }

    const userPseudoId = options.userPseudoId || req.cookies.get("user_pseudo_id")?.value || uuidv4()

    // Set cookie for userPseudoId if not present, for session consistency
    let responseHeaders: HeadersInit | undefined
    if (!req.cookies.get("user_pseudo_id")) {
      responseHeaders = {
        "Set-Cookie": `user_pseudo_id=${userPseudoId}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 30}`,
      } // 30 days
    }

    const results: SearchResult = await searchManager.search(query, filters, { ...options, userPseudoId })

    if (results.errorType === "RateLimitError") {
      return NextResponse.json(
        { error: results.error, type: "RateLimitError" },
        { status: 429, headers: responseHeaders },
      )
    }
    if (results.errorType === "SearchError") {
      return NextResponse.json({ error: results.error, type: "SearchError" }, { status: 500, headers: responseHeaders })
    }

    return NextResponse.json(results, { headers: responseHeaders })
  } catch (error: any) {
    // Catch unexpected errors during SearchManager instantiation or other issues
    console.error("[API/SEARCH/ENHANCED] Unhandled Error:", error)
    // Check if it's a RateLimitError that bubbled up before SearchManager could package it
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message, type: "RateLimitError" }, { status: 429 })
    }
    return NextResponse.json(
      { error: "Search operation failed unexpectedly.", details: error.message, type: "GenericError" },
      { status: 500 },
    )
  }
}
