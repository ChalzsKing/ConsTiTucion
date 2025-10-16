"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Clock, CheckCircle2, XCircle, Trophy, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExamQuestion } from "@/lib/exam-data"
import { calculateScore, saveExamResult } from "@/lib/exam-data"
import { useStatistics } from "@/lib/hooks/useStatistics"
import { useAchievements } from "@/lib/hooks/useAchievements"

interface ExamFlowProps {
  questions: ExamQuestion[]
  examTitle: string
  onComplete: (results: any) => void
  onBack: () => void
}

export function ExamFlow({ questions, examTitle, onComplete, onBack }: ExamFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>(questions)
  const [startTime] = useState(Date.now())
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const { saveExamResult: saveToSupabase } = useStatistics()
  const { addXP, checkAllAchievements } = useAchievements()

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  const currentQuestion = examQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / examQuestions.length) * 100

  // Safety check - if currentQuestion or options are not available, show loading
  if (!currentQuestion || !currentQuestion.options || !Array.isArray(currentQuestion.options)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
              <p>Cargando pregunta...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const updatedQuestions = [...examQuestions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answerIndex,
    }
    setExamQuestions(updatedQuestions)

    // Auto-advance to next question or complete exam
    setTimeout(() => {
      if (currentQuestionIndex < examQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        completeExam(updatedQuestions)
      }
    }, 1000)
  }

  const completeExam = async (finalQuestions: ExamQuestion[]) => {
    setIsCompleted(true)
    const results = calculateScore(finalQuestions)

    // Save exam result to localStorage
    try {
      const examResult = saveExamResult({
        type: examTitle.includes("General") ? "general" : "title",
        titleId: examTitle.includes("General") ? undefined : extractTitleId(examTitle),
        questions: results.questionsWithResults,
        score: results.score,
        totalQuestions: results.questionsWithResults.length,
        percentage: results.percentage,
        timeSpent: timeElapsed
      })
      console.log('✅ Exam result saved to localStorage:', examResult.id)
    } catch (error) {
      console.error('❌ Error saving exam result to localStorage:', error)
    }

    // Also save to Supabase for statistics
    try {
      await saveToSupabase({
        exam_type: examTitle.includes("General") ? "general" : "title",
        exam_identifier: examTitle.includes("General") ? "general" : extractTitleId(examTitle),
        title_name: examTitle,
        total_questions: results.questionsWithResults.length,
        correct_answers: results.score,
        incorrect_answers: results.questionsWithResults.length - results.score,
        score_percentage: results.percentage,
        time_taken_seconds: timeElapsed,
        questions_data: results.questionsWithResults
      })
      console.log('✅ Exam result saved to Supabase')
    } catch (error) {
      console.error('❌ Error saving exam result to Supabase:', error)
    }

    // 🎮 Gamificación: Añadir XP por completar examen
    try {
      const percentage = results.percentage

      // XP base por completar el examen
      let xpEarned = 20

      // Bonus por porcentaje de acierto
      if (percentage >= 100) {
        xpEarned += 200 // Perfect score
      } else if (percentage >= 90) {
        xpEarned += 100 // Excelente
      } else if (percentage >= 75) {
        xpEarned += 50 // Notable
      } else if (percentage >= 50) {
        xpEarned += 25 // Aprobado
      }

      // XP adicional por cada respuesta correcta
      xpEarned += results.score * 5

      // Añadir XP
      await addXP(
        xpEarned,
        percentage >= 50 ? 'exam_passed' : 'exam_completed',
        examTitle.includes("General") ? "general" : extractTitleId(examTitle) || "unknown"
      )

      // Verificar logros
      await checkAllAchievements()

      console.log(`✅ Gamification: +${xpEarned} XP awarded for exam (${percentage}%)`)
    } catch (error) {
      console.error('❌ Error adding XP for exam:', error)
    }

    setTimeout(() => {
      onComplete({
        ...results,
        timeSpent: timeElapsed,
        examTitle,
      })
    }, 2000)
  }

  // Helper function to extract title ID from exam title
  const extractTitleId = (title: string): string | undefined => {
    // Extract title ID from exam title like "Examen: Título III"
    const match = title.match(/Título\s+(I{1,3}|IV|V|VI{1,3}|IX?|X)/i)
    if (match) {
      const romanToId: { [key: string]: string } = {
        'I': 'titulo1',
        'II': 'titulo2',
        'III': 'titulo3',
        'IV': 'titulo4',
        'V': 'titulo5',
        'VI': 'titulo6',
        'VII': 'titulo7',
        'VIII': 'titulo8',
        'IX': 'titulo9',
        'X': 'titulo10'
      }
      return romanToId[match[1].toUpperCase()]
    }
    return undefined
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isCompleted) {
    const results = calculateScore(examQuestions)

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl">¡Examen Completado!</CardTitle>
              </div>
              <p className="text-muted-foreground">Procesando resultados...</p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-2xl font-bold text-primary">{results.score}</div>
                  <div className="text-sm text-muted-foreground">Respuestas correctas</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-accent">{results.percentage}%</div>
                  <div className="text-sm text-muted-foreground">Puntuación</div>
                </Card>
                <Card className="p-4">
                  <div className="text-2xl font-bold text-muted-foreground">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-muted-foreground">Tiempo empleado</div>
                </Card>
              </div>

              <div className="animate-pulse">
                <div className="w-8 h-8 bg-primary rounded-full mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Salir del examen
            </Button>
            <Badge variant="outline">{examTitle}</Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {formatTime(timeElapsed)}
            </div>
            <Badge variant="secondary">
              {currentQuestionIndex + 1} de {examQuestions.length}
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progreso del examen</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="outline" className="gap-2">
                <Target className="w-4 h-4" />
                Pregunta {currentQuestionIndex + 1}
              </Badge>
              {currentQuestion.articleNumber && (
                <Badge variant="secondary">Artículo {currentQuestion.articleNumber}</Badge>
              )}
            </div>
            <CardTitle className="text-xl text-left">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = currentQuestion.userAnswer === index
                const isCorrect = index === currentQuestion.correctAnswer
                const showResult = currentQuestion.userAnswer !== undefined

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={cn(
                      "h-auto p-4 text-left justify-start text-wrap whitespace-normal transition-all",
                      !showResult && "hover:bg-primary/10 hover:border-primary",
                      showResult && isCorrect && "bg-accent/10 border-accent text-accent-foreground",
                      showResult &&
                        isSelected &&
                        !isCorrect &&
                        "bg-destructive/10 border-destructive text-destructive-foreground",
                      !showResult && "cursor-pointer",
                    )}
                    onClick={() => currentQuestion.userAnswer === undefined && handleAnswerSelect(index)}
                    disabled={currentQuestion.userAnswer !== undefined}
                  >
                    <span className="font-semibold mr-3 text-primary">{String.fromCharCode(65 + index)}.</span>
                    <span className="flex-1">{option}</span>
                    {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-accent ml-2" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive ml-2" />}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
