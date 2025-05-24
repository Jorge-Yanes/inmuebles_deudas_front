export interface Asset {
  // Identificadores
  id: string
  ndg: string
  lien?: string
  property_id?: string
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
  address?: string // Campo calculado a partir de datos de dirección
  numero?: string
  street_type?: string
  street_no?: string
  zip_code?: string
  floor?: string
  door?: string
  comarca?: string

  // Información catastral
  direccion_texto_catastro?: string
  provincia_catastro?: string
  municipio_catastro?: string
  tipo_via_catastro?: string
  nombre_via_catastro?: string
  numero_portal_catastro?: string
  escalera_catastro?: string
  planta_catastro?: string
  puerta_catastro?: string
  codigo_postal_catastro?: string
  superficie_construida_m2?: string
  uso_predominante_inmueble?: string
  ano_construccion_inmueble?: string

  // Características físicas
  sqm: number
  rooms?: string
  bathrooms?: string
  has_parking?: string
  extras?: string

  // Información financiera
  gbv?: number
  auction_base?: number
  deuda?: number
  DEUDA?: number // Campo duplicado, mantener por compatibilidad
  auction_value?: number
  price_approx?: number
  price_to_brokers?: number
  ob?: number
  hv?: number
  purchase_price?: number
  uw_value?: number
  hipoges_value_total?: number

  // Información de mercado
  precio_idealista_venta_m2?: number
  precio_idealista_alquiler_m2?: number

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
  hip_under_re_mgmt?: string
  reference_code_1?: string

  // Campos para UI
  imageUrl?: string
  features?: string[]
  documents?: { name: string; url: string }[]
  history?: { title: string; date: string; description: string }[]
  createdAt: Date
}

export interface AssetFilter {
  type?: string
  status?: string
  location?: string
  province?: string
  city?: string
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
  comarca?: string
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
  idufir: "IDUFIR",

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

  // Información catastral
  direccion_texto_catastro: "Dirección Catastral",
  provincia_catastro: "Provincia (Catastro)",
  municipio_catastro: "Municipio (Catastro)",
  tipo_via_catastro: "Tipo de Vía (Catastro)",
  nombre_via_catastro: "Nombre de Vía (Catastro)",
  numero_portal_catastro: "Número Portal (Catastro)",
  escalera_catastro: "Escalera (Catastro)",
  planta_catastro: "Planta (Catastro)",
  puerta_catastro: "Puerta (Catastro)",
  codigo_postal_catastro: "Código Postal (Catastro)",
  superficie_construida_m2: "Superficie Construida (m²)",
  uso_predominante_inmueble: "Uso Predominante",
  ano_construccion_inmueble: "Año de Construcción",

  // Características físicas
  sqm: "Metros Cuadrados",
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
  // Nuevos tipos según la base de datos
  Vivienda: "Vivienda",
  "Local Comercial": "Local Comercial",
  Garaje: "Garaje",
  Trastero: "Trastero",
  "Nave Industrial": "Nave Industrial",
  Suelo: "Suelo",
  Edificio: "Edificio",
  Oficina: "Oficina",
  Otros: "Otros",
}

// Mapeo de estados de marketing para mostrar en español
export const marketingStatusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  RENTED: "Alquilado",
  SUSPENDED: "Suspendido",
  PENDING: "Pendiente",
  // Nuevos estados según la base de datos
  Available: "Disponible",
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
  // Nuevas fases según la base de datos
  Foreclosure: "Ejecución Hipotecaria",
  Auction: "Subasta",
  Adjudication: "Adjudicación",
  Possession: "Posesión",
  Eviction: "Desahucio",
  Closed: "Cerrado",
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

  // Construir la dirección completa a partir de los datos disponibles
  let address = asset.address || ""
  if (!address && asset.direccion_texto_catastro) {
    address = asset.direccion_texto_catastro
  } else if (!address) {
    // Construir dirección a partir de componentes individuales
    const components = []
    if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
      components.push(`${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`)
    }
    if (asset.numero_portal_catastro) {
      components.push(asset.numero_portal_catastro)
    }
    if (components.length > 0) {
      address = components.join(", ")
    }
  }

  let description = `${type} ubicado en ${address || "dirección no disponible"}, ${asset.city || "ciudad no disponible"}, ${asset.province || "provincia no disponible"}.`

  if (asset.sqm) description += ` Superficie de ${asset.sqm}m².`
  if (asset.rooms) description += ` ${asset.rooms} habitaciones.`
  if (asset.bathrooms) description += ` ${asset.bathrooms} baños.`
  if (asset.extras) description += ` ${asset.extras}.`
  if (asset.ano_construccion_inmueble && asset.ano_construccion_inmueble !== "0") {
    description += ` Año de construcción: ${asset.ano_construccion_inmueble}.`
  }

  if (asset.legal_phase) {
    const phase = legalPhaseLabels[asset.legal_phase] || asset.legal_phase
    description += ` Actualmente en fase legal: ${phase}.`
  }

  return description
}

// Función para obtener la dirección completa
export function getFullAddress(asset: Asset): string {
  // Primero intentamos usar la dirección ya formateada si existe
  if (asset.address) return asset.address

  // Si no, intentamos usar la dirección del catastro
  if (asset.direccion_texto_catastro) return asset.direccion_texto_catastro

  // Si no, construimos la dirección a partir de los componentes individuales
  const components = []

  // Intentamos primero con los datos de catastro
  if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
    components.push(`${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`)
    if (asset.numero_portal_catastro) {
      components.push(asset.numero_portal_catastro)
    }
    if (asset.escalera_catastro) {
      components.push(`Esc. ${asset.escalera_catastro}`)
    }
    if (asset.planta_catastro) {
      components.push(`Planta ${asset.planta_catastro}`)
    }
    if (asset.puerta_catastro) {
      components.push(`Puerta ${asset.puerta_catastro}`)
    }
  }
  // Si no hay datos de catastro, usamos los datos generales
  else if (asset.street_type && asset.street_no) {
    components.push(`${asset.street_type} ${asset.street_no}`)
    if (asset.numero) {
      components.push(asset.numero)
    }
    if (asset.floor) {
      components.push(`Planta ${asset.floor}`)
    }
    if (asset.door) {
      components.push(`Puerta ${asset.door}`)
    }
  }

  if (components.length > 0) {
    return components.join(", ")
  }

  // Si no hay suficiente información, devolvemos un mensaje genérico
  return "Dirección no disponible"
}
