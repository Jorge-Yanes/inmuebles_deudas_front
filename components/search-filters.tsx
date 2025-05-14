"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getPropertyTypes,
  getMarketingStatuses,
  getLegalPhases,
  getProvinces,
  getCities,
} from "@/lib/firestore/property-service"
import { propertyTypeLabels } from "@/types/asset"

interface SearchFiltersProps {
  searchParams: Record<string, string | undefined>
}

export function SearchFilters({ searchParams }: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  // State for filter options
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [marketingStatuses, setMarketingStatuses] = useState<string[]>([])
  const [legalPhases, setLegalPhases] = useState<string[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // State for current filter values
  const [filters, setFilters] = useState({
    property_type: searchParams.property_type || "",
    marketing_status: searchParams.marketing_status || "",
    legal_phase: searchParams.legal_phase || "",
    province: searchParams.province || "",
    city: searchParams.city || "",
    minPrice: searchParams.minPrice || "",
    maxPrice: searchParams.maxPrice || "",
    minSqm: searchParams.minSqm || "",
    maxSqm: searchParams.maxSqm || "",
    query: searchParams.q || "",
    investmentType: searchParams.investmentType || "",
    propertyFeatures: searchParams.propertyFeatures ? searchParams.propertyFeatures.split(",") : [],
    rooms: searchParams.rooms || "",
    bathrooms: searchParams.bathrooms || "",
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
  const handleFilterChange = (name: string, value: string | string[]) => {
    // Special handling for province changes
    if (name === "province" && value !== filters.province) {
      setFilters((prev) => ({ ...prev, [name]: value, city: "" }))
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Handle checkbox changes for property features
  const handleFeatureChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFilters((prev) => ({
        ...prev,
        propertyFeatures: [...prev.propertyFeatures, feature],
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        propertyFeatures: prev.propertyFeatures.filter((f) => f !== feature),
      }))
    }
  }

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    // Only add non-empty filters to the URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === "propertyFeatures" && Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","))
        } else if (key === "query") {
          params.set("q", value as string)
        } else if (value) {
          params.set(key, value as string)
        }
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
      investmentType: "",
      propertyFeatures: [],
      rooms: "",
      bathrooms: "",
    })

    router.push(pathname)
  }

  // Check if any filters are applied
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0
    }
    return value !== ""
  })

  if (loading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded mb-4"></div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-2 mb-4">
            <div className="h-5 w-24 bg-muted rounded"></div>
            <div className="h-10 w-full bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 overflow-auto max-h-screen">
      <h2 className="text-lg font-semibold">Tu búsqueda</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-query">Ubicación</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-query"
              type="text"
              placeholder="Ciudad, provincia, código postal..."
              className="pl-8"
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
            />
          </div>
        </div>

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
          <Label>Tipo de inversión</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="investment-type-reo"
                checked={filters.investmentType === "REO"}
                onCheckedChange={(checked) => handleFilterChange("investmentType", checked ? "REO" : "")}
              />
              <label
                htmlFor="investment-type-reo"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Compra de inmuebles (REO)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="investment-type-npl"
                checked={filters.investmentType === "NPL"}
                onCheckedChange={(checked) => handleFilterChange("investmentType", checked ? "NPL" : "")}
              />
              <label
                htmlFor="investment-type-npl"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Compra de deuda hipotecaria (NPL)
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tipo de piso o casa</Label>
          <div className="space-y-2">
            {[
              { id: "all", label: "Todos" },
              { id: "apartment", label: "Pisos y apartamentos" },
              { id: "studio", label: "Estudios" },
              { id: "house", label: "Casas y chalets" },
              { id: "duplex", label: "Dúplex" },
              { id: "loft", label: "Lofts" },
            ].map((item) => (
              <div key={item.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`property-type-${item.id}`}
                  checked={item.id === "all" ? !filters.property_type : filters.property_type === item.id.toUpperCase()}
                  onCheckedChange={(checked) =>
                    handleFilterChange("property_type", checked ? (item.id === "all" ? "" : item.id.toUpperCase()) : "")
                  }
                />
                <label
                  htmlFor={`property-type-${item.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tamaño</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Mínimo"
              type="number"
              value={filters.minSqm}
              onChange={(e) => handleFilterChange("minSqm", e.target.value)}
            />
            <Input
              placeholder="Máximo"
              type="number"
              value={filters.maxSqm}
              onChange={(e) => handleFilterChange("maxSqm", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Precio</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Mínimo"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <Input
              placeholder="Máximo"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Habitaciones</Label>
          <div className="flex space-x-2">
            {["Todas", "1", "2", "3", "4", "+5"].map((room) => (
              <Button
                key={room}
                variant={filters.rooms === (room === "Todas" ? "" : room) ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleFilterChange("rooms", room === "Todas" ? "" : room)}
              >
                {room}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Baños</Label>
          <div className="flex space-x-2">
            {["Todos", "1", "2", "3", "4", "+5"].map((bathroom) => (
              <Button
                key={bathroom}
                variant={filters.bathrooms === (bathroom === "Todos" ? "" : bathroom) ? "default" : "outline"}
                className="flex-1"
                onClick={() => handleFilterChange("bathrooms", bathroom === "Todos" ? "" : bathroom)}
              >
                {bathroom}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Características</Label>
          <div className="space-y-2">
            {[
              { id: "parking", label: "Plaza de garaje" },
              { id: "elevator", label: "Ascensor" },
              { id: "terrace", label: "Terraza" },
              { id: "garden", label: "Jardín" },
              { id: "pool", label: "Piscina" },
              { id: "ac", label: "Aire acondicionado" },
            ].map((feature) => (
              <div key={feature.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature.id}`}
                  checked={filters.propertyFeatures.includes(feature.id)}
                  onCheckedChange={(checked) => handleFeatureChange(feature.id, checked as boolean)}
                />
                <label
                  htmlFor={`feature-${feature.id}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {feature.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <Button onClick={applyFilters} className="w-full">
          Aplicar Filtros
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" onClick={resetFilters} className="w-full">
            <X className="mr-2 h-4 w-4" />
            Limpiar Filtros
          </Button>
        )}
      </div>
    </div>
  )
}
