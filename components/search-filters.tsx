"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { getUniqueFieldValues } from "@/lib/firestore/property-service"

interface SearchFiltersProps {
  searchParams: Record<string, string | undefined>
}

export function SearchFilters({ searchParams }: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [locations, setLocations] = useState<string[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sqmRange, setSqmRange] = useState([0, 500])
  const [searchQuery, setSearchQuery] = useState(searchParams.q || "")

  // Get current filter values from URL
  const property_type = searchParams.property_type || ""
  const marketing_status = searchParams.marketing_status || ""
  const legal_phase = searchParams.legal_phase || ""
  const province = searchParams.province || ""
  const city = searchParams.city || ""
  const minPrice = searchParams.minPrice || ""
  const maxPrice = searchParams.maxPrice || ""
  const minSqm = searchParams.minSqm || ""
  const maxSqm = searchParams.maxSqm || ""
  const rooms = searchParams.rooms || ""
  const bathrooms = searchParams.bathrooms || ""

  useEffect(() => {
    // Initialize search query from URL
    setSearchQuery(searchParams.q || "")

    // Initialize price range from URL
    setPriceRange([minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 1000000])

    // Initialize sqm range from URL
    setSqmRange([minSqm ? Number(minSqm) : 0, maxSqm ? Number(maxSqm) : 500])
  }, [searchParams.q, minPrice, maxPrice, minSqm, maxSqm])

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
    const params = new URLSearchParams()

    // Preserve existing params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    // Update or remove each filter
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle search query submission
  const handleSearch = () => {
    applyFilters({ q: searchQuery })
  }

  // Clear all filters
  const clearFilters = () => {
    router.push(pathname)
    setPriceRange([0, 1000000])
    setSqmRange([0, 500])
    setSearchQuery("")
  }

  // Toggle a checkbox filter
  const toggleFilter = (key: string, value: string, currentValue: string) => {
    applyFilters({ [key]: currentValue === value ? "" : value })
  }

  // Set a numeric filter
  const setNumericFilter = (key: string, value: string) => {
    applyFilters({ [key]: value })
  }

  return (
    <div className="h-full overflow-auto p-4">
      <h2 className="text-xl font-bold mb-4">Tu búsqueda</h2>

      {/* Map preview */}
      <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden bg-muted">
        <Image src="/map-of-spain.png" alt="Mapa de ubicación" fill className="object-cover" />
      </div>

      {/* Search input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar ubicación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch()
              }
            }}
          />
        </div>
      </div>

      {/* Property type selector */}
      <div className="mb-6">
        <Label className="mb-2 block">Tipo de propiedad</Label>
        <Select
          value={property_type || "ALL"}
          onValueChange={(value) => applyFilters({ property_type: value === "ALL" ? "" : value })}
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

      {/* Investment type */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Tipo de inversión</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="investment-reo" />
            <Label htmlFor="investment-reo">Compra de inmuebles (REO)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="investment-npl" />
            <Label htmlFor="investment-npl">Compra de deuda hipotecaria (NPL)</Label>
          </div>
        </div>
      </div>

      {/* Property subtypes */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Tipo de piso o casa</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="type-all"
              checked={!property_type || property_type === "ALL"}
              onCheckedChange={() => applyFilters({ property_type: "" })}
            />
            <Label htmlFor="type-all">Todos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="type-residential"
              checked={property_type === "RESIDENTIAL"}
              onCheckedChange={() => toggleFilter("property_type", "RESIDENTIAL", property_type)}
            />
            <Label htmlFor="type-residential">Pisos y apartamentos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="type-studio" />
            <Label htmlFor="type-studio">Estudios</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="type-house" />
            <Label htmlFor="type-house">Casas y chalets</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="type-duplex" />
            <Label htmlFor="type-duplex">Dúplex</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="type-loft" />
            <Label htmlFor="type-loft">Lofts</Label>
          </div>
        </div>
      </div>

      {/* Size range */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Tamaño (m²)</h3>
        <div className="space-y-4">
          <Slider
            defaultValue={[minSqm ? Number(minSqm) : 0, maxSqm ? Number(maxSqm) : 500]}
            max={500}
            step={10}
            value={sqmRange}
            onValueChange={(value) => setSqmRange(value as [number, number])}
            onValueCommit={(value) => {
              const [min, max] = value as [number, number]
              applyFilters({
                minSqm: min > 0 ? min.toString() : "",
                maxSqm: max < 500 ? max.toString() : "",
              })
            }}
          />
          <div className="flex items-center justify-between">
            <Select value={minSqm || "0"} onValueChange={(value) => setNumericFilter("minSqm", value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Mínimo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Mínimo</SelectItem>
                <SelectItem value="50">50 m²</SelectItem>
                <SelectItem value="100">100 m²</SelectItem>
                <SelectItem value="150">150 m²</SelectItem>
                <SelectItem value="200">200 m²</SelectItem>
              </SelectContent>
            </Select>
            <Select value={maxSqm || "500"} onValueChange={(value) => setNumericFilter("maxSqm", value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Máximo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 m²</SelectItem>
                <SelectItem value="200">200 m²</SelectItem>
                <SelectItem value="300">300 m²</SelectItem>
                <SelectItem value="400">400 m²</SelectItem>
                <SelectItem value="500">Máximo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Price range */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Precio (€)</h3>
        <div className="space-y-4">
          <Slider
            defaultValue={[minPrice ? Number(minPrice) : 0, maxPrice ? Number(maxPrice) : 1000000]}
            max={1000000}
            step={10000}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            onValueCommit={(value) => {
              const [min, max] = value as [number, number]
              applyFilters({
                minPrice: min > 0 ? min.toString() : "",
                maxPrice: max < 1000000 ? max.toString() : "",
              })
            }}
          />
          <div className="flex items-center justify-between">
            <Select value={minPrice || "0"} onValueChange={(value) => setNumericFilter("minPrice", value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Mínimo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Mínimo</SelectItem>
                <SelectItem value="50000">50.000 €</SelectItem>
                <SelectItem value="100000">100.000 €</SelectItem>
                <SelectItem value="200000">200.000 €</SelectItem>
                <SelectItem value="300000">300.000 €</SelectItem>
              </SelectContent>
            </Select>
            <Select value={maxPrice || "1000000"} onValueChange={(value) => setNumericFilter("maxPrice", value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Máximo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200000">200.000 €</SelectItem>
                <SelectItem value="400000">400.000 €</SelectItem>
                <SelectItem value="600000">600.000 €</SelectItem>
                <SelectItem value="800000">800.000 €</SelectItem>
                <SelectItem value="1000000">Máximo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Habitaciones</h3>
        <div className="flex space-x-2">
          <Button
            variant={rooms === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setNumericFilter("rooms", "")}
            className="flex-1"
          >
            Todas
          </Button>
          {[1, 2, 3, 4, "+5"].map((num) => (
            <Button
              key={num}
              variant={rooms === num.toString() ? "default" : "outline"}
              size="sm"
              onClick={() => setNumericFilter("rooms", num.toString())}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Baños</h3>
        <div className="flex space-x-2">
          <Button
            variant={bathrooms === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setNumericFilter("bathrooms", "")}
            className="flex-1"
          >
            Todos
          </Button>
          {[1, 2, 3, 4, "+5"].map((num) => (
            <Button
              key={num}
              variant={bathrooms === num.toString() ? "default" : "outline"}
              size="sm"
              onClick={() => setNumericFilter("bathrooms", num.toString())}
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Características</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-common" />
            <Label htmlFor="feature-common">Áreas comunes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-gym" />
            <Label htmlFor="feature-gym">Gimnasio</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-balcony" />
            <Label htmlFor="feature-balcony">Balcón</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-alarm" />
            <Label htmlFor="feature-alarm">Alarma</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-ac" />
            <Label htmlFor="feature-ac">Aire acondicionado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="feature-heating" />
            <Label htmlFor="feature-heating">Calefacción</Label>
          </div>
        </div>
      </div>

      {/* Clear filters button */}
      <Button variant="outline" onClick={clearFilters} className="w-full">
        <X className="mr-2 h-4 w-4" />
        Limpiar filtros
      </Button>
    </div>
  )
}
