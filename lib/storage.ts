import type { Article } from "./constitution-data"

const STORAGE_KEY = "constimaster_progress"

export interface UserProgress {
  articles: Record<number, {
    completed: boolean
    available: boolean
    attempts: number
    correctAnswers: number
    lastStudied?: string
  }>
  globalStats: {
    totalArticlesCompleted: number
    totalAttempts: number
    totalCorrectAnswers: number
    studyStartDate?: string
    lastActivityDate?: string
  }
  settings: {
    autoAdvance: boolean
    studyReminders: boolean
    darkMode?: boolean
  }
}

export function loadUserProgress(): UserProgress | null {
  try {
    if (typeof window === "undefined") return null

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    return JSON.parse(stored) as UserProgress
  } catch (error) {
    console.error("Error loading user progress:", error)
    return null
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    if (typeof window === "undefined") return

    progress.globalStats.lastActivityDate = new Date().toISOString()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error("Error saving user progress:", error)
  }
}

export function initializeUserProgress(): UserProgress {
  const now = new Date().toISOString()
  return {
    articles: {},
    globalStats: {
      totalArticlesCompleted: 0,
      totalAttempts: 0,
      totalCorrectAnswers: 0,
      studyStartDate: now,
      lastActivityDate: now,
    },
    settings: {
      autoAdvance: true,
      studyReminders: false,
      darkMode: false,
    }
  }
}

export function updateArticleInStorage(
  articleId: number,
  completed: boolean,
  attempts: number,
  correctAnswers: number
): void {
  const progress = loadUserProgress() || initializeUserProgress()

  progress.articles[articleId] = {
    completed,
    available: true,
    attempts,
    correctAnswers,
    lastStudied: new Date().toISOString(),
  }

  // Update global stats
  if (completed) {
    progress.globalStats.totalArticlesCompleted = Object.values(progress.articles)
      .filter(article => article.completed).length
  }

  progress.globalStats.totalAttempts = Object.values(progress.articles)
    .reduce((sum, article) => sum + article.attempts, 0)

  progress.globalStats.totalCorrectAnswers = Object.values(progress.articles)
    .reduce((sum, article) => sum + article.correctAnswers, 0)

  saveUserProgress(progress)
}

export function getArticleProgress(articleId: number) {
  const progress = loadUserProgress()
  return progress?.articles[articleId] || null
}

export function resetProgress(): void {
  try {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Error resetting progress:", error)
  }
}

export function exportProgressAsJSON(): string {
  const progress = loadUserProgress()
  return JSON.stringify(progress, null, 2)
}

export function importProgressFromJSON(jsonData: string): boolean {
  try {
    const progress = JSON.parse(jsonData) as UserProgress
    saveUserProgress(progress)
    return true
  } catch (error) {
    console.error("Error importing progress:", error)
    return false
  }
}