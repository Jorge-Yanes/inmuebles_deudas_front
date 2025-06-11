import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  limit,
  type Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Asset, AssetFilter } from "@/types/asset"
import type { User } from "@/types/user"
import { normalizeText } from "@/lib/utils"

// Cache para mejorar el rendimiento
const propertyCache = new Map<string, Asset>()
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutos

// Convertir timestamp de Firestore a Date
const convertTimestamp = (timestamp: Timestamp | undefined | null): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined
}

// Convertir string a Date si es posible
const parseDate = (dateStr: string | undefined | null): Date | undefined => {
  if (!dateStr) return undefined

  // Intentar parsear la fecha
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? undefined : date
}

// Convertir documento de Firestore a tipo Asset
export const convertDocToAsset = (doc: DocumentData): Asset => {
  const data = doc.data()

  // Manejar posibles inconsistencias de datos
  const asset: Asset = {
    id: doc.id,
    ndg: data.ndg || "",
    lien: data.lien || undefined,
    property_id: data.property_id || undefined,
    reference_code: data.reference_code || undefined,
    parcel: data.parcel || undefined,
    cadastral_reference: data.cadastral_reference || undefined,
    property_idh: data.property_idh || undefined,
    property_bank_id: data.property_bank_id || undefined,
    alt_id1: data.alt_id1 || undefined,
    idufir: data.IDUFIR || data.idufir || undefined,
    id_portal_subasta: data.id_portal_subasta || undefined,

    // Información de la propiedad
    property_type: data.property_type || data["Property Type"] || "OTHER",
    property_general_subtype: data.property_general_subtype || data["Property General Subtype"] || undefined,

    // Ubicación - SOLO CAMPOS CATASTRALES
    provincia_catastro: data.provincia_catastro || "",
    municipio_catastro: data.municipio_catastro || "",
    tipo_via_catastro: data.tipo_via_catastro || "",
    nombre_via_catastro: data.nombre_via_catastro || "",
    numero_portal_catastro: data.numero_portal_catastro || "",
    escalera_catastro: data.escalera_catastro || undefined,
    planta_catastro: data.planta_catastro || undefined,
    puerta_catastro: data.puerta_catastro || undefined,
    codigo_postal_catastro: data.codigo_postal_catastro || "",

    // Características físicas - SOLO SUPERFICIE CATASTRAL
    superficie_construida_m2: data.superficie_construida_m2 || "0",
    rooms: data.rooms || undefined,
    bathrooms: data.bathrooms || undefined,
    has_parking: data.has_parking || undefined,
    extras: data.extras || undefined,

    // Información financiera
    gbv: Number.parseFloat(data.gbv) || undefined,
    auction_base: Number.parseFloat(data.auction_base) || undefined,
    deuda: Number.parseFloat(data.deuda) || undefined,
    DEUDA: Number.parseFloat(data.DEUDA) || undefined,
    auction_value: Number.parseFloat(data.auction_value) || undefined,
    price_approx: Number.parseFloat(data.price_approx) || undefined,
    price_to_brokers: Number.parseFloat(data.price_to_brokers) || undefined,
    ob: Number.parseFloat(data.ob) || undefined,
    hv: Number.parseFloat(data.hv) || undefined,
    purchase_price: Number.parseFloat(data.purchase_price) || undefined,
    uw_value: Number.parseFloat(data.uw_value) || undefined,
    hipoges_value_total: Number.parseFloat(data.hipoges_value_total) || undefined,

    // Información de mercado
    precio_idealista_venta_m2: Number.parseFloat(data.precio_idealista_venta_m2) || undefined,
    precio_idealista_alquiler_m2: Number.parseFloat(data.precio_idealista_alquiler_m2) || undefined,

    // Información legal
    legal_type: data.legal_type || undefined,
    legal_phase: data.legal_phase || undefined,
    tipo_procedimiento: data.tipo_procedimiento || undefined,
    fase_procedimiento: data.fase_procedimiento || undefined,
    fase_actual: data.fase_actual || undefined,

    // Estados
    registration_status: data.registration_status || undefined,
    working_status: data.working_status || undefined,
    marketing_status: data.marketing_status || undefined,
    marketing_suspended_reason: data.marketing_suspended_reason || undefined,
    estado_posesion_fisica: data.estado_posesion_fisica || undefined,

    // Fechas
    closing_date: convertTimestamp(data.closing_date) || parseDate(data.closing_date),
    portfolio_closing_date: convertTimestamp(data.portfolio_closing_date) || parseDate(data.portfolio_closing_date),
    date_under_re_mgmt: convertTimestamp(data.date_under_re_mgmt) || parseDate(data.date_under_re_mgmt),
    fecha_subasta: convertTimestamp(data.fecha_subasta) || parseDate(data.fecha_subasta),
    fecha_cesion_remate: convertTimestamp(data.fecha_cesion_remate) || parseDate(data.fecha_cesion_remate),

    // Información adicional
    campania: data.campania || undefined,
    portfolio: data.portfolio || undefined,
    borrower_name: data.borrower_name || undefined,
    hip_under_re_mgmt: data.hip_under_re_mgmt || undefined,
    reference_code_1: data.reference_code_1 || undefined,
    uso_predominante_inmueble: data.uso_predominante_inmueble || undefined,
    ano_construccion_inmueble: data.ano_construccion_inmueble || undefined,

    // Campos para UI
    imageUrl: data.imageUrl || undefined,
    features: data.features || [],
    documents: data.documents || [],
    history: data.history || [],
    createdAt: convertTimestamp(data.createdAt) || new Date(),
  }

  // Generar título y descripción si no existen
  if (!asset.title) {
    asset.title = generateTitle(asset)
  }

  if (!asset.description) {
    asset.description = generateDescription(asset)
  }

  return asset
}

// Función auxiliar para generar título
function generateTitle(asset: Asset): string {
  const propertyTypeLabels: Record<string, string> = {
    RESIDENTIAL: "Residencial",
    COMMERCIAL: "Comercial",
    INDUSTRIAL: "Industrial",
    LAND: "Terreno",
    PARKING: "Garaje",
    STORAGE: "Trastero",
    OTHER: "Otro",
    Vivienda: "Vivienda",
    "Local Comercial": "Local Comercial",
    Garaje: "Garaje",
    Trastero: "Trastero",
    "Nave Industrial": "Nave Industrial",
    Suelo: "Suelo",
    Edificio: "Edificio",
    Oficina: "Oficina",
    Otros: "Otros",
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

  const type = propertyTypeLabels[asset.property_type] || asset.property_type
  const location = asset.municipio_catastro || asset.provincia_catastro
  const size = asset.superficie_construida_m2 ? `${asset.superficie_construida_m2}m²` : ""

  let title = `${type} en ${location}`
  if (size) title += ` de ${size}`
  if (asset.rooms) title += `, ${asset.rooms} hab.`

  return title
}

// Función auxiliar para generar descripción
function generateDescription(asset: Asset): string {
  const propertyTypeLabels: Record<string, string> = {
    RESIDENTIAL: "Residencial",
    COMMERCIAL: "Comercial",
    INDUSTRIAL: "Industrial",
    LAND: "Terreno",
    PARKING: "Garaje",
    STORAGE: "Trastero",
    OTHER: "Otro",
    Vivienda: "Vivienda",
    "Local Comercial": "Local Comercial",
    Garaje: "Garaje",
    Trastero: "Trastero",
    "Nave Industrial": "Nave Industrial",
    Suelo: "Suelo",
    Edificio: "Edificio",
    Oficina: "Oficina",
    Otros: "Otros",
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

  const legalPhaseLabels: Record<string, string> = {
    FORECLOSURE: "Ejecución Hipotecaria",
    AUCTION: "Subasta",
    ADJUDICATION: "Adjudicación",
    POSSESSION: "Posesión",
    EVICTION: "Desahucio",
    CLOSED: "Cerrado",
    Foreclosure: "Ejecución Hipotecaria",
    Auction: "Subasta",
    Adjudication: "Adjudicación",
    Possession: "Posesión",
    Eviction: "Desahucio",
    Closed: "Cerrado",
  }

  const type = propertyTypeLabels[asset.property_type] || asset.property_type

  // Obtener dirección completa usando solo campos catastrales
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
function getFullAddress(asset: Asset): string {
  const components = []

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

  return "Dirección no disponible"
}

// Obtener una propiedad por ID
export async function getPropertyById(id: string, user?: User | null): Promise<Asset | null> {
  try {
    console.log(`Attempting to fetch property with ID: ${id}`)

    // Verificar caché primero
    if (propertyCache.has(id)) {
      const cachedData = propertyCache.get(id)!
      const cacheTime = cachedData.cacheTime as unknown as number

      // Devolver datos en caché si aún son válidos
      if (cacheTime && Date.now() - cacheTime < CACHE_EXPIRY) {
        return cachedData
      }
    }

    const propertyDoc = await getDoc(doc(db, "inmueblesMayo2", id))

    const docExists = propertyDoc.exists();
    console.log(`Document with ID ${id} exists: ${docExists}`)

    if (!docExists) {
      return null
    }
    const asset = convertDocToAsset(propertyDoc)

    // Añadir a caché con timestamp
    const assetWithCache = {
      ...asset,
      cacheTime: Date.now(),
    }
    propertyCache.set(id, assetWithCache)

    return asset
  } catch (error) {
    console.error("Error fetching property:", error)
    throw new Error("Failed to fetch property details")
  }
}

// Obtener todas las propiedades sin filtrado ni ordenación
export async function getAllProperties(maxLimit = 500): Promise<Asset[]> {
  try {
    console.log("🔍 getAllProperties - Starting with limit:", maxLimit)

    // Consulta simple con solo un límite - sin filtrado ni ordenación
    const propertiesQuery = query(collection(db, "inmueblesMayo2"), limit(maxLimit))
    const querySnapshot = await getDocs(propertiesQuery)

    console.log("🔍 getAllProperties - Query snapshot size:", querySnapshot.size)
    console.log("🔍 getAllProperties - Query snapshot empty:", querySnapshot.empty)

    const properties: Asset[] = []

    querySnapshot.forEach((doc) => {
      try {
        const asset = convertDocToAsset(doc)
        properties.push(asset)
      } catch (error) {
        console.error("🔍 getAllProperties - Error converting doc:", doc.id, error)
      }
    })

    console.log("🔍 getAllProperties - Converted properties:", properties.length)
    return properties
  } catch (error) {
    console.error("🔍 getAllProperties - Error fetching all properties:", error)
    return []
  }
}

// Obtener propiedades con paginación y filtrado
export async function getProperties(
  filters?: AssetFilter,
  pageSize = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  user?: User | null,
): Promise<{
  properties: Asset[]
  lastVisible: QueryDocumentSnapshot<DocumentData> | null
  total?: number
  hasNextPage?: boolean
}> {
  try {
    console.log("🔍 getProperties - Starting with filters:", filters)
    console.log("🔍 getProperties - Page size:", pageSize)

    // Primero, intentemos obtener todas las propiedades para verificar si hay datos
    const allProperties = await getAllProperties(pageSize * 2) // Obtener más para tener opciones

    console.log("🔍 getProperties - All properties count:", allProperties.length)

    if (allProperties.length === 0) {
      console.log("🔍 getProperties - No properties found in database")
      return { properties: [], lastVisible: null, total: 0, hasNextPage: false }
    }

    // Si no hay filtros, devolver las primeras propiedades
    if (!filters || Object.values(filters).every((v) => !v || v === "ALL")) {
      console.log("🔍 getProperties - No filters applied, returning first", pageSize, "properties")

      const pagedProperties = allProperties.slice(0, pageSize)
      let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null

      if (pagedProperties.length > 0) {
        const lastId = pagedProperties[pagedProperties.length - 1].id
        newLastVisible = { id: lastId } as QueryDocumentSnapshot<DocumentData>
      }

      return {
        properties: pagedProperties,
        lastVisible: newLastVisible,
        total: allProperties.length,
        hasNextPage: allProperties.length > pageSize,
      }
    }

    // Aplicar filtros del lado del cliente
    let filteredProperties = allProperties

    if (filters) {
      filteredProperties = allProperties.filter((asset) => {
        let include = true

        // Aplicar todos los filtros usando SOLO campos catastrales
        if (filters.property_type && filters.property_type !== "ALL" && asset.property_type !== filters.property_type) {
          include = false
        }

        if (
          include &&
          filters.marketing_status &&
          filters.marketing_status !== "ALL" &&
          asset.marketing_status !== filters.marketing_status
        ) {
          include = false
        }

        if (
          include &&
          filters.legal_phase &&
          filters.legal_phase !== "ALL" &&
          asset.legal_phase !== filters.legal_phase
        ) {
          include = false
        }

        if (
          include &&
          filters.provincia_catastro &&
          filters.provincia_catastro !== "ALL" &&
          asset.provincia_catastro !== filters.provincia_catastro
        ) {
          include = false
        }

        if (
          include &&
          filters.municipio_catastro &&
          filters.municipio_catastro !== "ALL" &&
          asset.municipio_catastro !== filters.municipio_catastro
        ) {
          include = false
        }

        if (
          include &&
          filters.tipo_via_catastro &&
          filters.tipo_via_catastro !== "ALL" &&
          asset.tipo_via_catastro !== filters.tipo_via_catastro
        ) {
          include = false
        }

        // Aplicar filtros de rango numérico
        if (include && filters.minPrice && asset.price_approx && asset.price_approx < filters.minPrice) {
          include = false
        }

        if (include && filters.maxPrice && asset.price_approx && asset.price_approx > filters.maxPrice) {
          include = false
        }

        // Usar superficie_construida_m2 en lugar de sqm
        const superficie = Number.parseFloat(asset.superficie_construida_m2) || 0
        if (include && filters.minSqm && superficie < filters.minSqm) {
          include = false
        }

        if (include && filters.maxSqm && superficie > filters.maxSqm) {
          include = false
        }

        // Nuevos filtros
        if (
          include &&
          filters.ano_construccion_min &&
          asset.ano_construccion_inmueble &&
          Number.parseInt(asset.ano_construccion_inmueble) < Number.parseInt(filters.ano_construccion_min)
        ) {
          include = false
        }

        if (
          include &&
          filters.ano_construccion_max &&
          asset.ano_construccion_inmueble &&
          Number.parseInt(asset.ano_construccion_inmueble) > Number.parseInt(filters.ano_construccion_max)
        ) {
          include = false
        }

        if (
          include &&
          filters.precio_idealista_min &&
          asset.precio_idealista_venta_m2 &&
          asset.precio_idealista_venta_m2 < filters.precio_idealista_min
        ) {
          include = false
        }

        if (
          include &&
          filters.precio_idealista_max &&
          asset.precio_idealista_venta_m2 &&
          asset.precio_idealista_venta_m2 > filters.precio_idealista_max
        ) {
          include = false
        }

        if (include && filters.has_parking && asset.has_parking !== filters.has_parking) {
          include = false
        }

        if (include && filters.rooms && asset.rooms !== filters.rooms) {
          include = false
        }

        if (include && filters.bathrooms && asset.bathrooms !== filters.bathrooms) {
          include = false
        }

        return include
      })
    }

    // Ordenar por createdAt manualmente
    filteredProperties.sort((a, b) => {
      const dateA = a.createdAt?.getTime() || 0
      const dateB = b.createdAt?.getTime() || 0
      return dateB - dateA // Orden descendente (más reciente primero)
    })

    // Manejar paginación manualmente
    let startIndex = 0
    if (lastVisible) {
      // Encontrar el índice del último elemento visible
      const lastId = lastVisible.id
      const lastIndex = filteredProperties.findIndex((asset) => asset.id === lastId)
      if (lastIndex !== -1) {
        startIndex = lastIndex + 1
      }
    }

    // Obtener la página actual de resultados
    const endIndex = startIndex + pageSize
    const pagedProperties = filteredProperties.slice(startIndex, endIndex)

    // Establecer el último documento visible para paginación
    let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null
    if (pagedProperties.length > 0) {
      const lastId = pagedProperties[pagedProperties.length - 1].id
      // Este es un documento visible simulado ya que no estamos usando la paginación de Firestore
      newLastVisible = { id: lastId } as QueryDocumentSnapshot<DocumentData>
    }

    console.log("🔍 getProperties - Returning:", {
      propertiesCount: pagedProperties.length,
      totalFiltered: filteredProperties.length,
      hasNext: endIndex < filteredProperties.length,
    })

    return {
      properties: pagedProperties,
      lastVisible: newLastVisible,
      total: filteredProperties.length,
      hasNextPage: endIndex < filteredProperties.length,
    }
  } catch (error) {
    console.error("🔍 getProperties - Error fetching properties:", error)
    return { properties: [], lastVisible: null, total: 0, hasNextPage: false }
  }
}

// Obtener propiedades filtradas - enfoque del lado del cliente
export async function getFilteredProperties(filters: Record<string, string | undefined>): Promise<Asset[]> {
  try {
    console.log("Filtering properties with filters:", filters)

    // Get all properties first
    const allProperties = await getAllProperties(1000)

    let filteredProperties = allProperties

    // Apply filters
    filteredProperties = allProperties.filter((asset) => {
      let include = true

      // Property type filter
      if (filters.property_type && filters.property_type !== "ALL" && filters.property_type !== "all") {
        if (asset.property_type !== filters.property_type) {
          include = false
        }
      }

      // Marketing status filter
      if (
        include &&
        filters.marketing_status &&
        filters.marketing_status !== "ALL" &&
        filters.marketing_status !== "all"
      ) {
        if (asset.marketing_status !== filters.marketing_status) {
          include = false
        }
      }

      // Legal phase filter
      if (include && filters.legal_phase && filters.legal_phase !== "ALL" && filters.legal_phase !== "all") {
        if (asset.legal_phase !== filters.legal_phase) {
          include = false
        }
      }

      // Provincia filter
      if (
        include &&
        filters.provincia_catastro &&
        filters.provincia_catastro !== "ALL" &&
        filters.provincia_catastro !== "all"
      ) {
        if (asset.provincia_catastro !== filters.provincia_catastro) {
          include = false
        }
      }

      // Municipio filter
      if (
        include &&
        filters.municipio_catastro &&
        filters.municipio_catastro !== "ALL" &&
        filters.municipio_catastro !== "all"
      ) {
        if (asset.municipio_catastro !== filters.municipio_catastro) {
          include = false
        }
      }

      // Tipo via filter
      if (
        include &&
        filters.tipo_via_catastro &&
        filters.tipo_via_catastro !== "ALL" &&
        filters.tipo_via_catastro !== "all"
      ) {
        if (asset.tipo_via_catastro !== filters.tipo_via_catastro) {
          include = false
        }
      }

      // Price filters
      if (include && filters.minPrice) {
        const minPrice = Number(filters.minPrice)
        if (!asset.price_approx || asset.price_approx < minPrice) {
          include = false
        }
      }

      if (include && filters.maxPrice) {
        const maxPrice = Number(filters.maxPrice)
        if (!asset.price_approx || asset.price_approx > maxPrice) {
          include = false
        }
      }

      // Surface filters
      if (include && (filters.minSqm || filters.maxSqm)) {
        const superficie = Number.parseFloat(asset.superficie_construida_m2) || 0

        if (filters.minSqm && superficie < Number(filters.minSqm)) {
          include = false
        }

        if (include && filters.maxSqm && superficie > Number(filters.maxSqm)) {
          include = false
        }
      }

      // Rooms filter
      if (include && filters.rooms && filters.rooms !== "Todas" && filters.rooms !== "all") {
        if (filters.rooms === "+5") {
          if (!asset.rooms || Number(asset.rooms) < 5) {
            include = false
          }
        } else {
          if (asset.rooms !== filters.rooms) {
            include = false
          }
        }
      }

      // Bathrooms filter
      if (include && filters.bathrooms && filters.bathrooms !== "Todos" && filters.bathrooms !== "all") {
        if (filters.bathrooms === "+5") {
          if (!asset.bathrooms || Number(asset.bathrooms) < 5) {
            include = false
          }
        } else {
          if (asset.bathrooms !== filters.bathrooms) {
            include = false
          }
        }
      }

      // Year filters
      if (include && filters.minYear && asset.ano_construccion_inmueble) {
        const year = Number.parseInt(asset.ano_construccion_inmueble)
        if (year < Number(filters.minYear)) {
          include = false
        }
      }

      if (include && filters.maxYear && asset.ano_construccion_inmueble) {
        const year = Number.parseInt(asset.ano_construccion_inmueble)
        if (year > Number(filters.maxYear)) {
          include = false
        }
      }

      return include
    })

    console.log(`Filtered ${filteredProperties.length} properties from ${allProperties.length} total`)
    return filteredProperties
  } catch (error) {
    console.error("Error fetching filtered properties:", error)
    return []
  }
}

// Obtener valores únicos para filtros
export async function getUniqueFieldValues(field: string): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(query(collection(db, "inmueblesMayo2"), limit(500)))
    const uniqueValues = new Set<string>()

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data[field]) {
        uniqueValues.add(data[field])
      }
    })

    return Array.from(uniqueValues).sort()
  } catch (error) {
    console.error(`Error fetching unique ${field} values:`, error)
    return []
  }
}

// Obtener estadísticas de propiedades
export async function getPropertyStats(userId?: string): Promise<{
  totalProperties: number
  totalValue: number
  totalLocations: number
  averageValue: number
}> {
  try {
    const querySnapshot = await getDocs(collection(db, "inmueblesMayo2"))

    let totalProperties = 0
    let totalValue = 0
    const locations = new Set<string>()

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      totalProperties++

      if (data.price_approx) {
        totalValue += data.price_approx
      }

      if (data.municipio_catastro) {
        locations.add(data.municipio_catastro)
      }
    })

    const averageValue = totalProperties > 0 ? Math.round(totalValue / totalProperties) : 0

    return {
      totalProperties,
      totalValue,
      totalLocations: locations.size,
      averageValue,
    }
  } catch (error) {
    console.error("Error fetching property stats:", error)
    return {
      totalProperties: 0,
      totalValue: 0,
      totalLocations: 0,
      averageValue: 0,
    }
  }
}

// Buscar propiedades por consulta de texto - enfoque del lado del cliente
export async function searchProperties(query: string): Promise<Asset[]> {
  try {
    if (!query.trim()) {
      return []
    }

    // Obtener todas las propiedades y filtrar del lado del cliente
    const allProperties = await getAllProperties(500)
    const normalizedQuery = normalizeText(query.toLowerCase())

    // Filtrar por la consulta de búsqueda usando SOLO campos catastrales
    const results = allProperties.filter((asset) => {
      // Buscar en múltiples campos catastrales
      const searchableFields = [
        asset.reference_code,
        asset.provincia_catastro,
        asset.municipio_catastro,
        asset.tipo_via_catastro,
        asset.nombre_via_catastro,
        asset.numero_portal_catastro,
        asset.codigo_postal_catastro,
        asset.property_type,
        asset.property_general_subtype,
        asset.marketing_status,
        asset.legal_phase,
        asset.extras,
        asset.uso_predominante_inmueble,
      ]
        .filter(Boolean)
        .map((field) => normalizeText(field || ""))

      return searchableFields.some((field) => field.includes(normalizedQuery))
    })

    return results
  } catch (error) {
    console.error("Error searching properties:", error)
    return []
  }
}

// Obtener provincias catastrales
export async function getProvincias(): Promise<string[]> {
  return getUniqueFieldValues("provincia_catastro")
}

// Obtener municipios catastrales
export async function getMunicipios(provincia?: string): Promise<string[]> {
  try {
    // Si no se especifica provincia, simplemente obtener todos los municipios únicos
    if (!provincia || provincia === "ALL") {
      return getUniqueFieldValues("municipio_catastro")
    }

    // De lo contrario, obtener todas las propiedades y filtrar del lado del cliente
    const allProperties = await getAllProperties(500)
    const municipios = new Set<string>()

    allProperties.forEach((asset) => {
      if (asset.provincia_catastro === provincia && asset.municipio_catastro) {
        municipios.add(asset.municipio_catastro)
      }
    })

    return Array.from(municipios).sort()
  } catch (error) {
    console.error("Error fetching municipios:", error)
    return []
  }
}

// Obtener tipos de vía catastrales
export async function getTiposVia(): Promise<string[]> {
  return getUniqueFieldValues("tipo_via_catastro")
}

// Obtener tipos de propiedad
export async function getPropertyTypes(): Promise<string[]> {
  return getUniqueFieldValues("property_type")
}

// Obtener estados de marketing
export async function getMarketingStatuses(): Promise<string[]> {
  return getUniqueFieldValues("marketing_status")
}

// Obtener fases legales
export async function getLegalPhases(): Promise<string[]> {
  return getUniqueFieldValues("legal_phase")
}

// Obtener años de construcción únicos
export async function getConstructionYears(): Promise<string[]> {
  return getUniqueFieldValues("ano_construccion_inmueble")
}

// Obtener número de habitaciones únicas
export async function getRoomCounts(): Promise<string[]> {
  return getUniqueFieldValues("rooms")
}

// Obtener número de baños únicos
export async function getBathroomCounts(): Promise<string[]> {
  return getUniqueFieldValues("bathrooms")
}

// Alias para mantener compatibilidad con código existente
export const getProvinces = getProvincias

// Alias para mantener compatibilidad con código existente
export const getCities = getMunicipios

// Obtener comarcas (mantener función original si existe en los datos)
export async function getComarcas(): Promise<string[]> {
  try {
    // Intentar obtener comarcas si el campo existe en los datos
    const querySnapshot = await getDocs(collection(db, "inmueblesMayo2"))
    const uniqueValues = new Set<string>()

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      // Buscar en posibles campos de comarca
      if (data.comarca) {
        uniqueValues.add(data.comarca)
      }
    })

    return Array.from(uniqueValues).sort()
  } catch (error) {
    console.error("Error fetching comarcas:", error)
    return []
  }
}
