import { constitutionData } from "./constitution-data"

export interface UserStats {
  totalQuestionsAnswered: number
  correctAnswers: number
  overallAccuracy: number
  studyStreak: number
  totalStudyTime: number // in minutes
  examsCompleted: number
  averageExamScore: number
  articlesCompleted: number
  totalArticles: number
  weakestTopics: string[]
  strongestTopics: string[]
}

export interface ArticleStats {
  articleNumber: number
  title: string
  attempts: number
  correctAnswers: number
  accuracy: number
  lastStudied?: Date
  mastery: "weak" | "moderate" | "strong"
}

export interface TitleStats {
  titleId: string
  titleName: string
  articlesCompleted: number
  totalArticles: number
  averageAccuracy: number
  totalAttempts: number
  mastery: "weak" | "moderate" | "strong"
}

// Mock user statistics
export const mockUserStats: UserStats = {
  totalQuestionsAnswered: 156,
  correctAnswers: 118,
  overallAccuracy: 76,
  studyStreak: 7,
  totalStudyTime: 340, // minutes
  examsCompleted: 4,
  averageExamScore: 78,
  articlesCompleted: 8,
  totalArticles: 73,
  weakestTopics: ["Título II - De la Corona", "Título III - De las Cortes Generales"],
  strongestTopics: ["Título Preliminar", "Título I - Derechos fundamentales"],
}

// Generate article statistics from constitution data
export function generateArticleStats(): ArticleStats[] {
  return constitutionData.flatMap((title) =>
    title.articles.map((article) => {
      const accuracy = article.attempts > 0 ? Math.round((article.correctAnswers / article.attempts) * 100) : 0
      let mastery: "weak" | "moderate" | "strong" = "weak"

      if (accuracy >= 80) mastery = "strong"
      else if (accuracy >= 60) mastery = "moderate"

      return {
        articleNumber: article.number,
        title: article.title,
        attempts: article.attempts,
        correctAnswers: article.correctAnswers,
        accuracy,
        lastStudied: article.completed ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        mastery,
      }
    }),
  )
}

// Generate title statistics
export function generateTitleStats(): TitleStats[] {
  return constitutionData.map((title) => {
    const completedArticles = title.articles.filter((a) => a.completed).length
    const totalAttempts = title.articles.reduce((sum, a) => sum + a.attempts, 0)
    const totalCorrect = title.articles.reduce((sum, a) => sum + a.correctAnswers, 0)
    const averageAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

    let mastery: "weak" | "moderate" | "strong" = "weak"
    if (averageAccuracy >= 80) mastery = "strong"
    else if (averageAccuracy >= 60) mastery = "moderate"

    return {
      titleId: title.id,
      titleName: title.title,
      articlesCompleted: completedArticles,
      totalArticles: title.articles.length,
      averageAccuracy,
      totalAttempts,
      mastery,
    }
  })
}

export function getMasteryColor(mastery: "weak" | "moderate" | "strong"): string {
  switch (mastery) {
    case "strong":
      return "text-accent bg-accent/10 border-accent"
    case "moderate":
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case "weak":
      return "text-destructive bg-destructive/10 border-destructive"
  }
}

export function getMasteryLabel(mastery: "weak" | "moderate" | "strong"): string {
  switch (mastery) {
    case "strong":
      return "Dominado"
    case "moderate":
      return "En progreso"
    case "weak":
      return "Necesita repaso"
  }
}

// Study streak calculation
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "¡Comienza tu racha de estudio hoy!"
  if (streak === 1) return "¡Buen comienzo! Sigue así mañana."
  if (streak < 7) return `¡Llevas ${streak} días seguidos! La constancia es clave.`
  if (streak < 30) return `¡Increíble! ${streak} días de estudio consecutivos.`
  return `¡Eres imparable! ${streak} días seguidos dominando la Constitución.`
}
