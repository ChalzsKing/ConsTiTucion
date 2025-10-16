'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAchievements } from '@/lib/hooks/useAchievements'
import { formatXP } from '@/lib/gamification/xp-system'

interface LevelProgressProps {
  variant?: 'full' | 'compact' | 'minimal'
  showXPDetails?: boolean
}

export function LevelProgress({ variant = 'full', showXPDetails = true }: LevelProgressProps) {
  const { xpData, loading } = useAchievements()

  if (loading || !xpData) {
    return (
      <Card className={cn(variant === 'minimal' ? 'bg-transparent border-0 shadow-none' : '')}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{xpData.levelIcon}</span>
            <div>
              <p className="font-semibold">Nivel {xpData.currentLevel}</p>
              <p className={cn('text-xs', xpData.levelColor)}>{xpData.levelTitle}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {xpData.progressPercentage}%
          </span>
        </div>
        <Progress value={xpData.progressPercentage} className="h-2" />
        {showXPDetails && (
          <p className="text-xs text-muted-foreground">
            {formatXP(xpData.currentLevelXP)} / {formatXP(xpData.nextLevelXP)} XP
          </p>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{xpData.levelIcon}</div>
              <div>
                <p className="font-bold text-lg">Nivel {xpData.currentLevel}</p>
                <p className={cn('text-sm', xpData.levelColor)}>{xpData.levelTitle}</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              {formatXP(xpData.totalXP)} XP
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{xpData.progressPercentage}%</span>
            </div>
            <Progress value={xpData.progressPercentage} className="h-2" />
            {showXPDetails && (
              <p className="text-xs text-muted-foreground text-center">
                {formatXP(xpData.xpToNextLevel)} XP hasta nivel {xpData.currentLevel + 1}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Variant 'full'
  return (
    <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
      <CardContent className="p-6 space-y-4">
        {/* Header con nivel e icono */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="text-5xl">{xpData.levelIcon}</div>
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full px-2 py-0.5 border-2 border-primary">
                <span className="text-xs font-bold text-primary">{xpData.currentLevel}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tu nivel actual</p>
              <p className={cn('text-2xl font-bold', xpData.levelColor)}>
                {xpData.levelTitle}
              </p>
              <p className="text-sm text-muted-foreground">
                Nivel {xpData.currentLevel}
              </p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant="default" className="gap-1 text-base px-3 py-1">
              <Zap className="w-4 h-4" />
              {formatXP(xpData.totalXP)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">XP Total</p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Progreso al siguiente nivel
            </span>
            <span className="font-bold text-primary">{xpData.progressPercentage}%</span>
          </div>

          <Progress value={xpData.progressPercentage} className="h-3" />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatXP(xpData.currentLevelXP)} XP</span>
            <span className="font-medium text-primary">
              {formatXP(xpData.xpToNextLevel)} XP restantes
            </span>
            <span>{formatXP(xpData.nextLevelXP)} XP</span>
          </div>
        </div>

        {/* Info adicional */}
        {showXPDetails && (
          <div className="pt-4 border-t flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              <p>Próximo nivel: <span className="font-medium text-foreground">Nivel {xpData.currentLevel + 1}</span></p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              +{formatXP(xpData.xpToNextLevel)} XP
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
