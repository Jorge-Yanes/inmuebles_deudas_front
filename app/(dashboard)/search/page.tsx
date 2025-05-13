import { Suspense } from "react"
import { SearchResults } from "@/components/search-results"
import { SearchFilters } from "@/components/search-filters"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchPageProps {
  searchParams: {
    q?: string
    property_type?: string
    marketing_status?: string
    legal_phase?: string
    province?: string
    city?: string
    minPrice?: string
    maxPrice?: string
    minSqm?: string
    maxSqm?: string
    rooms?: string
    bathrooms?: string
    view?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const view = searchParams.view || "list"

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      {/* Sidebar with filters */}
      <div className="w-full md:w-80 lg:w-96 shrink-0 border-r bg-background">
        <SearchFilters searchParams={searchParams} />
      </div>

      {/* Main content area */}
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
