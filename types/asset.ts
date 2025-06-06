export interface Asset {
  puerta_catastro?: string
  planta_catastro?: string
  hipoges_value_total?: number | null
  direccion_texto_catastro?: string
  uw_value?: number | null
  precio_idealista_alquiler_m2?: number
  provincia_catastro?: string
  numero_portal_catastro?: string
  gbv?: number | null
  price_to_brokers?: number | null
  fase_procedimiento?: string
  cadastral_reference?: string
  sqm?: number
  municipio_catastro?: string
  auction_base?: number | null
  escalera_catastro?: string
  tipo_procedimiento?: string
  superficie_construida_m2?: string
  tipo_via_catastro?: string
  hv?: number | null
  auction_value?: number
  uso_predominante_inmueble?: string
  deuda?: number | null
  property_type?: string
  price_approx?: number | null
  nombre_via_catastro?: string
  precio_idealista_venta_m2?: number
  purchase_price?: number | null
  codigo_postal_catastro?: string
  ob?: number
  ano_construccion_inmueble?: string
  reference_code?: string
  DEUDA?: number | null
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
