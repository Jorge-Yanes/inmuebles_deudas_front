"use client"

import { useEffect, useState, useDeferredValue } from "react"
import { useSearchParams } from "next/navigation"
import { AssetList } from "@/components/asset-list"
import { type Asset } from "@/types/asset"
import { AlgoliaSearchFilters } from "@/components/algolia/algolia-search-filters" // Keep filters if needed
import { getSearchSuggestions, searchClient, ALGOLIA_INDEX_NAME } from "@/lib/algolia" // Import the suggestion and search functions

interface SearchResponse {
  assets: Asset[]
  totalCount: number
  facets: any // Define a proper type for facets if needed
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialSearchQuery = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [searchResults, setSearchResults] = useState<Asset[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([]); // State for suggestions
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [debouncedSearchQueryState, setDebouncedSearchQueryState] = useState(initialSearchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQueryState(searchQuery);
      console.log("debouncedSearchQueryState updated:", searchQuery); // Added log
    }, 300); // 300ms debounce delay

    // Cleanup function to clear the timeout
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]); // This effect depends on searchQuery

  // Effect to fetch search results when the debounced query changes
  useEffect(() => {
    console.log("debouncedSearchQueryState changed, fetching search results:", debouncedSearchQueryState); // Updated log
    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: debouncedSearchQueryState }), // Use debouncedSearchQueryState here
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data: SearchResponse = await response.json();
        setSearchResults(data.assets);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch main search results when the debounced query state is not empty
    if (debouncedSearchQueryState) {
      fetchSearchResults();
    } else {
      setSearchResults([]);
      setLoading(false);
    }
  }, [debouncedSearchQueryState]); // This effect now depends on debouncedSearchQueryState


  // Effect for fetching suggestions
  useEffect(() => {
 console.log("searchQuery changed:", searchQuery);
    const fetchSuggestions = async () => {
      if (searchQuery.length > 1) { // Fetch suggestions if query has more than 1 character and not equal to debounced query
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
