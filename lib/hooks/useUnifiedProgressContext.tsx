'use client'

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react'
import { useUnifiedProgress, type UnifiedProgressState } from './useUnifiedProgress'

/**
 * 🔥 CONTEXTO GLOBAL DE PROGRESO - ConstiMaster
 *
 * Este contexto envuelve useUnifiedProgress y permite que TODOS los componentes
 * de la aplicación compartan el mismo estado y se actualicen automáticamente
 * cuando cualquier componente marque un artículo como completado.
 *
 * SOLUCIÓN AL PROBLEMA:
 * - Sin contexto: Cada componente tiene su propia instancia del hook
 * - Con contexto: Todos los componentes comparten la misma instancia
 * - Resultado: Actualización en tiempo real sin recargar página
 */

const ProgressContext = createContext<UnifiedProgressState | null>(null)

/**
 * Wrapper component para manejar client-side rendering
 */
function ProgressProviderContent({ children }: { children: React.ReactNode }) {
  const progressState = useUnifiedProgress()
  const [isClient, setIsClient] = useState(false)

  // Asegurarse de que estamos en el cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Suscribirse a cambios de Supabase en tiempo real (opcional)
  useEffect(() => {
    if (!isClient) return

    // Refrescar cada 30 segundos como fallback
    const interval = setInterval(() => {
      progressState.refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [progressState, isClient])

  return (
    <ProgressContext.Provider value={progressState}>
      {children}
    </ProgressContext.Provider>
  )
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  return <ProgressProviderContent>{children}</ProgressProviderContent>
}

/**
 * Hook para consumir el progreso unificado desde cualquier componente
 *
 * @throws Error si se usa fuera del ProgressProvider
 */
export function useProgress(): UnifiedProgressState {
  const context = useContext(ProgressContext)

  if (!context) {
    throw new Error('useProgress debe usarse dentro de un ProgressProvider')
  }

  return context
}

/**
 * Hook de conveniencia para marcar artículos y refrescar automáticamente
 */
export function useMarkArticle() {
  const { markArticleCompleted, refreshData } = useProgress()

  const markAndRefresh = useCallback(async (
    articleNumber: number,
    titleId: string,
    studyTime?: number
  ) => {
    const success = await markArticleCompleted(articleNumber, titleId, studyTime)

    if (success) {
      // Refrescar inmediatamente para actualizar todos los componentes
      await refreshData()
    }

    return success
  }, [markArticleCompleted, refreshData])

  return { markArticleCompleted: markAndRefresh }
}
