import { Building } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cuenta Pendiente | Portal Inmobiliario",
  description: "Su cuenta está pendiente de aprobación por un administrador",
}

export default function PendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500">
            <Building className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Cuenta Pendiente de Aprobación</h1>
          <p className="text-sm text-muted-foreground">
            Su solicitud de registro ha sido recibida y está pendiente de revisión por un administrador.
          </p>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            Una vez que su cuenta sea aprobada, recibirá un correo electrónico de confirmación y podrá acceder al portal
            inmobiliario. Si tiene alguna pregunta, por favor contacte con el administrador.
          </p>
        </div>
      </div>
    </div>
  )
}
