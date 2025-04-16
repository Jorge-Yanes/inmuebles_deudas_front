"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Building, Home, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { getRecentAssets } from "@/lib/firestore"
import type { Asset } from "@/types/asset"
import { formatCurrency, marketingStatusLabels, propertyTypeLabels } from "@/types/asset"

export function RecentAssets() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await getRecentAssets()
        setAssets(data)
      } catch (error) {
        console.error("Error fetching recent assets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssets()
  }, [])

  if (loading) {
    return <div className="text-center">Cargando activos recientes...</div>
  }

  if (assets.length === 0) {
    return <div className="text-center">No hay activos recientes disponibles.</div>
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
                {asset.address || `${asset.city}, ${asset.province}`}
              </div>
              <div className="mt-1 flex items-center text-sm text-muted-foreground">
                {asset.property_type === "RESIDENTIAL" ? (
                  <Home className="mr-1 h-4 w-4" />
                ) : (
                  <Building className="mr-1 h-4 w-4" />
                )}
                {propertyType}
              </div>
              <p className="mt-2 text-lg font-bold">{formatCurrency(asset.price_approx)}</p>
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
