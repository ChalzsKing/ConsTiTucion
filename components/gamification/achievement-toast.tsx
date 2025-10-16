'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { Trophy, Zap, Star } from 'lucide-react'
import { useAchievements } from '@/lib/hooks/useAchievements'
import { getRarityColor } from '@/lib/gamification/badges'

/**
 * 🎉 Componente para mostrar toasts de logros desbloqueados
 *
 * Se renderiza globalmente y escucha nuevos logros automáticamente
 */
export function AchievementToastListener() {
  const { newlyUnlockedBadges, clearNewBadges, xpData } = useAchievements()

  useEffect(() => {
    if (newlyUnlockedBadges.length === 0) return

    // Mostrar toast para cada badge recién desbloqueado
    newlyUnlockedBadges.forEach((badge, index) => {
      // Delay escalonado si hay múltiples badges
      setTimeout(() => {
        toast.custom(
          (t) => (
            <div className="bg-background border-2 border-primary rounded-lg shadow-2xl p-4 min-w-[320px] animate-in slide-in-from-top-5">
              <div className="flex items-start gap-4">
                {/* Icon del badge */}
                <div className="flex-shrink-0">
                  <div className="text-5xl relative">
                    {badge.icon}
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-primary rounded-full p-1 animate-bounce">
                        <Star className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-sm text-yellow-600 dark:text-yellow-400">
                        ¡LOGRO DESBLOQUEADO!
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className={`font-bold text-lg ${getRarityColor(badge.rarity)}`}>
                      {badge.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {badge.description}
                    </p>
                  </div>

                  {/* XP ganado */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-1 text-primary">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">+{badge.xpReward} XP</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Rareza: <span className={getRarityColor(badge.rarity)}>{badge.rarity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
          {
            duration: 5000,
            position: 'top-center',
          }
        )
      }, index * 500) // 500ms entre cada notificación
    })

    // Limpiar badges mostrados
    setTimeout(() => {
      clearNewBadges()
    }, newlyUnlockedBadges.length * 500 + 5000)

  }, [newlyUnlockedBadges, clearNewBadges])

  // Este componente no renderiza nada visible
  return null
}

/**
 * Toast para subida de nivel
 */
export function showLevelUpToast(newLevel: number, levelTitle: string, levelIcon: string) {
  toast.custom(
    (t) => (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-2 border-yellow-500 rounded-lg shadow-2xl p-6 min-w-[360px] animate-in zoom-in-50">
        <div className="text-center space-y-3">
          {/* Icono animado */}
          <div className="text-7xl animate-bounce">
            {levelIcon}
          </div>

          {/* Texto */}
          <div>
            <p className="text-yellow-600 dark:text-yellow-400 font-bold text-sm uppercase tracking-wide">
              ¡Nivel Alcanzado!
            </p>
            <p className="text-3xl font-bold text-foreground mt-2">
              Nivel {newLevel}
            </p>
            <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">
              {levelTitle}
            </p>
          </div>

          {/* Mensaje motivacional */}
          <p className="text-sm text-muted-foreground pt-4 border-t">
            ¡Sigue así! Cada estudio te acerca más a dominar la Constitución
          </p>
        </div>
      </div>
    ),
    {
      duration: 6000,
      position: 'top-center',
    }
  )
}

/**
 * Toast para ganar XP
 */
export function showXPGainToast(xpAmount: number, reason: string) {
  toast.success(
    <div className="flex items-center gap-2">
      <Zap className="w-5 h-5 text-yellow-500" />
      <div>
        <p className="font-bold">+{xpAmount} XP</p>
        <p className="text-xs text-muted-foreground">{reason}</p>
      </div>
    </div>,
    {
      duration: 3000,
    }
  )
}
