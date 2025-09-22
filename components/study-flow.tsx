"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Article } from "@/lib/constitution-data"
import { updateArticleProgress } from "@/lib/constitution-data"
import { useSupabaseQuestions, type SupabaseQuestion } from "@/lib/hooks/useSupabaseQuestions"

interface StudyFlowProps {
  article: Article
  onComplete: (success: boolean) => void
  onBack: () => void
}

type StudyPhase = "reading" | "question" | "result"

export function StudyFlow({ article, onComplete, onBack }: StudyFlowProps) {
  const [phase, setPhase] = useState<StudyPhase>("reading")
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

  // Usar el hook de Supabase en lugar de datos estáticos
  const { question, loading, error } = useSupabaseQuestions(article.number)

  const handleContinueToQuestion = () => {
    if (question) {
      setPhase("question")
    } else {
      // If no question available, mark as completed and update progress
      updateArticleProgress(article.id, true, true)
      onComplete(true)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return // Prevent changing answer after selection

    setSelectedAnswer(answerIndex)
    const correct = question?.correct_answer === answerIndex
    setIsCorrect(correct)
    setPhase("result")

    // Auto-advance after showing result
    setTimeout(() => {
      // Update article progress and unlock next article
      updateArticleProgress(article.id, true, correct || false)
      onComplete(correct || false)
    }, 3000)
  }

  const handleNext = () => {
    // Update article progress and unlock next article
    updateArticleProgress(article.id, true, isCorrect || false)
    onComplete(isCorrect || false)
  }

  if (phase === "reading") {
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
              Artículo {article.number}
            </Badge>
          </div>

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

              <div className="text-center">
                <Button size="lg" onClick={handleContinueToQuestion} className="px-8 py-3 text-lg">
                  Continuar a la Pregunta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
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
