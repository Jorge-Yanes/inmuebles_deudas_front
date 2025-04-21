import { type NextRequest, NextResponse } from "next/server"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if the current user is an admin
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const userId = params.id
    const userDoc = await getDoc(doc(db, "users", userId))

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()

    return NextResponse.json({
      id: userDoc.id,
      ...userData,
      createdAt: userData.createdAt?.toDate() || null,
      approvedAt: userData.approvedAt?.toDate() || null,
      lastLogin: userData.lastLogin?.toDate() || null,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
