"use client"

import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/auth-context'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { useRouter } from 'next/navigation'

export function PricingTable() {
  const { user } = useAuth()
  const { subscription, isPro } = useSubscription()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (priceId: string, planType: string) => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    try {
      setLoading(planType)

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId,
          userId: user.id
        })
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Redirigir a Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error)
      alert(`Error al procesar el pago: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: 'FREE',
      price: '0',
      period: '',
      description: 'Para empezar a practicar',
      features: [
        'Acceso completo a 169 artículos',
        'Sistema de estudio con navegación',
        '5 exámenes generales por mes',
        '1 examen por título (máx. 8/mes)',
        'Marcadores y favoritos',
        'Progreso básico'
      ],
      limitations: [
        'Sin estadísticas avanzadas',
        'Sin exportación de datos',
        'Sin gamificación completa'
      ],
      buttonText: 'Plan Actual',
      popular: false,
      priceId: null,
      planType: 'free',
      isCurrent: !isPro()
    },
    {
      name: 'PRO',
      price: '4.99',
      period: '/mes',
      description: 'Preparación intensiva',
      features: [
        'Todo lo del plan FREE',
        '✨ Exámenes completamente ilimitados',
        '✨ Estadísticas detalladas y gráficos',
        '✨ Exportación de datos (CSV/PDF)',
        '✨ Historial completo de exámenes',
        '✨ Gamificación completa',
        '✨ Sistema de logros y badges',
        '✨ Soporte prioritario'
      ],
      limitations: [],
      buttonText: isPro() && subscription?.plan_type === 'pro' ? 'Plan Actual' : 'Empezar Pro',
      popular: true,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
      planType: 'pro',
      isCurrent: isPro() && subscription?.plan_type === 'pro'
    },
    {
      name: 'PRO ANUAL',
      price: '49.99',
      period: '/año',
      description: '2 meses gratis - Mejor precio',
      features: [
        'Todo lo del plan PRO',
        '💎 Ahorro de €10 al año',
        '💎 2 meses completamente gratis',
        '💎 Facturación anual',
        '💎 Cancela cuando quieras'
      ],
      limitations: [],
      buttonText: isPro() && subscription?.plan_type === 'annual' ? 'Plan Actual' : 'Empezar Anual',
      popular: false,
      priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL,
      planType: 'annual',
      isCurrent: isPro() && subscription?.plan_type === 'annual',
      badge: 'MEJOR OFERTA'
    }
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative p-6 ${
            plan.popular
              ? 'border-2 border-purple-500 shadow-lg scale-105'
              : plan.isCurrent
              ? 'border-2 border-green-500'
              : ''
          }`}
        >
          {/* Badge de plan popular o mejor oferta */}
          {plan.badge && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                {plan.badge}
              </span>
            </div>
          )}

          {plan.popular && !plan.badge && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                MÁS POPULAR
              </span>
            </div>
          )}

          {/* Nombre del plan */}
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>

          {/* Precio */}
          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center">
              <span className="text-4xl font-bold">€{plan.price}</span>
              <span className="text-muted-foreground ml-1">{plan.period}</span>
            </div>
            {plan.planType === 'annual' && (
              <p className="text-sm text-green-600 mt-1 font-medium">
                Equivale a €4.16/mes
              </p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Limitations (solo FREE) */}
          {plan.limitations.length > 0 && (
            <ul className="space-y-2 mb-6 pb-6 border-t pt-4">
              {plan.limitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500 text-sm">✗</span>
                  <span className="text-sm text-muted-foreground">{limitation}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Button */}
          <Button
            className="w-full"
            variant={plan.popular ? 'default' : plan.isCurrent ? 'outline' : 'secondary'}
            disabled={plan.isCurrent || loading !== null}
            onClick={() => plan.priceId && handleUpgrade(plan.priceId, plan.planType)}
          >
            {loading === plan.planType ? 'Procesando...' : plan.buttonText}
          </Button>

          {plan.isCurrent && (
            <p className="text-center text-sm text-green-600 mt-2 font-medium">
              ✓ Este es tu plan actual
            </p>
          )}
        </Card>
      ))}
    </div>
  )
}
