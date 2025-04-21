"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getPendingUsers, approveUser, rejectUser } from "@/lib/auth"
import type { User } from "@/types/user"

export function PendingUsersList() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const users = await getPendingUsers()
        setPendingUsers(users)
      } catch (error) {
        console.error("Error fetching pending users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingUsers()
  }, [])

  const handleApproveUser = async (userId: string) => {
    try {
      await approveUser(userId)
      // Remove the user from the list
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error approving user:", error)
    }
  }

  const handleRejectUser = async (userId: string) => {
    try {
      await rejectUser(userId)
      // Remove the user from the list
      setPendingUsers(pendingUsers.filter((user) => user.id !== userId))
    } catch (error) {
      console.error("Error rejecting user:", error)
    }
  }

  if (loading) {
    return <div className="text-center">Cargando solicitudes pendientes...</div>
  }

  if (pendingUsers.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">No hay solicitudes pendientes de aprobación</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes Pendientes de Aprobación</CardTitle>
        <CardDescription>Revise y apruebe las solicitudes de registro de nuevos usuarios</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Fecha de Solicitud</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.company || "-"}</TableCell>
                  <TableCell>
                    {user.createdAt instanceof Date
                      ? user.createdAt.toLocaleDateString("es-ES")
                      : new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleApproveUser(user.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectUser(user.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
