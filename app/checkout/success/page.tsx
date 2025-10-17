"use client"

import { useEffect } from 'react'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Efecto de confeti al cargar la página
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#9333ea', '#ec4899', '#8b5cf6', '#d946ef']
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12">
        {/* Icono de éxito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            ¡Bienvenido a ConstiMaster Pro! 🎉
          </h1>

          <p className="text-lg text-muted-foreground mb-2">
            Tu pago se ha procesado correctamente
          </p>

          {sessionId && (
            <p className="text-sm text-muted-foreground">
              ID de sesión: {sessionId}
            </p>
          )}
        </div>

        {/* Beneficios desbloqueados */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-8 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-lg mb-2">
                Has desbloqueado todas las funciones Pro
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Exámenes completamente ilimitados
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Estadísticas avanzadas y gráficos detallados
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Exportación de datos en CSV y PDF
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Sistema completo de gamificación y logros
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Soporte prioritario
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Próximos pasos */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Próximos pasos:</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold">1</span>
              </div>
              <p>
                Recibirás un email de confirmación con tu factura
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold">2</span>
              </div>
              <p>
                Ya puedes hacer exámenes ilimitados sin restricciones
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <p>
                Gestiona tu suscripción desde tu panel de facturación
              </p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => router.push('/')}
          >
            Ir al Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push('/billing')}
          >
            Ver facturación
          </Button>
        </div>

        {/* Nota de agradecimiento */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Gracias por confiar en ConstiMaster para preparar tu oposición 🚀
        </p>
      </Card>
    </div>
  )
}
