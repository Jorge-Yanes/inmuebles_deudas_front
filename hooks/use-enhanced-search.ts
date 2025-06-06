"use client"

import { useState, useCallback, useEffect } from "react"
import { useDebounce } from "./use-debounce"
import type { Asset } from "@/types/asset"

interface SearchState {
  assets: Asset[]
  totalCount: number
  facets: Record<string, Array<{ value: string; count: number }>>
  loading: boolean
  error: string | null
  searchTime: number
}

interface SearchFilters {
  property_type?: string
  provincia_catastro?: string
  municipio_catastro?: string
  price_range?: { min?: number; max?: number }
  surface_range?: { min?: number; max?: number }
  legal_phase?: string
  marketing_status?: string
  rooms?: number
  bathrooms?: number
  has_parking?: boolean
}

interface SearchOptions {
  pageSize?: number
  offset?: number
  sortBy?: "relevance" | "price_asc" | "price_desc" | "date_desc"
}

export function useEnhancedSearch() {
  const [searchState, setSearchState] = useState<SearchState>({
    assets: [],
    totalCount: 0,
    facets: {},
    loading: false,
    error: null,
    searchTime: 0,
  })

  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>({})
  const [options, setOptions] = useState<SearchOptions>({
    pageSize: 20,
    offset: 0,
    sortBy: "relevance",
  })

  const debouncedQuery = useDebounce(query, 300)

  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: SearchFilters, searchOptions: SearchOptions) => {
      setSearchState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await fetch("/api/search/enhanced", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: searchQuery,
            filters: searchFilters,
            options: searchOptions,
          }),
        })

        if (!response.ok) {
          throw new Error("Search request failed")
        }

        const result = await response.json()

        if (result.success) {
          setSearchState({
            assets: result.data.assets,
            totalCount: result.data.totalCount,
            facets: result.data.facets,
            loading: false,
            error: null,
            searchTime: result.data.searchTime,
          })
        } else {
          throw new Error(result.error || "Search failed")
        }
      } catch (error) {
        setSearchState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Search failed",
        }))
      }
    },
    [],
  )

  // Auto-search when query or filters change
  useEffect(() => {
    if (debouncedQuery || Object.keys(filters).length > 0) {
      performSearch(debouncedQuery, filters, options)
    }
  }, [debouncedQuery, filters, options, performSearch])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setOptions((prev) => ({ ...prev, offset: 0 })) // Reset pagination
  }, [])

  const updateOptions = useCallback((newOptions: Partial<SearchOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setOptions((prev) => ({ ...prev, offset: 0 }))
  }, [])

  const loadMore = useCallback(() => {
    setOptions((prev) => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.pageSize || 20),
    }))
  }, [])

  return {
    // State
    ...searchState,
    query,
    filters,
    options,

    // Actions
    setQuery,
    updateFilters,
    updateOptions,
    clearFilters,
    loadMore,
    performSearch: () => performSearch(query, filters, options),
  }
}
