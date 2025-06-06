import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("Google Maps API key is not configured on the server.")
    return NextResponse.json({ error: "Google Maps API key is not configured" }, { status: 500 })
  }

  return NextResponse.json({ apiKey })
}
