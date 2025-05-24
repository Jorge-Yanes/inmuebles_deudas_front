import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  type Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Asset, AssetFilter } from "@/types/asset"
import type { User } from "@/types/user"
import { normalizeText, getFullAddress } from "@/lib/utils"

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

    // Ubicación
    province: data.province || "",
    city: data.city || "",
    address: data.address || undefined,
    numero: data.numero || undefined,
    street_type: data.street_type || undefined,
    street_no: data.street_no || undefined,
    zip_code: data.zip_code || undefined,
    floor: data.floor || undefined,
    door: data.door || undefined,
    comarca: data.comarca || undefined,

    // Información catastral
    direccion_texto_catastro: data.direccion_texto_catastro || undefined,
    provincia_catastro: data.provincia_catastro || undefined,
    municipio_catastro: data.municipio_catastro || undefined,
    tipo_via_catastro: data.tipo_via_catastro || undefined,
    nombre_via_catastro: data.nombre_via_catastro || undefined,
    numero_portal_catastro: data.numero_portal_catastro || undefined,
    escalera_catastro: data.escalera_catastro || undefined,
    planta_catastro: data.planta_catastro || undefined,
    puerta_catastro: data.puerta_catastro || undefined,
    codigo_postal_catastro: data.codigo_postal_catastro || undefined,
    superficie_construida_m2: data.superficie_construida_m2 || undefined,
    uso_predominante_inmueble: data.uso_predominante_inmueble || undefined,
    ano_construccion_inmueble: data.ano_construccion_inmueble || undefined,

    // Características físicas
    sqm: Number.parseFloat(data.sqm) || Number.parseFloat(data.superficie_construida_m2) || 0,
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
  }

  const type = propertyTypeLabels[asset.property_type] || asset.property_type
  const location = asset.city || asset.province || asset.municipio_catastro || asset.provincia_catastro
  const size = asset.sqm
    ? `${asset.sqm}m²`
    : asset.superficie_construida_m2
      ? `${asset.superficie_construida_m2}m²`
      : ""

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

  // Obtener dirección completa
  const address = getFullAddress(asset)
  const city = asset.city || asset.municipio_catastro || "ciudad no disponible"
  const province = asset.province || asset.provincia_catastro || "provincia no disponible"

  let description = `${type} ubicado en ${address}, ${city}, ${province}.`

  if (asset.sqm) description += ` Superficie de ${asset.sqm}m².`
  else if (asset.superficie_construida_m2)
    description += ` Superficie construida de ${asset.superficie_construida_m2}m².`

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

// Obtener una propiedad por ID
export async function getPropertyById(id: string, user?: User | null): Promise<Asset | null> {
  try {
    // Verificar caché primero
    if (propertyCache.has(id)) {
      const cachedData = propertyCache.get(id)!
      const cacheTime = cachedData.cacheTime as unknown as number

      // Devolver datos en caché si aún son válidos
      if (cacheTime && Date.now() - cacheTime < CACHE_EXPIRY) {
        return cachedData
      }
    }

    const propertyDoc = await getDoc(doc(db, "inmueblesMayo", id))

    if (!propertyDoc.exists()) {
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
    // Consulta simple con solo un límite - sin filtrado ni ordenación
    const propertiesQuery = query(collection(db, "inmueblesMayo"), limit(maxLimit))
    const querySnapshot = await getDocs(propertiesQuery)

    const properties: Asset[] = []

    querySnapshot.forEach((doc) => {
      const asset = convertDocToAsset(doc)
      properties.push(asset)
    })

    return properties
  } catch (error) {
    console.error("Error fetching all properties:", error)
    return []
  }
}

// Obtener propiedades con paginación y filtrado
export async function getProperties(
  filters?: AssetFilter,
  pageSize = 10,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  user?: User | null,
): Promise<{ properties: Asset[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    console.log("Property service: Getting properties with filters:", filters)

    // Para evitar requerir índices compuestos, usaremos diferentes estrategias:

    // 1. Si no se aplican filtros, podemos usar orderBy de forma segura
    if (!filters || Object.values(filters).every((v) => !v || v === "ALL")) {
      // Sin filtros, solo ordenar por createdAt
      const simpleQuery = query(collection(db, "inmueblesMayo"), orderBy("createdAt", "desc"), limit(pageSize))

      // Aplicar paginación para consultas sin filtros
      if (lastVisible) {
        const paginatedQuery = query(
          collection(db, "inmueblesMayo"),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(pageSize),
        )

        const querySnapshot = await getDocs(paginatedQuery)
        const properties: Asset[] = []
        let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null

        querySnapshot.forEach((doc) => {
          properties.push(convertDocToAsset(doc))
          newLastVisible = doc
        })

        return { properties, lastVisible: newLastVisible }
      }

      const querySnapshot = await getDocs(simpleQuery)
      const properties: Asset[] = []
      let newLastVisible: QueryDocumentSnapshot<DocumentData> | null = null

      querySnapshot.forEach((doc) => {
        properties.push(convertDocToAsset(doc))
        newLastVisible = doc
      })

      return { properties, lastVisible: newLastVisible }
    }

    // 2. Para consultas filtradas, obtendremos todas las propiedades y filtraremos del lado del cliente
    // Esto es menos eficiente pero evita requisitos de índice
    const allProperties = await getAllProperties(500) // Límite a 500 para evitar lecturas excesivas

    // Aplicar filtros del lado del cliente
    let filteredProperties = allProperties

    if (filters) {
      filteredProperties = allProperties.filter((asset) => {
        let include = true

        // Aplicar todos los filtros
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

        if (include && filters.province && filters.province !== "ALL" && asset.province !== filters.province) {
          include = false
        }

        if (include && filters.city && filters.city !== "ALL" && asset.city !== filters.city) {
          include = false
        }

        if (include && filters.comarca && filters.comarca !== "ALL" && asset.comarca !== filters.comarca) {
          include = false
        }

        // Aplicar filtros de rango numérico
        if (include && filters.minPrice && asset.price_approx && asset.price_approx < filters.minPrice) {
          include = false
        }

        if (include && filters.maxPrice && asset.price_approx && asset.price_approx > filters.maxPrice) {
          include = false
        }

        if (include && filters.minSqm && asset.sqm && asset.sqm < filters.minSqm) {
          include = false
        }

        if (include && filters.maxSqm && asset.sqm && asset.sqm > filters.maxSqm) {
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

    return {
      properties: pagedProperties,
      lastVisible: newLastVisible,
    }
  } catch (error) {
    console.error("Error fetching properties:", error)
    return { properties: [], lastVisible: null }
  }
}

// Obtener valores únicos para filtros
export async function getUniqueFieldValues(field: string): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "inmueblesMayo"))
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
    const querySnapshot = await getDocs(collection(db, "inmueblesMayo"))

    let totalProperties = 0
    let totalValue = 0
    const locations = new Set<string>()

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      totalProperties++

      if (data.price_approx) {
        totalValue += data.price_approx
      }

      if (data.city) {
        locations.add(data.city)
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

    // Filtrar por la consulta de búsqueda
    const results = allProperties.filter((asset) => {
      // Buscar en múltiples campos
      const searchableFields = [
        asset.reference_code,
        asset.address,
        asset.direccion_texto_catastro,
        asset.city,
        asset.municipio_catastro,
        asset.province,
        asset.provincia_catastro,
        asset.property_type,
        asset.property_general_subtype,
        asset.marketing_status,
        asset.legal_phase,
        asset.extras,
        asset.uso_predominante_inmueble,
        asset.comarca,
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

// Obtener propiedades filtradas - enfoque del lado del cliente
export async function getFilteredProperties(filters: Record<string, string | undefined>): Promise<Asset[]> {
  try {
    // Convertir los filtros al tipo AssetFilter
    const assetFilters: AssetFilter = {
      property_type: filters.property_type,
      marketing_status: filters.marketing_status,
      legal_phase: filters.legal_phase,
      province: filters.province,
      city: filters.city,
      comarca: filters.comarca,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      minSqm: filters.minSqm ? Number(filters.minSqm) : undefined,
      maxSqm: filters.maxSqm ? Number(filters.maxSqm) : undefined,
      query: filters.query,
      ano_construccion_min: filters.ano_construccion_min,
      ano_construccion_max: filters.ano_construccion_max,
      precio_idealista_min: filters.precio_idealista_min ? Number(filters.precio_idealista_min) : undefined,
      precio_idealista_max: filters.precio_idealista_max ? Number(filters.precio_idealista_max) : undefined,
      has_parking: filters.has_parking,
      rooms: filters.rooms,
      bathrooms: filters.bathrooms,
    }

    // Usar la función getProperties para obtener propiedades filtradas
    const result = await getProperties(assetFilters, 100)
    return result.properties
  } catch (error) {
    console.error("Error fetching filtered properties:", error)
    return []
  }
}

// Obtener provincias
export async function getProvinces(): Promise<string[]> {
  return getUniqueFieldValues("province")
}

// Obtener comarcas
export async function getComarcas(): Promise<string[]> {
  return getUniqueFieldValues("comarca")
}

// Obtener ciudades
export async function getCities(province?: string): Promise<string[]> {
  try {
    // Si no se especifica provincia, simplemente obtener todas las ciudades únicas
    if (!province || province === "ALL") {
      return getUniqueFieldValues("city")
    }

    // De lo contrario, obtener todas las propiedades y filtrar del lado del cliente
    const allProperties = await getAllProperties(500)
    const cities = new Set<string>()

    allProperties.forEach((asset) => {
      if (asset.province === province && asset.city) {
        cities.add(asset.city)
      }
    })

    return Array.from(cities).sort()
  } catch (error) {
    console.error("Error fetching cities:", error)
    return []
  }
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
