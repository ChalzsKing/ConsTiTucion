"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ArticulosView } from "@/components/articulos-view"
import { StudyFlow } from "@/components/study-flow"
import { ExamenesView } from "@/components/examenes-view"
import { ExamFlow } from "@/components/exam-flow"
import { ExamResults } from "@/components/exam-results"
import { EstadisticasView } from "@/components/estadisticas-view"
import { PerfilView } from "@/components/perfil-view"
import type { Article } from "@/lib/constitution-data"
import type { ExamQuestion } from "@/lib/exam-data"
// IMPORTS LEGACY COMENTADOS - Ahora usamos sistema unificado
import { constitutionData } from "@/lib/constitution-data"
// import { initializeProgressState, clearStudyPosition } from "@/lib/navigation-state"
// import { useUserProgress } from "@/lib/user-progress"
// import { useOnlineSync } from "@/lib/hooks/useOnlineStatus"
// import { useSupabaseSync } from "@/lib/supabase-sync"
import { AuthProvider } from "@/lib/auth/auth-context"
// import { debugSyncData, forceSync, verifyDataConsistency } from "@/lib/force-sync"
// import { supabase } from "@/lib/supabase-client"

type AppState = "main" | "studying" | "exam" | "exam-results"

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("articulos")
  const [appState, setAppState] = useState<AppState>("main")
  const [studyingArticle, setStudyingArticle] = useState<Article | null>(null)
  const [examData, setExamData] = useState<{ questions: ExamQuestion[]; title: string } | null>(null)
  const [examResults, setExamResults] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0) // Key para forzar refresh

  // HOOKS LEGACY DESACTIVADOS - Ahora usamos useUnifiedProgress
  // const { initializeDailySession } = useUserProgress()
  // const { smartSync } = useSupabaseSync()
  // const { isOnline } = useOnlineSync(() => {
  //   // Auto-sync cuando se restaura la conexión
  //   smartSync()
  // })

  // Initialize progress state on component mount
  useEffect(() => {
    // SISTEMA LEGACY DESACTIVADO - Ahora usamos useUnifiedProgress
    // const { cleanAndMigrateLocalStorage } = require('@/lib/data-migration')
    // cleanAndMigrateLocalStorage()

    // initializeProgressState()
    // initializeDailySession()

    // Intentar sincronización inicial si hay conexión
    // if (isOnline) {
    //   smartSync()
    // }

    console.log('🎯 Usando sistema unificado - Legacy desactivado')

    // DEBUG FUNCTIONS DESACTIVADAS - Usar hook unificado
    // if (typeof window !== 'undefined') {
    //   (window as any).debugSyncData = debugSyncData;
    //   (window as any).forceSync = forceSync;
    //   (window as any).verifyDataConsistency = verifyDataConsistency;
    //   (window as any).supabase = supabase;
    // }
  }, []) // Dependencias removidas - sistema legacy desactivado

  // FUNCIÓN LEGACY DESACTIVADA - clearStudyPosition puede causar efectos secundarios
  // useEffect(() => {
  //   if (activeSection !== "articulos") {
  //     clearStudyPosition()
  //   }
  // }, [activeSection])

  const handleStartArticle = (article: Article) => {
    setStudyingArticle(article)
    setAppState("studying")
  }

  const handleStudyComplete = (success: boolean) => {
    console.log(`Study completed for article ${studyingArticle?.number}: ${success ? "Success" : "Failed"}`)
    setStudyingArticle(null)
    setAppState("main")
    // Forzar refresh de datos
    setRefreshKey(prev => prev + 1)
  }

  const handleStartExam = (questions: ExamQuestion[], title: string) => {
    setExamData({ questions, title })
    setAppState("exam")
  }

  const handleExamComplete = (results: any) => {
    setExamResults(results)
    setAppState("exam-results")
    // Forzar refresh de datos después del examen
    setRefreshKey(prev => prev + 1)
  }

  const handleBackToMain = () => {
    setAppState("main")
    setStudyingArticle(null)
    setExamData(null)
    setExamResults(null)
  }

  const handleViewStats = () => {
    setActiveSection("estadisticas")
    setAppState("main")
    setExamResults(null)
  }

  const handleRetakeExam = async () => {
    if (examResults && examData) {
      try {
        // Regenerate fresh questions for the same exam type
        let newQuestions: ExamQuestion[] = []

        if (examData.title.includes("General")) {
          // Import function dynamically to avoid circular dependencies
          const { generateGeneralExam } = await import("@/lib/exam-data")
          newQuestions = await generateGeneralExam(20)
        } else {
          // Extract title ID for specific title exams
          const titleMatch = examData.title.match(/Título\s+(I{1,3}|IV|V|VI{1,3}|IX?)/i)
          if (titleMatch) {
            const { generateTitleExam } = await import("@/lib/exam-data")
            const romanToId: { [key: string]: string } = {
              'I': 'titulo1', 'II': 'titulo2', 'III': 'titulo3',
              'IV': 'titulo4', 'V': 'titulo5', 'VI': 'titulo6',
              'VII': 'titulo7', 'VIII': 'titulo8', 'IX': 'titulo9', 'X': 'titulo10'
            }
            const titleId = romanToId[titleMatch[1].toUpperCase()]
            if (titleId) {
              newQuestions = await generateTitleExam(titleId, 10)
            }
          }
        }

        if (newQuestions.length > 0) {
          setExamData({
            questions: newQuestions,
            title: examData.title
          })
          setExamResults(null)
          setAppState("exam")
        } else {
          console.warn("No se pudieron generar nuevas preguntas")
        }
      } catch (error) {
        console.error("Error al regenerar examen:", error)
        // Fallback: usar las preguntas existentes
        setExamResults(null)
        setAppState("exam")
      }
    }
  }

  const handleStudyMistakes = () => {
    if (examResults) {
      // Create a new exam with only the incorrect questions
      const incorrectQuestions = examResults.incorrectAnswers.map((q: any) => ({
        ...q,
        userAnswer: undefined, // Reset user answer
        isCorrect: undefined   // Reset correctness flag
      }))

      if (incorrectQuestions.length > 0) {
        setExamData({
          questions: incorrectQuestions,
          title: `Repaso de Errores: ${examResults.examTitle}`
        })
        setExamResults(null)
        setAppState("exam")
      }
    }
  }

  const handleNavigateToArticle = (articleNumber: number) => {
    // Buscar el artículo por número en los datos de la constitución
    const allArticles = constitutionData.flatMap(title => title.articles)
    const targetArticle = allArticles.find(article => article.number === articleNumber)

    if (targetArticle) {
      setStudyingArticle(targetArticle)
    }
  }

  // Render different app states
  if (appState === "studying" && studyingArticle) {
    return (
      <StudyFlow
        article={studyingArticle}
        onComplete={handleStudyComplete}
        onBack={handleBackToMain}
        onNavigateToArticle={handleNavigateToArticle}
      />
    )
  }

  if (appState === "exam" && examData) {
    return (
      <ExamFlow
        questions={examData.questions}
        examTitle={examData.title}
        onComplete={handleExamComplete}
        onBack={handleBackToMain}
      />
    )
  }

  if (appState === "exam-results" && examResults) {
    return (
      <ExamResults
        results={examResults}
        onBackToExams={() => {
          setActiveSection("examenes")
          handleBackToMain()
        }}
        onViewStats={handleViewStats}
        onRetakeExam={handleRetakeExam}
        onStudyMistakes={handleStudyMistakes}
      />
    )
  }

  // Main app with sidebar
  const renderContent = () => {
    switch (activeSection) {
      case "articulos":
        return <ArticulosView key={refreshKey} onStartArticle={handleStartArticle} onStartExam={handleStartExam} />
      case "examenes":
        return <ExamenesView onStartExam={handleStartExam} />
      case "estadisticas":
        return <EstadisticasView key={refreshKey} />
      case "perfil":
        return <PerfilView />
      default:
        return <ArticulosView key={refreshKey} onStartArticle={handleStartArticle} onStartExam={handleStartExam} />
    }
  }

  return (
    <AuthProvider>
      <div className="flex h-screen bg-background">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 overflow-auto">{renderContent()}</main>
      </div>
    </AuthProvider>
  )
}
