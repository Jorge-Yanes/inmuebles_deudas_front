import type { Asset } from "@/types/asset"

// Permission levels for fields
export type FieldPermissionLevel = "view" | "edit" | "none"

// Field permission configuration for a specific field
export interface FieldPermission {
  field: keyof Asset
  level: FieldPermissionLevel
}

// Field metadata for UI display and categorization
export interface FieldMetadata {
  field: keyof Asset
  label: string
  category: FieldCategory
  sensitive: boolean
  description?: string
}

// Categories for grouping fields
export type FieldCategory =
  | "identification"
  | "basic"
  | "location"
  | "physical"
  | "financial"
  | "legal"
  | "status"
  | "dates"
  | "additional"

// Role-based field permissions
export interface RoleFieldPermissions {
  role: string
  permissions: FieldPermission[]
}

// For use in API routes
export type FieldPermissions = Record<string, FieldPermissionLevel>

// Default field permissions by role
export const DEFAULT_FIELD_PERMISSIONS: Record<string, FieldPermission[]> = {
  admin: [
    // Admin has view and edit access to all fields
    { field: "id", level: "view" },
    { field: "ndg", level: "edit" },
    { field: "lien", level: "edit" },
    { field: "property_id", level: "edit" },
    { field: "reference_code", level: "edit" },
    { field: "parcel", level: "edit" },
    { field: "cadastral_reference", level: "edit" },
    { field: "property_idh", level: "edit" },
    { field: "property_bank_id", level: "edit" },
    { field: "alt_id1", level: "edit" },
    { field: "idufir", level: "edit" },
    { field: "id_portal_subasta", level: "edit" },
    { field: "property_type", level: "edit" },
    { field: "property_general_subtype", level: "edit" },
    { field: "title", level: "edit" },
    { field: "description", level: "edit" },
    { field: "province", level: "edit" },
    { field: "city", level: "edit" },
    { field: "address", level: "edit" },
    { field: "numero", level: "edit" },
    { field: "street_type", level: "edit" },
    { field: "street_no", level: "edit" },
    { field: "zip_code", level: "edit" },
    { field: "floor", level: "edit" },
    { field: "door", level: "edit" },
    { field: "comarca", level: "edit" },
    { field: "sqm", level: "edit" },
    { field: "rooms", level: "edit" },
    { field: "bathrooms", level: "edit" },
    { field: "has_parking", level: "edit" },
    { field: "extras", level: "edit" },
    { field: "gbv", level: "edit" },
    { field: "auction_base", level: "edit" },
    { field: "deuda", level: "edit" },
    { field: "auction_value", level: "edit" },
    { field: "price_approx", level: "edit" },
    { field: "price_to_brokers", level: "edit" },
    { field: "ob", level: "edit" },
    { field: "legal_type", level: "edit" },
    { field: "legal_phase", level: "edit" },
    { field: "tipo_procedimiento", level: "edit" },
    { field: "fase_procedimiento", level: "edit" },
    { field: "fase_actual", level: "edit" },
    { field: "registration_status", level: "edit" },
    { field: "working_status", level: "edit" },
    { field: "marketing_status", level: "edit" },
    { field: "marketing_suspended_reason", level: "edit" },
    { field: "estado_posesion_fisica", level: "edit" },
    { field: "closing_date", level: "edit" },
    { field: "portfolio_closing_date", level: "edit" },
    { field: "date_under_re_mgmt", level: "edit" },
    { field: "fecha_subasta", level: "edit" },
    { field: "fecha_cesion_remate", level: "edit" },
    { field: "campania", level: "edit" },
    { field: "portfolio", level: "edit" },
    { field: "borrower_name", level: "edit" },
    { field: "hip_under_re_mgmt", level: "edit" },
    { field: "reference_code_1", level: "edit" },
    { field: "imageUrl", level: "edit" },
    { field: "features", level: "edit" },
    { field: "documents", level: "edit" },
    { field: "history", level: "edit" },
    { field: "createdAt", level: "view" },
  ],
  client: [
    // Clients have limited access
    { field: "id", level: "view" },
    { field: "reference_code", level: "view" },
    { field: "property_type", level: "view" },
    { field: "property_general_subtype", level: "view" },
    { field: "title", level: "view" },
    { field: "description", level: "view" },
    { field: "province", level: "view" },
    { field: "city", level: "view" },
    { field: "address", level: "view" },
    { field: "zip_code", level: "view" },
    { field: "floor", level: "view" },
    { field: "door", level: "view" },
    { field: "sqm", level: "view" },
    { field: "rooms", level: "view" },
    { field: "bathrooms", level: "view" },
    { field: "has_parking", level: "view" },
    { field: "extras", level: "view" },
    { field: "marketing_status", level: "view" },
    { field: "imageUrl", level: "view" },
    { field: "features", level: "view" },
    { field: "cadastral_reference", level: "view" },
    { field: "createdAt", level: "view" },

    // Financial fields are restricted by default
    { field: "price_approx", level: "none" },
    { field: "auction_base", level: "none" },
    { field: "deuda", level: "none" },
    { field: "auction_value", level: "none" },
    { field: "price_to_brokers", level: "none" },
    { field: "gbv", level: "none" },
    { field: "ob", level: "none" },

    // Legal fields are restricted by default
    { field: "legal_type", level: "none" },
    { field: "legal_phase", level: "none" },
    { field: "tipo_procedimiento", level: "none" },
    { field: "fase_procedimiento", level: "none" },
    { field: "fase_actual", level: "none" },

    // Dates are restricted by default
    { field: "closing_date", level: "none" },
    { field: "portfolio_closing_date", level: "none" },
    { field: "date_under_re_mgmt", level: "none" },
    { field: "fecha_subasta", level: "none" },
    { field: "fecha_cesion_remate", level: "none" },

    // Additional fields are restricted by default
    { field: "borrower_name", level: "none" },
    { field: "documents", level: "none" },
    { field: "history", level: "none" },
  ],
  pending: [
    // Pending users have no access
    { field: "id", level: "none" },
  ],
}

// Field metadata for UI display
export const FIELD_METADATA: FieldMetadata[] = [
  // Identification fields
  { field: "id", label: "ID", category: "identification", sensitive: false },
  { field: "ndg", label: "NDG", category: "identification", sensitive: true },
  { field: "lien", label: "Lien", category: "identification", sensitive: true },
  { field: "property_id", label: "ID de Propiedad", category: "identification", sensitive: false },
  { field: "reference_code", label: "Código de Referencia", category: "identification", sensitive: false },
  { field: "parcel", label: "Parcela", category: "identification", sensitive: false },
  { field: "cadastral_reference", label: "Referencia Catastral", category: "identification", sensitive: false },
  { field: "property_idh", label: "ID de Propiedad (H)", category: "identification", sensitive: true },
  { field: "property_bank_id", label: "ID de Banco", category: "identification", sensitive: true },
  { field: "alt_id1", label: "ID Alternativo", category: "identification", sensitive: true },
  { field: "idufir", label: "IDUFIR", category: "identification", sensitive: true },
  { field: "id_portal_subasta", label: "ID Portal Subasta", category: "identification", sensitive: true },

  // Basic property information
  { field: "property_type", label: "Tipo de Propiedad", category: "basic", sensitive: false },
  { field: "property_general_subtype", label: "Subtipo de Propiedad", category: "basic", sensitive: false },
  { field: "title", label: "Título", category: "basic", sensitive: false },
  { field: "description", label: "Descripción", category: "basic", sensitive: false },

  // Location information
  { field: "province", label: "Provincia", category: "location", sensitive: false },
  { field: "city", label: "Ciudad", category: "location", sensitive: false },
  { field: "address", label: "Dirección", category: "location", sensitive: false },
  { field: "numero", label: "Número", category: "location", sensitive: false },
  { field: "street_type", label: "Tipo de Vía", category: "location", sensitive: false },
  { field: "street_no", label: "Número de Calle", category: "location", sensitive: false },
  { field: "zip_code", label: "Código Postal", category: "location", sensitive: false },
  { field: "floor", label: "Planta", category: "location", sensitive: false },
  { field: "door", label: "Puerta", category: "location", sensitive: false },
  { field: "comarca", label: "Comarca", category: "location", sensitive: false },

  // Physical characteristics
  { field: "sqm", label: "Metros Cuadrados", category: "physical", sensitive: false },
  { field: "rooms", label: "Habitaciones", category: "physical", sensitive: false },
  { field: "bathrooms", label: "Baños", category: "physical", sensitive: false },
  { field: "has_parking", label: "Plaza de Garaje", category: "physical", sensitive: false },
  { field: "extras", label: "Extras", category: "physical", sensitive: false },

  // Financial information
  { field: "gbv", label: "Valor Bruto", category: "financial", sensitive: true },
  { field: "auction_base", label: "Base de Subasta", category: "financial", sensitive: true },
  { field: "deuda", label: "Deuda", category: "financial", sensitive: true },
  { field: "auction_value", label: "Valor de Subasta", category: "financial", sensitive: true },
  { field: "price_approx", label: "Precio Aproximado", category: "financial", sensitive: true },
  { field: "price_to_brokers", label: "Precio para Intermediarios", category: "financial", sensitive: true },
  { field: "ob", label: "OB", category: "financial", sensitive: true },

  // Legal information
  { field: "legal_type", label: "Tipo Legal", category: "legal", sensitive: true },
  { field: "legal_phase", label: "Fase Legal", category: "legal", sensitive: true },
  { field: "tipo_procedimiento", label: "Tipo de Procedimiento", category: "legal", sensitive: true },
  { field: "fase_procedimiento", label: "Fase de Procedimiento", category: "legal", sensitive: true },
  { field: "fase_actual", label: "Fase Actual", category: "legal", sensitive: true },

  // Status information
  { field: "registration_status", label: "Estado de Registro", category: "status", sensitive: false },
  { field: "working_status", label: "Estado de Trabajo", category: "status", sensitive: false },
  { field: "marketing_status", label: "Estado de Marketing", category: "status", sensitive: false },
  { field: "marketing_suspended_reason", label: "Razón de Suspensión", category: "status", sensitive: false },
  { field: "estado_posesion_fisica", label: "Estado de Posesión Física", category: "status", sensitive: false },

  // Dates
  { field: "closing_date", label: "Fecha de Cierre", category: "dates", sensitive: true },
  { field: "portfolio_closing_date", label: "Fecha de Cierre de Cartera", category: "dates", sensitive: true },
  { field: "date_under_re_mgmt", label: "Fecha Bajo Gestión", category: "dates", sensitive: true },
  { field: "fecha_subasta", label: "Fecha de Subasta", category: "dates", sensitive: true },
  { field: "fecha_cesion_remate", label: "Fecha de Cesión de Remate", category: "dates", sensitive: true },
  { field: "createdAt", label: "Fecha de Creación", category: "dates", sensitive: false },

  // Additional information
  { field: "campania", label: "Campaña", category: "additional", sensitive: true },
  { field: "portfolio", label: "Cartera", category: "additional", sensitive: true },
  { field: "borrower_name", label: "Nombre del Prestatario", category: "additional", sensitive: true },
  { field: "hip_under_re_mgmt", label: "Hipoteca Bajo Gestión", category: "additional", sensitive: true },
  { field: "reference_code_1", label: "Código de Referencia 1", category: "additional", sensitive: true },

  // UI fields
  { field: "imageUrl", label: "URL de Imagen", category: "basic", sensitive: false },
  { field: "features", label: "Características", category: "physical", sensitive: false },
  { field: "documents", label: "Documentos", category: "additional", sensitive: true },
  { field: "history", label: "Historial", category: "additional", sensitive: true },
]
