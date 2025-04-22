import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { getFieldPermissionsByRole } from "@/lib/permissions/field-permissions-service"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Check if the request is for the API
  if (request.nextUrl.pathname.startsWith("/api/properties")) {
    // Get the user's session token
    const token = await getToken({ req: request })

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Get the user's role from the token
    const role = token.role as string

    // Get the field permissions for the user's role
    const fieldPermissions = await getFieldPermissionsByRole(role)

    // Convert field permissions to a format suitable for the API
    const permissionsMap: Record<string, string> = {}
    fieldPermissions.forEach((permission) => {
      permissionsMap[permission.field as string] = permission.level
    })

    // Clone the request headers to add the permissions
    const requestHeaders = new Headers(request.headers)

    // Add the field permissions to the request headers
    requestHeaders.set("x-field-permissions", JSON.stringify(permissionsMap))

    // Return the response with the modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Continue for non-API requests
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/properties/:path*",
}
