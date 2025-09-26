"use client"

import { useCallback, useRef } from 'react'
import { useLocalStorageObject } from './hooks/useLocalStorage'

// Tipos para el progreso del usuario
export interface ArticleProgress {
  articleNumber: number
  titleId: string
  completed: boolean
  completedAt?: Date
  studyTimeSeconds: number
  timesStudied: number
  lastStudiedAt?: Date
}

export interface UserProgress {
  // Progreso de artículos
  articles: { [articleNumber: number]: ArticleProgress }

  // Estadísticas generales
  totalStudyTime: number // en segundos
  totalArticlesStudied: number
  studyStreak: number // días consecutivos
  lastStudyDate?: Date

  // Preferencias del usuario
  settings: {
    autoMarkCompleted: boolean // Auto-marcar como completado tras cierto tiempo
    studyTimeThreshold: number // Segundos para considerar "estudiado" (default: 60)
    showProgress: boolean // Mostrar barra de progreso
    soundEnabled: boolean // Sonidos de logros
  }

  // Sesión actual
  currentSession: {
    startTime?: Date
    articlesStudiedToday: number
    timeStudiedToday: number
  }
}

// Valor inicial por defecto
export const defaultUserProgress: UserProgress = {
  articles: {},
  totalStudyTime: 0,
  totalArticlesStudied: 0,
  studyStreak: 0,
  settings: {
    autoMarkCompleted: true,
    studyTimeThreshold: 60, // 1 minuto
    showProgress: true,
    soundEnabled: true
  },
  currentSession: {
    articlesStudiedToday: 0,
    timeStudiedToday: 0
  }
}

const PROGRESS_STORAGE_KEY = 'constimaster-user-progress'

/**
 * Hook principal para gestionar el progreso del usuario
 */
export function useUserProgress() {
  const [
    progress,
    setProgress,
    removeProgress,
    isInitialized,
    updateProperty,
    updateProperties
  ] = useLocalStorageObject(PROGRESS_STORAGE_KEY, defaultUserProgress)

  const hasInitializedSession = useRef(false)

  // Función para marcar un artículo como completado
  const markArticleCompleted = (articleNumber: number, titleId: string, studyTime: number = 0) => {
    const now = new Date()

    setProgress(current => {
      const existingArticle = current.articles[articleNumber] || {
        articleNumber,
        titleId,
        completed: false,
        studyTimeSeconds: 0,
        timesStudied: 0
      }

      const wasAlreadyCompleted = existingArticle.completed

      const updatedArticle: ArticleProgress = {
        ...existingArticle,
        completed: true,
        completedAt: existingArticle.completedAt || now,
        studyTimeSeconds: existingArticle.studyTimeSeconds + studyTime,
        timesStudied: existingArticle.timesStudied + 1,
        lastStudiedAt: now
      }

      return {
        ...current,
        articles: {
          ...current.articles,
          [articleNumber]: updatedArticle
        },
        totalStudyTime: current.totalStudyTime + studyTime,
        totalArticlesStudied: wasAlreadyCompleted ? current.totalArticlesStudied : current.totalArticlesStudied + 1,
        lastStudyDate: now,
        currentSession: {
          ...current.currentSession,
          articlesStudiedToday: current.currentSession.articlesStudiedToday + (wasAlreadyCompleted ? 0 : 1),
          timeStudiedToday: current.currentSession.timeStudiedToday + studyTime
        }
      }
    })

    console.log(`📖 Artículo ${articleNumber} marcado como completado (${studyTime}s de estudio)`)
  }

  // Función para agregar tiempo de estudio sin marcar como completado
  const addStudyTime = (articleNumber: number, titleId: string, studyTime: number) => {
    const now = new Date()

    setProgress(current => {
      const existingArticle = current.articles[articleNumber] || {
        articleNumber,
        titleId,
        completed: false,
        studyTimeSeconds: 0,
        timesStudied: 0
      }

      const updatedArticle: ArticleProgress = {
        ...existingArticle,
        studyTimeSeconds: existingArticle.studyTimeSeconds + studyTime,
        timesStudied: existingArticle.timesStudied + 1,
        lastStudiedAt: now
      }

      // Auto-completar si supera el threshold y está habilitado
      const shouldAutoComplete =
        current.settings.autoMarkCompleted &&
        !existingArticle.completed &&
        updatedArticle.studyTimeSeconds >= current.settings.studyTimeThreshold

      if (shouldAutoComplete) {
        updatedArticle.completed = true
        updatedArticle.completedAt = now
      }

      return {
        ...current,
        articles: {
          ...current.articles,
          [articleNumber]: updatedArticle
        },
        totalStudyTime: current.totalStudyTime + studyTime,
        totalArticlesStudied: shouldAutoComplete ? current.totalArticlesStudied + 1 : current.totalArticlesStudied,
        lastStudyDate: now,
        currentSession: {
          ...current.currentSession,
          articlesStudiedToday: shouldAutoComplete ? current.currentSession.articlesStudiedToday + 1 : current.currentSession.articlesStudiedToday,
          timeStudiedToday: current.currentSession.timeStudiedToday + studyTime
        }
      }
    })

    console.log(`⏱️ +${studyTime}s de estudio agregados al artículo ${articleNumber}`)
  }

  // Función para obtener el progreso de un artículo específico
  const getArticleProgress = (articleNumber: number): ArticleProgress | null => {
    return progress.articles[articleNumber] || null
  }

  // Función para calcular estadísticas por título
  const getTitleStatistics = (titleId: string) => {
    const titleArticles = Object.values(progress.articles).filter(
      article => article.titleId === titleId
    )

    const completed = titleArticles.filter(article => article.completed).length
    const totalStudyTime = titleArticles.reduce((sum, article) => sum + article.studyTimeSeconds, 0)

    return {
      articlesStudied: titleArticles.length,
      articlesCompleted: completed,
      totalStudyTime,
      completionPercentage: titleArticles.length > 0 ? Math.round((completed / titleArticles.length) * 100) : 0
    }
  }

  // Función para actualizar configuración
  const updateSettings = (newSettings: Partial<UserProgress['settings']>) => {
    updateProperty('settings', { ...progress.settings, ...newSettings })
  }

  // Función para inicializar sesión diaria
  const initializeDailySession = useCallback(() => {
    if (hasInitializedSession.current) return

    const today = new Date()
    const lastStudyDate = progress.lastStudyDate ? new Date(progress.lastStudyDate) : null

    // Verificar si es un nuevo día
    const isNewDay = !lastStudyDate ||
      lastStudyDate.toDateString() !== today.toDateString()

    if (isNewDay) {
      hasInitializedSession.current = true

      // Calcular nueva racha
      let newStreak = progress.studyStreak
      if (lastStudyDate) {
        const daysDifference = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDifference === 1) {
          newStreak += 1 // Día consecutivo
        } else if (daysDifference > 1) {
          newStreak = 1 // Racha rota, empezar nueva
        }
        // Si daysDifference === 0, mismo día, mantener racha
      } else {
        newStreak = 1 // Primera vez
      }

      updateProperties({
        studyStreak: newStreak,
        currentSession: {
          startTime: today,
          articlesStudiedToday: 0,
          timeStudiedToday: 0
        }
      })

      console.log(`🔥 Sesión iniciada - Racha: ${newStreak} días`)
    } else {
      hasInitializedSession.current = true
    }
  }, [progress.lastStudyDate, progress.studyStreak, updateProperties])

  // Función para resetear progreso (para testing)
  const resetProgress = () => {
    setProgress(defaultUserProgress)
    console.log('🔄 Progreso reseteado')
  }

  return {
    // Estado
    progress,
    isInitialized,

    // Acciones
    markArticleCompleted,
    addStudyTime,
    getArticleProgress,
    getTitleStatistics,
    updateSettings,
    initializeDailySession,
    resetProgress,

    // Acceso directo a datos comunes
    totalArticlesStudied: progress.totalArticlesStudied,
    totalStudyTime: progress.totalStudyTime,
    studyStreak: progress.studyStreak,
    settings: progress.settings,
    currentSession: progress.currentSession
  }
}

/**
 * Función utilitaria para formatear tiempo de estudio
 */
export function formatStudyTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
}

/**
 * Función para calcular nivel del usuario basado en artículos estudiados
 */
export function calculateUserLevel(articlesStudied: number): { level: number; title: string; nextLevelAt: number } {
  const levels = [
    { level: 1, title: "Principiante", articlesRequired: 0 },
    { level: 2, title: "Estudiante", articlesRequired: 10 },
    { level: 3, title: "Conocedor", articlesRequired: 25 },
    { level: 4, title: "Experto", articlesRequired: 50 },
    { level: 5, title: "Maestro", articlesRequired: 100 },
    { level: 6, title: "Constitucionalista", articlesRequired: 169 } // Todos los artículos
  ]

  let currentLevel = levels[0]
  let nextLevel = levels[1]

  for (let i = 0; i < levels.length; i++) {
    if (articlesStudied >= levels[i].articlesRequired) {
      currentLevel = levels[i]
      nextLevel = levels[i + 1] || levels[i] // Si es el último nivel, mantener el mismo
    } else {
      break
    }
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelAt: nextLevel.articlesRequired
  }
}