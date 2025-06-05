"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { SearchResults } from "@/components/search-results"
import { SearchFilters } from "@/components/search-filters"
import { Skeleton } from "@/components/ui/skeleton"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const view = searchParams.get("view") || "list"

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <div className="w-full md:w-80 lg:w-96 shrink-0 border-r bg-background">
        <SearchFilters searchParams={searchParams} />
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {query ? (
              <>
                Resultados para <span className="text-primary">"{query}"</span>
              </>
            ) : (
              "Todos los activos inmobiliarios"
            )}
          </h1>
        </div>

        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <SearchResults query={query} view={view} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}