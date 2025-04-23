"use client"

import { useEffect, useState } from "react"
import { Building, Home, MapPin, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPropertyStats } from "@/lib/firestore/property-service"
import { useAuth } from "@/context/auth-context"

export function AssetStats() {
  const { user, checkPermission } = useAuth()
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalValue: 0,
    totalLocations: 0,
    averageValue: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Only fetch stats if user has permission to view assets
        if (user && checkPermission("viewAssets")) {
          const data = await getPropertyStats(user.id)
          setStats({
            totalAssets: data.totalProperties,
            totalValue: data.totalValue,
            totalLocations: data.totalLocations,
            averageValue: data.averageValue,
          })
        }
      } catch (error) {
        console.error("Error fetching asset stats:", error)
      }
    }

    fetchStats()
  }, [user, checkPermission])

  // If user doesn't have permission to view financial data, hide financial stats
  const canViewFinancialData = user && checkPermission("viewFinancialData")

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAssets || stats.totalProperties}</div>
          <p className="text-xs text-muted-foreground">Propiedades registradas</p>
        </CardContent>
      </Card>

      {canViewFinancialData ? (
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
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Restringido</div>
            <p className="text-xs text-muted-foreground">Requiere permisos adicionales</p>
          </CardContent>
        </Card>
      )}

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

      {canViewFinancialData ? (
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
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Restringido</div>
            <p className="text-xs text-muted-foreground">Requiere permisos adicionales</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
