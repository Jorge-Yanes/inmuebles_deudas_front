import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchResults } from "@/components/search-results"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default function SearchPage({ searchParams }: any) {
  const query = searchParams.q || ""

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Resultados de búsqueda</h1>
        {query ? (
          <p className="text-muted-foreground">
            Resultados para <span className="font-medium">"{query}"</span>
          </p>
        ) : (
          <p className="text-muted-foreground">Ingrese un término de búsqueda para encontrar activos inmobiliarios</p>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
        <SearchResults query={query} />
      </Suspense>
    </div>
  )
}
