"use client"
import { useEffect, useState } from "react"
import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SearchBar } from "@/components/search-bar"
import { DashboardGreeting } from "@/components/dashboard-greeting"
import { MostProfitableAssets } from "@/components/most-profitable-assets"
import { AnimatedStats } from "@/components/animated-stats"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 p-4 md:p-8 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-8 w-64 bg-muted rounded-md"></div>
          <div className="h-5 w-96 bg-muted rounded-md"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Search bar skeleton */}
        <div className="mx-auto w-full">
          <div className="h-12 bg-muted rounded-md"></div>
        </div>

        {/* Cards skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-[200px] bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Most profitable assets skeleton */}
        <div>
          <div className="h-8 w-64 bg-muted rounded-md mb-4"></div>
          <div className="h-[200px] bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in-0 duration-700">
      <div className="flex flex-col gap-2">
        <DashboardGreeting />
        <p className="text-muted-foreground">Gestione sus activos inmobiliarios de manera eficiente</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <AnimatedStats />
        </Suspense>
      </div>

      <div className="mx-auto w-full">
        <SearchBar placeholder="Buscar por ubicación, tipo, precio..." />
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

      <div className="border rounded-lg p-4">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">Top Activos Más Rentables</h2>
        <MostProfitableAssets />
      </div>
    </div>
  )
}
