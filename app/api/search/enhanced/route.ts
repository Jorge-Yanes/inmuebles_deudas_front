import { type NextRequest, NextResponse } from "next/server"
import { SearchManager } from "@/lib/search/search-manager"

const searchManager = new SearchManager(true) // Use Vertex AI

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, filters = {}, options = {} } = body

    // Validate input
    if (typeof query !== "string") {
      return NextResponse.json({ error: "Query must be a string" }, { status: 400 })
    }

    // Perform search
    const result = await searchManager.search(query, filters, options)

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        query,
        filters,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Enhanced search API error:", error)

    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q") || ""
  const suggestions = searchParams.get("suggestions") === "true"

  try {
    if (suggestions) {
      const results = await searchManager.getSuggestions(query)
      return NextResponse.json({ suggestions: results })
    }

    // Simple GET search
    const result = await searchManager.search(query)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Enhanced search GET error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
