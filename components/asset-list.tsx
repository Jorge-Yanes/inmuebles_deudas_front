"use client"
import { AssetGridItem } from "@/components/asset-grid-item"
import { AssetListItem } from "@/components/asset-list-item"
import type { Asset } from "@/types/asset"

interface AssetListProps {
  assets?: Asset[]
  view?: "grid" | "list"
  loading?: boolean
}

export function AssetList({ assets = [], view = "grid", loading = false }: AssetListProps) {
  // Ensure assets is always an array
  const safeAssets = Array.isArray(assets) ? assets : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando propiedades...</p>
        </div>
      </div>
    )
  }

  if (safeAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-muted-foreground mb-4">
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
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9,22 9,12 15,12 15,22"></polyline>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">No hay propiedades</h3>
        <p className="text-muted-foreground max-w-md">
          No se encontraron propiedades que coincidan con los criterios de búsqueda.
        </p>
      </div>
    )
  }

  if (view === "list") {
    return (
      <div className="space-y-4">
        {safeAssets.map((asset) => (
          <AssetListItem key={asset.id || `asset-${Math.random()}`} asset={asset} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {safeAssets.map((asset) => (
        <AssetGridItem key={asset.id || `asset-${Math.random()}`} asset={asset} />
      ))}
    </div>
  )
}
