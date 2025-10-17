"use client"

import { useState } from 'react'
import { X, Sparkles, TrendingUp, FileText, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  limitType: 'general' | 'title'
  titleName?: string
}

export function PaywallModal({ isOpen, onClose, limitType, titleName }: PaywallModalProps) {
  const router = useRouter()

  const handleUpgrade = () => {
    onClose()
    router.push('/pricing')
  }

  const benefits = [
    {
      icon: Sparkles,
      title: 'Exámenes ilimitados',
      description: 'Practica sin restricciones, tantos exámenes como necesites'
    },
    {
      icon: TrendingUp,
      title: 'Estadísticas avanzadas',
      description: 'Gráficos detallados de tu progreso y áreas de mejora'
    },
    {
      icon: FileText,
      title: 'Exportación de datos',
      description: 'Descarga tus resultados en CSV o PDF'
    },
    {
      icon: Trophy,
      title: 'Gamificación completa',
      description: 'Desbloquea logros, badges y compite en rankings'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Has alcanzado el límite del plan FREE
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          {/* Mensaje personalizado según el tipo de límite */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <p className="text-center text-sm">
              {limitType === 'general' ? (
                <>
                  Has realizado tus <strong>5 exámenes generales</strong> de este mes.
                </>
              ) : (
                <>
                  Ya has realizado <strong>1 examen del {titleName}</strong> este mes.
                </>
              )}
            </p>
            <p className="text-center text-sm mt-2 text-muted-foreground">
              Los límites se reinician el día 1 de cada mes.
            </p>
          </div>

          {/* Beneficios de Pro */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Desbloquea todo con ConstiMaster Pro
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <benefit.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-6 border border-purple-200 dark:border-purple-800">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Desde solo</p>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-4xl font-bold">€4.99</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <p className="text-sm text-muted-foreground">
                o €49.99/año (ahorra €10 - 2 meses gratis)
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Ahora no
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={handleUpgrade}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ver planes
            </Button>
          </div>

          {/* Garantía */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Cancela cuando quieras • Sin compromiso • Pago seguro con Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
