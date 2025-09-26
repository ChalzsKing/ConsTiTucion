"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, CheckCircle2, XCircle, BarChart3, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMotivationalMessage, type ExamQuestion } from "@/lib/exam-data"

interface ExamResultsProps {
  results: {
    score: number
    percentage: number
    correctAnswers: ExamQuestion[]
    incorrectAnswers: ExamQuestion[]
    questionsWithResults: ExamQuestion[]
    timeSpent?: number
    examTitle: string
  }
  onBackToExams: () => void
  onViewStats: () => void
  onRetakeExam?: () => Promise<void> | void
  onStudyMistakes?: () => void
}

export function ExamResults({ results, onBackToExams, onViewStats, onRetakeExam, onStudyMistakes }: ExamResultsProps) {
  const [showFullReview, setShowFullReview] = useState(false)
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)
  const [isRetaking, setIsRetaking] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-accent"
    if (percentage >= 60) return "text-yellow-600"
    return "text-destructive"
  }

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default"
    if (percentage >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className={cn("w-10 h-10", getScoreColor(results.percentage))} />
            <h1 className="text-3xl font-bold">Resultados del Examen</h1>
          </div>
          <p className="text-muted-foreground">{results.examTitle}</p>
        </div>

        {/* Score Summary */}
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className={cn("text-6xl font-bold mb-2", getScoreColor(results.percentage))}>
              {results.percentage}%
            </div>
            <CardTitle className="text-xl mb-4">
              {results.score} de {results.questionsWithResults.length} respuestas correctas
            </CardTitle>
            <Badge variant={getScoreBadgeVariant(results.percentage)} className="text-lg px-4 py-2">
              {results.percentage >= 80 ? "¡Excelente!" : results.percentage >= 60 ? "¡Bien!" : "Sigue practicando"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-accent mx-auto mb-2" />
                <div className="text-2xl font-bold text-accent">{results.correctAnswers.length}</div>
                <div className="text-sm text-muted-foreground">Correctas</div>
              </div>
              <div className="text-center">
                <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <div className="text-2xl font-bold text-destructive">{results.incorrectAnswers.length}</div>
                <div className="text-sm text-muted-foreground">Incorrectas</div>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-2xl font-bold text-muted-foreground">
                  {results.timeSpent ? formatTime(results.timeSpent) : "--:--"}
                </div>
                <div className="text-sm text-muted-foreground">Tiempo empleado</div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 text-center">
              <p className="text-lg font-medium text-primary mb-2">Mensaje motivacional</p>
              <p className="text-foreground">{getMotivationalMessage(results.percentage)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Question Review Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Revisión de Respuestas
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowFullReview(!showFullReview)}
                className="gap-2"
              >
                {showFullReview ? "Ocultar Revisión" : "Ver Todas las Preguntas"}
                <Target className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!showFullReview ? (
              // Quick review - just incorrect answers summary
              <div className="space-y-4">
                {results.incorrectAnswers.length > 0 ? (
                  <>
                    <div className="text-center p-6 bg-destructive/5 rounded-lg border border-destructive/20">
                      <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                      <h3 className="text-lg font-semibold text-destructive mb-2">
                        {results.incorrectAnswers.length} preguntas incorrectas
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Revisa estas preguntas para mejorar tu comprensión
                      </p>
                      <Button onClick={() => setShowFullReview(true)} className="gap-2">
                        <Eye className="w-4 h-4" />
                        Revisar Respuestas
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 bg-accent/5 rounded-lg border border-accent/20">
                    <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-accent mb-2">
                      ¡Perfecto! Todas las respuestas correctas
                    </h3>
                    <p className="text-muted-foreground">
                      Has respondido correctamente a todas las preguntas
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Full review with navigation
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">
                      Pregunta {currentReviewIndex + 1} de {results.questionsWithResults.length}
                    </Badge>
                    <Badge variant={results.questionsWithResults[currentReviewIndex]?.isCorrect ? "default" : "destructive"}>
                      {results.questionsWithResults[currentReviewIndex]?.isCorrect ? "Correcta" : "Incorrecta"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentReviewIndex(Math.max(0, currentReviewIndex - 1))}
                      disabled={currentReviewIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentReviewIndex(Math.min(results.questionsWithResults.length - 1, currentReviewIndex + 1))}
                      disabled={currentReviewIndex === results.questionsWithResults.length - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {results.questionsWithResults[currentReviewIndex] && (
                  <div className="border rounded-lg p-6 bg-muted/30">
                    <p className="font-medium text-lg mb-4">
                      {results.questionsWithResults[currentReviewIndex].question}
                    </p>
                    <div className="space-y-3">
                      {results.questionsWithResults[currentReviewIndex].options.map((option: string, optionIndex: number) => {
                        const currentQuestion = results.questionsWithResults[currentReviewIndex]
                        const isUserAnswer = currentQuestion.userAnswer === optionIndex
                        const isCorrectAnswer = currentQuestion.correctAnswer === optionIndex

                        return (
                          <div
                            key={optionIndex}
                            className={cn(
                              "p-3 rounded-lg text-sm transition-all",
                              isCorrectAnswer && "bg-accent/15 text-accent-foreground border-2 border-accent",
                              isUserAnswer && !isCorrectAnswer && "bg-destructive/15 text-destructive-foreground border-2 border-destructive",
                              !isCorrectAnswer && !isUserAnswer && "bg-background border border-border"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-primary">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span>{option}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {isCorrectAnswer && (
                                  <div className="flex items-center gap-1 text-accent">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-xs font-medium">Correcta</span>
                                  </div>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <div className="flex items-center gap-1 text-destructive">
                                    <XCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Tu respuesta</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {results.questionsWithResults[currentReviewIndex].articleNumber && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm">
                          <strong>📖 Artículo relacionado:</strong> Artículo {results.questionsWithResults[currentReviewIndex].articleNumber} de la Constitución Española
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick navigation */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {results.questionsWithResults.map((question, index) => (
                    <Button
                      key={index}
                      variant={currentReviewIndex === index ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "w-10 h-10 p-0",
                        question.isCorrect ? "border-accent/50" : "border-destructive/50"
                      )}
                      onClick={() => setCurrentReviewIndex(index)}
                    >
                      <span className={cn(
                        "text-xs",
                        question.isCorrect ? "text-accent" : "text-destructive"
                      )}>
                        {index + 1}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={onBackToExams} className="px-8">
            Volver a Exámenes
          </Button>
          {onRetakeExam && (
            <Button
              size="lg"
              variant="outline"
              onClick={async () => {
                setIsRetaking(true)
                try {
                  await onRetakeExam()
                } finally {
                  setIsRetaking(false)
                }
              }}
              className="px-8"
              disabled={isRetaking}
            >
              {isRetaking ? "Generando preguntas..." : "Repetir Examen"}
            </Button>
          )}
          {results.incorrectAnswers.length > 0 && onStudyMistakes && (
            <Button size="lg" variant="outline" onClick={onStudyMistakes} className="px-8">
              Estudiar Errores
            </Button>
          )}
          <Button size="lg" variant="outline" onClick={onViewStats} className="px-8 gap-2 bg-transparent">
            <BarChart3 className="w-5 h-5" />
            Ver Estadísticas
          </Button>
        </div>
      </div>
    </div>
  )
}
