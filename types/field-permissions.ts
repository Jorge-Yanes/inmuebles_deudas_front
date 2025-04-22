// Define the field permission types
export type FieldPermission = "view" | "edit" | "none"

// Define the field permission structure
export interface FieldPermissions {
  [fieldName: string]: FieldPermission
}

// Define the role-based field permissions
export interface RoleFieldPermissions {
  [role: string]: FieldPermissions
}

// Define the field metadata for UI display
export interface FieldMetadata {
  name: string
  label: string
  description: string
  category: FieldCategory
  type: FieldType
  sensitive: boolean
}

// Field categories for grouping in the UI
export type FieldCategory =
  | "identification"
  | "property"
  | "location"
  | "physical"
  | "financial"
  | "legal"
  | "status"
  | "dates"
  | "additional"

// Field types for validation and rendering
export type FieldType = "string" | "number" | "date" | "boolean" | "enum"

// Define the property fields with metadata
export const PROPERTY_FIELDS: Record<string, FieldMetadata> = {
  // Identification fields
  ndg: {
    name: "ndg",
    label: "NDG",
    description: "Número de Gestión",
    category: "identification",
    type: "string",
    sensitive: false,
  },
  lien: {
    name: "lien",
    label: "Lien",
    description: "Número de gravamen",
    category: "identification",
    type: "number",
    sensitive: false,
  },
  property_id: {
    name: "property_id",
    label: "ID de Propiedad",
    description: "Identificador único de la propiedad",
    category: "identification",
    type: "number",
    sensitive: false,
  },
  reference_code: {
    name: "reference_code",
    label: "Código de Referencia",
    description: "Código de referencia de la propiedad",
    category: "identification",
    type: "string",
    sensitive: false,
  },
  parcel: {
    name: "parcel",
    label: "Parcela",
    description: "Número de parcela",
    category: "identification",
    type: "string",
    sensitive: false,
  },
  cadastral_reference: {
    name: "cadastral_reference",
    label: "Referencia Catastral",
    description: "Referencia catastral de la propiedad",
    category: "identification",
    type: "string",
    sensitive: false,
  },

  // Property information
  property_type: {
    name: "property_type",
    label: "Tipo de Propiedad",
    description: "Tipo principal de la propiedad",
    category: "property",
    type: "enum",
    sensitive: false,
  },
  property_general_subtype: {
    name: "property_general_subtype",
    label: "Subtipo de Propiedad",
    description: "Subtipo de la propiedad",
    category: "property",
    type: "enum",
    sensitive: false,
  },

  // Location fields
  province: {
    name: "province",
    label: "Provincia",
    description: "Provincia donde se ubica la propiedad",
    category: "location",
    type: "string",
    sensitive: false,
  },
  city: {
    name: "city",
    label: "Ciudad",
    description: "Ciudad donde se ubica la propiedad",
    category: "location",
    type: "string",
    sensitive: false,
  },
  address: {
    name: "address",
    label: "Dirección",
    description: "Dirección completa de la propiedad",
    category: "location",
    type: "string",
    sensitive: false,
  },
  zip_code: {
    name: "zip_code",
    label: "Código Postal",
    description: "Código postal de la ubicación",
    category: "location",
    type: "string",
    sensitive: false,
  },

  // Physical characteristics
  sqm: {
    name: "sqm",
    label: "Metros Cuadrados",
    description: "Superficie en metros cuadrados",
    category: "physical",
    type: "number",
    sensitive: false,
  },
  rooms: {
    name: "rooms",
    label: "Habitaciones",
    description: "Número de habitaciones",
    category: "physical",
    type: "number",
    sensitive: false,
  },
  bathrooms: {
    name: "bathrooms",
    label: "Baños",
    description: "Número de baños",
    category: "physical",
    type: "number",
    sensitive: false,
  },
  has_parking: {
    name: "has_parking",
    label: "Plaza de Garaje",
    description: "Indica si la propiedad tiene plaza de garaje",
    category: "physical",
    type: "boolean",
    sensitive: false,
  },
  extras: {
    name: "extras",
    label: "Extras",
    description: "Características adicionales de la propiedad",
    category: "physical",
    type: "string",
    sensitive: false,
  },

  // Financial information
  gbv: {
    name: "gbv",
    label: "Valor Bruto",
    description: "Valor bruto de la propiedad",
    category: "financial",
    type: "number",
    sensitive: true,
  },
  auction_base: {
    name: "auction_base",
    label: "Base de Subasta",
    description: "Precio base para la subasta",
    category: "financial",
    type: "number",
    sensitive: true,
  },
  deuda: {
    name: "deuda",
    label: "Deuda",
    description: "Deuda asociada a la propiedad",
    category: "financial",
    type: "number",
    sensitive: true,
  },
  auction_value: {
    name: "auction_value",
    label: "Valor de Subasta",
    description: "Valor final de la subasta",
    category: "financial",
    type: "number",
    sensitive: true,
  },
  price_approx: {
    name: "price_approx",
    label: "Precio Aproximado",
    description: "Precio aproximado de la propiedad",
    category: "financial",
    type: "number",
    sensitive: true,
  },
  price_to_brokers: {
    name: "price_to_brokers",
    label: "Precio para Intermediarios",
    description: "Precio ofrecido a intermediarios",
    category: "financial",
    type: "number",
    sensitive: true,
  },
  ob: {
    name: "ob",
    label: "OB",
    description: "Valor OB",
    category: "financial",
    type: "number",
    sensitive: true,
  },

  // Legal information
  legal_type: {
    name: "legal_type",
    label: "Tipo Legal",
    description: "Tipo legal de la propiedad",
    category: "legal",
    type: "string",
    sensitive: true,
  },
  legal_phase: {
    name: "legal_phase",
    label: "Fase Legal",
    description: "Fase legal actual de la propiedad",
    category: "legal",
    type: "enum",
    sensitive: true,
  },
  tipo_procedimiento: {
    name: "tipo_procedimiento",
    label: "Tipo de Procedimiento",
    description: "Tipo de procedimiento legal",
    category: "legal",
    type: "string",
    sensitive: true,
  },
  fase_procedimiento: {
    name: "fase_procedimiento",
    label: "Fase de Procedimiento",
    description: "Fase actual del procedimiento legal",
    category: "legal",
    type: "string",
    sensitive: true,
  },
  fase_actual: {
    name: "fase_actual",
    label: "Fase Actual",
    description: "Fase actual detallada",
    category: "legal",
    type: "string",
    sensitive: true,
  },

  // Status fields
  registration_status: {
    name: "registration_status",
    label: "Estado de Registro",
    description: "Estado del registro de la propiedad",
    category: "status",
    type: "string",
    sensitive: false,
  },
  working_status: {
    name: "working_status",
    label: "Estado de Trabajo",
    description: "Estado de trabajo de la propiedad",
    category: "status",
    type: "string",
    sensitive: false,
  },
  marketing_status: {
    name: "marketing_status",
    label: "Estado de Marketing",
    description: "Estado de marketing de la propiedad",
    category: "status",
    type: "enum",
    sensitive: false,
  },
  estado_posesion_fisica: {
    name: "estado_posesion_fisica",
    label: "Estado de Posesión Física",
    description: "Estado de la posesión física de la propiedad",
    category: "status",
    type: "string",
    sensitive: false,
  },

  // Dates
  closing_date: {
    name: "closing_date",
    label: "Fecha de Cierre",
    description: "Fecha de cierre de la operación",
    category: "dates",
    type: "date",
    sensitive: true,
  },
  portfolio_closing_date: {
    name: "portfolio_closing_date",
    label: "Fecha de Cierre de Cartera",
    description: "Fecha de cierre de la cartera",
    category: "dates",
    type: "date",
    sensitive: true,
  },
  fecha_subasta: {
    name: "fecha_subasta",
    label: "Fecha de Subasta",
    description: "Fecha programada para la subasta",
    category: "dates",
    type: "date",
    sensitive: true,
  },

  // Additional information
  portfolio: {
    name: "portfolio",
    label: "Cartera",
    description: "Cartera a la que pertenece la propiedad",
    category: "additional",
    type: "string",
    sensitive: false,
  },
  borrower_name: {
    name: "borrower_name",
    label: "Nombre del Prestatario",
    description: "Nombre del prestatario asociado",
    category: "additional",
    type: "string",
    sensitive: true,
  },
}

// Default field permissions for different roles
export const DEFAULT_FIELD_PERMISSIONS: RoleFieldPermissions = {
  admin: Object.keys(PROPERTY_FIELDS).reduce((acc, field) => {
    acc[field] = "edit"
    return acc
  }, {} as FieldPermissions),

  client: Object.keys(PROPERTY_FIELDS).reduce((acc, field) => {
    const fieldMeta = PROPERTY_FIELDS[field]
    // Clients can view non-sensitive fields by default
    acc[field] = fieldMeta.sensitive ? "none" : "view"
    return acc
  }, {} as FieldPermissions),

  pending: Object.keys(PROPERTY_FIELDS).reduce((acc, field) => {
    acc[field] = "none"
    return acc
  }, {} as FieldPermissions),
}

// Group fields by category for the UI
export const FIELD_CATEGORIES: Record<FieldCategory, string> = {
  identification: "Identificación",
  property: "Información de Propiedad",
  location: "Ubicación",
  physical: "Características Físicas",
  financial: "Información Financiera",
  legal: "Información Legal",
  status: "Estados",
  dates: "Fechas",
  additional: "Información Adicional",
}

// Get fields grouped by category
export function getFieldsByCategory(): Record<FieldCategory, FieldMetadata[]> {
  const result: Record<FieldCategory, FieldMetadata[]> = {
    identification: [],
    property: [],
    location: [],
    physical: [],
    financial: [],
    legal: [],
    status: [],
    dates: [],
    additional: [],
  }

  Object.values(PROPERTY_FIELDS).forEach((field) => {
    result[field.category].push(field)
  })

  return result
}
