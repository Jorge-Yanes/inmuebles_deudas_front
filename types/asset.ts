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

  // Ubicación - SOLO CAMPOS CATASTRALES
  provincia_catastro: string
  municipio_catastro: string
  tipo_via_catastro: string
  nombre_via_catastro: string
  numero_portal_catastro: string
  escalera_catastro?: string
  planta_catastro?: string
  puerta_catastro?: string
  codigo_postal_catastro: string

  // Características físicas - SOLO SUPERFICIE CATASTRAL
  superficie_construida_m2: string
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
  uso_predominante_inmueble?: string
  ano_construccion_inmueble?: string

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

  // Información adicional
  campania: "Campaña",
  portfolio: "Cartera",
  borrower_name: "Nombre del Prestatario",
  hip_under_re_mgmt: "Hipoteca Bajo Gestión",
}

// Mapeo de tipos de propiedad para mostrar en español
export const propertyTypeLabels: Record<string, string> = {
  // Tipos adicionales solicitados
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
  const location = asset.municipio_catastro || asset.provincia_catastro
  const size = asset.superficie_construida_m2 ? `${asset.superficie_construida_m2}m²` : ""

  let title = `${type} en ${location}`
  if (size) title += ` de ${size}`
  if (asset.rooms) title += `, ${asset.rooms} hab.`

  return title
}

// Función para generar una descripción para la propiedad
export function generateDescription(asset: Asset): string {
  const type = propertyTypeLabels[asset.property_type] || asset.property_type

  // Construir la dirección completa a partir de los datos catastrales
  const address = getFullAddress(asset)

  let description = `${type} ubicado en ${address}, ${asset.municipio_catastro}, ${asset.provincia_catastro}.`

  if (asset.superficie_construida_m2) description += ` Superficie construida de ${asset.superficie_construida_m2}m².`
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

// Función para obtener la dirección completa usando SOLO campos catastrales
export function getFullAddress(asset: Asset): string {
  const components = []

  // Construir dirección usando solo datos catastrales
  if (asset.tipo_via_catastro && asset.nombre_via_catastro) {
    components.push(`${asset.tipo_via_catastro} ${asset.nombre_via_catastro}`)
  }

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

  if (components.length > 0) {
    return components.join(", ")
  }

  // Si no hay suficiente información, devolvemos un mensaje genérico
  return "Dirección no disponible"
}

// Función para obtener la superficie como número
export function getSuperficie(asset: Asset): number {
  if (!asset.superficie_construida_m2) return 0
  const superficie = Number.parseFloat(asset.superficie_construida_m2.toString())
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
