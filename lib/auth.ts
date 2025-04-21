import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore"

import { auth, db } from "./firebase"
import { type User, type UserRole, DEFAULT_PERMISSIONS } from "@/types/user"

// Register a new user (creates account with pending status)
export async function registerUser(
  name: string,
  email: string,
  password: string,
  company?: string,
  phone?: string,
): Promise<User> {
  try {
    // Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Update the user's display name
    await updateProfile(firebaseUser, { displayName: name })

    // Create a user document in Firestore with pending status
    const newUser: Omit<User, "id"> = {
      email: email,
      name: name,
      role: "pending", // New users start as pending until approved by admin
      permissions: DEFAULT_PERMISSIONS.pending,
      createdAt: new Date(),
      company,
      phone,
    }

    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
    })

    return {
      id: firebaseUser.uid,
      ...newUser,
    }
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

// Login user
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Get the user document from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

    if (!userDoc.exists()) {
      throw new Error("User document not found")
    }

    const userData = userDoc.data() as Omit<User, "id">

    // Check if user is pending
    if (userData.role === "pending") {
      await firebaseSignOut(auth)
      throw new Error("Your account is pending approval. Please contact the administrator.")
    }

    // Update last login time
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      lastLogin: serverTimestamp(),
    })

    return {
      id: firebaseUser.uid,
      ...userData,
      lastLogin: new Date(),
    }
  } catch (error) {
    console.error("Error logging in:", error)
    throw error
  }
}

// Logout user
export async function logoutUser(): Promise<void> {
  return firebaseSignOut(auth)
}

// Get current user with Firestore data
export async function getCurrentUser(): Promise<User | null> {
  const firebaseUser = auth.currentUser

  if (!firebaseUser) {
    return null
  }

  try {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

    if (!userDoc.exists()) {
      return null
    }

    const userData = userDoc.data() as Omit<User, "id">

    return {
      id: firebaseUser.uid,
      ...userData,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email)
}

// Admin functions

// Approve a pending user
export async function approveUser(userId: string, role: UserRole = "client", customPermissions?: any): Promise<void> {
  const adminUser = auth.currentUser
  if (!adminUser) {
    throw new Error("You must be logged in as an admin to approve users")
  }

  // Verify admin is actually an admin
  const adminDoc = await getDoc(doc(db, "users", adminUser.uid))
  if (!adminDoc.exists() || adminDoc.data().role !== "admin") {
    throw new Error("Only administrators can approve users")
  }

  // Update the user's role and permissions
  await updateDoc(doc(db, "users", userId), {
    role,
    permissions: customPermissions || DEFAULT_PERMISSIONS[role],
    approvedBy: adminUser.uid,
    approvedAt: serverTimestamp(),
  })
}

// Reject a pending user
export async function rejectUser(userId: string): Promise<void> {
  // In a real implementation, you might want to delete the user from Authentication as well
  // For now, we'll just mark them as rejected in Firestore
  await updateDoc(doc(db, "users", userId), {
    role: "rejected",
    approvedBy: auth.currentUser?.uid,
    approvedAt: serverTimestamp(),
  })
}

// Update user permissions
export async function updateUserPermissions(userId: string, permissions: Partial<User>): Promise<void> {
  await updateDoc(doc(db, "users", userId), permissions)
}

// Get all users (admin only)
export async function getAllUsers(): Promise<User[]> {
  const usersSnapshot = await getDocs(collection(db, "users"))
  return usersSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as User,
  )
}

// Get pending users (admin only)
export async function getPendingUsers(): Promise<User[]> {
  const pendingUsersQuery = query(collection(db, "users"), where("role", "==", "pending"))

  const pendingUsersSnapshot = await getDocs(pendingUsersQuery)
  return pendingUsersSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      }) as User,
  )
}
