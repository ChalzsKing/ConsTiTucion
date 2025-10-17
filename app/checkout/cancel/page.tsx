"use client"

import { XCircle, ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function CheckoutCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12">
        {/* Icono de cancelación */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
            <XCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Pago cancelado
          </h1>

          <p className="text-lg text-muted-foreground">
            Has cancelado el proceso de pago. No se ha realizado ningún cargo.
          </p>
        </div>

        {/* Información */}
        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <h2 className="font-semibold mb-3">¿Tuviste algún problema?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Si encontraste algún error durante el proceso de pago o tienes dudas sobre los planes,
            estamos aquí para ayudarte.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              Todos los pagos son procesados de forma segura por Stripe
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              Puedes cancelar tu suscripción en cualquier momento
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              Sin compromiso ni cargos ocultos
            </li>
          </ul>
        </div>

        {/* Recordatorio de beneficios */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-8 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">
                Con Pro tendrías acceso a:
              </h3>
              <ul className="space-y-1 text-sm">
                <li>✨ Exámenes ilimitados</li>
                <li>✨ Estadísticas avanzadas</li>
                <li>✨ Exportación de datos</li>
                <li>✨ Gamificación completa</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Desde solo €4.99/mes o €49.99/año (ahorra €10)
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => router.push('/pricing')}
          >
            Ver planes de nuevo
          </Button>
        </div>

        {/* Soporte */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Necesitas ayuda? Contacta con soporte en{' '}
          <a href="mailto:soporte@constimaster.com" className="underline hover:text-foreground">
            soporte@constimaster.com
          </a>
        </p>
      </Card>
    </div>
  )
}
