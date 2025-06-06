import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location")
  const zoom = searchParams.get("zoom") || "15"
  const maptype = searchParams.get("maptype") || "roadmap"

  if (!location) {
    return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "Google Maps API key is not configured" }, { status: 500 })
  }

  const encodedLocation = encodeURIComponent(location)
  const url = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedLocation}&zoom=${zoom}&maptype=${maptype}`

  // Redirigir a la URL de Google Maps con la API key
  return NextResponse.redirect(url)
}
