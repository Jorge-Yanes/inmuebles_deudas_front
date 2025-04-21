"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { updateUserPermissions } from "@/lib/auth"
import { getAssetTypes, getProvinces, getPortfolios } from "@/lib/firestore"
import type { User } from "@/types/user"

interface UserPermissionsFormProps {
  userId: string
}

export function UserPermissionsForm({ userId }: UserPermissionsFormProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [assetTypes, setAssetTypes] = useState<string[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [portfolios, setPortfolios] = useState<string[]>([])

  // Form state
  const [permissions, setPermissions] = useState({
    viewAssets: false,
    viewAssetDetails: false,
    viewFinancialData: false,
    viewLegalData: false,
    exportData: false,
  })

  const [allowedAssetTypes, setAllowedAssetTypes] = useState<string[]>([])
  const [allowedProvinces, setAllowedProvinces] = useState<string[]>([])
  const [allowedPortfolios, setAllowedPortfolios] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) throw new Error("Failed to fetch user")
        const userData = await response.json()

        setUser(userData)

        // Initialize form state with user data
        if (userData.permissions) {
          setPermissions(userData.permissions)
        }

        setAllowedAssetTypes(userData.allowedAssetTypes || [])
        setAllowedProvinces(userData.allowedProvinces || [])
        setAllowedPortfolios(userData.allowedPortfolios || [])

        // Fetch filter options
        const [typesData, provincesData, portfoliosData] = await Promise.all([
          getAssetTypes(),
          getProvinces(),
          getPortfolios(),
        ])

        setAssetTypes(typesData)
        setProvinces(provincesData)
        setPortfolios(portfoliosData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }))
  }

  const handleAssetTypeToggle = (type: string) => {
    setAllowedAssetTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const handleProvinceToggle = (province: string) => {
    setAllowedProvinces((prev) => (prev.includes(province) ? prev.filter((p) => p !== province) : [...prev, province]))
  }

  const handlePortfolioToggle = (portfolio: string) => {
    setAllowedPortfolios((prev) =>
      prev.includes(portfolio) ? prev.filter((p) => p !== portfolio) : [...prev, portfolio],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await updateUserPermissions(userId, {
        permissions,
        allowedAssetTypes,
        allowedProvinces,
        allowedPortfolios,
      })

      router.push("/admin/users")
    } catch (error) {
      console.error("Error updating permissions:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center">Cargando información del usuario...</div>
  }

  if (!user) {
    return <div className="text-center">Usuario no encontrado</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Permisos para {user.name}</CardTitle>
            <CardDescription>
              Configure los permisos de acceso para este usuario en el portal inmobiliario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="permissions">
              <TabsList className="mb-4">
                <TabsTrigger value="permissions">Permisos Generales</TabsTrigger>
                <TabsTrigger value="access">Acceso a Datos</TabsTrigger>
              </TabsList>

              <TabsContent value="permissions">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="viewAssets"
                          checked={permissions.viewAssets}
                          onCheckedChange={() => handlePermissionChange("viewAssets")}
                        />
                        <Label htmlFor="viewAssets">Ver listado de activos</Label>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Permite al usuario ver el listado general de activos inmobiliarios
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="viewAssetDetails"
                          checked={permissions.viewAssetDetails}
                          onCheckedChange={() => handlePermissionChange("viewAssetDetails")}
                        />
                        <Label htmlFor="viewAssetDetails">Ver detalles de activos</Label>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Permite al usuario ver la información detallada de cada activo
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="viewFinancialData"
                          checked={permissions.viewFinancialData}
                          onCheckedChange={() => handlePermissionChange("viewFinancialData")}
                        />
                        <Label htmlFor="viewFinancialData">Ver datos financieros</Label>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Permite al usuario ver información financiera sensible como precios, deudas y valores
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="viewLegalData"
                          checked={permissions.viewLegalData}
                          onCheckedChange={() => handlePermissionChange("viewLegalData")}
                        />
                        <Label htmlFor="viewLegalData">Ver datos legales</Label>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Permite al usuario ver información legal como estado de procedimientos y fases legales
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="exportData"
                          checked={permissions.exportData}
                          onCheckedChange={() => handlePermissionChange("exportData")}
                        />
                        <Label htmlFor="exportData">Exportar datos</Label>
                      </div>
                      <p className="text-sm text-muted-foreground pl-6">
                        Permite al usuario exportar datos en formatos como CSV o Excel
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="access">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Tipos de Activos Permitidos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Seleccione los tipos de activos inmobiliarios a los que este usuario tendrá acceso
                    </p>

                    <div className="grid gap-2 md:grid-cols-3">
                      {assetTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={allowedAssetTypes.includes(type)}
                            onCheckedChange={() => handleAssetTypeToggle(type)}
                          />
                          <Label htmlFor={`type-${type}`}>{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Provincias Permitidas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Seleccione las provincias a las que este usuario tendrá acceso
                    </p>

                    <div className="grid gap-2 md:grid-cols-3">
                      {provinces.map((province) => (
                        <div key={province} className="flex items-center space-x-2">
                          <Checkbox
                            id={`province-${province}`}
                            checked={allowedProvinces.includes(province)}
                            onCheckedChange={() => handleProvinceToggle(province)}
                          />
                          <Label htmlFor={`province-${province}`}>{province}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-2">Carteras Permitidas</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Seleccione las carteras de activos a las que este usuario tendrá acceso
                    </p>

                    <div className="grid gap-2 md:grid-cols-3">
                      {portfolios.map((portfolio) => (
                        <div key={portfolio} className="flex items-center space-x-2">
                          <Checkbox
                            id={`portfolio-${portfolio}`}
                            checked={allowedPortfolios.includes(portfolio)}
                            onCheckedChange={() => handlePortfolioToggle(portfolio)}
                          />
                          <Label htmlFor={`portfolio-${portfolio}`}>{portfolio}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/admin/users")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
