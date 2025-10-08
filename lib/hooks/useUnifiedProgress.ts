'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth/auth-context'

/**
 * 🚀 HOOK UNIFICADO DE PROGRESO - ConstiMaster
 *
 * Este hook reemplaza las 4 funciones diferentes que leían progreso:
 * - getOverallProgress() → useUnifiedProgress().overall
 * - getTitleProgress() → useUnifiedProgress().byTitle()
 * - useUserProgress() → useUnifiedProgress().userProgress
 * - useStatistics() → useUnifiedProgress().statistics
 *
 * SINGLE SOURCE OF TRUTH: Solo lee de Supabase user_progress
 */

// ================================
// TIPOS Y INTERFACES
// ================================

export interface ArticleProgress {
  articleNumber: number
  titleId: string
  articleTitle: string
  isCompleted: boolean
  timesStudied: number
  totalStudyTimeSeconds: number
  firstStudiedAt: string | null
  lastStudiedAt: string | null
  completedAt: string | null
}

export interface TitleProgress {
  titleId: string
  titleName: string
  completedArticles: number
  totalArticles: number
  percentage: number
  studyTimeMinutes: number
}

export interface OverallProgress {
  totalArticles: number
  completedArticles: number
  completionPercentage: number
  totalStudyTimeMinutes: number
  titlesProgress: TitleProgress[]
}

export interface ExamHistoryEntry {
  id: number
  user_id: string
  exam_type: 'article' | 'title' | 'general'
  exam_identifier: string | null
  title_name: string | null
  total_questions: number
  correct_answers: number
  incorrect_answers: number
  score_percentage: number
  time_taken_seconds: number | null
  started_at: string | null
  completed_at: string
}

export interface DailyActivity {
  id: number
  user_id: string
  activity_date: string
  articles_studied: number
  exams_taken: number
  questions_answered: number
  correct_answers: number
  study_time_minutes: number
  xp_earned: number
  created_at?: string
  updated_at?: string
}

export interface UnifiedProgressState {
  // Datos
  articles: ArticleProgress[]
  overall: OverallProgress
  statistics: {
    totalArticlesStudied: number
    totalStudyTimeMinutes: number
    currentStreakDays: number
    totalExamsTaken: number
    averageExamScore: number
  }

  // Datos adicionales del sistema de estadísticas
  examHistory: ExamHistoryEntry[]
  dailyActivity: DailyActivity[]

  // Estados
  loading: boolean
  error: string | null
  lastSync: Date | null

  // Acciones
  markArticleCompleted: (articleNumber: number, titleId: string, studyTime?: number) => Promise<boolean>
  getArticleProgress: (articleNumber: number) => ArticleProgress | null
  getTitleProgress: (titleId: string) => TitleProgress | null
  refreshData: () => Promise<void>

  // Funciones de estadísticas unificadas
  getRecentActivity: (days: number) => DailyActivity[]
  getStudyStreak: () => number

  // Cache y sincronización
  invalidateCache: () => void
  syncToSupabase: () => Promise<boolean>
}

// ================================
// MAPEO DE TÍTULOS
// ================================

const TITLE_MAPPING: Record<string, string> = {
  'preliminar': 'Título Preliminar',
  'titulo1': 'Título I - Derechos y Deberes Fundamentales',
  'titulo2': 'Título II - La Corona',
  'titulo3': 'Título III - Las Cortes Generales',
  'titulo4': 'Título IV - Del Gobierno y la Administración',
  'titulo5': 'Título V - Relaciones entre Gobierno y Cortes',
  'titulo6': 'Título VI - Del Poder Judicial',
  'titulo7': 'Título VII - Economía y Hacienda',
  'titulo8': 'Título VIII - Organización Territorial del Estado',
  'disposiciones': 'Disposiciones'
}

const TITLE_ARTICLE_RANGES: Record<string, { start: number, end: number, total: number }> = {
  'preliminar': { start: 1, end: 9, total: 9 },
  'titulo1': { start: 10, end: 55, total: 46 },
  'titulo2': { start: 56, end: 65, total: 10 },
  'titulo3': { start: 66, end: 96, total: 31 },
  'titulo4': { start: 97, end: 107, total: 11 },
  'titulo5': { start: 108, end: 116, total: 9 },
  'titulo6': { start: 117, end: 127, total: 11 },
  'titulo7': { start: 128, end: 136, total: 9 },
  'titulo8': { start: 137, end: 158, total: 22 },
  'disposiciones': { start: 159, end: 169, total: 11 }
}

// ================================
// HOOK PRINCIPAL
// ================================

export function useUnifiedProgress(): UnifiedProgressState {
  const { user } = useAuth()

  // Estados
  const [articles, setArticles] = useState<ArticleProgress[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [examHistory, setExamHistory] = useState<ExamHistoryEntry[]>([])
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // ================================
  // FUNCIONES DE CARGA DE DATOS
  // ================================

  const loadProgressData = useCallback(async () => {
    if (!user) {
      setArticles([])
      setStatistics(null)
      setExamHistory([])
      setDailyActivity([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Cargar progreso de artículos
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('article_number', { ascending: true })

      if (progressError) throw progressError

      // 2. Cargar estadísticas
      const { data: statsData, error: statsError } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') {
        // PGRST116 = no rows found, es OK para nuevos usuarios
        throw statsError
      }

      // 3. Cargar historial de exámenes
      const { data: examData, error: examError } = await supabase
        .from('exam_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (examError && examError.code !== 'PGRST116') {
        console.warn('Error cargando exam_history:', examError)
      }

      // 4. Cargar actividad diaria
      const { data: activityData, error: activityError } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(30)

      if (activityError && activityError.code !== 'PGRST116') {
        console.warn('Error cargando daily_activity:', activityError)
      }

      // Transformar datos de Supabase al formato del hook
      const transformedArticles: ArticleProgress[] = progressData?.map(p => ({
        articleNumber: p.article_number,
        titleId: p.title_id,
        articleTitle: `Artículo ${p.article_number}`, // No existe en DB
        isCompleted: p.is_completed, // Corregido: is_completed existe en statistics_tables.sql
        timesStudied: p.times_studied || 1,
        totalStudyTimeSeconds: p.total_study_time_seconds || 0, // Corregido: nombre completo
        firstStudiedAt: p.first_studied_at || p.created_at, // first_studied_at existe
        lastStudiedAt: p.last_studied_at,
        completedAt: p.completed_at
      })) || []

      setArticles(transformedArticles)
      setStatistics(statsData)
      setExamHistory(examData || [])
      setDailyActivity(activityData || [])
      setLastSync(new Date())

    } catch (err: any) {
      setError(err.message)
      console.error('Error cargando datos de progreso:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Cargar datos al montar el componente o cambiar usuario
  useEffect(() => {
    loadProgressData()
  }, [loadProgressData])

  // ================================
  // CÁLCULOS DERIVADOS
  // ================================

  const overall = useMemo((): OverallProgress => {
    const completedArticles = articles.filter(a => a.isCompleted).length
    const totalStudyTimeMinutes = Math.floor(
      articles.reduce((sum, a) => sum + a.totalStudyTimeSeconds, 0) / 60
    )

    // Calcular progreso por título
    const titlesProgress: TitleProgress[] = Object.entries(TITLE_ARTICLE_RANGES).map(([titleId, range]) => {
      const titleArticles = articles.filter(a => a.titleId === titleId)
      const completedInTitle = titleArticles.filter(a => a.isCompleted).length
      const studyTimeInTitle = Math.floor(
        titleArticles.reduce((sum, a) => sum + a.totalStudyTimeSeconds, 0) / 60
      )

      return {
        titleId,
        titleName: TITLE_MAPPING[titleId] || titleId,
        completedArticles: completedInTitle,
        totalArticles: range.total,
        percentage: Math.round((completedInTitle / range.total) * 100),
        studyTimeMinutes: studyTimeInTitle
      }
    })

    const totalArticles = Object.values(TITLE_ARTICLE_RANGES).reduce((sum, range) => sum + range.total, 0)

    return {
      totalArticles,
      completedArticles,
      completionPercentage: Math.round((completedArticles / totalArticles) * 100),
      totalStudyTimeMinutes,
      titlesProgress
    }
  }, [articles])

  // ================================
  // FUNCIONES DE ACCIÓN
  // ================================

  const markArticleCompleted = useCallback(async (
    articleNumber: number,
    titleId: string,
    studyTime: number = 0
  ): Promise<boolean> => {
    if (!user) return false

    try {
      const now = new Date().toISOString()

      // Buscar artículo existente
      const existingArticle = articles.find(a => a.articleNumber === articleNumber)

      const progressData = {
        user_id: user.id,
        article_number: articleNumber,
        title_id: titleId,
        is_completed: true, // Corregido: is_completed para statistics_tables.sql
        times_studied: (existingArticle?.timesStudied || 0) + 1,
        total_study_time_seconds: (existingArticle?.totalStudyTimeSeconds || 0) + studyTime, // Nombre completo
        first_studied_at: existingArticle?.firstStudiedAt || now, // Agregar first_studied_at
        last_studied_at: now,
        completed_at: existingArticle?.completedAt || now
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert(progressData, {
          onConflict: 'user_id,article_number'
        })

      if (error) throw error

      // Recargar datos para mantener consistencia
      await loadProgressData()

      return true

    } catch (err: any) {
      setError(err.message)
      console.error('Error marcando artículo como completado:', err)
      return false
    }
  }, [user, articles, loadProgressData])

  const getArticleProgress = useCallback((articleNumber: number): ArticleProgress | null => {
    return articles.find(a => a.articleNumber === articleNumber) || null
  }, [articles])

  const getTitleProgress = useCallback((titleId: string): TitleProgress | null => {
    return overall.titlesProgress.find(t => t.titleId === titleId) || null
  }, [overall.titlesProgress])

  const refreshData = useCallback(async () => {
    await loadProgressData()
  }, [loadProgressData])

  const invalidateCache = useCallback(() => {
    // Para futuras implementaciones de cache
    setLastSync(null)
  }, [])

  const syncToSupabase = useCallback(async (): Promise<boolean> => {
    // Esta función ya no es necesaria porque siempre leemos de Supabase
    // Pero la mantenemos para compatibilidad
    await loadProgressData()
    return true
  }, [loadProgressData])

  // ================================
  // FUNCIONES DE ESTADÍSTICAS UNIFICADAS
  // ================================

  const getRecentActivity = useCallback((days: number): DailyActivity[] => {
    const now = new Date()
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    return dailyActivity.filter(activity => {
      const activityDate = new Date(activity.activity_date)
      return activityDate >= cutoffDate
    }).slice(0, days)
  }, [dailyActivity])

  const getStudyStreak = useCallback((): number => {
    if (statistics?.current_streak_days) {
      return statistics.current_streak_days // Corregido: current_streak_days para statistics_tables.sql
    }

    // Calcular racha desde dailyActivity si no está en statistics
    if (dailyActivity.length === 0) return 0

    const sortedActivity = [...dailyActivity].sort((a, b) =>
      new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
    )

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const activity of sortedActivity) {
      const activityDate = new Date(activity.activity_date)
      activityDate.setHours(0, 0, 0, 0)

      const expectedDate = new Date(today.getTime() - (streak * 24 * 60 * 60 * 1000))

      if (activityDate.getTime() === expectedDate.getTime() && activity.articles_studied > 0) {
        streak++
      } else {
        break
      }
    }

    return streak
  }, [dailyActivity, statistics])

  // ================================
  // ESTADO FINAL
  // ================================

  const unifiedStatistics = useMemo(() => {
    // Contar artículos estudiados: cualquier artículo con progreso registrado
    const articlesStudied = articles.length

    // Calcular tiempo total de estudio desde los artículos
    const totalStudyTime = overall.totalStudyTimeMinutes

    // Contar exámenes desde el historial real
    const examCount = examHistory.length

    // Calcular promedio de exámenes desde el historial real
    const avgScore = examHistory.length > 0
      ? Math.round(examHistory.reduce((sum, exam) => sum + exam.score_percentage, 0) / examHistory.length)
      : 0

    return {
      totalArticlesStudied: articlesStudied,
      totalStudyTimeMinutes: totalStudyTime,
      currentStreakDays: statistics?.current_streak_days || 0,
      totalExamsTaken: examCount,
      averageExamScore: avgScore
    }
  }, [statistics, overall, articles, examHistory])

  return {
    // Datos
    articles,
    overall,
    statistics: unifiedStatistics,

    // Datos adicionales del sistema de estadísticas
    examHistory,
    dailyActivity,

    // Estados
    loading,
    error,
    lastSync,

    // Acciones
    markArticleCompleted,
    getArticleProgress,
    getTitleProgress,
    refreshData,

    // Funciones de estadísticas unificadas
    getRecentActivity,
    getStudyStreak,

    // Cache y sincronización
    invalidateCache,
    syncToSupabase
  }
}

// ================================
// HOOKS DE CONVENIENCIA
// ================================

/**
 * Hook de conveniencia para obtener solo progreso general
 */
export function useOverallProgress() {
  const { overall, loading, error } = useUnifiedProgress()
  return { overall, loading, error }
}

/**
 * Hook de conveniencia para obtener progreso de un título específico
 */
export function useTitleProgress(titleId: string) {
  const { getTitleProgress, loading, error } = useUnifiedProgress()
  const titleProgress = getTitleProgress(titleId)
  return { titleProgress, loading, error }
}

/**
 * Hook de conveniencia para obtener progreso de un artículo específico
 */
export function useArticleProgress(articleNumber: number) {
  const { getArticleProgress, markArticleCompleted, loading, error } = useUnifiedProgress()
  const articleProgress = getArticleProgress(articleNumber)
  return {
    articleProgress,
    markArticleCompleted: (titleId: string, studyTime?: number) =>
      markArticleCompleted(articleNumber, titleId, studyTime),
    loading,
    error
  }
}