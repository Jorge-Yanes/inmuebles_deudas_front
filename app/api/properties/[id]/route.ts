import { type NextRequest, NextResponse } from "next/server"
import { getPropertyById } from "@/lib/firestore/property-service"
import { getCurrentUser } from "@/lib/auth"
import type { FieldPermissions } from "@/types/field-permissions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the current user
    const currentUser = await getCurrentUser()

    // If no user, return unauthorized
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the property
    const property = await getPropertyById(params.id, currentUser)

    // If no property, return not found
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Get the field permissions from the request headers
    const fieldPermissionsHeader = request.headers.get("x-field-permissions")
    let fieldPermissions: FieldPermissions = {}

    if (fieldPermissionsHeader) {
      try {
        fieldPermissions = JSON.parse(fieldPermissionsHeader)
      } catch (error) {
        console.error("Error parsing field permissions:", error)
      }
    }

    // If the user is an admin, return the full property
    if (currentUser.role === "admin") {
      return NextResponse.json(property)
    }

    // Filter the property fields based on the user's permissions
    const filteredProperty: Record<string, any> = {}

    for (const [key, value] of Object.entries(property)) {
      // Always include the id
      if (key === "id") {
        filteredProperty[key] = value
        continue
      }

      // Check if the user has permission to view this field
      const permission = fieldPermissions[key]
      if (permission === "view" || permission === "edit") {
        filteredProperty[key] = value
      }
    }

    return NextResponse.json(filteredProperty)
  } catch (error) {
    console.error("Error fetching property:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
