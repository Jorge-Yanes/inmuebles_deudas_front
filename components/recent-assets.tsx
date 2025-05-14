"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Building, Home, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getProperties } from "@/lib/firestore/property-service"
import type { Asset } from "@/types/asset"
import { formatCurrency, marketingStatusLabels, propertyTypeLabels } from "@/types/asset"
import { useAuth } from "@/context/auth-context"

export function RecentAssets() {
  const { user, checkPermission } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true)
        // Only fetch assets if user has permission to view assets
        if (user && checkPermission("viewAssets")) {
          // Use getProperties with a limit of 3 and sort by createdAt desc
          const result = await getProperties(
            {}, // No filters
            3, // Limit to 3 recent assets
            undefined, // No pagination
            user, // Pass user for permissions
          )
          setAssets(result.properties)
        }
      } catch (error) {
        console.error("Error fetching recent assets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [user, checkPermission])

  // Check if user has permission to view financial data
  const canViewFinancialData = user && checkPermission("viewFinancialData")

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <div className="h-48 bg-muted"></div>
            <CardContent className="p-4">
              <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-muted rounded mb-4"></div>
              <div className="h-5 w-1/4 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!user || !checkPermission("viewAssets")) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">Acceso Restringido</h3>
        <p className="mt-2 text-muted-foreground">No tiene permisos para ver activos inmobiliarios.</p>
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="text-lg font-semibold">No hay activos recientes</h3>
        <p className="mt-2 text-muted-foreground">No se encontraron activos inmobiliarios recientes.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => {
        const propertyType = propertyTypeLabels[asset.property_type] || asset.property_type
        const marketingStatus =
          marketingStatusLabels[asset.marketing_status || "AVAILABLE"] || asset.marketing_status || "Disponible"

        return (
          <Card key={asset.id} className="overflow-hidden">
            <div className="relative h-48">
              <Image
                src={
                  asset.imageUrl ||
                  `/placeholder.svg?height=200&width=400&text=${encodeURIComponent(asset.reference_code || asset.id)}`
                }
                alt={asset.title || `${propertyType} en ${asset.city}`}
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
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold">{asset.title || `${propertyType} en ${asset.city}`}</h3>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-1 h-4 w-4" />
                {asset.address}, {asset.city}, {asset.province}
              </div>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                {asset.property_type === "RESIDENTIAL" ? (
                  <Home className="mr-1 h-4 w-4" />
                ) : (
                  <Building className="mr-1 h-4 w-4" />
                )}
                {propertyType}
              </div>
              {canViewFinancialData ? (
                <p className="mt-2 text-lg font-bold">{formatCurrency(asset.price_approx)}</p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Precio: Requiere permisos adicionales</p>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/assets/${asset.id}`}>
                  Ver Detalles <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
