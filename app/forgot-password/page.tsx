import Link from "next/link"
import type { Metadata } from "next"
import { Building } from "lucide-react"

import { PasswordResetForm } from "@/components/password-reset-form"

export const metadata: Metadata = {
  title: "Recuperar Contraseña | Portal Inmobiliario",
  description: "Recupere su contraseña para acceder al portal inmobiliario",
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Building className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Recuperar Contraseña</h1>
          <p className="text-sm text-muted-foreground">
            Ingrese su correo electrónico para recibir un enlace de recuperación
          </p>
        </div>
        <PasswordResetForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
