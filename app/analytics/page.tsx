import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics",
  description: "Análisis y estadísticas",
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <p className="text-muted-foreground">Página de analytics en desarrollo.</p>
    </div>
  )
}
