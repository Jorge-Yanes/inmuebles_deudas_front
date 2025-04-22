import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { type FieldPermissions, type RoleFieldPermissions, DEFAULT_FIELD_PERMISSIONS } from "@/types/field-permissions"
import type { User } from "@/types/user"

// Collection name for field permissions
const FIELD_PERMISSIONS_COLLECTION = "fieldPermissions"

// Get field permissions for a specific role
export async function getFieldPermissionsForRole(role: string): Promise<FieldPermissions> {
  try {
    const permissionsDoc = await getDoc(doc(db, FIELD_PERMISSIONS_COLLECTION, role))

    if (permissionsDoc.exists()) {
      return permissionsDoc.data() as FieldPermissions
    }

    // If no permissions are defined, use defaults
    return DEFAULT_FIELD_PERMISSIONS[role] || {}
  } catch (error) {
    console.error(`Error fetching field permissions for role ${role}:`, error)
    return DEFAULT_FIELD_PERMISSIONS[role] || {}
  }
}

// Update field permissions for a role
export async function updateFieldPermissionsForRole(role: string, permissions: FieldPermissions): Promise<void> {
  try {
    const permissionsRef = doc(db, FIELD_PERMISSIONS_COLLECTION, role)
    const permissionsDoc = await getDoc(permissionsRef)

    if (permissionsDoc.exists()) {
      await updateDoc(permissionsRef, permissions)
    } else {
      await setDoc(permissionsRef, permissions)
    }
  } catch (error) {
    console.error(`Error updating field permissions for role ${role}:`, error)
    throw new Error("Failed to update field permissions")
  }
}

// Reset field permissions to defaults for a role
export async function resetFieldPermissionsForRole(role: string): Promise<void> {
  try {
    if (DEFAULT_FIELD_PERMISSIONS[role]) {
      await setDoc(doc(db, FIELD_PERMISSIONS_COLLECTION, role), DEFAULT_FIELD_PERMISSIONS[role])
    } else {
      throw new Error(`No default permissions defined for role: ${role}`)
    }
  } catch (error) {
    console.error(`Error resetting field permissions for role ${role}:`, error)
    throw new Error("Failed to reset field permissions")
  }
}

// Check if a user has permission to view a specific field
export function hasFieldViewPermission(
  user: User | null | undefined,
  fieldName: string,
  fieldPermissions?: FieldPermissions,
): boolean {
  if (!user) return false

  // Admins can view all fields
  if (user.role === "admin") return true

  // Use provided permissions or default to user's role permissions
  const permissions = fieldPermissions || DEFAULT_FIELD_PERMISSIONS[user.role] || {}

  return permissions[fieldName] === "view" || permissions[fieldName] === "edit"
}

// Check if a user has permission to edit a specific field
export function hasFieldEditPermission(
  user: User | null | undefined,
  fieldName: string,
  fieldPermissions?: FieldPermissions,
): boolean {
  if (!user) return false

  // Admins can edit all fields
  if (user.role === "admin") return true

  // Use provided permissions or default to user's role permissions
  const permissions = fieldPermissions || DEFAULT_FIELD_PERMISSIONS[user.role] || {}

  return permissions[fieldName] === "edit"
}

// Get all field permissions for all roles
export async function getAllFieldPermissions(): Promise<RoleFieldPermissions> {
  try {
    const roles = Object.keys(DEFAULT_FIELD_PERMISSIONS)
    const permissions: RoleFieldPermissions = {}

    for (const role of roles) {
      permissions[role] = await getFieldPermissionsForRole(role)
    }

    return permissions
  } catch (error) {
    console.error("Error fetching all field permissions:", error)
    return DEFAULT_FIELD_PERMISSIONS
  }
}
