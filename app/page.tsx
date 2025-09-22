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
import { initializeProgressState } from "@/lib/constitution-data"
import { clearStudyPosition } from "@/lib/navigation-state"

type AppState = "main" | "studying" | "exam" | "exam-results"

export default function HomePage() {
  const [activeSection, setActiveSection] = useState("articulos")
  const [appState, setAppState] = useState<AppState>("main")
  const [studyingArticle, setStudyingArticle] = useState<Article | null>(null)
  const [examData, setExamData] = useState<{ questions: ExamQuestion[]; title: string } | null>(null)
  const [examResults, setExamResults] = useState<any>(null)

  // Initialize progress state on component mount
  useEffect(() => {
    initializeProgressState()
  }, [])

  // Limpiar posición de estudio cuando el usuario cambie de sección (excepto artículos)
  useEffect(() => {
    if (activeSection !== "articulos") {
      clearStudyPosition()
    }
  }, [activeSection])

  const handleStartArticle = (article: Article) => {
    setStudyingArticle(article)
    setAppState("studying")
  }

  const handleStudyComplete = (success: boolean) => {
    console.log(`Study completed for article ${studyingArticle?.number}: ${success ? "Success" : "Failed"}`)
    setStudyingArticle(null)
    setAppState("main")
  }

  const handleStartExam = (questions: ExamQuestion[], title: string) => {
    setExamData({ questions, title })
    setAppState("exam")
  }

  const handleExamComplete = (results: any) => {
    setExamResults(results)
    setAppState("exam-results")
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

  // Render different app states
  if (appState === "studying" && studyingArticle) {
    return <StudyFlow article={studyingArticle} onComplete={handleStudyComplete} onBack={handleBackToMain} />
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
      />
    )
  }

  // Main app with sidebar
  const renderContent = () => {
    switch (activeSection) {
      case "articulos":
        return <ArticulosView onStartArticle={handleStartArticle} />
      case "examenes":
        return <ExamenesView onStartExam={handleStartExam} />
      case "estadisticas":
        return <EstadisticasView />
      case "perfil":
        return <PerfilView />
      default:
        return <ArticulosView onStartArticle={handleStartArticle} />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-auto">{renderContent()}</main>
    </div>
  )
}
