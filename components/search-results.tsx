"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { List, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllProperties } from "@/lib/firestore/property-service"
import type { Asset } from "@/types/asset"
import { AssetGridItem } from "@/components/asset-grid-item"
import AssetMap from "@/components/maps/asset-map"
import { searchAssets } from "@/lib/search"

interface SearchResultsProps {
  query: string
  view?: string
  searchParams?: Record<string, string | undefined>
}

export function SearchResults({ query, view = "list", searchParams = {} }: SearchResultsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const urlSearchParams = useSearchParams()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<"list" | "map">(view === "map" ? "map" : "list")
  const [sortOption, setSortOption] = useState<"relevance" | "price">("relevance")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        // Determine if any UI filters are active (excluding q and view)
        const entries = Array.from(
          // Next.js useSearchParams returns URLSearchParams-like object
          (searchParams as any).entries()
        ) as [string, string][];
        const hasFilters = entries.some(
          ([key, value]) => value && value !== 'ALL' && value !== 'all' && key !== 'q' && key !== 'view'
        );
        let results: Asset[] = [];
        if (query.trim() || hasFilters) {
          // Build filters object for Vertex
          const filters: Record<string, any> = {};
          entries.forEach(([key, value]) => {
            if (!value || value === 'ALL' || value === 'all') return;
            if (key === 'q' || key === 'view') return;
            if (key === 'propertyFeatures') {
              filters.propertyFeatures = value.split(',');
            } else {
              filters[key] = value;
            }
          });
          results = await searchAssets(query, filters);
        } else {
          // No search and no filters: show recent properties
          const allProps = await getAllProperties(50);
          results = allProps.sort((a, b) => {
            const dateA = a.createdAt?.getTime() || 0;
            const dateB = b.createdAt?.getTime() || 0;
            return dateB - dateA;
          });
        }
        // Apply sorting option
        if (sortOption === 'price') {
          results.sort((a, b) => (a.price_approx || 0) - (b.price_approx || 0));
        } else if (!query.trim()) {
          // relevance default for non-text searches: by date
          results.sort((a, b) => {
            const dateA = a.createdAt?.getTime() || 0;
            const dateB = b.createdAt?.getTime() || 0;
            return dateB - dateA;
          });
        }
        setAssets(results);
      } catch (error) {
        console.error('Error fetching assets:', error);
        setError('Error al cargar los activos inmobiliarios. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, searchParams, sortOption]);

  const handleViewChange = (view: "list" | "map") => {
    setActiveView(view)

    // Update URL to persist view preference
    const params = new URLSearchParams(urlSearchParams.toString())
    params.set("view", view)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleSortChange = (sort: "relevance" | "price") => {
    setSortOption(sort)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Buscando activos inmobiliarios...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Error</h3>
        <p className="text-muted-foreground max-w-md mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Intentar de nuevo</Button>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
        <p className="text-muted-foreground max-w-md">
          No hay activos inmobiliarios que coincidan con tu búsqueda. Intenta con otros criterios o amplía los filtros.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            {assets.length} {assets.length === 1 ? "propiedad encontrada" : "propiedades encontradas"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort options */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Ordenar por:</span>
            <Button
              variant="link"
              size="sm"
              className={sortOption === "relevance" ? "text-primary font-medium underline" : ""}
              onClick={() => handleSortChange("relevance")}
            >
              Relevancia
            </Button>
            <Button
              variant="link"
              size="sm"
              className={sortOption === "price" ? "text-primary font-medium underline" : ""}
              onClick={() => handleSortChange("price")}
            >
              Baratos
            </Button>
          </div>

          {/* View toggle */}
          <Tabs value={activeView} onValueChange={(v) => handleViewChange(v as "list" | "map")} className="w-auto">
            <TabsList className="grid w-[160px] grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                <span>Lista</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Mapa</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={activeView} className="w-full">
        <TabsContent value="list" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {assets.map((asset) => (
              <AssetGridItem key={asset.id} asset={asset} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="map" className="mt-0">
          <div className="h-screen rounded-md overflow-hidden border">
            <AssetMap assets={assets} height="100%" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
