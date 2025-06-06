import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Configuración",
  description: "Configuración de la aplicación",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <p className="text-muted-foreground">Página de configuración en desarrollo.</p>
    </div>
  )
}
