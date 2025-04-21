"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldAlert } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { checkAssetAccess } from "@/lib/firestore"

interface AssetAccessGuardProps {
  assetId: string
  assetType?: string
  province?: string
  portfolio?: string
  children: React.ReactNode
}

export function AssetAccessGuard({ assetId, assetType, province, portfolio, children }: AssetAccessGuardProps) {
  const { user, hasAccess, checkPermission } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    const checkPermission = async () => {
      if (!user) {
        setHasPermission(false)
        setLoading(false)
        return
      }

      // Admin has access to everything
      if (user.role === "admin") {
        setHasPermission(true)
        setLoading(false)
        return
      }

      // Check if user has basic permission to view assets
      if (!checkPermission("viewAssets")) {
        setHasPermission(false)
        setLoading(false)
        return
      }

      // Check if user has access to this type of asset
      if (!hasAccess(assetType, province, portfolio)) {
        setHasPermission(false)
        setLoading(false)
        return
      }

      // Check specific asset access (e.g., based on additional rules in Firestore)
      try {
        const access = await checkAssetAccess(user.id, assetId)
        setHasPermission(access)
      } catch (error) {
        console.error("Error checking asset access:", error)
        setHasPermission(false)
      } finally {
        setLoading(false)
      }
    }

    checkPermission()
  }, [user, assetId, assetType, province, portfolio, hasAccess, checkPermission])

  if (loading) {
    return <div className="text-center py-8">Verificando permisos de acceso...</div>
  }

  if (!hasPermission) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-800">
            <ShieldAlert className="mr-2 h-5 w-5" />
            Acceso Restringido
          </CardTitle>
          <CardDescription className="text-red-700">
            No tiene permisos para acceder a este activo inmobiliario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-4">
            Si considera que debería tener acceso a esta información, por favor contacte con el administrador del
            sistema.
          </p>
          <Button variant="outline" onClick={() => router.push("/assets")}>
            Volver al listado de activos
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
