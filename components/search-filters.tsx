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
  getProvincias,
  getMunicipios,
  getTiposVia,
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
  const [provincias, setProvincias] = useState<string[]>([])
  const [municipios, setMunicipios] = useState<string[]>([])
  const [tiposVia, setTiposVia] = useState(true)

  // State for current filter values
  const [filters, setFilters] = useState({
    property_type: searchParams.property_type || "",
    marketing_status: searchParams.marketing_status || "",
    legal_phase: searchParams.legal_phase || "",
    provincia_catastro: searchParams.provincia_catastro || "",
    municipio_catastro: searchParams.municipio_catastro || "",
    tipo_via_catastro: searchParams.tipo_via_catastro || "",
    minPrice: searchParams.minPrice || "",
    maxPrice: searchParams.maxPrice || "",
    minSqm: searchParams.minSqm || "",
    maxSqm: searchParams.maxSqm || "",
    query: searchParams.q || "",
    investmentType: searchParams.investmentType || "",
    propertyFeatures: searchParams.propertyFeatures ? searchParams.propertyFeatures.split(",") : [],
    rooms: searchParams.rooms || "",
    bathrooms: searchParams.bathrooms || "",
    minYear: searchParams.minYear || "",
    maxYear: searchParams.maxYear || "",
  })

  const [loading, setLoading] = useState(true)

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true)

        // Fetch all filter options in parallel
        const [types, statuses, phases, provs, tiposViaData] = await Promise.all([
          getPropertyTypes(),
          getMarketingStatuses(),
          getLegalPhases(),
          getProvincias(),
          getTiposVia(),
        ])

        setPropertyTypes(types)
        setMarketingStatuses(statuses)
        setLegalPhases(phases)
        setProvincias(provs)
        setTiposVia(tiposViaData)

        // If provincia is selected, fetch municipios for that provincia
        if (filters.provincia_catastro) {
          const municipiosData = await getMunicipios(filters.provincia_catastro)
          setMunicipios(municipiosData)
        }
      } catch (error) {
        console.error("Error fetching filter options:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [filters.provincia_catastro])

  // Update municipios when provincia changes
  useEffect(() => {
    const updateMunicipios = async () => {
      if (filters.provincia_catastro) {
        try {
          const municipiosData = await getMunicipios(filters.provincia_catastro)
          setMunicipios(municipiosData)

          // If the current municipio is not in the new list, reset it
          if (filters.municipio_catastro && !municipiosData.includes(filters.municipio_catastro)) {
            setFilters((prev) => ({ ...prev, municipio_catastro: "" }))
          }
        } catch (error) {
          console.error("Error fetching municipios:", error)
        }
      } else {
        setMunicipios([])
        if (filters.municipio_catastro) {
          setFilters((prev) => ({ ...prev, municipio_catastro: "" }))
        }
      }
    }

    updateMunicipios()
  }, [filters.provincia_catastro])

  // Handle filter changes
  const handleFilterChange = (name: string, value: string | string[]) => {
    // Special handling for provincia changes
    if (name === "provincia_catastro" && value !== filters.provincia_catastro) {
      setFilters((prev) => ({ ...prev, [name]: value, municipio_catastro: "" }))
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

    // Add current query if it exists
    if (filters.query.trim()) {
      params.set("q", filters.query.trim())
    }

    // Only add non-empty filters to the URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "query") {
        if (key === "propertyFeatures" && Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(","))
        } else if (typeof value === "string" && value.trim() && value !== "all" && value !== "ALL") {
          params.set(key, value.trim())
        }
      }
    })

    const newUrl = `${pathname}?${params.toString()}`
    console.log("Applying filters, navigating to:", newUrl)
    router.push(newUrl)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      property_type: "",
      marketing_status: "",
      legal_phase: "",
      provincia_catastro: "",
      municipio_catastro: "",
      tipo_via_catastro: "",
      minPrice: "",
      maxPrice: "",
      minSqm: "",
      maxSqm: "",
      query: "",
      investmentType: "",
      propertyFeatures: [],
      rooms: "",
      bathrooms: "",
      minYear: "",
      maxYear: "",
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
      <h2 className="text-lg font-semibold">Filtros de Búsqueda</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-query">Búsqueda General</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-query"
              type="text"
              placeholder="Provincia, municipio, tipo de vía, código postal..."
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
          <Label htmlFor="provincia_catastro">Provincia</Label>
          <Select
            value={filters.provincia_catastro}
            onValueChange={(value) => handleFilterChange("provincia_catastro", value)}
          >
            <SelectTrigger id="provincia_catastro">
              <SelectValue placeholder="Todas las provincias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las provincias</SelectItem>
              {provincias.map((provincia) => (
                <SelectItem key={provincia} value={provincia}>
                  {provincia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="municipio_catastro">Municipio</Label>
          <Select
            value={filters.municipio_catastro}
            onValueChange={(value) => handleFilterChange("municipio_catastro", value)}
            disabled={!filters.provincia_catastro}
          >
            <SelectTrigger id="municipio_catastro">
              <SelectValue
                placeholder={filters.provincia_catastro ? "Todos los municipios" : "Selecciona provincia primero"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los municipios</SelectItem>
              {municipios.map((municipio) => (
                <SelectItem key={municipio} value={municipio}>
                  {municipio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_via_catastro">Tipo de Vía</Label>
          <Select
            value={filters.tipo_via_catastro}
            onValueChange={(value) => handleFilterChange("tipo_via_catastro", value)}
          >
            <SelectTrigger id="tipo_via_catastro">
              <SelectValue placeholder="Todos los tipos de vía" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos de vía</SelectItem>
              {tiposVia.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
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
                  {status}
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
                  {phase}
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
          <Label>Superficie (m²)</Label>
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
          <Label>Precio (€)</Label>
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
          <Label>Año de Construcción</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Desde"
              type="number"
              value={filters.minYear}
              onChange={(e) => handleFilterChange("minYear", e.target.value)}
            />
            <Input
              placeholder="Hasta"
              type="number"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange("maxYear", e.target.value)}
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
