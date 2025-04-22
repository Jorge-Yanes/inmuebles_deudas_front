import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AssetStats } from "@/components/asset-stats"
import { RecentAssets } from "@/components/recent-assets"
import { SearchBar } from "@/components/search-bar"
import { DashboardGreeting } from "@/components/dashboard-greeting" // New component

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <DashboardGreeting />
        <p className="text-muted-foreground">Gestione sus activos inmobiliarios de manera eficiente</p>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <SearchBar placeholder="Buscar por ubicación, tipo, precio..." />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <AssetStats />
        </Suspense>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activos Inmobiliarios</CardTitle>
            <CardDescription>Gestione todos sus activos inmobiliarios</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Acceda a la lista completa de propiedades, filtre por tipo, ubicación y estado.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/assets">
                Ver Activos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análisis de Cartera</CardTitle>
            <CardDescription>Visualice el rendimiento de su cartera inmobiliaria</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Obtenga información sobre el valor, rendimiento y distribución de sus activos.</p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/analytics">
                Ver Análisis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Activos Recientes</h2>
        <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
          <RecentAssets />
        </Suspense>
      </div>
    </div>
  )
}
