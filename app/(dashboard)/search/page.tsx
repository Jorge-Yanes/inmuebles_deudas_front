"use client"

import { InstantSearch } from "react-instantsearch-hooks-web"
import { searchClient, ALGOLIA_INDEX_NAME } from "@/lib/algolia"
import { AlgoliaSearchFilters } from "@/components/algolia/algolia-search-filters"
import { AlgoliaSearchResults } from "@/components/algolia/algolia-search-results"
import { history } from "instantsearch.js/es/lib/routers"

export default function SearchPage() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={ALGOLIA_INDEX_NAME}
      routing={{
        router: history({
          // Sync search state with URL query parameters
          getLocation() {
            if (typeof window === "undefined") {
              return new URL("http://localhost") as unknown as Location
            }
            return window.location
          },
        }),
      }}
    >
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        <div className="w-full md:w-80 lg:w-96 shrink-0 border-r bg-background">
          <AlgoliaSearchFilters />
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <AlgoliaSearchResults />
        </div>
      </div>
    </InstantSearch>
  )
}
