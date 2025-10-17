"use client"

import { PricingTable } from '@/components/subscription/PricingTable'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const faqs = [
    {
      question: '¿Puedo cancelar en cualquier momento?',
      answer: 'Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de facturación. Mantendrás acceso Pro hasta el final del periodo pagado.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) procesadas de forma segura por Stripe.'
    },
    {
      question: '¿Los límites FREE se reinician?',
      answer: 'Sí, los límites del plan FREE se reinician automáticamente el día 1 de cada mes.'
    },
    {
      question: '¿Puedo cambiar de plan mensual a anual?',
      answer: 'Sí, puedes cambiar de plan en cualquier momento. El cambio se aplicará de inmediato y se calculará proporcionalmente el coste.'
    },
    {
      question: '¿Hay descuentos para estudiantes?',
      answer: 'El plan anual ya incluye un descuento del 17% (2 meses gratis). Próximamente ofreceremos códigos promocionales para estudiantes.'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Elige el plan perfecto para ti
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Prepárate para tu oposición con la mejor plataforma de estudio de la Constitución Española
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16">
          <PricingTable />
        </div>

        {/* Garantías */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Sin compromiso</h3>
              <p className="text-sm text-muted-foreground">
                Cancela cuando quieras sin penalizaciones
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Pago seguro</h3>
              <p className="text-sm text-muted-foreground">
                Procesado por Stripe, el líder mundial en pagos
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Actualizaciones incluidas</h3>
              <p className="text-sm text-muted-foreground">
                Nuevas funciones y mejoras sin coste adicional
              </p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Preguntas frecuentes
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 rounded-lg bg-muted/50 border hover:border-purple-300 transition-colors"
              >
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="p-8 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
            <h3 className="text-2xl font-bold mb-4">
              ¿Listo para aprobar tu oposición?
            </h3>
            <p className="text-muted-foreground mb-6">
              Únete a miles de opositores que ya están preparándose con ConstiMaster
            </p>
            <a
              href="#pricing"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Ver planes
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
