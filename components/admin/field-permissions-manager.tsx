"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, RefreshCw, AlertTriangle, Eye, Edit, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  type FieldPermissions,
  type FieldPermission,
  FIELD_CATEGORIES,
  getFieldsByCategory,
  type FieldCategory,
} from "@/types/field-permissions"
import {
  getFieldPermissionsForRole,
  updateFieldPermissionsForRole,
  resetFieldPermissionsForRole,
} from "@/lib/permissions/field-permissions-service"

export function FieldPermissionsManager() {
  const { toast } = useToast()
  const [selectedRole, setSelectedRole] = useState<string>("client")
  const [permissions, setPermissions] = useState<FieldPermissions>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<FieldCategory>("identification")

  const fieldsByCategory = getFieldsByCategory()

  useEffect(() => {
    loadPermissions(selectedRole)
  }, [selectedRole])

  const loadPermissions = async (role: string) => {
    setLoading(true)
    try {
      const rolePermissions = await getFieldPermissionsForRole(role)
      setPermissions(rolePermissions)
    } catch (error) {
      console.error("Error loading permissions:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los permisos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (fieldName: string, permission: FieldPermission) => {
    setPermissions((prev) => ({
      ...prev,
      [fieldName]: permission,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateFieldPermissionsForRole(selectedRole, permissions)
      toast({
        title: "Permisos actualizados",
        description: `Los permisos para el rol ${selectedRole} han sido actualizados correctamente`,
      })
    } catch (error) {
      console.error("Error saving permissions:", error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los permisos",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm(`¿Está seguro de que desea restablecer los permisos para el rol ${selectedRole}?`)) {
      setSaving(true)
      try {
        await resetFieldPermissionsForRole(selectedRole)
        await loadPermissions(selectedRole)
        toast({
          title: "Permisos restablecidos",
          description: `Los permisos para el rol ${selectedRole} han sido restablecidos a los valores predeterminados`,
        })
      } catch (error) {
        console.error("Error resetting permissions:", error)
        toast({
          title: "Error",
          description: "No se pudieron restablecer los permisos",
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
    }
  }

  const getPermissionBadge = (permission: FieldPermission) => {
    switch (permission) {
      case "view":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Eye className="mr-1 h-3 w-3" /> Ver
          </Badge>
        )
      case "edit":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <Edit className="mr-1 h-3 w-3" /> Editar
          </Badge>
        )
      case "none":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <EyeOff className="mr-1 h-3 w-3" /> Sin acceso
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Permisos de Campos</CardTitle>
        <CardDescription>Configure qué campos pueden ver y editar los diferentes roles de usuario</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-64">
              <Label htmlFor="role-select">Seleccionar Rol</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading || saving}>
                <SelectTrigger id="role-select">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="client">Cliente</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => loadPermissions(selectedRole)} disabled={loading || saving}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar
              </Button>

              <Button variant="destructive" onClick={handleReset} disabled={loading || saving}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Restablecer
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Categorías de Campos</h3>
                  <p className="text-sm text-muted-foreground">Seleccione una categoría para gestionar sus permisos</p>
                </div>

                <div className="mt-3 space-y-1">
                  {Object.entries(FIELD_CATEGORIES).map(([category, label]) => (
                    <Button
                      key={category}
                      variant={activeCategory === category ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory(category as FieldCategory)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">{FIELD_CATEGORIES[activeCategory]}</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure los permisos para cada campo en esta categoría
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  {fieldsByCategory[activeCategory].map((field) => (
                    <div key={field.name} className="rounded-md border p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{field.label}</h4>
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                          </div>
                          {field.sensitive && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="mr-1 h-3 w-3" /> Sensible
                            </Badge>
                          )}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.name}-none`}
                              checked={permissions[field.name] === "none"}
                              onCheckedChange={() => handlePermissionChange(field.name, "none")}
                            />
                            <Label htmlFor={`${field.name}-none`} className="flex items-center">
                              <EyeOff className="mr-1 h-4 w-4 text-red-500" /> Sin acceso
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.name}-view`}
                              checked={permissions[field.name] === "view"}
                              onCheckedChange={() => handlePermissionChange(field.name, "view")}
                            />
                            <Label htmlFor={`${field.name}-view`} className="flex items-center">
                              <Eye className="mr-1 h-4 w-4 text-blue-500" /> Ver
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.name}-edit`}
                              checked={permissions[field.name] === "edit"}
                              onCheckedChange={() => handlePermissionChange(field.name, "edit")}
                            />
                            <Label htmlFor={`${field.name}-edit`} className="flex items-center">
                              <Edit className="mr-1 h-4 w-4 text-green-500" /> Editar
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={loading || saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  )
}
