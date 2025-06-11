"use client"

import { useEffect, useState, useDeferredValue } from "react"
import { useSearchParams } from "next/navigation"
import { useDebounce } from "use-debounce"
import { AssetList } from "@/components/asset-list"
import { type Asset } from "@/types/asset"
import { AlgoliaSearchFilters } from "@/components/algolia/algolia-search-filters" // Keep filters if needed
import { getSearchSuggestions } from "@/lib/algolia" // Import the suggestion function

interface SearchResponse {
  assets: Asset[]
  totalCount: number
  facets: any // Define a proper type for facets if needed
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialSearchQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300); // Debounce for main search
  const [searchResults, setSearchResults] = useState<Asset[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([]); // State for suggestions
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: searchQuery }),
        })
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        const data: SearchResponse = await response.json() // Assuming the API returns an object with 'assets'
        setSearchResults(data.assets)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch main search results when the debounced query changes
    if (debouncedSearchQuery) {
      fetchSearchResults()
    } else {
      setSearchResults([])
      setLoading(false)
    }
  }, [debouncedSearchQuery])

  // Effect for fetching suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 1) { // Fetch suggestions if query has more than 1 character
        try {
          const newSuggestions = await getSearchSuggestions(searchQuery);
          setSuggestions(newSuggestions);
          console.log("Fetched suggestions:", newSuggestions); // Log suggestions
        } catch (err) {
          console.error("Error fetching suggestions:", err);
          setSuggestions([]); // Clear suggestions on error
        }
      } else {
        setSuggestions([]); // Clear suggestions if query is too short
      }
    };

    fetchSuggestions();
  }, [searchQuery]); // Fetch suggestions whenever searchQuery changes

  if (loading) {
    return <div>Loading search results...</div>
  }

  if (error) {
    return <div>Error loading search results: {error}</div>
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* You might want to keep the filters, depending on how you want to integrate them with the new search logic */}
      {/*
        <div className="w-full md:w-80 lg:w-96 shrink-0 border-r bg-background">
          <AlgoliaSearchFilters />
        </div>
      */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {searchResults.length > 0 ? (
          // Here you might want to render the suggestions list when available
          // For now, we are just logging them. You'll need to add UI to display them.
          // Example:
          // {suggestions.length > 0 && (
          //   <ul>
          //     {suggestions.map((suggestion, index) => (
          //       <li key={index}>{suggestion}</li>
          //     ))}
          //   </ul>
          // )}
          <AssetList assets={searchResults} />
        ) : (
          <div>No results found for "{searchQuery}"</div>
        )}
      </div>
    </div>
  )
}
