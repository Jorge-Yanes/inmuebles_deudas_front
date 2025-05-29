"use client"

import { useEffect, useState } from "react"
import { Building, Home, MapPin, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPropertyStats } from "@/lib/firestore/property-service"
import { useAuth } from "@/context/auth-context"

interface AnimatedNumberProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  formatter?: (value: number) => string
}

function AnimatedNumber({ value, duration = 2000, prefix = "", suffix = "", formatter }: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Usar una función de easing para una animación más suave
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(easeOutQuart * value)

      setDisplayValue(currentValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value) // Asegurar que termine en el valor exacto
      }
    }

    if (value > 0) {
      animationFrame = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  const formattedValue = formatter ? formatter(displayValue) : displayValue.toLocaleString()

  return (
    <span className="tabular-nums">
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  )
}

export function AnimatedStats() {
  const { user, checkPermission } = useAuth()
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalValue: 0,
    totalLocations: 0,
    averageValue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [startAnimation, setStartAnimation] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Only fetch stats if user has permission to view assets
        if (user && checkPermission("viewAssets")) {
          const data = await getPropertyStats(user.id)
          setStats(data)
          // Pequeño delay antes de iniciar la animación para mejor efecto visual
          setTimeout(() => setStartAnimation(true), 300)
        }
      } catch (error) {
        console.error("Error fetching asset stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, checkPermission])

  // If user doesn't have permission to view financial data, hide financial stats
  const canViewFinancialData = user && checkPermission("viewFinancialData")

  if (loading) {
    return (
      <>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 w-24 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-1"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      <Card className="transform transition-all duration-500 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Activos</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={startAnimation ? stats.totalProperties : 0} duration={2000} />
          </div>
          <p className="text-xs text-muted-foreground">Propiedades registradas</p>
        </CardContent>
      </Card>

      {canViewFinancialData ? (
        <Card className="transform transition-all duration-500 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber
                value={startAnimation ? stats.totalValue : 0}
                duration={2500}
                prefix="€"
                formatter={(value) => value.toLocaleString()}
              />
            </div>
            <p className="text-xs text-muted-foreground">Valor de cartera</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="transform transition-all duration-500 hover:scale-105">
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

      <Card className="transform transition-all duration-500 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedNumber value={startAnimation ? stats.totalLocations : 0} duration={1800} />
          </div>
          <p className="text-xs text-muted-foreground">Ciudades diferentes</p>
        </CardContent>
      </Card>

      {canViewFinancialData ? (
        <Card className="transform transition-all duration-500 hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber
                value={startAnimation ? stats.averageValue : 0}
                duration={2200}
                prefix="€"
                formatter={(value) => value.toLocaleString()}
              />
            </div>
            <p className="text-xs text-muted-foreground">Por propiedad</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="transform transition-all duration-500 hover:scale-105">
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
