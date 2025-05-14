export interface Asset {
  // Identificadores
  id: string
  ndg: string
  lien?: number
  property_id?: number
  reference_code?: string
  parcel?: string
  cadastral_reference?: string
  property_idh?: string
  property_bank_id?: string
  alt_id1?: string
  idufir?: string
  id_portal_subasta?: string

  // Información básica de la propiedad
  property_type: string
  property_general_subtype?: string
  title?: string // Campo calculado para mostrar en la UI
  description?: string // Campo calculado para mostrar en la UI

  // Ubicación
  province: string
  city: string
  address: string
  numero?: string
  street_type?: string
  street_no?: string
  zip_code?: string
  floor?: string
  door?: string
  comarca?: string

  // Características físicas
  sqm: number
  rooms?: number
  bathrooms?: number
  has_parking?: number
  extras?: string

  // Información financiera
  gbv?: number
  auction_base?: number
  deuda?: number
  auction_value?: number
  price_approx?: number
  price_to_brokers?: number
  ob?: number

  // Información legal
  legal_type?: string
  legal_phase?: string
  tipo_procedimiento?: string
  fase_procedimiento?: string
  fase_actual?: string

  // Estados
  registration_status?: string
  working_status?: string
  marketing_status?: string
  marketing_suspended_reason?: string
  estado_posesion_fisica?: string

  // Fechas
  closing_date?: Date
  portfolio_closing_date?: Date
  date_under_re_mgmt?: Date
  fecha_subasta?: Date
  fecha_cesion_remate?: Date

  // Información adicional
  campania?: string
  portfolio?: string
  borrower_name?: string
  hip_under_re_mgmt?: number
  reference_code_1?: string

  // Campos para UI
  imageUrl?: string
  features?: string[]
  documents?: { name: string; url: string }[]
  history?: { title: string; date: string; description: string }[]
  createdAt: Date
}

export interface AssetFilter {
  reference_code?: string
  ndg?: string
  province?: string
  city?: string
  property_type?: string
  marketing_status?: string
  legal_phase?: string
  minPrice?: number
  maxPrice?: number
  minSqm?: number
  maxSqm?: number
  startDate?: Date
  endDate?: Date
}

// Mapeo de campos en español para mostrar en la UI
export const fieldLabels: Record<string, string> = {
  // Identificadores
  ndg: "NDG",
  lien: "Lien",
  property_id: "ID de Propiedad",
  reference_code: "Código de Referencia",
  parcel: "Parcela",
  cadastral_reference: "Referencia Catastral",

  // Información básica
  property_type: "Tipo de Propiedad",
  property_general_subtype: "Subtipo de Propiedad",

  // Ubicación
  province: "Provincia",
  city: "Ciudad",
  address: "Dirección",
  numero: "Número",
  street_type: "Tipo de Vía",
  street_no: "Número de Calle",
  zip_code: "Código Postal",
  floor: "Planta",
  door: "Puerta",
  comarca: "Comarca",

  // Características físicas
  sqm: "Metros Cuadrados",
  rooms: "Habitaciones",
  bathrooms: "Baños",
  has_parking: "Plaza de Garaje",
  extras: "Extras",

  // Información financiera
  gbv: "Valor Bruto",
  auction_base: "Base de Subasta",
  deuda: "Deuda",
  auction_value: "Valor de Subasta",
  price_approx: "Precio Aproximado",
  price_to_brokers: "Precio para Intermediarios",
  ob: "OB",

  // Información legal
  legal_type: "Tipo Legal",
  legal_phase: "Fase Legal",
  tipo_procedimiento: "Tipo de Procedimiento",
  fase_procedimiento: "Fase de Procedimiento",
  fase_actual: "Fase Actual",

  // Estados
  registration_status: "Estado de Registro",
  working_status: "Estado de Trabajo",
  marketing_status: "Estado de Marketing",
  marketing_suspended_reason: "Razón de Suspensión de Marketing",
  estado_posesion_fisica: "Estado de Posesión Física",

  // Fechas
  closing_date: "Fecha de Cierre",
  portfolio_closing_date: "Fecha de Cierre de Cartera",
  date_under_re_mgmt: "Fecha Bajo Gestión",
  fecha_subasta: "Fecha de Subasta",
  fecha_cesion_remate: "Fecha de Cesión de Remate",

  // Información adicional
  campania: "Campaña",
  portfolio: "Cartera",
  borrower_name: "Nombre del Prestatario",
  hip_under_re_mgmt: "Hipoteca Bajo Gestión",
}

// Mapeo de tipos de propiedad para mostrar en español
export const propertyTypeLabels: Record<string, string> = {
  RESIDENTIAL: "Residencial",
  COMMERCIAL: "Comercial",
  INDUSTRIAL: "Industrial",
  LAND: "Terreno",
  PARKING: "Garaje",
  STORAGE: "Trastero",
  OTHER: "Otro",
}

// Mapeo de estados de marketing para mostrar en español
export const marketingStatusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  RENTED: "Alquilado",
  SUSPENDED: "Suspendido",
  PENDING: "Pendiente",
}

// Mapeo de fases legales para mostrar en español
export const legalPhaseLabels: Record<string, string> = {
  FORECLOSURE: "Ejecución Hipotecaria",
  AUCTION: "Subasta",
  ADJUDICATION: "Adjudicación",
  POSSESSION: "Posesión",
  EVICTION: "Desahucio",
  CLOSED: "Cerrado",
}

// Función para formatear fechas en español
export function formatDate(date?: Date): string {
  if (!date) return "N/A"
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date instanceof Date ? date : new Date(date))
}

// Función para formatear valores monetarios en euros
export function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return "N/A"
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

// Función para generar un título descriptivo para la propiedad
export function generateTitle(asset: Asset): string {
  const type = propertyTypeLabels[asset.property_type] || asset.property_type
  const location = asset.city || asset.province
  const size = asset.sqm ? `${asset.sqm}m²` : ""

  let title = `${type} en ${location}`
  if (size) title += ` de ${size}`
  if (asset.rooms) title += `, ${asset.rooms} hab.`

  return title
}

// Función para generar una descripción para la propiedad
export function generateDescription(asset: Asset): string {
  const type = propertyTypeLabels[asset.property_type] || asset.property_type
  let description = `${type} ubicado en ${asset.address}, ${asset.city}, ${asset.province}.`

  if (asset.sqm) description += ` Superficie de ${asset.sqm}m².`
  if (asset.rooms) description += ` ${asset.rooms} habitaciones.`
  if (asset.bathrooms) description += ` ${asset.bathrooms} baños.`
  if (asset.extras) description += ` ${asset.extras}.`

  if (asset.legal_phase) {
    const phase = legalPhaseLabels[asset.legal_phase] || asset.legal_phase
    description += ` Actualmente en fase legal: ${phase}.`
  }

  return description
}
