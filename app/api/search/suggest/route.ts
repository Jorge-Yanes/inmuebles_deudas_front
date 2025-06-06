import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/search/suggest?q=...
 * Returns query auto-complete suggestions.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl
    const query = url.searchParams.get("q") || ""

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // For now, return simple suggestions based on common search terms
    // This can be enhanced with Vertex AI later
    const commonSuggestions = [
      "Madrid",
      "Barcelona",
      "Valencia",
      "Sevilla",
      "Bilbao",
      "Málaga",
      "Murcia",
      "Palma",
      "Las Palmas",
      "Valladolid",
      "Apartamento",
      "Casa",
      "Chalet",
      "Piso",
      "Local comercial",
      "Oficina",
      "Garaje",
      "Trastero",
    ]

    const normalizedQuery = query.toLowerCase().trim()

    const suggestions = commonSuggestions
      .filter((suggestion) => suggestion.toLowerCase().includes(normalizedQuery))
      .slice(0, 8)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error in /api/search/suggest:", error)
    return NextResponse.json(
      {
        suggestions: [],
        error: "Failed to get suggestions",
      },
      { status: 500 },
    )
  }
}
