"use client"

import { useState, useEffect } from "react"
import { useDebounce } from "./use-debounce"

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search/enhanced?q=${encodeURIComponent(debouncedQuery)}&suggestions=true`)

        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  return { suggestions, loading }
}
