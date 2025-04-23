import type { Asset, AssetFilter } from "@/types/asset"
import { normalizeText, generateTitle, generateDescription } from "@/lib/utils"

// Datos de ejemplo para simular la conexión con Firestore
// En una implementación real, esto se reemplazaría con llamadas a la API de Firestore
export const sampleAssets: Asset[] = [
  {
    id: "1",
    ndg: "NDG001",
    property_id: 1001,
    reference_code: "REF-1001",
    property_type: "RESIDENTIAL",
    property_general_subtype: "APARTMENT",
    province: "Madrid",
    city: "Madrid",
    address: "Calle Gran Vía 25",
    zip_code: "28013",
    floor: "3",
    door: "B",
    sqm: 85,
    rooms: 2,
    bathrooms: 1,
    has_parking: 1,
    extras: "Balcón, aire acondicionado, calefacción central",
    price_approx: 350000,
    auction_base: 300000,
    legal_phase: "AUCTION",
    marketing_status: "AVAILABLE",
    cadastral_reference: "4529701TG3442H0010PA",
    estado_posesion_fisica: "Ocupado",
    fecha_subasta: new Date("2023-12-15"),
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "2",
    ndg: "NDG002",
    property_id: 1002,
    reference_code: "REF-1002",
    property_type: "COMMERCIAL",
    property_general_subtype: "OFFICE",
    province: "Barcelona",
    city: "Barcelona",
    cadastral_reference: "4529701TG3442H0010PA",
    address: "Avenida Diagonal 405",
    zip_code: "08008",
    floor: "5",
    door: "1",
    sqm: 150,
    has_parking: 0,
    extras: "Recepción, sala de reuniones, zona de descanso",
    price_approx: 750000,
    auction_base: 650000,
    legal_phase: "POSSESSION",
    marketing_status: "RENTED",
    estado_posesion_fisica: "Libre",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-02-20"),
  },
  {
    id: "3",
    ndg: "NDG003",
    property_id: 1003,
    reference_code: "REF-1003",
    property_type: "RESIDENTIAL",
    property_general_subtype: "HOUSE",
    province: "Valencia",
    city: "Valencia",
    cadastral_reference: "4529701TG3442H0010PA",
    address: "Calle de la Paz 10",
    zip_code: "46003",
    sqm: 200,
    rooms: 4,
    bathrooms: 2,
    has_parking: 1,
    extras: "Jardín, terraza, piscina comunitaria",
    price_approx: 500000,
    auction_base: 450000,
    legal_phase: "CLOSED",
    marketing_status: "SOLD",
    estado_posesion_fisica: "Libre",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "4",
    ndg: "NDG004",
    property_id: 1004,
    reference_code: "REF-1004",
    property_type: "COMMERCIAL",
    cadastral_reference: "4529701TG3442H0010PA",
    property_general_subtype: "RETAIL",
    province: "Sevilla",
    city: "Sevilla",
    address: "Calle Sierpes 15",
    zip_code: "41004",
    sqm: 90,
    has_parking: 0,
    extras: "Escaparate, almacén, zona comercial",
    price_approx: 400000,
    auction_base: 350000,
    legal_phase: "AUCTION",
    marketing_status: "AVAILABLE",
    estado_posesion_fisica: "Libre",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-04-05"),
  },
  {
    id: "5",
    ndg: "NDG005",
    property_id: 1005,
    reference_code: "REF-1005",
    property_type: "LAND",
    province: "Málaga",
    city: "Marbella",
    cadastral_reference: "4529701TG3442H0010PA",
    address: "Urbanización Costa del Sol, Parcela 25",
    zip_code: "29603",
    sqm: 1000,
    extras: "Vistas al mar, urbanizable",
    price_approx: 250000,
    auction_base: 200000,
    legal_phase: "FORECLOSURE",
    marketing_status: "AVAILABLE",
    estado_posesion_fisica: "Libre",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-05-15"),
  },
  {
    id: "6",
    ndg: "NDG006",
    property_id: 1006,
    reference_code: "REF-1006",
    property_type: "RESIDENTIAL",
    property_general_subtype: "APARTMENT",
    province: "Madrid",
    city: "Alcobendas",
    address: "Calle Mayor 45",
    zip_code: "28100",
    floor: "2",
    door: "A",
    cadastral_reference: "4529701TG3442H0010PA",
    sqm: 95,
    rooms: 3,
    bathrooms: 2,
    has_parking: 1,
    extras: "Reformado, cocina equipada, armarios empotrados",
    price_approx: 320000,
    auction_base: 280000,
    legal_phase: "ADJUDICATION",
    marketing_status: "RESERVED",
    estado_posesion_fisica: "Ocupado",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-06-20"),
  },
  {
    id: "7",
    ndg: "NDG007",
    property_id: 1007,
    reference_code: "REF-1007",
    property_type: "INDUSTRIAL",
    province: "Barcelona",
    city: "Hospitalet de Llobregat",
    address: "Polígono Industrial Zona Franca, Nave 12",
    zip_code: "08040",
    sqm: 500,
    cadastral_reference: "4529701TG3442H0010PA",

    extras: "Muelle de carga, oficinas, altura 8m",
    price_approx: 600000,
    auction_base: 550000,
    legal_phase: "EVICTION",
    marketing_status: "AVAILABLE",
    estado_posesion_fisica: "Ocupado",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-07-05"),
  },
  {
    id: "8",
    ndg: "NDG008",
    property_id: 1008,
    reference_code: "REF-1008",
    property_type: "RESIDENTIAL",
    property_general_subtype: "APARTMENT",
    province: "Valencia",
    city: "Alicante",
    address: "Avenida Alfonso X El Sabio 15",
    zip_code: "03004",
    floor: "4",
    door: "C",
    cadastral_reference: "4529701TG3442H0010PA",

    sqm: 75,
    rooms: 2,
    bathrooms: 1,
    has_parking: 0,
    extras: "Cerca de la playa, terraza, vistas al mar",
    price_approx: 180000,
    auction_base: 150000,
    legal_phase: "POSSESSION",
    marketing_status: "AVAILABLE",
    estado_posesion_fisica: "Libre",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-08-10"),
  },
  {
    id: "9",
    ndg: "NDG009",
    property_id: 1009,
    reference_code: "REF-1009",
    property_type: "PARKING",
    province: "Madrid",
    city: "Madrid",
    cadastral_reference: "4529701TG3442H0010PA",

    address: "Calle Serrano 120",
    zip_code: "28006",
    sqm: 25,
    extras: "Plaza amplia, fácil acceso, vigilancia 24h",
    price_approx: 45000,
    auction_base: 40000,
    legal_phase: "CLOSED",
    marketing_status: "SOLD",
    estado_posesion_fisica: "Libre",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-09-15"),
  },
  {
    id: "10",
    ndg: "NDG010",
    property_id: 1010,
    reference_code: "REF-1010",
    property_type: "STORAGE",
    province: "Barcelona",
    city: "Barcelona",
    address: "Calle Balmes 215",
    zip_code: "08006",
    cadastral_reference: "4529701TG3442H0010PA",

    sqm: 15,
    extras: "Trastero en sótano, acceso con ascensor",
    price_approx: 25000,
    auction_base: 20000,
    legal_phase: "ADJUDICATION",
    marketing_status: "AVAILABLE",
    estado_posesion_fisica: "Libre",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-10-20"),
  },
  {
    id: "11",
    ndg: "NDG011",
    property_id: 1011,
    reference_code: "REF-1011",
    property_type: "RESIDENTIAL",
    property_general_subtype: "HOUSE",
    province: "Málaga",
    city: "Marbella",
    address: "Urbanización Sierra Blanca, Villa 5",
    zip_code: "29602",
    sqm: 350,
    rooms: 5,
    bathrooms: 4,
    cadastral_reference: "4529701TG3442H0010PA",

    has_parking: 1,
    extras: "Piscina privada, jardín, vistas al mar, seguridad 24h",
    price_approx: 1200000,
    auction_base: 1000000,
    legal_phase: "AUCTION",
    marketing_status: "AVAILABLE",
    estado_posesion_fisica: "Libre",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-11-05"),
  },
  {
    id: "12",
    ndg: "NDG012",
    property_id: 1012,
    reference_code: "REF-1012",
    property_type: "COMMERCIAL",
    property_general_subtype: "HOTEL",
    province: "Baleares",
    city: "Palma de Mallorca",
    address: "Paseo Marítimo 25",
    zip_code: "07014",
    sqm: 2000,
    rooms: 40,
    bathrooms: 45,
    has_parking: 1,
    extras: "Primera línea de playa, restaurante, piscina, terraza",
    price_approx: 5000000,
    auction_base: 4500000,
    cadastral_reference: "4529701TG3442H0010PA",

    legal_phase: "FORECLOSURE",
    marketing_status: "SUSPENDED",
    estado_posesion_fisica: "Ocupado",
    imageUrl: "/placeholder.svg?height=200&width=400",
    createdAt: new Date("2023-12-10"),
  },
]

// Obtener estadísticas de activos
export async function getAssetStats(userId?: string) {
  // Simular retraso de API
  await new Promise((resolve) => setTimeout(resolve, 500))

  // If userId is provided, filter assets based on user permissions
  const filteredAssets = [...sampleAssets]

  if (userId) {
    // In a real implementation, you would query Firestore to get user permissions
    // and filter assets accordingly
    // For now, we'll just use the sample assets
  }

  const totalAssets = filteredAssets.length
  const totalValue = filteredAssets.reduce((sum, asset) => sum + (asset.price_approx || 0), 0)
  const locations = new Set(filteredAssets.map((asset) => asset.city))
  const totalLocations = locations.size
  const averageValue = Math.round(totalValue / totalAssets)

  return {
    totalAssets,
    totalValue,
    totalLocations,
    averageValue,
  }
}

// Obtener activos recientes
export async function getRecentAssets(userId?: string) {
  // Simular retraso de API
  await new Promise((resolve) => setTimeout(resolve, 500))

  // If userId is provided, filter assets based on user permissions
  const filteredAssets = [...sampleAssets]

  if (userId) {
    // In a real implementation, you would query Firestore to get user permissions
    // and filter assets accordingly
    // For now, we'll just use the sample assets
  }

  // Ordenar por createdAt y devolver los 3 más recientes
  return filteredAssets
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
    .map((asset) => ({
      ...asset,
      title: asset.title || generateTitle(asset),
      description: asset.description || generateDescription(asset),
    }))
}

// Obtener todos los activos con filtrado opcional
export async function getAssets(filters?: AssetFilter) {
  // Simular retraso de API
  await new Promise((resolve) => setTimeout(resolve, 800))

  console.log("Getting assets with filters:", filters)

  let filteredAssets = [...sampleAssets]

  if (filters) {
    if (filters.property_type && filters.property_type !== "ALL") {
      filteredAssets = filteredAssets.filter((asset) => asset.property_type === filters.property_type)
    }
    if (filters.marketing_status && filters.marketing_status !== "ALL") {
      filteredAssets = filteredAssets.filter((asset) => asset.marketing_status === filters.marketing_status)
    }
    if (filters.legal_phase && filters.legal_phase !== "ALL") {
      filteredAssets = filteredAssets.filter((asset) => asset.legal_phase === filters.legal_phase)
    }
    if (filters.province && filters.province !== "ALL") {
      filteredAssets = filteredAssets.filter((asset) => asset.province === filters.province)
    }
    if (filters.city && filters.city !== "ALL") {
      filteredAssets = filteredAssets.filter((asset) => asset.city === filters.city)
    }
    if (filters.minPrice) {
      filteredAssets = filteredAssets.filter((asset) => (asset.price_approx || 0) >= filters.minPrice!)
    }
    if (filters.maxPrice) {
      filteredAssets = filteredAssets.filter((asset) => (asset.price_approx || 0) <= filters.maxPrice!)
    }
    if (filters.minSqm) {
      filteredAssets = filteredAssets.filter((asset) => asset.sqm >= filters.minSqm!)
    }
    if (filters.maxSqm) {
      filteredAssets = filteredAssets.filter((asset) => asset.sqm <= filters.maxSqm!)
    }
    if (filters.query) {
      const normalizedQuery = normalizeText(filters.query)
      filteredAssets = filteredAssets.filter((asset) => {
        return (
          normalizeText(asset.reference_code || "").includes(normalizedQuery) ||
          normalizeText(asset.address || "").includes(normalizedQuery) ||
          normalizeText(asset.city || "").includes(normalizedQuery) ||
          normalizeText(asset.province || "").includes(normalizedQuery) ||
          normalizeText(asset.property_type || "").includes(normalizedQuery) ||
          normalizeText(asset.property_general_subtype || "").includes(normalizedQuery) ||
          normalizeText(asset.marketing_status || "").includes(normalizedQuery) ||
          normalizeText(asset.legal_phase || "").includes(normalizedQuery) ||
          normalizeText(asset.extras || "").includes(normalizedQuery)
        )
      })
    }
  }

  console.log("Filtered assets count:", filteredAssets.length)

  // Añadir títulos y descripciones generadas para la UI
  return filteredAssets.map((asset) => ({
    ...asset,
    title: asset.title || generateTitle(asset),
    description: asset.description || generateDescription(asset),
  }))
}

// Obtener activo por ID
export async function getAssetById(id: string) {
  // Simular retraso de API
  await new Promise((resolve) => setTimeout(resolve, 500))

  const asset = sampleAssets.find((asset) => asset.id === id)

  if (!asset) return null

  // Añadir título y descripción generados para la UI
  return {
    ...asset,
    title: asset.title || generateTitle(asset),
    description: asset.description || generateDescription(asset),
  }
}

// Obtener todas las ubicaciones únicas
export async function getLocations() {
  // Simular retraso de API
  await new Promise((resolve) => setTimeout(resolve, 300))

  return Array.from(new Set(sampleAssets.map((asset) => asset.city))).sort()
}

// Obtener todas las provincias únicas
export async function getProvinces() {
  // Simular retraso de API
  await new Promise((resolve) => setTimeout(resolve, 300))

  return Array.from(new Set(sampleAssets.map((asset) => asset.province))).sort()
}

// Crear un nuevo activo
export async function createAsset(assetData: Partial<Asset>) {
  // Simular retraso de API
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // En una aplicación real, esto añadiría el activo a Firestore
  console.log("Creando activo:", assetData)

  // Devolver éxito
  return true
}

// Get all unique asset types
export async function getAssetTypes(): Promise<string[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real implementation, you would query Firestore
  return ["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL", "LAND", "PARKING", "STORAGE"]
}

// Get all unique portfolios
export async function getPortfolios(): Promise<string[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // In a real implementation, you would query Firestore
  return ["Portfolio A", "Portfolio B", "Portfolio C", "Legacy Assets"]
}

// Add a function to check if a user has access to an asset
export async function checkAssetAccess(userId: string, assetId: string): Promise<boolean> {
  // In a real implementation, you would:
  // 1. Get the user's permissions
  // 2. Get the asset details
  // 3. Check if the user has access based on asset type, province, portfolio, etc.

  // For now, we'll simulate this check
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Return true 80% of the time for demo purposes
  return Math.random() > 0.2
}
