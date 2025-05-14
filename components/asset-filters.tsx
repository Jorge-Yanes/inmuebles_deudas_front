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
} from "@/lib/firestore/property-service"
import { propertyTypeLabels, marketingStatusLabels, legalPhaseLabels } from "@/types/asset"

export function AssetFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // State for filter options
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [marketingStatuses, setMarketingStatuses] = useState<string[]>([])
  const [legalPhases, setLegalPhases] = useState<string[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // State for current filter values
  const [filters, setFilters] = useState({
    property_type: searchParams.get("property_type") || "",
    marketing_status: searchParams.get("marketing_status") || "",
    legal_phase: searchParams.get("legal_phase") || "",
    province: searchParams.get("province") || "",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minSqm: searchParams.get("minSqm") || "",
    maxSqm: searchParams.get("maxSqm") || "",
    query: searchParams.get("query") || "",
  })

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true)

        // Fetch all filter options in parallel
        const [types, statuses, phases, provs] = await Promise.all([
          getPropertyTypes(),
          getMarketingStatuses(),
          getLegalPhases(),
          getProvinces(),
        ])

        setPropertyTypes(types)
        setMarketingStatuses(statuses)
        setLegalPhases(phases)
        setProvinces(provs)

        // If province is selected, fetch cities for that province
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

  // Update cities when province changes
  useEffect(() => {
    const updateCities = async () => {
      if (filters.province) {
        try {
          const citiesData = await getCities(filters.province)
          setCities(citiesData)

          // If the current city is not in the new list of cities, reset it
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

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    // Special handling for province changes
    if (name === "province" && value !== filters.province) {
      setFilters((prev) => ({ ...prev, [name]: value, city: "" }))
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    // Only add non-empty filters to the URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      property_type: "",
      marketing_status: "",
      legal_phase: "",
      province: "",
      city: "",
      minPrice: "",
      maxPrice: "",
      minSqm: "",
      maxSqm: "",
      query: "",
    })

    router.push(pathname)
  }

  // Check if any filters are applied
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
