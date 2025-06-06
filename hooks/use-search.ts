"use client"

import { useState, useEffect, useCallback } from "react"
import { searchAssets, getSearchSuggestions } from "@/lib/search"
import type { Asset } from "@/types/asset"

interface SearchFilters {
  property_type?: string
  provincia_catastro?: string
  municipio_catastro?: string
  price_min?: number
  price_max?: number
  surface_min?: number
  surface_max?: number
}

interface UseSearchResult {
  assets: Asset[]
  loading: boolean
  error: string | null
  totalCount: number
  facets: Record<string, Array<{ value: string; count: number }>>
  suggestions: string[]
  loadingSuggestions: boolean
}

export function useSearch(query: string, filters: SearchFilters = {}) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [facets, setFacets] = useState<Record<string, Array<{ value: string; count: number }>>>({})
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const performSearch = useCallback(async () => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      setAssets([])
      setTotalCount(0)
      setFacets({})
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await searchAssets(query, filters)

      // Ensure we always set arrays
      setAssets(Array.isArray(result.assets) ? result.assets : [])
      setTotalCount(result.totalCount || 0)
      setFacets(result.facets || {})
    } catch (err) {
      console.error("Search error:", err)
      setError(err instanceof Error ? err.message : "Error en la búsqueda")
      setAssets([])
      setTotalCount(0)
      setFacets({})
    } finally {
      setLoading(false)
    }
  }, [query, filters])

  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setLoadingSuggestions(true)

    try {
      const result = await getSearchSuggestions(searchQuery)
      setSuggestions(Array.isArray(result) ? result : [])
    } catch (err) {
      console.error("Suggestions error:", err)
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  return {
    assets,
    loading,
    error,
    totalCount,
    facets,
    suggestions,
    loadingSuggestions,
    getSuggestions,
    refetch: performSearch,
  }
}
