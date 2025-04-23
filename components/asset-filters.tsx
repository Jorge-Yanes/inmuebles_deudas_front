"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Filter, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { getUniqueFieldValues } from "@/lib/firestore/property-service"
import { propertyTypeLabels, marketingStatusLabels, legalPhaseLabels } from "@/types/asset"

export function AssetFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const [locations, setLocations] = useState<string[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sqmRange, setSqmRange] = useState([0, 500])
  const [searchQuery, setSearchQuery] = useState("")

  // Get current filter values from URL
  const property_type = searchParams.get("property_type") || ""
  const marketing_status = searchParams.get("marketing_status") || ""
  const legal_phase = searchParams.get("legal_phase") || ""
  const province = searchParams.get("province") || ""
  const city = searchParams.get("city") || ""
  const minPrice = searchParams.get("minPrice") || ""
  const maxPrice = searchParams.get("maxPrice") || ""
  const minSqm = searchParams.get("minSqm") || ""
  const maxSqm = searchParams.get("maxSqm") || ""
  const query = searchParams.get("query") || ""

  useEffect(() => {
    // Initialize search query from URL
    setSearchQuery(query)

    // Initialize price range from URL
    setPriceRange([minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 1000000])

    // Initialize sqm range from URL
    setSqmRange([minSqm ? Number(minSqm) : 0, maxSqm ? Number(maxSqm) : 500])
  }, [query, minPrice, maxPrice, minSqm, maxSqm])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsData, provincesData] = await Promise.all([
          getUniqueFieldValues("city"),
          getUniqueFieldValues("province"),
        ])
        setLocations(locationsData)
        setProvinces(provincesData)
      } catch (error) {
        console.error("Error fetching filter data:", error)
      }
    }

    fetchData()
  }, [])

  // Update URL with filters
  const applyFilters = (newFilters: Record<string, string>) => {
    const params = new URLSearchParams(searchParams)

    // Update or remove each filter
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  // Clear all filters
  const clearFilters = () => {
    router.push(pathname)
    setPriceRange([0, 1000000])
    setSqmRange([0, 500])
    setSearchQuery("")
  }

  const hasActiveFilters =
    property_type ||
    marketing_status ||
    legal_phase ||
    province ||
    city ||
    minPrice ||
    maxPrice ||
    minSqm ||
    maxSqm ||
    query

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar activos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters({ ...Object.fromEntries(searchParams.entries()), query: searchQuery })
              }
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={open ? "default" : "outline"}
            size="default"
            onClick={() => setOpen(!open)}
            className="whitespace-nowrap"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {
                  Object.values({
                    property_type,
                    marketing_status,
                    legal_phase,
                    province,
                    city,
                    price: minPrice || maxPrice,
                    sqm: minSqm || maxSqm,
                    query,
                  }).filter(Boolean).length
                }
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="default" onClick={clearFilters} className="whitespace-nowrap">
              <X className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {query && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              applyFilters({ ...Object.fromEntries(searchParams.entries()), query: "" })
            }}
          >
            Búsqueda: {query}
            <X className="ml-2 h-3 w-3" />
          </Button>
        )}

        {property_type && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyFilters({ ...Object.fromEntries(searchParams.entries()), property_type: "" })}
          >
            Tipo: {propertyTypeLabels[property_type] || property_type}
            <X className="ml-2 h-3 w-3" />
          </Button>
        )}

        {marketing_status && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyFilters({ ...Object.fromEntries(searchParams.entries()), marketing_status: "" })}
          >
            Estado: {marketingStatusLabels[marketing_status] || marketing_status}
            <X className="ml-2 h-3 w-3" />
          </Button>
        )}

        {legal_phase && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyFilters({ ...Object.fromEntries(searchParams.entries()), legal_phase: "" })}
          >
            Fase legal: {legalPhaseLabels[legal_phase] || legal_phase}
            <X className="ml-2 h-3 w-3" />
          </Button>
        )}

        {province && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyFilters({ ...Object.fromEntries(searchParams.entries()), province: "" })}
          >
            Provincia: {province}
            <X className="ml-2 h-3 w-3" />
          </Button>
        )}

        {city && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyFilters({ ...Object.fromEntries(searchParams.entries()), city: "" })}
          >
            Ciudad: {city}
            <X className="ml-2 h-3 w-3" />
          </Button>
        )}

        {(minPrice || maxPrice) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyFilters({ ...Object.fromEntries(searchParams.entries()), minPrice: "", maxPrice: "" })}
          >
            Precio: {minPrice ? `€${Number(minPrice).toLocaleString()}` : "0"} -{" "}
            {maxPrice ? `€${Number(maxPrice).toLocaleString()}` : "Max"}
            <X className="ml-2 h-3 w-3" />
          </Button>
        )}

        {(minSqm || maxSqm) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => applyFilters({ ...Object.fromEntries(searchParams.entries()), minSqm: "", maxSqm: "" })}
          >
            Superficie: {minSqm ? `${Number(minSqm).toLocaleString()}` : "0"} -{" "}
            {maxSqm ? `${Number(maxSqm).toLocaleString()}` : "Max"} m²
            <X className="ml-2 h-3 w-3" />
          </Button>
        )}
      </div>

      {open && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Filtrar Activos</CardTitle>
            <CardDescription>Refine la lista de activos inmobiliarios</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Propiedad</label>
              <Select
                value={property_type}
                onValueChange={(value) =>
                  applyFilters({ ...Object.fromEntries(searchParams.entries()), property_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los tipos</SelectItem>
                  <SelectItem value="RESIDENTIAL">Residencial</SelectItem>
                  <SelectItem value="COMMERCIAL">Comercial</SelectItem>
                  <SelectItem value="INDUSTRIAL">Industrial</SelectItem>
                  <SelectItem value="LAND">Terreno</SelectItem>
                  <SelectItem value="PARKING">Garaje</SelectItem>
                  <SelectItem value="STORAGE">Trastero</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={marketing_status}
                onValueChange={(value) =>
                  applyFilters({ ...Object.fromEntries(searchParams.entries()), marketing_status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los estados</SelectItem>
                  <SelectItem value="AVAILABLE">Disponible</SelectItem>
                  <SelectItem value="RESERVED">Reservado</SelectItem>
                  <SelectItem value="SOLD">Vendido</SelectItem>
                  <SelectItem value="RENTED">Alquilado</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fase Legal</label>
              <Select
                value={legal_phase}
                onValueChange={(value) =>
                  applyFilters({ ...Object.fromEntries(searchParams.entries()), legal_phase: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las fases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las fases</SelectItem>
                  <SelectItem value="FORECLOSURE">Ejecución Hipotecaria</SelectItem>
                  <SelectItem value="AUCTION">Subasta</SelectItem>
                  <SelectItem value="ADJUDICATION">Adjudicación</SelectItem>
                  <SelectItem value="POSSESSION">Posesión</SelectItem>
                  <SelectItem value="EVICTION">Desahucio</SelectItem>
                  <SelectItem value="CLOSED">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Provincia</label>
              <Select
                value={province}
                onValueChange={(value) =>
                  applyFilters({ ...Object.fromEntries(searchParams.entries()), province: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las provincias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las provincias</SelectItem>
                  {provinces.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ciudad</label>
              <Select
                value={city}
                onValueChange={(value) => applyFilters({ ...Object.fromEntries(searchParams.entries()), city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las ciudades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las ciudades</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Rango de Precio (€)</label>
              <Slider
                defaultValue={[minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 1000000]}
                max={1000000}
                step={10000}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                onValueCommit={(value) => {
                  const [min, max] = value as [number, number]
                  applyFilters({
                    ...Object.fromEntries(searchParams.entries()),
                    minPrice: min > 0 ? min.toString() : "",
                    maxPrice: max < 1000000 ? max.toString() : "",
                  })
                }}
              />
              <div className="flex items-center justify-between">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setPriceRange([value, priceRange[1]])
                  }}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setPriceRange([priceRange[0], value])
                  }}
                  className="w-24"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium">Superficie (m²)</label>
              <Slider
                defaultValue={[minSqm ? Number(minSqm) : 0, maxSqm ? Number(maxSqm) : 500]}
                max={500}
                step={10}
                onValueChange={(value) => setSqmRange(value as [number, number])}
                onValueCommit={(value) => {
                  const [min, max] = value as [number, number]
                  applyFilters({
                    ...Object.fromEntries(searchParams.entries()),
                    minSqm: min > 0 ? min.toString() : "",
                    maxSqm: max < 500 ? max.toString() : "",
                  })
                }}
              />
              <div className="flex items-center justify-between">
                <Input
                  type="number"
                  value={sqmRange[0]}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setSqmRange([value, sqmRange[1]])
                  }}
                  className="w-24"
                />
                <span>-</span>
                <Input
                  type="number"
                  value={sqmRange[1]}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    setSqmRange([sqmRange[0], value])
                  }}
                  className="w-24"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button
              onClick={() =>
                applyFilters({
                  ...Object.fromEntries(searchParams.entries()),
                  minPrice: priceRange[0] > 0 ? priceRange[0].toString() : "",
                  maxPrice: priceRange[1] < 1000000 ? priceRange[1].toString() : "",
                  minSqm: sqmRange[0] > 0 ? sqmRange[0].toString() : "",
                  maxSqm: sqmRange[1] < 500 ? sqmRange[1].toString() : "",
                  query: searchQuery,
                })
              }
            >
              Aplicar Filtros
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
