"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Play, Trophy, Target, BookOpen, Globe } from "lucide-react"
import { constitutionData } from "@/lib/constitution-data"
import { generateTitleExam, generateGeneralExam, type ExamQuestion } from "@/lib/exam-data"
import { isTitleAvailable } from "@/lib/title-mapping"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { PaywallModal } from "@/components/subscription/PaywallModal"
import { UsageMeter } from "@/components/subscription/UsageMeter"
import { AuthRequiredCard } from "@/components/subscription/AuthRequiredCard"
import { useAuth } from "@/lib/auth/auth-context"

interface ExamenesViewProps {
  onStartExam?: (questions: ExamQuestion[], title: string) => void
}

export function ExamenesView({ onStartExam }: ExamenesViewProps) {
  const { user } = useAuth()
  const [selectedExamType, setSelectedExamType] = useState<string | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [paywallType, setPaywallType] = useState<'general' | 'title'>('general')
  const [paywallTitleName, setPaywallTitleName] = useState<string>('')

  const {
    canTakeGeneralExam,
    canTakeTitleExam,
    incrementGeneralExamCount,
    incrementTitleExamCount,
    isPro
  } = useSubscription()

  const handleStartTitleExam = async (titleId: string, titleName: string) => {
    // Debug
    console.log('🔍 handleStartTitleExam:', {
      titleId,
      canTake: canTakeTitleExam(titleId),
      isPro: isPro()
    })

    // Verificar límites antes de iniciar
    if (!canTakeTitleExam(titleId)) {
      console.log('❌ No puede hacer examen de título')
      setPaywallType('title')
      setPaywallTitleName(titleName)
      setShowPaywall(true)
      return
    }

    console.log('✅ Puede hacer examen de título')

    try {
      setSelectedExamType(titleId)
      const questions = await generateTitleExam(titleId, 10)
      if (questions.length > 0 && onStartExam) {
        // Incrementar contador ANTES de iniciar el examen (para usuarios FREE)
        try {
          await incrementTitleExamCount(titleId)
        } catch (error) {
          console.error('Error incrementing title exam count:', error)
        }
        onStartExam(questions, `Examen: ${titleName}`)
      } else {
        console.warn(`No questions available for title: ${titleName}`)
      }
    } catch (error) {
      console.error('Error starting title exam:', error)
    } finally {
      setSelectedExamType(null)
    }
  }

  const handleStartGeneralExam = async () => {
    // Debug
    console.log('🔍 handleStartGeneralExam:', {
      canTake: canTakeGeneralExam(),
      isPro: isPro()
    })

    // Verificar límites antes de iniciar
    if (!canTakeGeneralExam()) {
      console.log('❌ No puede hacer examen general')
      setPaywallType('general')
      setShowPaywall(true)
      return
    }

    console.log('✅ Puede hacer examen general')

    try {
      setSelectedExamType('general')
      const questions = await generateGeneralExam(20)
      if (questions.length > 0 && onStartExam) {
        // Incrementar contador ANTES de iniciar el examen (para usuarios FREE)
        try {
          await incrementGeneralExamCount()
        } catch (error) {
          console.error('Error incrementing general exam count:', error)
        }
        onStartExam(questions, "Examen General de la Constitución")
      } else {
        console.warn('No questions available for general exam')
      }
    } catch (error) {
      console.error('Error starting general exam:', error)
    } finally {
      setSelectedExamType(null)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Exámenes</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Pon a prueba tus conocimientos con exámenes personalizados. Practica por títulos específicos o desafíate con
          un examen general.
        </p>
      </div>

      {/* Si NO está autenticado, mostrar mensaje de registro */}
      {!user ? (
        <AuthRequiredCard />
      ) : (
        <>
          {/* Usage Meter - Solo para usuarios FREE autenticados */}
          {!isPro() && (
            <div className="mb-4 md:mb-6">
              <UsageMeter />
            </div>
          )}

          <div className="grid gap-4 md:gap-8">
            {/* Quick Start */}
            <Card className="shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  Examen Rápido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-muted-foreground">
                  Comienza inmediatamente con un examen general de 20 preguntas aleatorias.
                </p>
                <Button
                  size="lg"
                  onClick={handleStartGeneralExam}
                  className="gap-2 w-full md:w-auto text-sm md:text-base"
                  disabled={selectedExamType === 'general'}
                >
                  <Globe className="w-4 h-4 md:w-5 md:h-5" />
                  {selectedExamType === 'general' ? 'Generando preguntas...' : 'Iniciar Examen General'}
                </Button>
              </CardContent>
            </Card>

            {/* Exam by Title */}
            <Card className="shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  Exámenes por Título
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  Practica sobre títulos específicos de la Constitución. Cada examen incluye 10 preguntas del título
                  seleccionado.
                </p>
                <div className="grid gap-3 md:gap-4">
                  {constitutionData.map((title) => {
                    const completedArticles = title.articles.filter((a) => a.completed).length
                    const totalArticles = title.articles.length
                    const progress = Math.round((completedArticles / totalArticles) * 100)
                    // Check if this title has questions available using the mapping function
                    const hasQuestions = isTitleAvailable(title.id)

                    return (
                      <Card
                        key={title.id}
                        className={`transition-all ${hasQuestions ? "hover:shadow-md cursor-pointer" : "opacity-60"}`}
                      >
                        <CardContent className="p-3 md:p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base md:text-lg mb-1">{title.title}</h3>
                              <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">{title.description}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <Target className="w-3 h-3" />
                                  {totalArticles} artículos
                                </Badge>
                                <Badge variant={progress > 0 ? "default" : "outline"} className="text-xs">{progress}% estudiado</Badge>
                                {!hasQuestions && (
                                  <Badge variant="outline" className="text-muted-foreground text-xs">
                                    Próximamente
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="w-full md:w-auto md:ml-4">
                              <Button
                                variant={hasQuestions ? "default" : "ghost"}
                                disabled={!hasQuestions || selectedExamType === title.id}
                                onClick={() => hasQuestions && handleStartTitleExam(title.id, title.title)}
                                className="gap-2 w-full md:w-auto text-xs md:text-sm"
                                size="sm"
                              >
                                <FileText className="w-3 h-3 md:w-4 md:h-4" />
                                {selectedExamType === title.id ? 'Generando...' : hasQuestions ? "Iniciar Examen" : "Próximamente"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Exam History Preview */}
            <Card className="shadow-lg">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 md:gap-3 text-lg md:text-xl">
                  <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  Historial de Exámenes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-center py-6 md:py-8">
                  <Trophy className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                  <p className="text-sm md:text-base text-muted-foreground">
                    Aquí aparecerán tus exámenes completados con sus puntuaciones y estadísticas.
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-2">
                    ¡Completa tu primer examen para comenzar tu historial!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Paywall Modal */}
          <PaywallModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            limitType={paywallType}
            titleName={paywallTitleName}
          />
        </>
      )}
    </div>
  )
}
