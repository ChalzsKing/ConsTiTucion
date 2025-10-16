import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth/auth-context"
import { ProgressProvider } from "@/lib/hooks/useUnifiedProgressContext"
import { AchievementToastListener } from "@/components/gamification/achievement-toast"
import "./globals.css"

export const metadata: Metadata = {
  title: "ConstiMaster - Domina la Constitución Española",
  description:
    "Aplicación para opositores que convierte el estudio de la Constitución Española en una experiencia dinámica",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <ProgressProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <AchievementToastListener />
            <Toaster position="top-center" richColors />
          </ProgressProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
