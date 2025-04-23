"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"

import { getProperties } from "@/lib/firestore/property-service"
import type { Asset } from "@/types/asset"
import { ViewToggle, type ViewMode } from "@/components/view-toggle"
import { AssetGridItem } from "@/components/asset-grid-item"
import { AssetListItem } from "@/components/asset-list-item"
import { Loader2 } from "lucide-react"

export function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [hasMore, setHasMore] = useState(true)
  const searchParams = useSearchParams()
  const lastVisibleRef = useRef<any>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Check if any filters are applied
  const hasFilters = useCallback(() => {
    return (
      searchParams.has("property_type") ||
      searchParams.has("marketing_status") ||
      searchParams.has("legal_phase") ||
      searchParams.has("province") ||
      searchParams.has("city") ||
      searchParams.has("minPrice") ||
      searchParams.has("maxPrice") ||
      searchParams.has("minSqm") ||
      searchParams.has("maxSqm") ||
      searchParams.has("query")
    )
  }, [searchParams])

  // Randomly set view mode on initial load if no filters
  useEffect(() => {
    if (!hasFilters()) {
      // 50% chance for grid or list view
      const randomView = Math.random() > 0.5 ? "grid" : "list"
      setViewMode(randomView as ViewMode)
    }
  }, [hasFilters])

  const fetchAssets = useCallback(
    async (isInitialLoad = false) => {
      if (isInitialLoad) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      try {
        const property_type = searchParams.get("property_type") || undefined
        const marketing_status = searchParams.get("marketing_status") || undefined
        const legal_phase = searchParams.get("legal_phase") || undefined
        const province = searchParams.get("province") || undefined
        const city = searchParams.get("city") || undefined
        const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
        const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
        const minSqm = searchParams.get("minSqm") ? Number(searchParams.get("minSqm")) : undefined
        const maxSqm = searchParams.get("maxSqm") ? Number(searchParams.get("maxSqm")) : undefined
        const query = searchParams.get("query") || undefined

        const filters = {
          property_type,
          marketing_status,
          legal_phase,
          province,
          city,
          minPrice,
          maxPrice,
          minSqm,
          maxSqm,
          query,
        }

        console.log("Fetching assets with filters:", filters)

        const result = await getProperties(
          filters,
          10, // pageSize
          isInitialLoad ? undefined : lastVisibleRef.current,
        )

        console.log("Fetched assets:", result.properties.length)

        if (isInitialLoad) {
          setAssets(result.properties)
        } else {
          setAssets((prev) => [...prev, ...result.properties])
        }

        lastVisibleRef.current = result.lastVisible
        setHasMore(result.properties.length > 0 && result.lastVisible !== null)
      } catch (error) {
        console.error("Error fetching assets:", error)
      } finally {
        if (isInitialLoad) {
          setLoading(false)
        } else {
          setLoadingMore(false)
        }
      }
    },
    [searchParams],
  )

  // Initial load
  useEffect(() => {
    console.log("Initial load triggered")
    fetchAssets(true)
    // Reset pagination when filters change
    lastVisibleRef.current = null
    setHasMore(true)
  }, [fetchAssets])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (loading) return

    // Disconnect previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          console.log("Loading more assets...")
          fetchAssets(false)
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    )

    observerRef.current = observer

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loading, hasMore, loadingMore, fetchAssets])

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    // Save view preference
    localStorage.setItem("viewMode", view)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
        <ViewToggle onChange={handleViewChange} defaultView={viewMode} />
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

      {/* Lazy loading indicator */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center items-center py-8">
          {loadingMore ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <div className="h-8" />}
        </div>
      )}
    </div>
  )
}
