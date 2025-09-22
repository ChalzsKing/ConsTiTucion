"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Target,
  Clock,
  Trophy,
  TrendingUp,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Flame,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  mockUserStats,
  generateArticleStats,
  generateTitleStats,
  getMasteryColor,
  getMasteryLabel,
  getStreakMessage,
} from "@/lib/statistics-data"
import { useState } from "react"

export function EstadisticasView() {
  const [expandedTitles, setExpandedTitles] = useState<string[]>([])
  const userStats = mockUserStats
  const articleStats = generateArticleStats()
  const titleStats = generateTitleStats()

  const toggleTitle = (titleId: string) => {
    setExpandedTitles((prev) => (prev.includes(titleId) ? prev.filter((id) => id !== titleId) : [...prev, titleId]))
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Estadísticas</h1>
        <p className="text-muted-foreground">
          Analiza tu progreso y descubre tus fortalezas y áreas de mejora en el estudio de la Constitución.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisión General</p>
                <p className="text-3xl font-bold text-primary">{userStats.overallAccuracy}%</p>
                <p className="text-sm text-muted-foreground">
                  {userStats.correctAnswers} de {userStats.totalQuestionsAnswered}
                </p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Racha de Estudio</p>
                <p className="text-3xl font-bold text-accent">{userStats.studyStreak}</p>
                <p className="text-sm text-muted-foreground">días consecutivos</p>
              </div>
              <Flame className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiempo de Estudio</p>
                <p className="text-3xl font-bold text-primary">{formatTime(userStats.totalStudyTime)}</p>
                <p className="text-sm text-muted-foreground">tiempo total</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exámenes</p>
                <p className="text-3xl font-bold text-primary">{userStats.examsCompleted}</p>
                <p className="text-sm text-muted-foreground">{userStats.averageExamScore}% promedio</p>
              </div>
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progreso General
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Artículos Completados</span>
                <span className="text-sm text-muted-foreground">
                  {userStats.articlesCompleted}/{userStats.totalArticles}
                </span>
              </div>
              <Progress value={(userStats.articlesCompleted / userStats.totalArticles) * 100} className="h-3" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Precisión Objetivo (80%)</span>
                <span className="text-sm text-muted-foreground">{userStats.overallAccuracy}%</span>
              </div>
              <Progress value={Math.min(userStats.overallAccuracy, 100)} className="h-3" />
            </div>
          </div>

          <div className="bg-accent/5 p-4 rounded-lg border border-accent/20">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium text-accent-foreground">Racha de Estudio</p>
                <p className="text-sm text-muted-foreground">{getStreakMessage(userStats.studyStreak)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heat Map - Title Performance */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Mapa de Dominio por Títulos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Cada título se colorea según tu nivel de dominio: verde (dominado), amarillo (en progreso), rojo (necesita
            repaso).
          </p>

          <div className="space-y-4">
            {titleStats.map((title) => {
              const isExpanded = expandedTitles.includes(title.titleId)
              const titleArticles = articleStats.filter((a) =>
                title.titleId === "preliminar"
                  ? a.articleNumber <= 9
                  : title.titleId === "titulo1"
                    ? a.articleNumber >= 10 && a.articleNumber <= 64
                    : a.articleNumber >= 56 && a.articleNumber <= 64,
              )

              return (
                <Card key={title.titleId} className="overflow-hidden">
                  <CardContent
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleTitle(title.titleId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{title.titleName}</h3>
                          <div className="flex items-center gap-4">
                            <Badge className={cn("gap-1", getMasteryColor(title.mastery))}>
                              {title.mastery === "strong" && <CheckCircle2 className="w-3 h-3" />}
                              {title.mastery === "moderate" && <Clock className="w-3 h-3" />}
                              {title.mastery === "weak" && <AlertCircle className="w-3 h-3" />}
                              {getMasteryLabel(title.mastery)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {title.articlesCompleted}/{title.totalArticles} artículos
                            </span>
                            {title.averageAccuracy > 0 && (
                              <span className="text-sm text-muted-foreground">{title.averageAccuracy}% precisión</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                          {titleArticles.map((article) => (
                            <div
                              key={article.articleNumber}
                              className={cn(
                                "aspect-square rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium transition-all",
                                getMasteryColor(article.mastery),
                                "hover:scale-105",
                              )}
                            >
                              <div>Art. {article.articleNumber}</div>
                              {article.accuracy > 0 && <div className="text-xs opacity-75">{article.accuracy}%</div>}
                            </div>
                          ))}
                        </div>

                        {title.totalAttempts > 0 && (
                          <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Intentos totales:</span>
                                <div className="font-medium">{title.totalAttempts}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Precisión promedio:</span>
                                <div className="font-medium">{title.averageAccuracy}%</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Artículos completados:</span>
                                <div className="font-medium">{title.articlesCompleted}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Progreso:</span>
                                <div className="font-medium">
                                  {Math.round((title.articlesCompleted / title.totalArticles) * 100)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Recomendaciones de Estudio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {userStats.weakestTopics.length > 0 && (
              <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Áreas que necesitan más atención
                </h4>
                <ul className="space-y-1">
                  {userStats.weakestTopics.map((topic, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {userStats.strongestTopics.length > 0 && (
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Tus fortalezas
                </h4>
                <ul className="space-y-1">
                  {userStats.strongestTopics.map((topic, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      • {topic}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="gap-2">
              <Target className="w-4 h-4" />
              Practicar Áreas Débiles
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Trophy className="w-4 h-4" />
              Hacer Examen General
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
