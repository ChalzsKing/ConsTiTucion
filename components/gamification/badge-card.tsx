'use client'

import { Card } from '@/components/ui/card'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Lock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Badge, getRarityColor, getRarityBgColor } from '@/lib/gamification/badges'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BadgeCardProps {
  badge: Badge
  unlocked: boolean
  progress?: {
    current: number
    required: number
    percentage: number
  }
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function BadgeCard({
  badge,
  unlocked,
  progress,
  onClick,
  size = 'md'
}: BadgeCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl'
  }

  const cardClasses = cn(
    'relative transition-all duration-200 hover:scale-105 cursor-pointer',
    unlocked
      ? getRarityBgColor(badge.rarity)
      : 'bg-muted/30',
    unlocked
      ? 'border-2 shadow-md'
      : 'border border-dashed border-muted-foreground/30 grayscale opacity-60'
  )

  const iconClasses = cn(
    sizeClasses[size],
    'flex items-center justify-center rounded-lg transition-all',
    unlocked ? '' : 'filter blur-[1px]'
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={cardClasses}
            onClick={unlocked ? onClick : undefined}
          >
            {/* Badge Icon */}
            <div className="p-4 flex flex-col items-center justify-center space-y-2">
              <div className={iconClasses}>
                {unlocked ? (
                  <span>{badge.icon}</span>
                ) : (
                  <Lock className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              {/* Badge Name */}
              <div className="text-center">
                <p className={cn(
                  'font-semibold text-xs line-clamp-2',
                  unlocked ? getRarityColor(badge.rarity) : 'text-muted-foreground'
                )}>
                  {badge.name}
                </p>
              </div>

              {/* Progress Bar (si no está desbloqueado) */}
              {!unlocked && progress && progress.percentage > 0 && (
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className="bg-primary rounded-full h-1.5 transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              )}

              {/* Check Icon (si está desbloqueado) */}
              {unlocked && (
                <div className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow-md">
                  <CheckCircle className={cn('w-5 h-5', getRarityColor(badge.rarity))} />
                </div>
              )}

              {/* XP Reward Badge */}
              {unlocked && (
                <UIBadge variant="secondary" className="absolute -bottom-2 text-[10px] px-1.5 py-0.5">
                  +{badge.xpReward} XP
                </UIBadge>
              )}
            </div>
          </Card>
        </TooltipTrigger>

        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className={cn('font-bold', getRarityColor(badge.rarity))}>
                {badge.icon} {badge.name}
              </p>
              <UIBadge variant="outline" className="text-[10px]">
                {badge.rarity}
              </UIBadge>
            </div>

            <p className="text-sm text-muted-foreground">
              {badge.description}
            </p>

            {!unlocked && progress && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">
                  Progreso: {progress.current}/{progress.required}
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {!unlocked && (
              <div className="pt-2 border-t">
                <p className="text-xs font-medium text-primary">
                  Recompensa: +{badge.xpReward} XP
                </p>
              </div>
            )}

            {unlocked && (
              <div className="pt-2 border-t">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✓ Desbloqueado
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
