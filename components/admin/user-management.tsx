"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CheckCircle,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Trash,
  UserCog,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getAllUsers, approveUser, rejectUser } from "@/lib/auth"
import type { User } from "@/types/user"

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers()
        setUsers(allUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId)
      // Update the user in the local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: "client", approvedAt: new Date() } : user)))
    } catch (error) {
      console.error("Error approving user:", error)
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      await rejectUser(userId)
      // Update the user in the local state
      setUsers(users.map((user) => (user.id === userId ? { ...user, role: "rejected", approvedAt: new Date() } : user)))
    } catch (error) {
      console.error("Error rejecting user:", error)
    }
  }

  const filteredUsers = users.filter((user) => {
    if (activeTab === "all") return true
    if (activeTab === "pending") return user.role === "pending"
    if (activeTab === "clients") return user.role === "client"
    if (activeTab === "admins") return user.role === "admin"
    return true
  })

  const pendingCount = users.filter((user) => user.role === "pending").length

  if (loading) {
    return <div className="text-center">Cargando usuarios...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios del Sistema</CardTitle>
        <CardDescription>Gestione los usuarios, sus roles y permisos en el portal inmobiliario</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pendientes
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="admins">Administradores</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Fecha de Registro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No hay usuarios para mostrar
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.role === "admin" ? (
                            <Badge variant="default" className="bg-blue-500">
                              <Shield className="mr-1 h-3 w-3" />
                              Administrador
                            </Badge>
                          ) : user.role === "client" ? (
                            <Badge variant="outline">
                              <UserCog className="mr-1 h-3 w-3" />
                              Cliente
                            </Badge>
                          ) : user.role === "pending" ? (
                            <Badge variant="secondary">
                              <Clock className="mr-1 h-3 w-3" />
                              Pendiente
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              Rechazado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{user.company || "-"}</TableCell>
                        <TableCell>
                          {user.createdAt instanceof Date
                            ? user.createdAt.toLocaleDateString("es-ES")
                            : new Date(user.createdAt).toLocaleDateString("es-ES")}
                        </TableCell>
                        <TableCell>
                          {user.role === "pending" ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                              Pendiente de aprobación
                            </Badge>
                          ) : user.role === "rejected" ? (
                            <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                              Rechazado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Activo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />

                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuItem asChild>
                                <Link href={`/admin/users/${user.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar usuario
                                </Link>
                              </DropdownMenuItem>

                              {user.role === "pending" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                    Aprobar usuario
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRejectUser(user.id)}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                    Rechazar usuario
                                  </DropdownMenuItem>
                                </>
                              )}

                              {user.role === "client" && (
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/users/${user.id}/permissions`}>
                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                    Gestionar permisos
                                  </Link>
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Eliminar usuario
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
