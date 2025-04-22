import { hasFieldViewPermission, hasFieldEditPermission } from "../field-permissions-service"
import { DEFAULT_FIELD_PERMISSIONS } from "@/types/field-permissions"
import type { User } from "@/types/user"

describe("Field Permissions Service", () => {
  // Mock users
  const adminUser: User = {
    id: "admin-id",
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    permissions: {
      viewAssets: true,
      viewAssetDetails: true,
      viewFinancialData: true,
      viewLegalData: true,
      exportData: true,
    },
    createdAt: new Date(),
  }

  const clientUser: User = {
    id: "client-id",
    email: "client@example.com",
    name: "Client User",
    role: "client",
    permissions: {
      viewAssets: true,
      viewAssetDetails: true,
      viewFinancialData: false,
      viewLegalData: false,
      exportData: false,
    },
    createdAt: new Date(),
  }

  const pendingUser: User = {
    id: "pending-id",
    email: "pending@example.com",
    name: "Pending User",
    role: "pending",
    permissions: {
      viewAssets: false,
      viewAssetDetails: false,
      viewFinancialData: false,
      viewLegalData: false,
      exportData: false,
    },
    createdAt: new Date(),
  }

  describe("hasFieldViewPermission", () => {
    it("should return true for admin users for any field", () => {
      expect(hasFieldViewPermission(adminUser, "price_approx")).toBe(true)
      expect(hasFieldViewPermission(adminUser, "legal_phase")).toBe(true)
      expect(hasFieldViewPermission(adminUser, "borrower_name")).toBe(true)
    })

    it("should return true for client users for non-sensitive fields", () => {
      const clientPermissions = DEFAULT_FIELD_PERMISSIONS.client

      // Test with default permissions
      expect(hasFieldViewPermission(clientUser, "reference_code", clientPermissions)).toBe(true)
      expect(hasFieldViewPermission(clientUser, "address", clientPermissions)).toBe(true)
      expect(hasFieldViewPermission(clientUser, "sqm", clientPermissions)).toBe(true)
    })

    it("should return false for client users for sensitive fields", () => {
      const clientPermissions = DEFAULT_FIELD_PERMISSIONS.client

      // Test with default permissions
      expect(hasFieldViewPermission(clientUser, "price_approx", clientPermissions)).toBe(false)
      expect(hasFieldViewPermission(clientUser, "legal_phase", clientPermissions)).toBe(false)
      expect(hasFieldViewPermission(clientUser, "borrower_name", clientPermissions)).toBe(false)
    })

    it("should return false for pending users for all fields", () => {
      const pendingPermissions = DEFAULT_FIELD_PERMISSIONS.pending

      // Test with default permissions
      expect(hasFieldViewPermission(pendingUser, "reference_code", pendingPermissions)).toBe(false)
      expect(hasFieldViewPermission(pendingUser, "address", pendingPermissions)).toBe(false)
      expect(hasFieldViewPermission(pendingUser, "price_approx", pendingPermissions)).toBe(false)
    })

    it("should return false if no user is provided", () => {
      expect(hasFieldViewPermission(null, "reference_code")).toBe(false)
      expect(hasFieldViewPermission(undefined, "price_approx")).toBe(false)
    })

    it("should respect custom permissions", () => {
      const customPermissions = {
        reference_code: "view",
        price_approx: "view",
        legal_phase: "none",
      }

      expect(hasFieldViewPermission(clientUser, "reference_code", customPermissions)).toBe(true)
      expect(hasFieldViewPermission(clientUser, "price_approx", customPermissions)).toBe(true)
      expect(hasFieldViewPermission(clientUser, "legal_phase", customPermissions)).toBe(false)
    })
  })

  describe("hasFieldEditPermission", () => {
    it("should return true for admin users for any field", () => {
      expect(hasFieldEditPermission(adminUser, "price_approx")).toBe(true)
      expect(hasFieldEditPermission(adminUser, "legal_phase")).toBe(true)
      expect(hasFieldEditPermission(adminUser, "borrower_name")).toBe(true)
    })

    it("should return false for client users for all fields by default", () => {
      const clientPermissions = DEFAULT_FIELD_PERMISSIONS.client

      // Test with default permissions
      expect(hasFieldEditPermission(clientUser, "reference_code", clientPermissions)).toBe(false)
      expect(hasFieldEditPermission(clientUser, "address", clientPermissions)).toBe(false)
      expect(hasFieldEditPermission(clientUser, "price_approx", clientPermissions)).toBe(false)
    })

    it("should respect custom edit permissions", () => {
      const customPermissions = {
        reference_code: "edit",
        price_approx: "view",
        legal_phase: "none",
      }

      expect(hasFieldEditPermission(clientUser, "reference_code", customPermissions)).toBe(true)
      expect(hasFieldEditPermission(clientUser, "price_approx", customPermissions)).toBe(false)
      expect(hasFieldEditPermission(clientUser, "legal_phase", customPermissions)).toBe(false)
    })
  })
})
