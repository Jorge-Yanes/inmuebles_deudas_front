import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { AuthProvider } from "@/context/auth-context"
import { FieldPermissionsProvider } from "@/context/field-permissions-context"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Portal Inmobiliario",
  description: "Gestión de activos inmobiliarios",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <FieldPermissionsProvider>{children}</FieldPermissionsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
