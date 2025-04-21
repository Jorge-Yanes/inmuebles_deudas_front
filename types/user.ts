export type UserRole = "admin" | "client" | "pending"

export interface UserPermissions {
  viewAssets: boolean
  viewAssetDetails: boolean
  viewFinancialData: boolean
  viewLegalData: boolean
  exportData: boolean
  // Add more permissions as needed
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  permissions: UserPermissions
  createdAt: Date
  lastLogin?: Date
  company?: string
  phone?: string
  // Fields for admin to track client access
  approvedBy?: string
  approvedAt?: Date
  // Fields for client-specific data access
  allowedAssetTypes?: string[]
  allowedProvinces?: string[]
  allowedPortfolios?: string[]
}

// Default permissions by role
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    viewAssets: true,
    viewAssetDetails: true,
    viewFinancialData: true,
    viewLegalData: true,
    exportData: true,
  },
  client: {
    viewAssets: true,
    viewAssetDetails: true,
    viewFinancialData: false,
    viewLegalData: false,
    exportData: false,
  },
  pending: {
    viewAssets: false,
    viewAssetDetails: false,
    viewFinancialData: false,
    viewLegalData: false,
    exportData: false,
  },
}
