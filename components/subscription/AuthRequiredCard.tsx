"use client"

import { UserPlus, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export function AuthRequiredCard() {
  const router = useRouter()

  return (
    <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
      <div className="text-center max-w-2xl mx-auto">
        {/* Icono */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full mb-6">
          <UserPlus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold mb-3">
          Regístrate gratis para acceder a los exámenes
        </h2>

        {/* Descripción */}
        <p className="text-muted-foreground mb-6">
          Crea una cuenta gratuita en segundos y comienza a preparar tu oposición con nuestro sistema de exámenes
        </p>

        {/* Beneficios del plan FREE */}
        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Plan FREE incluye:
          </h3>
          <div className="grid md:grid-cols-2 gap-3 text-sm text-left">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>5 exámenes generales por mes</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>1 examen por título (máx. 8/mes)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Acceso completo a 169 artículos</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Sistema de estudio interactivo</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Seguimiento de progreso básico</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Marcadores y favoritos</span>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => router.push('/auth')}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Registrarse / Iniciar Sesión
          </Button>
        </div>

        {/* Nota */}
        <p className="text-xs text-muted-foreground mt-4">
          Sin tarjeta de crédito • Cancela cuando quieras • Actualiza a Pro cuando lo necesites
        </p>
      </div>
    </Card>
  )
}
