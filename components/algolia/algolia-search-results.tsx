"use client"

import {
  useSearchBox,
  useInstantSearch,
  useHits,
  useSortBy,
  useStats,
  usePagination,
} from "react-instantsearch-hooks-web"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, List } from "lucide-react"
import { AssetHit } from "./asset-hit"
import type { Asset } from "@/types/asset"
import { ALGOLIA_INDEX_NAME, ALGOLIA_INDEX_NAME_PRICE_ASC, ALGOLIA_INDEX_NAME_PRICE_DESC } from "@/lib/algolia"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import AssetMap from "@/components/maps/asset-map"

function CustomSearchBox() {
  const { query, refine } = useSearchBox()
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar por dirección, ciudad, referencia..."
        className="pl-8"
        value={query}
        onChange={(e) => refine(e.currentTarget.value)}
      />
    </div>
  )
}

export function AlgoliaSearchResults() {
  const { results } = useInstantSearch()
  const { hits } = useHits<Asset>()
  const { nbHits, processingTimeMS } = useStats()
  const { refine: refineSort, options: sortOptions } = useSortBy({
    items: [
      { value: ALGOLIA_INDEX_NAME, label: "Relevancia" },
      { value: ALGOLIA_INDEX_NAME_PRICE_ASC, label: "Precio (asc)" },
      { value: ALGOLIA_INDEX_NAME_PRICE_DESC, label: "Precio (desc)" },
    ],
  })
  const { refine: loadMore, isLastPage } = usePagination()
  const [activeView, setActiveView] = useState<"list" | "map">("list")

  const mapAssets = hits
    .filter((hit) => hit._geoloc?.lat && hit._geoloc?.lng)
    .map((hit) => ({
      ...hit,
      latitude: hit._geoloc.lat,
      longitude: hit._geoloc.lng,
    }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CustomSearchBox />
        <div className="flex items-center gap-4">
          <Select onValueChange={refineSort}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "list" | "map")} className="w-auto">
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

      <p className="text-sm text-muted-foreground">
        {nbHits} {nbHits === 1 ? "resultado" : "resultados"} encontrados en {processingTimeMS}ms
      </p>

      {!results.nbHits && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No se encontraron resultados</h3>
          <p className="text-muted-foreground max-w-md">
            Intenta con otros criterios o limpia los filtros para ampliar tu búsqueda.
          </p>
        </div>
      )}

      <Tabs value={activeView} className="w-full">
        <TabsContent value="list" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {hits.map((hit) => (
              <AssetHit key={hit.objectID} hit={hit} />
            ))}
          </div>
          {!isLastPage && (
            <div className="mt-6 text-center">
              <Button onClick={() => loadMore()}>Cargar más resultados</Button>
            </div>
          )}
        </TabsContent>
        <TabsContent value="map" className="mt-0">
          <div className="h-[calc(100vh-12rem)] rounded-md overflow-hidden border">
            <AssetMap assets={mapAssets} height="100%" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
