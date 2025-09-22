"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, CheckCircle2, Lock, Play, Trophy, Target, ArrowRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { constitutionData, getTitleProgress, type Article } from "@/lib/constitution-data"
import {
  getSmartExpandedTitles,
  saveExpandedTitles,
  getContinueStudyInfo,
  markAsReturningUser,
  saveLastStudyPosition
} from "@/lib/navigation-state"

interface ArticulosViewProps {
  onStartArticle?: (article: Article) => void
}

export function ArticulosView({ onStartArticle }: ArticulosViewProps) {
  const [expandedTitles, setExpandedTitles] = useState<string[]>([])
  const [showContinueCard, setShowContinueCard] = useState(false)
  const [continueInfo, setContinueInfo] = useState<any>(null)
  const scrollTargetRef = useRef<HTMLDivElement>(null)
  const hasScrolledToTarget = useRef(false)

  // Inicializar estado inteligente al cargar el componente
  useEffect(() => {
    const smartTitles = getSmartExpandedTitles()
    setExpandedTitles(smartTitles)

    const continueStudyInfo = getContinueStudyInfo()
    if (continueStudyInfo) {
      setContinueInfo(continueStudyInfo)
      setShowContinueCard(true)
    }

    // Marcar como usuario que regresa (no primera visita)
    markAsReturningUser()
  }, [])

  // Scroll automático a la última posición de estudio
  useEffect(() => {
    if (continueInfo && expandedTitles.length > 0 && !hasScrolledToTarget.current) {
      // Dar tiempo a que se rendericen los elementos expandidos
      setTimeout(() => {
        const targetElement = document.getElementById(`article-${continueInfo.articleId}`)
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
          hasScrolledToTarget.current = true
        }
      }, 300)
    }
  }, [continueInfo, expandedTitles])

  // Guardar estado de títulos expandidos cuando cambie
  useEffect(() => {
    if (expandedTitles.length > 0) {
      saveExpandedTitles(expandedTitles)
    }
  }, [expandedTitles])

  const toggleTitle = (titleId: string) => {
    setExpandedTitles((prev) => {
      const newExpanded = prev.includes(titleId)
        ? prev.filter((id) => id !== titleId)
        : [...prev, titleId]
      return newExpanded
    })
  }

  const handleArticleClick = (article: Article) => {
    if (article.available && onStartArticle) {
      // Encontrar el título al que pertenece este artículo
      const titleData = constitutionData.find(title =>
        title.articles.some(art => art.id === article.id)
      )

      if (titleData) {
        // Guardar la posición antes de navegar
        saveLastStudyPosition(titleData.id, article.id)
      }

      setShowContinueCard(false) // Ocultar la card de continuar
      onStartArticle(article)
    }
  }

  const handleContinueStudy = () => {
    if (continueInfo) {
      // Buscar el artículo a continuar
      const targetArticle = constitutionData
        .flatMap(title => title.articles)
        .find(article => article.id === continueInfo.articleId)

      if (targetArticle) {
        handleArticleClick(targetArticle)
      }
    }
  }

  const dismissContinueCard = () => {
    setShowContinueCard(false)
    setContinueInfo(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Mapa de Estudio</h1>
        <p className="text-muted-foreground mb-6">
          Progresa a través de los artículos de la Constitución Española. Cada artículo desbloqueado te acerca más al
          dominio completo.
        </p>

        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Tu Progreso General</h3>
                  <p className="text-sm text-muted-foreground">Sigue así, cada artículo cuenta</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">12%</div>
                <div className="text-sm text-muted-foreground">8 de 73 artículos</div>
              </div>
            </div>
            <Progress value={12} className="h-3" />
          </CardContent>
        </Card>

        {/* Card de Continuar Estudio */}
        {showContinueCard && continueInfo && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/50 dark:to-indigo-950/50 dark:border-blue-800 mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100">
                      Continuar donde lo dejaste
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Regresa al Artículo {continueInfo.articleId} que estabas estudiando
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={dismissContinueCard}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300"
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={handleContinueStudy}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        {constitutionData.map((title) => {
          const progress = getTitleProgress(title.id)
          const isExpanded = expandedTitles.includes(title.id)

          return (
            <Card key={title.id} className="overflow-hidden shadow-sm">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleTitle(title.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{title.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-3">{title.description}</p>
                      <div className="flex items-center gap-4">
                        <Badge variant={progress.completed > 0 ? "default" : "secondary"} className="gap-1">
                          <Target className="w-3 h-3" />
                          {progress.completed}/{progress.total} completados
                        </Badge>
                        <div className="flex items-center gap-3">
                          <Progress value={progress.percentage} className="w-32" />
                          <span className="text-sm font-medium text-muted-foreground min-w-[3rem]">
                            {progress.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {progress.completed === progress.total && progress.total > 0 && (
                    <div className="flex items-center gap-2 text-accent">
                      <Trophy className="w-5 h-5" />
                      <span className="text-sm font-medium">¡Completado!</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 pb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                    {title.articles.map((article) => (
                      <ArticleCard key={article.id} article={article} onClick={() => handleArticleClick(article)} />
                    ))}
                  </div>

                  {progress.completed === progress.total && progress.total > 0 && (
                    <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-accent" />
                          <div>
                            <h4 className="font-semibold text-accent-foreground">¡Título completado!</h4>
                            <p className="text-sm text-muted-foreground">
                              Has dominado todos los artículos de este título
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent"
                        >
                          Hacer Examen del Título
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

interface ArticleCardProps {
  article: Article
  onClick: () => void
}

function ArticleCard({ article, onClick }: ArticleCardProps) {
  const getCardStyle = () => {
    if (article.completed) {
      return "bg-accent/10 border-accent text-accent hover:bg-accent/20 cursor-pointer"
    }
    if (article.available) {
      return "bg-primary/10 border-primary text-primary hover:bg-primary/20 cursor-pointer"
    }
    return "bg-muted border-muted-foreground/20 text-muted-foreground cursor-not-allowed"
  }

  const getIcon = () => {
    if (article.completed) {
      return <CheckCircle2 className="w-5 h-5" />
    }
    if (article.available) {
      return <Play className="w-5 h-5" />
    }
    return <Lock className="w-5 h-5" />
  }

  const getAccuracyBadge = () => {
    if (article.attempts > 0) {
      const accuracy = Math.round((article.correctAnswers / article.attempts) * 100)
      return (
        <div
          className={cn(
            "absolute -top-1 -left-1 text-xs px-1.5 py-0.5 rounded-full text-white font-medium",
            accuracy >= 80 ? "bg-accent" : accuracy >= 60 ? "bg-yellow-500" : "bg-destructive",
          )}
        >
          {accuracy}%
        </div>
      )
    }
    return null
  }

  return (
    <Card
      id={`article-${article.id}`}
      className={cn(
        "relative aspect-square flex flex-col items-center justify-center transition-all duration-200 hover:scale-105",
        getCardStyle(),
      )}
      onClick={onClick}
    >
      <div className="text-center space-y-2">
        {getIcon()}
        <div className="font-semibold text-sm">Art. {article.number}</div>
        {article.attempts > 0 && (
          <div className="text-xs opacity-75">
            {article.attempts} intento{article.attempts !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {article.completed && (
        <div className="absolute -top-1 -right-1">
          <CheckCircle2 className="w-6 h-6 text-accent bg-background rounded-full border-2 border-background" />
        </div>
      )}

      {getAccuracyBadge()}
    </Card>
  )
}
