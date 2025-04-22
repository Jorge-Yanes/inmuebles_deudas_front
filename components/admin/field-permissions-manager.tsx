"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

import {
  getAllRolesWithPermissions,
  getFieldPermissionsByRole,
  saveFieldPermissions,
  getAllFieldCategories,
  getFieldMetadataByCategory,
} from "@/lib/permissions/field-permissions-service"

import type { FieldPermission, FieldPermissionLevel, FieldCategory } from "@/types/field-permissions"

export function FieldPermissionsManager() {
  const router = useRouter()
  const { toast } = useToast()
  const [roles, setRoles] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [permissions, setPermissions] = useState<FieldPermission[]>([])
  const [categories, setCategories] = useState<FieldCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<FieldCategory | "all">("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allRoles = await getAllRolesWithPermissions()
        setRoles(allRoles)

        if (allRoles.length > 0) {
          setSelectedRole(allRoles[0])
        }

        const allCategories = getAllFieldCategories()
        setCategories(allCategories)
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los roles y categorías",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedRole) return

      setLoading(true)
      try {
        const rolePermissions = await getFieldPermissionsByRole(selectedRole)
        setPermissions(rolePermissions)
      } catch (error) {
        console.error(`Error fetching permissions for role ${selectedRole}:`, error)
        toast({
          title: "Error",
          description: `No se pudieron cargar los permisos para el rol ${selectedRole}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [selectedRole, toast])

  const handlePermissionChange = (field: string, level: FieldPermissionLevel) => {
    setPermissions((prevPermissions) => {
      const newPermissions = [...prevPermissions]
      const index = newPermissions.findIndex((p) => p.field === field)

      if (index !== -1) {
        newPermissions[index] = { ...newPermissions[index], level }
      } else {
        newPermissions.push({ field: field as keyof (typeof newPermissions)[0]["field"], level })
      }

      return newPermissions
    })
  }

  const handleSave = async () => {
    if (!selectedRole) return

    setSaving(true)
    try {
      await saveFieldPermissions(selectedRole, permissions)
      toast({
        title: "Permisos guardados",
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

  const renderFieldPermissions = (category: FieldCategory) => {
    const fields = getFieldMetadataByCategory(category)

    return (
      <div className="space-y-6">
        {fields.map((field) => (
          <div key={field.field as string} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium flex items-center">
                {field.label}
                {field.sensitive && (
                  <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 hover:bg-red-50">
                    Sensible
                  </Badge>
                )}
              </Label>
            </div>
            <RadioGroup
              value={permissions.find((p) => p.field === field.field)?.level || "none"}
              onValueChange={(value) => handlePermissionChange(field.field as string, value as FieldPermissionLevel)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id={`${field.field}-none`} />
                <Label htmlFor={`${field.field}-none`} className="text-sm font-normal">
                  Sin acceso
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="view" id={`${field.field}-view`} />
                <Label htmlFor={`${field.field}-view`} className="text-sm font-normal">
                  Ver
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="edit" id={`${field.field}-edit`} />
                <Label htmlFor={`${field.field}-edit`} className="text-sm font-normal">
                  Editar
                </Label>
              </div>
            </RadioGroup>
            {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          </div>
        ))}
      </div>
    )
  }

  if (loading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Permisos de Campos</CardTitle>
        <CardDescription>Configure qué campos pueden ver y editar los usuarios según su rol</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading || roles.length === 0}>
              <SelectTrigger id="role" className="w-full sm:w-[300px]">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs
              defaultValue="all"
              value={activeCategory}
              onValueChange={(value) => setActiveCategory(value as FieldCategory | "all")}
            >
              <TabsList className="mb-4 flex flex-wrap">
                <TabsTrigger value="all">Todos</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                {categories.map((category) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-4">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h3>
                    {renderFieldPermissions(category)}
                    <Separator className="my-6" />
                  </div>
                ))}
              </TabsContent>

              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  {renderFieldPermissions(category)}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  )
}
