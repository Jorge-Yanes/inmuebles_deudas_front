"use client"

import { useEffect, useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { searchAssets } from "@/lib/search"
import type { Asset } from "@/types/asset"
import { ViewToggle, type ViewMode } from "@/components/view-toggle"
import { AssetGridItem } from "@/components/asset-grid-item"
import { AssetListItem } from "@/components/asset-list-item"

interface SearchResultsProps {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(query)
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      try {
        if (!searchQuery.trim()) {
          setAssets([])
          setLoading(false)
          return
        }

        const results = await searchAssets(searchQuery)
        setAssets(results)
      } catch (error) {
        console.error("Error searching assets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchQuery])

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery)
  }

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
  }

  if (loading) {
    return <div className="text-center">Buscando activos inmobiliarios...</div>
  }

  if (!searchQuery.trim()) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-lg">Ingrese un término de búsqueda para encontrar activos inmobiliarios</p>
        </div>
        <SearchBar initialQuery={searchQuery} onSearch={handleSearch} className="max-w-xl" />
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-lg">No se encontraron resultados para "{searchQuery}"</p>
          <p className="mt-2 text-muted-foreground">Intente con otros términos de búsqueda</p>
        </div>
        <SearchBar initialQuery={searchQuery} onSearch={handleSearch} className="max-w-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchBar initialQuery={searchQuery} onSearch={handleSearch} className="max-w-xl" />

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Se encontraron {assets.length} resultado{assets.length !== 1 ? "s" : ""}
        </p>
        <ViewToggle onChange={handleViewChange} defaultView="list" />
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetGridItem key={asset.id} asset={asset} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {assets.map((asset) => (
            <AssetListItem key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  )
}
