"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getPropertyTypes,
  getMarketingStatuses,
  getLegalPhases,
  getProvinces,
  getCities,
  getComarcas,
  getConstructionYears,
  getRoomCounts,
  getBathroomCounts,
} from "@/lib/firestore/property-service"
import { propertyTypeLabels, marketingStatusLabels, legalPhaseLabels } from "@/types/asset"

export function AssetFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Estado para opciones de filtro
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [marketingStatuses, setMarketingStatuses] = useState<string[]>([])
  const [legalPhases, setLegalPhases] = useState<string[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [comarcas, setComarcas] = useState<string[]>([])
  const [constructionYears, setConstructionYears] = useState<string[]>([])
  const [roomCounts, setRoomCounts] = useState<string[]>([])
  const [bathroomCounts, setBathroomCounts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Estado para valores de filtro actuales
  const [filters, setFilters] = useState({
    property_type: searchParams.get("property_type") || "",
    marketing_status: searchParams.get("marketing_status") || "",
    legal_phase: searchParams.get("legal_phase") || "",
    province: searchParams.get("province") || "",
    city: searchParams.get("city") || "",
    comarca: searchParams.get("comarca") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minSqm: searchParams.get("minSqm") || "",
    maxSqm: searchParams.get("maxSqm") || "",
    query: searchParams.get("query") || "",
    ano_construccion_min: searchParams.get("ano_construccion_min") || "",
    ano_construccion_max: searchParams.get("ano_construccion_max") || "",
    precio_idealista_min: searchParams.get("precio_idealista_min") || "",
    precio_idealista_max: searchParams.get("precio_idealista_max") || "",
    rooms: searchParams.get("rooms") || "",
    bathrooms: searchParams.get("bathrooms") || "",
    has_parking: searchParams.get("has_parking") || "",
  })

  // Obtener opciones de filtro
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true)

        // Obtener todas las opciones de filtro en paralelo
        const [types, statuses, phases, provs, coms, years, rooms, baths] = await Promise.all([
          getPropertyTypes(),
          getMarketingStatuses(),
          getLegalPhases(),
          getProvinces(),
          getComarcas(),
          getConstructionYears(),
          getRoomCounts(),
          getBathroomCounts(),
        ])

        setPropertyTypes(types)
        setMarketingStatuses(statuses)
        setLegalPhases(phases)
        setProvinces(provs)
        setComarcas(coms)
        setConstructionYears(
          years.filter((year) => year !== "0").sort((a, b) => Number.parseInt(a) - Number.parseInt(b)),
        )
        setRoomCounts(rooms.sort((a, b) => Number.parseInt(a) - Number.parseInt(b)))
        setBathroomCounts(baths.sort((a, b) => Number.parseInt(a) - Number.parseInt(b)))

        // Si se selecciona una provincia, obtener ciudades para esa provincia
        if (filters.province) {
          const citiesData = await getCities(filters.province)
          setCities(citiesData)
        }
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [filters.province])

  // Actualizar ciudades cuando cambia la provincia
  useEffect(() => {
    const updateCities = async () => {
      if (filters.province) {
        try {
          const citiesData = await getCities(filters.province)
          setCities(citiesData)

          // Si la ciudad actual no está en la nueva lista de ciudades, restablecerla
          if (filters.city && !citiesData.includes(filters.city)) {
            setFilters((prev) => ({ ...prev, city: "" }))
          }
        } catch (error) {
          console.error("Error fetching cities:", error)
        }
      } else {
        setCities([])
        if (filters.city) {
          setFilters((prev) => ({ ...prev, city: "" }))
        }
      }
    }

    updateCities()
  }, [filters.province])

  // Manejar cambios de filtro
  const handleFilterChange = (name: string, value: string) => {
    // Manejo especial para cambios de provincia
    if (name === "province" && value !== filters.province) {
      setFilters((prev) => ({ ...prev, [name]: value, city: "" }))
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Aplicar filtros
  const applyFilters = () => {
    const params = new URLSearchParams()

    // Solo agregar filtros no vacíos a la URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  // Restablecer filtros
  const resetFilters = () => {
    setFilters({
      property_type: "",
      marketing_status: "",
      legal_phase: "",
      province: "",
      city: "",
      comarca: "",
      minPrice: "",
      maxPrice: "",
      minSqm: "",
      maxSqm: "",
      query: "",
      ano_construccion_min: "",
      ano_construccion_max: "",
      precio_idealista_min: "",
      precio_idealista_max: "",
      rooms: "",
      bathrooms: "",
      has_parking: "",
    })

    router.push(pathname)
  }

  // Verificar si se aplican filtros
  const hasActiveFilters = Object.values(filters).some((value) => value !== "")

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-24 bg-muted rounded"></div>
              <div className="h-10 w-full bg-muted rounded"></div>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <div className="h-10 w-24 bg-muted rounded"></div>
          <div className="h-10 w-24 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="property_type">Tipo de Propiedad</Label>
          <Select value={filters.property_type} onValueChange={(value) => handleFilterChange("property_type", value)}>
            <SelectTrigger id="property_type">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {propertyTypeLabels[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="marketing_status">Estado de Marketing</Label>
          <Select
            value={filters.marketing_status}
            onValueChange={(value) => handleFilterChange("marketing_status", value)}
          >
            <SelectTrigger id="marketing_status">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {marketingStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {marketingStatusLabels[status] || status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="legal_phase">Fase Legal</Label>
          <Select value={filters.legal_phase} onValueChange={(value) => handleFilterChange("legal_phase", value)}>
            <SelectTrigger id="legal_phase">
              <SelectValue placeholder="Todas las fases" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las fases</SelectItem>
              {legalPhases.map((phase) => (
                <SelectItem key={phase} value={phase}>
                  {legalPhaseLabels[phase] || phase}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="province">Provincia</Label>
          <Select value={filters.province} onValueChange={(value) => handleFilterChange("province", value)}>
            <SelectTrigger id="province">
              <SelectValue placeholder="Todas las provincias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las provincias</SelectItem>
              {provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filters.province && (
          <div className="space-y-2">
            <Label htmlFor="city">Ciudad</Label>
            <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
              <SelectTrigger id="city">
                <SelectValue placeholder="Todas las ciudades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las ciudades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="comarca">Comarca</Label>
          <Select value={filters.comarca} onValueChange={(value) => handleFilterChange("comarca", value)}>
            <SelectTrigger id="comarca">
              <SelectValue placeholder="Todas las comarcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las comarcas</SelectItem>
              {comarcas.map((comarca) => (
                <SelectItem key={comarca} value={comarca}>
                  {comarca}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPrice">Precio Mínimo</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="Mínimo"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Precio Máximo</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="Máximo"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="minSqm">Superficie Mínima (m²)</Label>
          <Input
            id="minSqm"
            type="number"
            placeholder="Mínimo"
            value={filters.minSqm}
            onChange={(e) => handleFilterChange("minSqm", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxSqm">Superficie Máxima (m²)</Label>
          <Input
            id="maxSqm"
            type="number"
            placeholder="Máximo"
            value={filters.maxSqm}
            onChange={(e) => handleFilterChange("maxSqm", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rooms">Habitaciones</Label>
          <Select value={filters.rooms} onValueChange={(value) => handleFilterChange("rooms", value)}>
            <SelectTrigger id="rooms">
              <SelectValue placeholder="Cualquier número" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier número</SelectItem>
              {roomCounts.map((count) => (
                <SelectItem key={count} value={count}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Baños</Label>
          <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange("bathrooms", value)}>
            <SelectTrigger id="bathrooms">
              <SelectValue placeholder="Cualquier número" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier número</SelectItem>
              {bathroomCounts.map((count) => (
                <SelectItem key={count} value={count}>
                  {count}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="has_parking">Plaza de Garaje</Label>
          <Select value={filters.has_parking} onValueChange={(value) => handleFilterChange("has_parking", value)}>
            <SelectTrigger id="has_parking">
              <SelectValue placeholder="Cualquier opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier opción</SelectItem>
              <SelectItem value="1">Sí</SelectItem>
              <SelectItem value="0">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ano_construccion_min">Año Construcción Mínimo</Label>
          <Select
            value={filters.ano_construccion_min}
            onValueChange={(value) => handleFilterChange("ano_construccion_min", value)}
          >
            <SelectTrigger id="ano_construccion_min">
              <SelectValue placeholder="Cualquier año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier año</SelectItem>
              {constructionYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ano_construccion_max">Año Construcción Máximo</Label>
          <Select
            value={filters.ano_construccion_max}
            onValueChange={(value) => handleFilterChange("ano_construccion_max", value)}
          >
            <SelectTrigger id="ano_construccion_max">
              <SelectValue placeholder="Cualquier año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier año</SelectItem>
              {constructionYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="precio_idealista_min">Precio Idealista Mín. (€/m²)</Label>
          <Input
            id="precio_idealista_min"
            type="number"
            placeholder="Mínimo"
            value={filters.precio_idealista_min}
            onChange={(e) => handleFilterChange("precio_idealista_min", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="precio_idealista_max">Precio Idealista Máx. (€/m²)</Label>
          <Input
            id="precio_idealista_max"
            type="number"
            placeholder="Máximo"
            value={filters.precio_idealista_max}
            onChange={(e) => handleFilterChange("precio_idealista_max", e.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="query">Búsqueda</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="query"
              type="text"
              placeholder="Buscar por referencia, dirección, etc."
              className="pl-8"
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {hasActiveFilters && (
          <Button variant="outline" onClick={resetFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        )}
        <Button onClick={applyFilters}>Aplicar Filtros</Button>
      </div>
    </div>
  )
}
