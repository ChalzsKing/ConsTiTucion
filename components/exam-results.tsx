"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, Clock, CheckCircle2, XCircle, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMotivationalMessage } from "@/lib/exam-data"

interface ExamResultsProps {
  results: {
    score: number
    percentage: number
    correctAnswers: any[]
    incorrectAnswers: any[]
    questions: any[]
    timeSpent: number
    examTitle: string
  }
  onBackToExams: () => void
  onViewStats: () => void
}

export function ExamResults({ results, onBackToExams, onViewStats }: ExamResultsProps) {
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
              {results.score} de {results.questions.length} respuestas correctas
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
                <div className="text-2xl font-bold text-muted-foreground">{formatTime(results.timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Tiempo empleado</div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 text-center">
              <p className="text-lg font-medium text-primary mb-2">Mensaje motivacional</p>
              <p className="text-foreground">{getMotivationalMessage(results.percentage)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        {results.incorrectAnswers.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Preguntas para repasar ({results.incorrectAnswers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.incorrectAnswers.slice(0, 3).map((question, index) => (
                <div key={index} className="border rounded-lg p-4 bg-muted/30">
                  <p className="font-medium mb-3">{question.question}</p>
                  <div className="space-y-2">
                    {question.options.map((option: string, optionIndex: number) => (
                      <div
                        key={optionIndex}
                        className={cn(
                          "p-2 rounded text-sm",
                          optionIndex === question.correctAnswer &&
                            "bg-accent/10 text-accent-foreground border border-accent",
                          optionIndex === question.userAnswer &&
                            optionIndex !== question.correctAnswer &&
                            "bg-destructive/10 text-destructive-foreground border border-destructive",
                          optionIndex !== question.correctAnswer &&
                            optionIndex !== question.userAnswer &&
                            "bg-background",
                        )}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + optionIndex)}.</span>
                        {option}
                        {optionIndex === question.correctAnswer && (
                          <CheckCircle2 className="w-4 h-4 text-accent inline ml-2" />
                        )}
                        {optionIndex === question.userAnswer && optionIndex !== question.correctAnswer && (
                          <XCircle className="w-4 h-4 text-destructive inline ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-primary/5 rounded border border-primary/20">
                    <p className="text-sm">
                      <strong>Explicación:</strong> {question.explanation}
                    </p>
                  </div>
                </div>
              ))}
              {results.incorrectAnswers.length > 3 && (
                <p className="text-center text-muted-foreground">
                  Y {results.incorrectAnswers.length - 3} preguntas más para repasar...
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={onBackToExams} className="px-8">
            Volver a Exámenes
          </Button>
          <Button size="lg" variant="outline" onClick={onViewStats} className="px-8 gap-2 bg-transparent">
            <BarChart3 className="w-5 h-5" />
            Ver Estadísticas
          </Button>
        </div>
      </div>
    </div>
  )
}
