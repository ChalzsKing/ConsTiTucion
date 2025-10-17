"use client"

import { useState } from 'react'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Crown, Calendar, CreditCard, AlertCircle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function BillingDashboard() {
  const { subscription, isPro, loading } = useSubscription()
  const [managingSubscription, setManagingSubscription] = useState(false)

  const handleManageSubscription = async () => {
    try {
      setManagingSubscription(true)

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: subscription?.user_id
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirigir a Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Error opening portal:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setManagingSubscription(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </Card>
      </div>
    )
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No se pudo cargar la información de suscripción.</p>
      </Card>
    )
  }

  const isProUser = isPro()
  const planName = subscription.plan_type === 'annual' ? 'Pro Anual' :
                   subscription.plan_type === 'pro' ? 'Pro Mensual' : 'Free'
  const planPrice = subscription.plan_type === 'annual' ? '€49.99/año' :
                    subscription.plan_type === 'pro' ? '€4.99/mes' : 'Gratis'

  return (
    <div className="space-y-6">
      {/* Plan actual */}
      <Card className={`p-6 ${isProUser ? 'border-2 border-purple-500' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isProUser && <Crown className="w-5 h-5 text-purple-600" />}
              <h2 className="text-2xl font-bold">Plan {planName}</h2>
            </div>
            <p className="text-muted-foreground">
              {isProUser ? 'Acceso completo a todas las funcionalidades' : 'Plan básico con límites mensuales'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{planPrice}</p>
            {isProUser && subscription.current_period_end && (
              <p className="text-sm text-muted-foreground">
                hasta {format(new Date(subscription.current_period_end), 'dd MMM yyyy', { locale: es })}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${
            subscription.status === 'active' ? 'bg-green-500' :
            subscription.status === 'past_due' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-sm">
            Estado: {subscription.status === 'active' ? 'Activo' :
                     subscription.status === 'past_due' ? 'Pago pendiente' :
                     'Inactivo'}
          </span>
        </div>

        {/* Advertencias */}
        {subscription.cancel_at_period_end && subscription.current_period_end && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Suscripción cancelada</p>
                <p className="text-sm text-muted-foreground">
                  Tu plan Pro terminará el{' '}
                  {format(new Date(subscription.current_period_end), 'dd MMM yyyy', { locale: es })}.
                  Después volverás al plan FREE.
                </p>
              </div>
            </div>
          </div>
        )}

        {subscription.status === 'past_due' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Problema con el pago</p>
                <p className="text-sm text-muted-foreground">
                  Hubo un problema al procesar tu pago. Por favor, actualiza tu método de pago.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón de gestión */}
        {isProUser && (
          <Button
            className="w-full"
            variant="outline"
            onClick={handleManageSubscription}
            disabled={managingSubscription}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {managingSubscription ? 'Abriendo portal...' : 'Gestionar suscripción'}
          </Button>
        )}

        {!isProUser && (
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            onClick={() => window.location.href = '/pricing'}
          >
            <Crown className="w-4 h-4 mr-2" />
            Actualizar a Pro
          </Button>
        )}
      </Card>

      {/* Información adicional */}
      {isProUser && subscription.current_period_start && subscription.current_period_end && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Periodo de facturación
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inicio del periodo:</span>
              <span className="font-medium">
                {format(new Date(subscription.current_period_start), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próxima renovación:</span>
              <span className="font-medium">
                {format(new Date(subscription.current_period_end), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Beneficios del plan */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">
          {isProUser ? 'Beneficios de tu plan Pro' : 'Beneficios del plan FREE'}
        </h3>
        <ul className="space-y-2 text-sm">
          {isProUser ? (
            <>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Exámenes completamente ilimitados
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Estadísticas avanzadas y gráficos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Exportación de datos (CSV/PDF)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Gamificación completa con logros
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Soporte prioritario
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Acceso completo a 169 artículos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                5 exámenes generales por mes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                1 examen por título (máx. 8/mes)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">✗</span>
                <span className="text-muted-foreground">Sin estadísticas avanzadas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">✗</span>
                <span className="text-muted-foreground">Sin exportación de datos</span>
              </li>
            </>
          )}
        </ul>
      </Card>

      {/* Link al portal */}
      {isProUser && (
        <p className="text-center text-sm text-muted-foreground">
          Gestiona tu suscripción, actualiza tu método de pago o cancela desde el{' '}
          <button
            onClick={handleManageSubscription}
            className="underline hover:text-foreground"
          >
            portal de facturación
          </button>
        </p>
      )}
    </div>
  )
}
