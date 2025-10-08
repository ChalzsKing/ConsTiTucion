'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth/auth-context'

// ================================
// INTERFACES Y TIPOS
// ================================

export interface UserStatistics {
  id: number
  user_id: string
  total_articles_studied: number
  total_study_time_minutes: number
  current_streak_days: number
  max_streak_days: number
  last_study_date: string | null
  total_exams_taken: number
  total_questions_answered: number
  total_correct_answers: number
  total_incorrect_answers: number
  best_exam_score: number
  average_exam_score: number
  titles_progress: Record<string, any>
  achievements: string[]
  total_xp: number
  current_level: number
  created_at: string
  updated_at: string
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
  questions_data: any
}

export interface UserProgress {
  id: number
  user_id: string
  article_number: number
  title_id: string
  article_title: string | null
  is_completed: boolean
  times_studied: number
  total_study_time_seconds: number
  first_studied_at: string
  last_studied_at: string
  completed_at: string | null
  user_notes: string | null
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
}

// ================================
// HOOK PRINCIPAL
// ================================

export function useStatistics() {
  const { user } = useAuth()
  const [statistics, setStatistics] = useState<UserStatistics | null>(null)
  const [examHistory, setExamHistory] = useState<ExamHistoryEntry[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ================================
  // FUNCIONES DE CARGA DE DATOS
  // ================================

  const loadUserStatistics = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        throw error
      }

      if (data) {
        setStatistics(data)
      } else {
        // Crear registro inicial si no existe
        await createInitialStatistics()
      }
    } catch (err: any) {
      console.error('Error loading user statistics:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadExamHistory = async (limit = 50) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('exam_history')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setExamHistory(data || [])
    } catch (err: any) {
      console.error('Error loading exam history:', err)
      setError(err.message)
    }
  }

  const loadUserProgress = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('article_number', { ascending: true })

      if (error) throw error
      setUserProgress(data || [])
    } catch (err: any) {
      console.error('Error loading user progress:', err)
      setError(err.message)
    }
  }

  const loadDailyActivity = async (days = 30) => {
    if (!user) return

    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .gte('activity_date', startDate.toISOString().split('T')[0])
        .order('activity_date', { ascending: true })

      if (error) throw error
      setDailyActivity(data || [])
    } catch (err: any) {
      console.error('Error loading daily activity:', err)
      setError(err.message)
    }
  }

  // ================================
  // FUNCIONES DE ACTUALIZACIÓN
  // ================================

  const createInitialStatistics = async () => {
    if (!user) return

    try {
      const initialStats = {
        user_id: user.id,
        total_articles_studied: 0,
        total_study_time_minutes: 0,
        current_streak_days: 0,
        max_streak_days: 0,
        total_exams_taken: 0,
        total_questions_answered: 0,
        total_correct_answers: 0,
        total_incorrect_answers: 0,
        best_exam_score: 0,
        average_exam_score: 0,
        titles_progress: {},
        achievements: [],
        total_xp: 0,
        current_level: 1
      }

      const { data, error } = await supabase
        .from('user_statistics')
        .upsert(initialStats, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error && error.code !== '23505') { // Ignorar error de duplicado
        throw error
      }

      if (data) {
        setStatistics(data)
      } else {
        // Si no devuelve data por el conflicto, cargar el registro existente
        await loadUserStatistics()
      }
    } catch (err: any) {
      // Si es error de duplicado, intentar cargar el registro existente
      if (err.code === '23505') {
        console.log('Usuario ya tiene estadísticas, cargando registro existente...')
        await loadUserStatistics()
      } else {
        console.error('Error creating initial statistics:', err)
        setError(err.message)
      }
    }
  }

  const saveExamResult = async (examData: {
    exam_type: 'article' | 'title' | 'general'
    exam_identifier?: string
    title_name?: string
    total_questions: number
    correct_answers: number
    score_percentage: number
    time_taken_seconds?: number
    questions_data?: any
  }) => {
    if (!user) return

    try {
      const examEntry = {
        user_id: user.id,
        exam_type: examData.exam_type,
        exam_identifier: examData.exam_identifier || null,
        title_name: examData.title_name || null,
        total_questions: examData.total_questions,
        correct_answers: examData.correct_answers,
        incorrect_answers: examData.total_questions - examData.correct_answers,
        score_percentage: examData.score_percentage,
        time_taken_seconds: examData.time_taken_seconds || null,
        questions_data: examData.questions_data || null,
        completed_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('exam_history')
        .insert(examEntry)

      if (error) throw error

      // Actualizar actividad diaria
      await updateDailyActivity({
        exams_taken: 1,
        questions_answered: examData.total_questions,
        correct_answers: examData.correct_answers,
        xp_earned: Math.floor(examData.score_percentage)
      })

      // Recargar datos
      await loadUserStatistics()
      await loadExamHistory()

    } catch (err: any) {
      console.error('Error saving exam result:', err)
      setError(err.message)
    }
  }

  const updateStudyProgress = async (articleData: {
    article_number: number
    title_id: string
    article_title?: string
    study_time_seconds: number
    is_completed?: boolean
    user_notes?: string
  }) => {
    if (!user) return

    try {
      const progressData = {
        user_id: user.id,
        article_number: articleData.article_number,
        title_id: articleData.title_id,
        article_title: articleData.article_title || null,
        is_completed: articleData.is_completed || false,
        total_study_time_seconds: articleData.study_time_seconds,
        last_studied_at: new Date().toISOString(),
        completed_at: articleData.is_completed ? new Date().toISOString() : null,
        user_notes: articleData.user_notes || null
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert(progressData, {
          onConflict: 'user_id,article_number',
          ignoreDuplicates: false
        })

      if (error) throw error

      // Actualizar actividad diaria
      await updateDailyActivity({
        articles_studied: 1,
        study_time_minutes: Math.ceil(articleData.study_time_seconds / 60),
        xp_earned: articleData.is_completed ? 50 : 10
      })

      // Recargar datos
      await loadUserProgress()
      await loadUserStatistics()

    } catch (err: any) {
      console.error('Error updating study progress:', err)
      setError(err.message)
    }
  }

  const updateDailyActivity = async (activityData: {
    articles_studied?: number
    exams_taken?: number
    questions_answered?: number
    correct_answers?: number
    study_time_minutes?: number
    xp_earned?: number
  }) => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]

      const dailyData = {
        user_id: user.id,
        activity_date: today,
        articles_studied: activityData.articles_studied || 0,
        exams_taken: activityData.exams_taken || 0,
        questions_answered: activityData.questions_answered || 0,
        correct_answers: activityData.correct_answers || 0,
        study_time_minutes: activityData.study_time_minutes || 0,
        xp_earned: activityData.xp_earned || 0
      }

      // Usar upsert para incrementar valores existentes
      const { data: existing } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .single()

      if (existing) {
        // Incrementar valores existentes
        const updatedData = {
          articles_studied: existing.articles_studied + dailyData.articles_studied,
          exams_taken: existing.exams_taken + dailyData.exams_taken,
          questions_answered: existing.questions_answered + dailyData.questions_answered,
          correct_answers: existing.correct_answers + dailyData.correct_answers,
          study_time_minutes: existing.study_time_minutes + dailyData.study_time_minutes,
          xp_earned: existing.xp_earned + dailyData.xp_earned,
          updated_at: new Date().toISOString()
        }

        const { error } = await supabase
          .from('daily_activity')
          .update(updatedData)
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Crear nuevo registro
        const { error } = await supabase
          .from('daily_activity')
          .insert(dailyData)

        if (error) throw error
      }

    } catch (err: any) {
      console.error('Error updating daily activity:', err)
      setError(err.message)
    }
  }

  // ================================
  // FUNCIONES DE CÁLCULO
  // ================================

  const getProgressByTitle = (titleId: string) => {
    const titleProgress = userProgress.filter(p => p.title_id === titleId)
    const completed = titleProgress.filter(p => p.is_completed).length
    const total = titleProgress.length
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }

  const getRecentActivity = (days = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return dailyActivity.filter(activity =>
      new Date(activity.activity_date) >= cutoffDate
    )
  }

  const getStudyStreak = () => {
    if (dailyActivity.length === 0) return 0

    let streak = 0
    const sortedActivity = [...dailyActivity].sort((a, b) =>
      new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
    )

    const today = new Date().toISOString().split('T')[0]
    let currentDate = new Date(today)

    for (const activity of sortedActivity) {
      const activityDate = activity.activity_date
      const expectedDate = currentDate.toISOString().split('T')[0]

      if (activityDate === expectedDate && activity.study_time_minutes > 0) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  // ================================
  // EFECTOS
  // ================================

  useEffect(() => {
    if (user) {
      loadUserStatistics()
      loadExamHistory()
      loadUserProgress()
      loadDailyActivity()
    }
  }, [user])

  return {
    // Estado
    statistics,
    examHistory,
    userProgress,
    dailyActivity,
    loading,
    error,

    // Funciones de actualización
    saveExamResult,
    updateStudyProgress,
    updateDailyActivity,

    // Funciones de cálculo
    getProgressByTitle,
    getRecentActivity,
    getStudyStreak,

    // Funciones de recarga
    refreshStatistics: loadUserStatistics,
    refreshExamHistory: loadExamHistory,
    refreshUserProgress: loadUserProgress,
    refreshDailyActivity: loadDailyActivity
  }
}