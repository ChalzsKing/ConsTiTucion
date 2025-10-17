"use client"

import { Progress } from '@/components/ui/progress'
import { useSubscription } from '@/lib/hooks/useSubscription'
import { AlertCircle, Infinity } from 'lucide-react'

export function UsageMeter() {
  const { usageLimits, isPro, loading, error } = useSubscription()

  console.log('🔍 UsageMeter debug:', { loading, usageLimits, isPro: isPro(), error })

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-muted/50 border">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (!usageLimits) return null

  // Si es PRO, mostrar mensaje de ilimitado
  if (isPro()) {
    return (
      <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Infinity className="w-5 h-5" />
          <div>
            <p className="font-semibold text-sm">Exámenes ilimitados</p>
            <p className="text-xs text-muted-foreground">Plan Pro activo</p>
          </div>
        </div>
      </div>
    )
  }

  // Para usuarios FREE, mostrar el medidor
  const generalTaken = usageLimits.general_exams_taken
  const generalLimit = usageLimits.general_exams_limit
  const generalRemaining = Math.max(0, generalLimit - generalTaken)
  const generalPercentage = (generalTaken / generalLimit) * 100

  // Calcular total de exámenes por título
  const titleExamsTotal = Object.values(usageLimits.title_exams_count).reduce((sum: number, count) => sum + (count as number), 0)
  const titleLimit = usageLimits.title_exams_limit

  // Total combinado
  const totalTaken = generalTaken + titleExamsTotal
  const totalLimit = generalLimit + (titleLimit * 10) // Asumiendo 10 títulos disponibles
  const totalPercentage = (totalTaken / totalLimit) * 100

  // Determinar color según el uso general
  const getColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400'
    if (percentage >= 80) return 'text-orange-600 dark:text-orange-400'
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="p-4 rounded-lg bg-muted/50 border space-y-4">
      {/* Exámenes Generales */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-medium">Exámenes generales</p>
            <p className="text-xs text-muted-foreground mt-0.5">Este mes</p>
          </div>
          <div className={`text-right ${getColor(generalPercentage)}`}>
            <p className="text-lg font-bold">{generalTaken}/{generalLimit}</p>
            {generalRemaining > 0 ? (
              <p className="text-xs">Quedan {generalRemaining}</p>
            ) : (
              <p className="text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Límite alcanzado
              </p>
            )}
          </div>
        </div>

        {/* Barra de progreso para exámenes generales */}
        <div className="relative">
          <Progress value={generalPercentage} className="h-2" />
          <div
            className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(generalPercentage)}`}
            style={{ width: `${Math.min(generalPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Exámenes por Título */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-sm font-medium">Exámenes por título</p>
            <p className="text-xs text-muted-foreground mt-0.5">{titleLimit} por título/mes</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{titleExamsTotal}</p>
            <p className="text-xs text-muted-foreground">realizados</p>
          </div>
        </div>

        {/* Mostrar detalle por título si hay exámenes */}
        {titleExamsTotal > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {Object.entries(usageLimits.title_exams_count).map(([titleId, count]) => (
              <div key={titleId} className="flex justify-between">
                <span>{titleId}:</span>
                <span>{count}/{titleLimit}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan FREE indicator */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground text-center">
          Plan FREE
        </p>
      </div>

      {/* Mensaje de advertencia si está cerca del límite */}
      {generalPercentage >= 80 && generalPercentage < 100 && (
        <p className="text-xs text-orange-600 dark:text-orange-400">
          Estás cerca del límite de exámenes generales
        </p>
      )}

      {generalPercentage >= 100 && (
        <p className="text-xs text-red-600 dark:text-red-400">
          Has alcanzado el límite de exámenes generales. Espera al próximo mes o{' '}
          <a href="/pricing" className="underline font-medium">
            actualiza a Pro
          </a>
        </p>
      )}
    </div>
  )
}
