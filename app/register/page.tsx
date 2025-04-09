import Link from "next/link"
import type { Metadata } from "next"
import { Building } from "lucide-react"

import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Registro | Portal Inmobiliario",
  description: "Cree una cuenta para acceder al portal inmobiliario",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Building className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-muted-foreground">Ingrese sus datos para registrarse en el portal inmobiliario</p>
        </div>
        <RegisterForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          ¿Ya tiene una cuenta?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
