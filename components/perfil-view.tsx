"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Trophy, Settings, Shield, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { UserProfile } from "@/components/auth/user-profile"
import { AuthModal } from "@/components/auth/auth-modal"

export function PerfilView() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Si el usuario está autenticado, mostrar el perfil real
  if (user && !loading) {
    return (
      <div className="p-6">
        <UserProfile />
      </div>
    )
  }

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si no está autenticado, mostrar interfaz de invitación al login
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-10 h-10 text-primary" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Inicia sesión para acceder a tu perfil personalizado, ver tu progreso de estudio
            y gestionar tus preferencias de aprendizaje.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => setShowAuthModal(true)}
            size="lg"
            className="gap-2"
          >
            <LogIn className="w-5 h-5" />
            Iniciar Sesión
          </Button>

          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta? El registro es rápido y gratuito.
          </p>
        </div>

        {/* Características que obtienen al crear cuenta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Seguimiento de Progreso</h3>
            <p className="text-sm text-muted-foreground">
              Rastrea tu progreso de estudio y ve tus estadísticas detalladas.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Datos Seguros</h3>
            <p className="text-sm text-muted-foreground">
              Tu progreso se guarda de forma segura y sincroniza entre dispositivos.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Personalización</h3>
            <p className="text-sm text-muted-foreground">
              Personaliza tu experiencia de estudio según tus preferencias.
            </p>
          </Card>
        </div>
      </div>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </div>
  )
}