import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { FieldPermission, FieldMetadata, FieldCategory } from "@/types/field-permissions"
import { FIELD_METADATA, DEFAULT_FIELD_PERMISSIONS } from "@/types/field-permissions"
import type { Asset } from "@/types/asset"
import type { User } from "@/types/user"

/**
 * Get field permissions for a specific role
 */
export async function getFieldPermissionsByRole(role: string): Promise<FieldPermission[]> {
  try {
    const permissionsDoc = await getDoc(doc(db, "fieldPermissions", role))

    if (!permissionsDoc.exists()) {
      // If no permissions are defined for this role, use defaults
      return DEFAULT_FIELD_PERMISSIONS[role] || []
    }

    return permissionsDoc.data().permissions as FieldPermission[]
  } catch (error) {
    console.error(`Error fetching field permissions for role ${role}:`, error)
    // Return default permissions as fallback
    return DEFAULT_FIELD_PERMISSIONS[role] || []
  }
}

/**
 * Save field permissions for a specific role
 */
export async function saveFieldPermissions(role: string, permissions: FieldPermission[]): Promise<void> {
  try {
    await setDoc(doc(db, "fieldPermissions", role), {
      role,
      permissions,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error(`Error saving field permissions for role ${role}:`, error)
    throw new Error(`Failed to save field permissions: ${error.message}`)
  }
}

/**
 * Get all available roles with field permissions
 */
export async function getAllRolesWithPermissions(): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "fieldPermissions"))
    const roles: string[] = []

    querySnapshot.forEach((doc) => {
      roles.push(doc.id)
    })

    // Add default roles if they don't exist in the database
    const defaultRoles = Object.keys(DEFAULT_FIELD_PERMISSIONS)
    for (const role of defaultRoles) {
      if (!roles.includes(role)) {
        roles.push(role)
      }
    }

    return roles
  } catch (error) {
    console.error("Error fetching roles with permissions:", error)
    return Object.keys(DEFAULT_FIELD_PERMISSIONS)
  }
}

/**
 * Check if a user has permission to view a specific field
 */
export function hasFieldViewPermission(
  user: User | null | undefined,
  field: keyof Asset,
  permissions?: FieldPermission[],
): boolean {
  if (!user) return false

  // Admin has view access to all fields
  if (user.role === "admin") return true

  if (!permissions) return false

  const permission = permissions.find((p) => p.field === field)
  return permission ? permission.level === "view" || permission.level === "edit" : false
}

/**
 * Check if a user has permission to edit a specific field
 */
export function hasFieldEditPermission(
  user: User | null | undefined,
  field: keyof Asset,
  permissions?: FieldPermission[],
): boolean {
  if (!user) return false

  // Admin has edit access to all fields
  if (user.role === "admin") return true

  if (!permissions) return false

  const permission = permissions.find((p) => p.field === field)
  return permission ? permission.level === "edit" : false
}

/**
 * Get field metadata by category
 */
export function getFieldMetadataByCategory(category: FieldCategory): FieldMetadata[] {
  return FIELD_METADATA.filter((metadata) => metadata.category === category)
}

/**
 * Get all field categories
 */
export function getAllFieldCategories(): FieldCategory[] {
  const categories = new Set<FieldCategory>()

  FIELD_METADATA.forEach((metadata) => {
    categories.add(metadata.category)
  })

  return Array.from(categories)
}

/**
 * Get metadata for a specific field
 */
export function getFieldMetadata(field: keyof Asset): FieldMetadata | undefined {
  return FIELD_METADATA.find((metadata) => metadata.field === field)
}

/**
 * Initialize default field permissions for all roles
 */
export async function initializeDefaultFieldPermissions(): Promise<void> {
  try {
    const roles = Object.keys(DEFAULT_FIELD_PERMISSIONS)

    for (const role of roles) {
      const permissionsDoc = await getDoc(doc(db, "fieldPermissions", role))

      if (!permissionsDoc.exists()) {
        await setDoc(doc(db, "fieldPermissions", role), {
          role,
          permissions: DEFAULT_FIELD_PERMISSIONS[role],
          updatedAt: new Date(),
        })
      }
    }
  } catch (error) {
    console.error("Error initializing default field permissions:", error)
    throw new Error(`Failed to initialize default field permissions: ${error.message}`)
  }
}
