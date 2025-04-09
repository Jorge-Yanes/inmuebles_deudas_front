"use client"

import { useEffect, useState } from "react"
import { Building, Home, MapPin, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAssetStats } from "@/lib/firestore"

export function AssetStats() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalValue: 0,
    totalLocations: 0,
    averageValue: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAssetStats()
        setStats(data)
      } catch (error) {
        console.error("Error fetching asset stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAssets}</div>
          <p className="text-xs text-muted-foreground">Propiedades registradas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Valor de cartera</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLocations}</div>
          <p className="text-xs text-muted-foreground">Ciudades diferentes</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.averageValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Por propiedad</p>
        </CardContent>
      </Card>
    </>
  )
}
