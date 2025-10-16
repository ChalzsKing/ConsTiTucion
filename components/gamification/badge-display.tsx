'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, BookOpen, FileCheck, Flame, Star } from 'lucide-react'
import { BadgeCard } from './badge-card'
import { useAchievements } from '@/lib/hooks/useAchievements'
import { allBadges, badgesByCategory, type BadgeCategory } from '@/lib/gamification/badges'

const categoryIcons: Record<BadgeCategory, React.ElementType> = {
  study: BookOpen,
  titles: Trophy,
  exams: FileCheck,
  streaks: Flame,
  special: Star
}

const categoryLabels: Record<BadgeCategory, string> = {
  study: 'Estudio',
  titles: 'Títulos',
  exams: 'Exámenes',
  streaks: 'Rachas',
  special: 'Especiales'
}

export function BadgeDisplay() {
  const {
    unlockedBadges,
    loading,
    getBadgeProgress,
    unlockedCount,
    totalBadges,
    completionPercentage
  } = useAchievements()

  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all')

  const unlockedBadgeIds = unlockedBadges.map(u => u.badge.id)

  const getBadgesToDisplay = () => {
    if (selectedCategory === 'all') {
      return allBadges
    }
    return badgesByCategory[selectedCategory] || []
  }

  const badges = getBadgesToDisplay()
  const categoryUnlocked = badges.filter(b => unlockedBadgeIds.includes(b.id)).length

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con progreso general */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold text-xl">Colección de Logros</h3>
                <p className="text-sm text-muted-foreground">
                  Desbloquea badges completando desafíos
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">
                {unlockedCount} de {totalBadges}
              </div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Tabs por categoría */}
      <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as BadgeCategory | 'all')}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="gap-2">
            <Star className="w-4 h-4" />
            Todos
          </TabsTrigger>
          {(Object.keys(categoryIcons) as BadgeCategory[]).map(category => {
            const Icon = categoryIcons[category]
            const categoryBadges = badgesByCategory[category]
            const unlocked = categoryBadges.filter(b => unlockedBadgeIds.includes(b.id)).length

            return (
              <TabsTrigger key={category} value={category} className="gap-2 relative">
                <Icon className="w-4 h-4" />
                {categoryLabels[category]}
                {unlocked > 0 && (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1">
                    {unlocked}
                  </Badge>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Content de cada tab */}
        <TabsContent value={selectedCategory} className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedCategory === 'all' ? 'Todos los Logros' : categoryLabels[selectedCategory as BadgeCategory]}
                  </CardTitle>
                  <CardDescription>
                    {selectedCategory === 'all'
                      ? `${unlockedCount} de ${totalBadges} badges desbloqueados`
                      : `${categoryUnlocked} de ${badges.length} badges desbloqueados`
                    }
                  </CardDescription>
                </div>
                {selectedCategory !== 'all' && (
                  <Progress
                    value={Math.round((categoryUnlocked / badges.length) * 100)}
                    className="w-32"
                  />
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {badges.map(badge => {
                  const unlocked = unlockedBadgeIds.includes(badge.id)
                  const progress = !unlocked ? getBadgeProgress(badge) : undefined

                  return (
                    <BadgeCard
                      key={badge.id}
                      badge={badge}
                      unlocked={unlocked}
                      progress={progress}
                      size="md"
                    />
                  )
                })}
              </div>

              {badges.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay badges en esta categoría</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
