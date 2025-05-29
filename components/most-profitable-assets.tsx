"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Building, Home, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getProperties } from "@/lib/firestore/property-service"
import type { Asset } from "@/types/asset"
import { formatCurrency, marketingStatusLabels, propertyTypeLabels, getFullAddress } from "@/types/asset"
import { useAuth } from "@/context/auth-context"

export function MostProfitableAssets() {
  const { user, checkPermission } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [randomAssets, setRandomAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("🔍 Debug - Starting asset fetch...")
        console.log("🔍 Debug - User:", user ? "Present" : "Not present")
        console.log("🔍 Debug - Can view assets:", user ? checkPermission("viewAssets") : "No user")

        // Debug info object
        const debug = {
          hasUser: !!user,
          canViewAssets: user ? checkPermission("viewAssets") : false,
          userPermissions: user?.permissions || [],
          userRole: user?.role || "none",
        }
        setDebugInfo(debug)

        if (!user) {
          console.log("🔍 Debug - No user found, waiting...")
          setLoading(false)
          return
        }

        if (!checkPermission("viewAssets")) {
          console.log("🔍 Debug - User lacks viewAssets permission")
          setLoading(false)
          return
        }

        console.log("🔍 Debug - Fetching properties...")

        // Fetch properties with more generous parameters
        const result = await getProperties(
          {}, // No filters
          50, // Increased limit for better selection
          undefined, // No pagination
          user, // Pass user for permissions
        )

        console.log("🔍 Debug - Properties result:", {
          count: result.properties.length,
          total: result.total,
          hasNext: result.hasNextPage,
        })

        // Store the original assets
        setAssets(result.properties)

        // If we have assets, randomly select 5 of them
        if (result.properties.length > 0) {
          console.log("🔍 Debug - Selecting random assets from", result.properties.length, "properties")

          // Get 5 random assets from the result
          const shuffled = [...result.properties].sort(() => 0.5 - Math.random())
          const selected = shuffled.slice(0, 5)

          console.log("🔍 Debug - Selected assets:", selected.length)
          console.log(
            "🔍 Debug - First asset sample:",
            selected[0]
              ? {
                  id: selected[0].id,
                  title: selected[0].title,
                  city: selected[0].municipio_catastro,
                  price: selected[0].price_approx,
                }
              : "No assets",
          )

          setRandomAssets(selected)
        } else {
          console.log("🔍 Debug - No properties found in result")
        }
      } catch (error) {
        console.error("🔍 Debug - Error fetching assets:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to ensure auth context is ready
    const timer = setTimeout(fetchAssets, 100)
    return () => clearTimeout(timer)
  }, [user, checkPermission])

  // Check if user has permission to view financial data
  const canViewFinancialData = user && checkPermission("viewFinancialData")

  // Always use randomAssets for display
  const displayAssets = randomAssets.length > 0 ? randomAssets : []

  console.log("🔍 Debug - Render state:", {
    loading,
    error,
    hasUser: !!user,
    canViewAssets: user ? checkPermission("viewAssets") : false,
    assetsCount: assets.length,
    randomAssetsCount: randomAssets.length,
    displayAssetsCount: displayAssets.length,
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Cargando activos...</div>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="flex">
              <div className="h-32 w-48 bg-muted"></div>
              <div className="flex-1 p-4">
                <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded mb-2"></div>
                <div className="h-4 w-2/3 bg-muted rounded mb-4"></div>
                <div className="h-5 w-1/4 bg-muted rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <h3 className="text-lg font-semibold text-destructive">Error al cargar activos</h3>
        <p className="mt-2 text-sm text-destructive/80">{error}</p>
        <details className="mt-2">
          <summary className="text-sm cursor-pointer">Debug Info</summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Cargando usuario...</h3>
        <p className="mt-2 text-muted-foreground">Esperando autenticación del usuario.</p>
        <details className="mt-2">
          <summary className="text-sm cursor-pointer">Debug Info</summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
    )
  }

  if (!checkPermission("viewAssets")) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Acceso Restringido</h3>
        <p className="mt-2 text-muted-foreground">No tiene permisos para ver activos inmobiliarios.</p>
        <details className="mt-2">
          <summary className="text-sm cursor-pointer">Debug Info</summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </details>
      </div>
    )
  }

  if (displayAssets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No hay activos disponibles</h3>
        <p className="mt-2 text-muted-foreground">No se encontraron activos inmobiliarios para mostrar.</p>
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Total de propiedades encontradas: {assets.length}</p>
          <p>Activos aleatorios seleccionados: {randomAssets.length}</p>
        </div>
        <details className="mt-2">
          <summary className="text-sm cursor-pointer">Debug Info</summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(
              {
                ...debugInfo,
                totalAssets: assets.length,
                randomAssets: randomAssets.length,
                sampleAsset: assets[0]
                  ? {
                      id: assets[0].id,
                      title: assets[0].title,
                      city: assets[0].municipio_catastro,
                    }
                  : null,
              },
              null,
              2,
            )}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Mostrando {displayAssets.length} de {assets.length} activos disponibles
      </div>
      {displayAssets.map((asset) => {
        const propertyType = propertyTypeLabels[asset.property_type] || asset.property_type
        const marketingStatus =
          marketingStatusLabels[asset.marketing_status || "AVAILABLE"] || asset.marketing_status || "Disponible"

        return (
          <Card key={asset.id} className="overflow-hidden">
            <div className="flex">
              <div className="relative h-32 w-48 flex-shrink-0">
                <Image
                  src={
                    asset.imageUrl ||
                    `/placeholder.svg?height=128&width=192&text=${encodeURIComponent(asset.reference_code || asset.id)}`
                  }
                  alt={asset.title || `${propertyType} en ${asset.municipio_catastro}`}
                  fill
                  className="object-cover"
                />
                <Badge
                  className="absolute right-2 top-2"
                  variant={marketingStatus === "Disponible" ? "default" : "secondary"}
                >
                  {marketingStatus}
                </Badge>
              </div>
              <div className="flex-1 p-4">
                <h3 className="text-lg font-semibold">
                  {asset.title || `${propertyType} en ${asset.municipio_catastro}`}
                </h3>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {getFullAddress(asset)}, {asset.municipio_catastro}, {asset.provincia_catastro}
                </div>
                <div className="mt-1 flex items-center text-sm text-muted-foreground">
                  {asset.property_type === "RESIDENTIAL" ? (
                    <Home className="mr-1 h-4 w-4" />
                  ) : (
                    <Building className="mr-1 h-4 w-4" />
                  )}
                  {propertyType}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {canViewFinancialData ? (
                    <p className="text-lg font-bold">{formatCurrency(asset.price_approx)}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Precio: Requiere permisos adicionales</p>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/assets/${asset.id}`}>
                      Ver Detalles <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
