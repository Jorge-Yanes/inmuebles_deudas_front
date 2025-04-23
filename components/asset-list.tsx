"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { getProperties } from "@/lib/firestore/property-service"
import type { Asset } from "@/types/asset"
import { ViewToggle, type ViewMode } from "@/components/view-toggle"
import { AssetGridItem } from "@/components/asset-grid-item"
import { AssetListItem } from "@/components/asset-list-item"

export function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true)
      try {
        const type = searchParams.get("type") || undefined
        const status = searchParams.get("status") || undefined
        const location = searchParams.get("location") || undefined
        const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
        const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
        const query = searchParams.get("query") || undefined

        const filters = {
          property_type: type,
          marketing_status: status,
          city: location,
          minPrice,
          maxPrice,
          query,
        }

        const result = await getProperties(filters)
        setAssets(result.properties)
      } catch (error) {
        console.error("Error fetching assets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [searchParams])

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
  }

  if (loading) {
    return <div className="text-center">Cargando activos...</div>
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No se encontraron activos</h3>
        <p className="mt-2 text-muted-foreground">Intente ajustar los filtros o añada nuevos activos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
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
