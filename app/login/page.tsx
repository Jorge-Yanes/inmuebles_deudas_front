import Link from "next/link"
import type { Metadata } from "next"
import { Building } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login | Portal Inmobiliario",
  description: "Acceda a su cuenta para gestionar sus activos inmobiliarios",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Building className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Bienvenido</h1>
          <p className="text-sm text-muted-foreground">Ingrese sus credenciales para acceder al portal inmobiliario</p>
        </div>
        <LoginForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          ¿No tiene una cuenta?{" "}
          <Link href="/register" className="underline underline-offset-4 hover:text-primary">
            Regístrese
          </Link>
        </p>
      </div>
    </div>
  )
}
