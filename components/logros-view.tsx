'use client'

import { BadgeDisplay } from './gamification/badge-display'
import { LevelProgress } from './gamification/level-progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useAchievements } from '@/lib/hooks/useAchievements'
import { Trophy, Star, Flame, TrendingUp } from 'lucide-react'
import { Badge } from './ui/badge'

/**
 * 🏆 Vista principal de Logros y Gamificación
 */
export function LogrosView() {
  const { xpData, unlockedCount, totalBadges, completionPercentage } = useAchievements()

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">🏆 Logros y Progresión</h1>
        <p className="text-muted-foreground">
          Desbloquea badges, sube de nivel y demuestra tu dominio de la Constitución
        </p>
      </div>

      {/* Progreso de Nivel */}
      <LevelProgress variant="full" showXPDetails />

      {/* Tabs principales */}
      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges" className="gap-2">
            <Trophy className="w-4 h-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Star className="w-4 h-4" />
            Ranking
          </TabsTrigger>
        </TabsList>

        {/* Tab: Badges */}
        <TabsContent value="badges">
          <BadgeDisplay />
        </TabsContent>

        {/* Tab: Estadísticas de Gamificación */}
        <TabsContent value="stats">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tu Nivel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Tu Nivel
                </CardTitle>
                <CardDescription>
                  Información sobre tu progresión
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {xpData && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Nivel actual</span>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{xpData.levelIcon}</span>
                        <span className="text-xl font-bold">{xpData.currentLevel}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Título</span>
                      <span className={`font-bold ${xpData.levelColor}`}>
                        {xpData.levelTitle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">XP Total</span>
                      <Badge variant="default">{xpData.totalXP.toLocaleString()} XP</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Próximo nivel</span>
                      <Badge variant="outline">
                        {xpData.xpToNextLevel.toLocaleString()} XP restantes
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Logros Desbloqueados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Logros Desbloqueados
                </CardTitle>
                <CardDescription>
                  Tu colección de badges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total desbloqueados</span>
                  <span className="text-2xl font-bold text-primary">
                    {unlockedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total disponibles</span>
                  <span className="text-xl font-semibold">{totalBadges}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Porcentaje</span>
                  <Badge variant="default">{completionPercentage}%</Badge>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Progreso de colección</p>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Próximos Logros */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Próximos Logros
                </CardTitle>
                <CardDescription>
                  Badges que estás cerca de desbloquear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sigue estudiando para desbloquear más logros
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Tabla de Clasificación
              </CardTitle>
              <CardDescription>
                Top usuarios con más XP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">Próximamente</p>
                <p className="text-sm">
                  El leaderboard estará disponible cuando se implemente el backend completo
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
