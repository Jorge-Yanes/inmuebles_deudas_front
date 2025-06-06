import { type NextRequest, NextResponse } from "next/server"
import { SearchManager } from "@/lib/search/search-manager"
import { v4 as uuidv4 } from "uuid"

const searchManager = new SearchManager(true)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""

    const userPseudoId = req.cookies.get("user_pseudo_id")?.value || uuidv4()
    // No need to set cookie here as it's a GET and less critical for suggestions if it changes

    if (!query.trim()) {
      return NextResponse.json([]) // Return empty array for no query
    }

    const suggestions = await searchManager.getSuggestions(query, userPseudoId)
    return NextResponse.json(suggestions)
  } catch (error: any) {
    console.error("[API/SEARCH/SUGGEST/ENHANCED] Error:", error)
    // For suggestions, typically we don't want to show a big error to the user.
    // Just return empty array or a generic error message if absolutely necessary.
    return NextResponse.json([], { status: 500 }) // Return empty on error
  }
}
