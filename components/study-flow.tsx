"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, BookOpen, Clock, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Article } from "@/lib/constitution-data"
import { useSupabaseQuestions, type SupabaseQuestion } from "@/lib/hooks/useSupabaseQuestions"
import { useProgress } from "@/lib/hooks/useUnifiedProgressContext"
import { useAchievements } from "@/lib/hooks/useAchievements"
import { formatStudyTime } from "@/lib/user-progress"
import { getArticleNavigation, getArticleBreadcrumbs, type ArticleNavigation } from "@/lib/article-navigation"
import { useArticleNavigationShortcuts, formatShortcutKey } from "@/lib/hooks/useKeyboardShortcuts"
import { getTitleIdFromArticleNumber } from "@/lib/constitution-data"

interface StudyFlowProps {
  article: Article
  onComplete: (success: boolean) => void
  onBack: () => void
  onNavigateToArticle?: (articleNumber: number) => void
}

type StudyPhase = "reading" | "question" | "result"

export function StudyFlow({ article, onComplete, onBack, onNavigateToArticle }: StudyFlowProps) {
  const [phase, setPhase] = useState<StudyPhase>("reading")
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [startTime] = useState(Date.now())
  const [studyTime, setStudyTime] = useState(0)

  // Hooks
  const { question, loading, error } = useSupabaseQuestions(article.number)
  const { getArticleProgress, markArticleCompleted, refreshData, getTitleProgress } = useProgress()
  const { addXP, checkAllAchievements } = useAchievements()
  const articleProgress = getArticleProgress(article.number)

  // LEGACY FUNCTIONS DESACTIVADAS - Ahora usamos hook unificado
  // const { addStudyTime, initializeDailySession, settings } = useUserProgress()

  // Timer para tracking del tiempo de estudio
  useEffect(() => {
    const timer = setInterval(() => {
      setStudyTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  // Obtener información de navegación
  const navigation = getArticleNavigation(article.number)
  const breadcrumbs = getArticleBreadcrumbs(article.number)

  // Obtener progreso real del título desde Supabase
  const realTitleProgress = navigation ? getTitleProgress(navigation.title.id) : null

  const handleContinueToQuestion = async () => {
    if (question) {
      setPhase("question")
    } else {
      // Si no hay pregunta, marcar como completado solo por lectura
      await markArticleCompleted(article.number, article.titleId, studyTime)

      // 🎮 Gamificación: Añadir XP por completar artículo
      if (!articleProgress?.completed) {
        await addXP(10, 'article_completed', `article-${article.number}`)
        await checkAllAchievements()
      }

      await refreshData() // Refrescar para actualizar todos los componentes
      onComplete(true)
    }
  }

  // Configurar keyboard shortcuts
  const { shortcuts } = useArticleNavigationShortcuts({
    onPrevious: navigation?.previous && onNavigateToArticle
      ? () => onNavigateToArticle(navigation.previous!.number)
      : undefined,
    onNext: navigation?.next && onNavigateToArticle
      ? () => onNavigateToArticle(navigation.next!.number)
      : undefined,
    onComplete: phase === "reading" ? handleContinueToQuestion : undefined,
    onBack: onBack,
    enabled: phase === "reading" // Solo activos en fase de lectura
  })

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return // Prevent changing answer after selection

    setSelectedAnswer(answerIndex)
    const correct = question?.correct_answer === answerIndex
    setIsCorrect(correct)
    setPhase("result")

    // Auto-advance after showing result
    setTimeout(async () => {
      // Obtener titleId del artículo
      const titleId = getTitleIdFromArticleNumber(article.number)
      if (titleId) {
        // Marcar como completado con tiempo total de estudio
        await markArticleCompleted(article.number, titleId, studyTime)

        // 🎮 Gamificación: Añadir XP por completar artículo
        if (!articleProgress?.completed) {
          await addXP(10, 'article_completed', `article-${article.number}`)

          // Bonus XP por responder correctamente
          if (correct) {
            await addXP(5, 'question_correct', `article-${article.number}`)
          }

          await checkAllAchievements()
        }

        await refreshData() // Refrescar para actualizar todos los componentes
      }
      onComplete(correct || false)
    }, 3000)
  }

  const handleNext = () => {
    onComplete(isCorrect || false)
  }

  if (phase === "reading") {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <button className="hover:text-foreground transition-colors">
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al mapa
              </Button>
              <Badge variant="outline" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Artículo {article.number}
              </Badge>
              {articleProgress?.completed && (
                <Badge variant="default" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Completado
                </Badge>
              )}
              {navigation && (
                <Badge variant="secondary" className="gap-2">
                  <Target className="w-4 h-4" />
                  {navigation.titleProgress.currentIndex + 1} de {navigation.titleProgress.totalArticles}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="gap-2">
                <Clock className="w-4 h-4" />
                {formatStudyTime(studyTime)}
              </Badge>
              {articleProgress && (
                <Badge variant="outline" className="gap-2">
                  <Target className="w-4 h-4" />
                  {articleProgress.timesStudied} {articleProgress.timesStudied === 1 ? 'vez' : 'veces'}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar - Datos reales de Supabase */}
          {navigation && realTitleProgress && (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{navigation.title.title}</span>
                <span className="text-sm text-muted-foreground">
                  {realTitleProgress.percentage}% completado ({realTitleProgress.completedArticles}/{realTitleProgress.totalArticles})
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2 border">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${realTitleProgress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Reading Phase */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl mb-2">Artículo {article.number}</CardTitle>
              <p className="text-lg text-muted-foreground">{article.title}</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="prose prose-lg max-w-none">
                <div className="text-lg leading-relaxed text-foreground bg-muted/30 p-6 rounded-lg border-l-4 border-primary">
                  {article.content.split('\n').map((line, index) => (
                    <p key={index} className={line.trim() === '' ? 'mb-4' : 'mb-2'}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Navegación anterior */}
                <div>
                  {navigation?.previous && onNavigateToArticle ? (
                    <Button
                      variant="outline"
                      onClick={() => onNavigateToArticle(navigation.previous!.number)}
                      className="gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Art. {navigation.previous.number}
                    </Button>
                  ) : (
                    <div className="w-24" /> // Spacer
                  )}
                </div>

                {/* Botón principal */}
                <Button size="lg" onClick={handleContinueToQuestion} className="px-8 py-3 text-lg">
                  {question ? "Continuar a pregunta" : "Marcar completado"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {/* Navegación siguiente */}
                <div>
                  {navigation?.next && onNavigateToArticle ? (
                    <Button
                      variant="outline"
                      onClick={() => onNavigateToArticle(navigation.next!.number)}
                      className="gap-2"
                    >
                      Art. {navigation.next.number}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="w-24" /> // Spacer
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts Help */}
          {shortcuts.length > 0 && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Atajos de teclado:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <kbd className="px-2 py-1 text-xs bg-background rounded border">
                      {formatShortcutKey(shortcut)}
                    </kbd>
                    <span className="text-xs text-muted-foreground ml-2 truncate">
                      {shortcut.description.split(':')[1] || shortcut.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase === "question" && question) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al mapa
            </Button>
            <Badge variant="outline" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Artículo {article.number} - Pregunta
            </Badge>
          </div>

          {/* Question Phase */}
          {loading && (
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <p>Cargando pregunta...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <p className="text-red-500">Error: {error}</p>
                <Button onClick={onBack} className="mt-4">Volver</Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && question && (
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl mb-4">Pregunta sobre el Artículo {article.number}</CardTitle>
                <p className="text-lg text-foreground">{question.question_text}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {[question.option_a, question.option_b, question.option_c, question.option_d].map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={cn(
                        "h-auto p-4 text-left justify-start text-wrap whitespace-normal",
                        "hover:bg-primary/10 hover:border-primary",
                        selectedAnswer === index && "bg-primary/10 border-primary",
                      )}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                    >
                      <span className="font-semibold mr-3 text-primary">{String.fromCharCode(65 + index)}.</span>
                      <span className="flex-1">{option}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && !error && !question && (
            <Card className="shadow-lg">
              <CardContent className="p-8 text-center">
                <p>No hay preguntas disponibles para este artículo.</p>
                <Button onClick={() => onComplete(true)} className="mt-4">Continuar</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (phase === "result" && question) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al mapa
            </Button>
            <Badge variant="outline" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Artículo {article.number} - Resultado
            </Badge>
          </div>

          {/* Result Phase */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                {isCorrect ? (
                  <CheckCircle2 className="w-8 h-8 text-accent" />
                ) : (
                  <XCircle className="w-8 h-8 text-destructive" />
                )}
                <CardTitle className={cn("text-2xl", isCorrect ? "text-accent" : "text-destructive")}>
                  {isCorrect ? "¡Correcto!" : "Incorrecto"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Show the question again */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="font-medium mb-3">{question.question_text}</p>
                <div className="space-y-2">
                  {[question.option_a, question.option_b, question.option_c, question.option_d].map((option, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded border",
                        index === question.correct_answer && "bg-accent/10 border-accent text-accent-foreground",
                        index === selectedAnswer &&
                          index !== question.correct_answer &&
                          "bg-destructive/10 border-destructive text-destructive-foreground",
                        index !== question.correct_answer && index !== selectedAnswer && "bg-background border-border",
                      )}
                    >
                      <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                      {index === question.correct_answer && <CheckCircle2 className="w-4 h-4 text-accent inline ml-2" />}
                      {index === selectedAnswer && index !== question.correct_answer && (
                        <XCircle className="w-4 h-4 text-destructive inline ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-primary mb-2">Resultado:</h4>
                <p className="text-foreground">
                  {isCorrect
                    ? "¡Excelente! Has respondido correctamente. Puedes continuar al siguiente artículo."
                    : `La respuesta correcta era la opción ${String.fromCharCode(65 + question.correct_answer)}. ¡Sigue practicando!`
                  }
                </p>
              </div>

              <div className="text-center">
                <Button size="lg" onClick={handleNext} className="px-8 py-3 text-lg">
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
