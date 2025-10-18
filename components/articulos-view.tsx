"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, CheckCircle2, Lock, Play, Trophy, Target, ArrowRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { constitutionData, type Article } from "@/lib/constitution-data"
import { useProgress } from "@/lib/hooks/useUnifiedProgressContext"
import { generateTitleExam, type ExamQuestion } from "@/lib/exam-data"
import {
  getSmartExpandedTitles,
  saveExpandedTitles,
  getContinueStudyInfo,
  markAsReturningUser,
  saveLastStudyPosition
} from "@/lib/navigation-state"

interface ArticulosViewProps {
  onStartArticle?: (article: Article) => void
  onStartExam?: (questions: ExamQuestion[], title: string) => void
}

export function ArticulosView({ onStartArticle, onStartExam }: ArticulosViewProps) {
  // Hook desde contexto global - actualización en tiempo real
  const { getTitleProgress, overall, getArticleProgress } = useProgress()

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

  const handleStartTitleExam = async (titleId: string, titleName: string) => {
    if (!onStartExam) return

    try {
      const questions = await generateTitleExam(titleId, 10)
      if (questions.length > 0) {
        onStartExam(questions, `Examen: ${titleName}`)
      } else {
        console.warn(`No hay preguntas disponibles para el título: ${titleName}`)
      }
    } catch (error) {
      console.error('Error al iniciar examen de título:', error)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Mapa de Estudio</h1>
        <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
          Progresa a través de los artículos de la Constitución Española. Cada artículo desbloqueado te acerca más al
          dominio completo.
        </p>

        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-base md:text-lg">Tu Progreso General</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">Sigue así, cada artículo cuenta</p>
                </div>
              </div>
              <div className="text-left md:text-right w-full md:w-auto">
                <div className="text-xl md:text-2xl font-bold text-primary">{overall.completionPercentage}%</div>
                <div className="text-xs md:text-sm text-muted-foreground">{overall.completedArticles} de {overall.totalArticles} artículos</div>
              </div>
            </div>
            <Progress value={overall.completionPercentage} className="h-2 md:h-3" />
          </CardContent>
        </Card>

        {/* Card de Continuar Estudio */}
        {showContinueCard && continueInfo && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/50 dark:to-indigo-950/50 dark:border-blue-800 mt-4 md:mt-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg text-blue-900 dark:text-blue-100">
                      Continuar donde lo dejaste
                    </h3>
                    <p className="text-xs md:text-sm text-blue-700 dark:text-blue-300">
                      Regresa al Artículo {continueInfo.articleId} que estabas estudiando
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={dismissContinueCard}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 flex-1 md:flex-none"
                  >
                    Dismiss
                  </Button>
                  <Button
                    onClick={handleContinueStudy}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 md:flex-none"
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

      <div className="space-y-4 md:space-y-6">
        {constitutionData.map((title) => {
          const titleProgress = getTitleProgress(title.id)
          const progress = titleProgress ? {
            completed: titleProgress.completedArticles,
            total: titleProgress.totalArticles,
            percentage: titleProgress.percentage
          } : { completed: 0, total: title.articles.length, percentage: 0 }
          const isExpanded = expandedTitles.includes(title.id)

          return (
            <Card key={title.id} className="overflow-hidden shadow-sm">
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors p-4 md:p-6"
                onClick={() => toggleTitle(title.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-start gap-3 md:gap-4 flex-1">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground mt-0.5" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg md:text-xl mb-1">{title.title}</CardTitle>
                      <p className="text-xs md:text-sm text-muted-foreground mb-3">{title.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <Badge variant={progress.completed > 0 ? "default" : "secondary"} className="gap-1 text-xs w-fit">
                          <Target className="w-3 h-3" />
                          {progress.completed}/{progress.total} completados
                        </Badge>
                        <div className="flex items-center gap-2 md:gap-3">
                          <Progress value={progress.percentage} className="w-24 sm:w-32" />
                          <span className="text-xs md:text-sm font-medium text-muted-foreground min-w-[2.5rem] md:min-w-[3rem]">
                            {progress.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {progress.completed === progress.total && progress.total > 0 && (
                    <div className="flex items-center gap-2 text-accent ml-8 md:ml-0">
                      <Trophy className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs md:text-sm font-medium">¡Completado!</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 pb-4 md:pb-6 px-4 md:px-6">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
                    {title.articles.map((article) => {
                      // Obtener progreso desde Supabase
                      const articleProgress = getArticleProgress(article.number)
                      const isCompleted = articleProgress?.isCompleted || false

                      return (
                        <ArticleCard
                          key={article.id}
                          article={article}
                          isCompleted={isCompleted}
                          onClick={() => handleArticleClick(article)}
                        />
                      )
                    })}
                  </div>

                  {progress.completed === progress.total && progress.total > 0 && (
                    <div className="mt-4 md:mt-6 p-3 md:p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="flex items-start md:items-center gap-2 md:gap-3">
                          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-accent mt-0.5 md:mt-0" />
                          <div>
                            <h4 className="font-semibold text-sm md:text-base text-accent-foreground">¡Título completado!</h4>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              Has dominado todos los artículos de este título
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent w-full md:w-auto text-xs md:text-sm"
                          onClick={() => handleStartTitleExam(title.id, title.title)}
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
  isCompleted: boolean
  onClick: () => void
}

function ArticleCard({ article, isCompleted, onClick }: ArticleCardProps) {
  const getCardStyle = () => {
    if (isCompleted) {
      return "bg-accent/10 border-accent text-accent hover:bg-accent/20 cursor-pointer"
    }
    if (article.available) {
      return "bg-primary/10 border-primary text-primary hover:bg-primary/20 cursor-pointer"
    }
    return "bg-muted border-muted-foreground/20 text-muted-foreground cursor-not-allowed"
  }

  const getIcon = () => {
    if (isCompleted) {
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
        "relative aspect-square flex flex-col items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95",
        getCardStyle(),
      )}
      onClick={onClick}
    >
      <div className="text-center space-y-1 md:space-y-2 px-1">
        <div className="scale-75 md:scale-100">{getIcon()}</div>
        <div className="font-semibold text-xs md:text-sm">Art. {article.number}</div>
        {article.attempts > 0 && (
          <div className="text-[10px] md:text-xs opacity-75">
            {article.attempts} intento{article.attempts !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {article.completed && (
        <div className="absolute -top-1 -right-1">
          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-accent bg-background rounded-full border-2 border-background" />
        </div>
      )}

      {getAccuracyBadge()}
    </Card>
  )
}
