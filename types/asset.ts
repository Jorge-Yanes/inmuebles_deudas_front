// Defines the comprehensive structure for a real estate asset
export interface Asset {
  objectID: string // Algolia's unique record identifier
  id: string // Crucial for keys and linking
  ndg?: string | null
  lien?: string | null
  property_id?: string | null
  reference_code?: string | null
  parcel?: string | null
  cadastral_reference?: string | null
  idufir?: string | null

  property_type?: string | null
  property_general_subtype?: string | null

  provincia_catastro?: string | null
  municipio_catastro?: string | null
  tipo_via_catastro?: string | null
  nombre_via_catastro?: string | null
  numero_portal_catastro?: string | null
  escalera_catastro?: string | null
  planta_catastro?: string | null
  puerta_catastro?: string | null
  codigo_postal_catastro?: string | null
  direccion_texto_catastro?: string | null // Full address text if available

  superficie_construida_m2?: number | string | null // Can be string, ensure parsing
  uso_predominante_inmueble?: string | null
  ano_construccion_inmueble?: number | string | null // Can be string

  rooms?: number | string | null // Can be string
  bathrooms?: number | string | null // Can be string
  has_parking?: boolean | null
  extras?: string | string[] | null // Can be string or array

  gbv?: number | null
  auction_base?: number | null
  deuda?: number | null
  DEUDA?: number | null // Alternative DEUDA field
  auction_value?: number | null
  price_approx?: number | null
  price_to_brokers?: number | null
  ob?: number | null
  hv?: number | null
  purchase_price?: number | null
  uw_value?: number | null
  hipoges_value_total?: number | null

  precio_idealista_venta_m2?: number | null
  precio_idealista_alquiler_m2?: number | null

  legal_type?: string | null
  legal_phase?: string | null
  tipo_procedimiento?: string | null
  fase_procedimiento?: string | null
  fase_actual?: string | null

  registration_status?: string | null
  working_status?: string | null
  marketing_status?: string | null
  marketing_suspended_reason?: string | null
  estado_posesion_fisica?: string | null

  closing_date?: Date | string | null
  portfolio_closing_date?: Date | string | null
  date_under_re_mgmt?: Date | string | null
  fecha_subasta?: Date | string | null
  fecha_cesion_remate?: Date | string | null

  campania?: string | null
  portfolio?: string | null
  borrower_name?: string | null
  hip_under_re_mgmt?: string | null

  // Geo and images
  latitude?: number | null
  longitude?: number | null
  images?: string[] | null // Array of image URLs

  // Timestamps
  createdAt?: Date | string | null
  updatedAt?: Date | string | null

  // Compatibility with older structure if needed
  sqm?: number | null // Alias for superficie_construida_m2 if used elsewhere
}

// --- The rest of the file (AssetFilter, labels, formatters) remains the same ---
// --- Make sure it's consistent with your previous version of types/asset.ts ---

export interface AssetFilter {
  type?: string
  status?: string
  location?: string
  provincia_catastro?: string
  municipio_catastro?: string
  minPrice?: number
  maxPrice?: number
  minSqm?: number
  maxSqm?: number
  property_type?: string
  legal_phase?: string
  marketing_status?: string
  query?: string
  ano_construccion_min?: string
  ano_construccion_max?: string
  precio_idealista_min?: number
  precio_idealista_max?: number
  has_parking?: string
  rooms?: string
  bathrooms?: string
  tipo_via_catastro?: string
}

// Mapeo de campos en español para mostrar en la UI
export const fieldLabels: Record<string, string> = {
  // Identificadores
  id: "ID",
  ndg: "NDG",
  lien: "Lien",
  property_id: "ID de Propiedad",
  reference_code: "Código de Referencia",
  parcel: "Parcela",
  cadastral_reference: "Referencia Catastral",
  idufir: "IDUFIR",

  // Información básica
  property_type: "Tipo de Propiedad",
  property_general_subtype: "Subtipo de Propiedad",

  // Ubicación catastral
  provincia_catastro: "Provincia",
  municipio_catastro: "Municipio",
  tipo_via_catastro: "Tipo de Vía",
  nombre_via_catastro: "Nombre de Vía",
  numero_portal_catastro: "Número Portal",
  escalera_catastro: "Escalera",
  planta_catastro: "Planta",
  puerta_catastro: "Puerta",
  codigo_postal_catastro: "Código Postal",
  direccion_texto_catastro: "Dirección Completa",
  superficie_construida_m2: "Superficie Construida (m²)",
  uso_predominante_inmueble: "Uso Predominante",
  ano_construccion_inmueble: "Año de Construcción",

  // Características físicas
  rooms: "Habitaciones",
  bathrooms: "Baños",
  has_parking: "Plaza de Garaje",
  extras: "Extras",

  // Información financiera
  gbv: "Valor Bruto (GBV)",
  auction_base: "Base de Subasta",
  deuda: "Deuda",
  DEUDA: "Deuda (Alt)",
  auction_value: "Valor de Subasta",
  price_approx: "Precio Aproximado",
  price_to_brokers: "Precio para Intermediarios",
  ob: "OB",
  hv: "Valor Hipotecario",
  purchase_price: "Precio de Compra",
  uw_value: "Valor UW",
  hipoges_value_total: "Valor Total Hipoges",

  // Información de mercado
  precio_idealista_venta_m2: "Precio Venta m² (Idealista)",
  precio_idealista_alquiler_m2: "Precio Alquiler m² (Idealista)",

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
  createdAt: "Fecha de Creación",
  updatedAt: "Última Actualización",

  // Información adicional
  campania: "Campaña",
  portfolio: "Cartera",
  borrower_name: "Nombre del Prestatario",
  hip_under_re_mgmt: "Hipoteca Bajo Gestión",

  // Geo
  latitude: "Latitud",
  longitude: "Longitud",
  images: "Imágenes",
}

// Mapeo de tipos de propiedad para mostrar en español
export const propertyTypeLabels: Record<string, string> = {
  vivienda_bloque_piso: "Vivienda en bloque/piso",
  vivienda_pareada: "Vivienda pareada",
  plaza_garaje: "Plaza de garaje",
  trastero: "Trastero",
  duplex: "Dúplex",
  vivienda_aislada: "Vivienda aislada",
  "finca_rustica/vivienda_aislada": "Finca rústica con vivienda aislada",
  casa: "Casa",
  vivienda_adosada: "Vivienda adosada",
  nave_industrial: "Nave industrial",
  local_comercial: "Local comercial",
  parcela_vivienda: "Parcela para vivienda",
  otro: "Otro",
  hotel: "Hotel",
  oficina: "Oficina",
  land: "Terreno",
  finca_rustica: "Finca rústica",
  apartamento: "Apartamento",
}

// Mapeo de estados de marketing para mostrar en español
export const marketingStatusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  RENTED: "Alquilado",
  SUSPENDED: "Suspendido",
  PENDING: "Pendiente",
  Available: "Disponible", // Case variations
  Reserved: "Reservado",
  Sold: "Vendido",
  Rented: "Alquilado",
  Suspended: "Suspendido",
  Pending: "Pendiente",
}

// Mapeo de fases legales para mostrar en español
export const legalPhaseLabels: Record<string, string> = {
  FORECLOSURE: "Ejecución Hipotecaria",
  AUCTION: "Subasta",
  ADJUDICATION: "Adjudicación",
  POSSESSION: "Posesión",
  EVICTION: "Desahucio",
  CLOSED: "Cerrado",
  Foreclosure: "Ejecución Hipotecaria", // Case variations
  Auction: "Subasta",
  Adjudication: "Adjudicación",
  Possession: "Posesión",
  Eviction: "Desahucio",
  Closed: "Cerrado",
}

// Función para formatear fechas en español
export function formatDate(dateInput?: Date | string | null): string {
  if (!dateInput) return "N/A"
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  if (isNaN(date.getTime())) return "Fecha inválida"
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

// Función para formatear valores monetarios en euros
export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null) return "N/A"
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0, // No decimals for simplicity, adjust if needed
  }).format(value)
}

// Función para generar un título descriptivo para la propiedad
export function generateTitle(asset: Asset): string {
  const type = asset.property_type ? propertyTypeLabels[asset.property_type] || asset.property_type : "Propiedad"
  const location = asset.municipio_catastro || asset.provincia_catastro || "Ubicación desconocida"
  const size = asset.superficie_construida_m2 ? `${asset.superficie_construida_m2}m²` : ""

  let title = `${type} en ${location}`
  if (size) title += ` de ${size}`
  if (asset.rooms) title += `, ${asset.rooms} hab.`

  return title
}

// Función para obtener la dirección completa usando SOLO campos catastrales
export function getFullAddress(asset: Asset): string {
  const components: string[] = []
  if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
    components.push(`${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`)
  }
  if (asset.numero_portal_catastro) components.push(asset.numero_portal_catastro)
  if (asset.escalera_catastro) components.push(`Esc. ${asset.escalera_catastro}`)
  if (asset.planta_catastro) components.push(`Planta ${asset.planta_catastro}`)
  if (asset.puerta_catastro) components.push(`Puerta ${asset.puerta_catastro}`)
  if (asset.codigo_postal_catastro) components.push(asset.codigo_postal_catastro)
  if (asset.municipio_catastro) components.push(asset.municipio_catastro)
  if (asset.provincia_catastro) components.push(asset.provincia_catastro)

  if (components.length > 0) return components.join(", ")
  if (asset.direccion_texto_catastro) return asset.direccion_texto_catastro
  return "Dirección no disponible"
}

// Función para generar una descripción para la propiedad
export function generateDescription(asset: Asset): string {
  const type = asset.property_type ? propertyTypeLabels[asset.property_type] || asset.property_type : "Propiedad"
  const address = getFullAddress(asset)
  let description = `${type} ubicado en ${address}.`

  if (asset.superficie_construida_m2) description += ` Superficie construida de ${asset.superficie_construida_m2}m².`
  if (asset.rooms) description += ` ${asset.rooms} habitaciones.`
  if (asset.bathrooms) description += ` ${asset.bathrooms} baños.`
  if (asset.extras) {
    const extrasText = Array.isArray(asset.extras) ? asset.extras.join(", ") : asset.extras
    description += ` Extras: ${extrasText}.`
  }
  if (asset.ano_construccion_inmueble && asset.ano_construccion_inmueble.toString() !== "0") {
    description += ` Año de construcción: ${asset.ano_construccion_inmueble}.`
  }
  if (asset.legal_phase) {
    const phase = legalPhaseLabels[asset.legal_phase] || asset.legal_phase
    description += ` Actualmente en fase legal: ${phase}.`
  }
  return description
}

// Función para obtener la superficie como número
export function getSuperficie(asset: Asset): number {
  if (!asset.superficie_construida_m2) return 0
  const superficie = Number.parseFloat(String(asset.superficie_construida_m2))
  return isNaN(superficie) ? 0 : superficie
}

// Función para calcular el valor de mercado
export function calculateMarketValue(asset: Asset): number {
  const superficie = getSuperficie(asset)
  if (!superficie || !asset.precio_idealista_venta_m2) return 0
  return superficie * asset.precio_idealista_venta_m2
}

// Función para calcular el valor de alquiler de mercado
export function calculateRentalMarketValue(asset: Asset): number {
  const superficie = getSuperficie(asset)
  if (!superficie || !asset.precio_idealista_alquiler_m2) return 0
  return superficie * asset.precio_idealista_alquiler_m2
}
