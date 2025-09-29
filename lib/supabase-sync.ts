"use client"

import { supabase } from './supabase-client'
import type { UserProgress, ArticleProgress } from './user-progress'
import { defaultUserProgress } from './user-progress'
import { getArticleTitleId } from './article-title-mapping'

// Tipos para Supabase
export interface SupabaseUserProgress {
  id: string
  user_id: string
  article_number: number
  title_id: string
  completed: boolean
  completed_at: string | null
  study_time_seconds: number
  times_studied: number
  last_studied_at: string | null
  created_at: string
  updated_at: string
}

export interface SupabaseUserStatistics {
  id: string
  user_id: string
  total_study_time_minutes: number
  total_articles_studied: number
  current_streak_days: number
  max_streak_days: number
  last_study_date: string | null
  created_at: string
  updated_at: string
}

export interface SupabaseUserSettings {
  id: string
  user_id: string
  auto_mark_completed: boolean
  study_time_threshold: number
  show_progress: boolean
  sound_enabled: boolean
  created_at: string
  updated_at: string
}

/**
 * Clase para manejar la sincronización entre localStorage y Supabase
 */
export class SupabaseSync {
  private userId: string | null = null

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    this.userId = user?.id || null

    // Escuchar cambios de autenticación
    supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id || null

      if (event === 'SIGNED_IN' && this.userId) {
        this.syncToSupabase()
      }
    })
  }

  /**
   * Subir progreso local a Supabase
   */
  async syncToSupabase(): Promise<boolean> {
    if (!this.userId) {
      console.log('❌ No user authenticated, skipping sync to Supabase')
      return false
    }

    try {
      // Obtener datos de localStorage
      const localProgress = this.getLocalProgress()

      console.log('📤 Syncing local progress to Supabase...')

      // Sincronizar progreso de artículos
      await this.syncArticlesToSupabase(localProgress.articles)

      // Sincronizar estadísticas generales
      await this.syncStatisticsToSupabase(localProgress)

      // Sincronizar configuraciones
      await this.syncSettingsToSupabase(localProgress.settings)

      console.log('✅ Successfully synced to Supabase')
      return true

    } catch (error) {
      console.error('❌ Error syncing to Supabase:', error)
      return false
    }
  }

  /**
   * Descargar progreso de Supabase a localStorage
   */
  async syncFromSupabase(): Promise<boolean> {
    if (!this.userId) {
      console.log('❌ No user authenticated, skipping sync from Supabase')
      return false
    }

    try {
      console.log('📥 Syncing progress from Supabase...')

      // Obtener datos de Supabase
      const [articlesData, statisticsData, settingsData] = await Promise.all([
        this.getArticlesFromSupabase(),
        this.getStatisticsFromSupabase(),
        this.getSettingsFromSupabase()
      ])

      // Convertir y guardar en localStorage
      const progress: UserProgress = {
        articles: articlesData,
        totalStudyTime: (statisticsData?.total_study_time_minutes || 0) * 60, // Convertir minutos a segundos
        totalArticlesStudied: statisticsData?.total_articles_studied || 0,
        studyStreak: statisticsData?.current_streak_days || 0,
        lastStudyDate: statisticsData?.last_study_date ? new Date(statisticsData.last_study_date) : undefined,
        settings: {
          autoMarkCompleted: settingsData?.auto_mark_completed ?? defaultUserProgress.settings.autoMarkCompleted,
          studyTimeThreshold: settingsData?.study_time_threshold ?? defaultUserProgress.settings.studyTimeThreshold,
          showProgress: settingsData?.show_progress ?? defaultUserProgress.settings.showProgress,
          soundEnabled: settingsData?.sound_enabled ?? defaultUserProgress.settings.soundEnabled
        },
        currentSession: defaultUserProgress.currentSession // Siempre resetear sesión al sincronizar
      }

      localStorage.setItem('constimaster-user-progress', JSON.stringify(progress))
      console.log('✅ Successfully synced from Supabase')
      return true

    } catch (error) {
      console.error('❌ Error syncing from Supabase:', error)
      return false
    }
  }

  /**
   * Sincronización bidireccional inteligente
   */
  async smartSync(): Promise<boolean> {
    if (!this.userId) return false

    try {
      const localProgress = this.getLocalProgress()
      const remoteStatistics = await this.getStatisticsFromSupabase()

      // Si no hay datos remotos, subir locales
      if (!remoteStatistics) {
        return await this.syncToSupabase()
      }

      // Comparar timestamps para decidir dirección de sync
      const localLastUpdate = localProgress.lastStudyDate
        ? (typeof localProgress.lastStudyDate === 'string'
          ? new Date(localProgress.lastStudyDate).getTime()
          : localProgress.lastStudyDate.getTime ? localProgress.lastStudyDate.getTime() : 0)
        : 0
      const remoteLastUpdate = remoteStatistics.last_study_date ?
        new Date(remoteStatistics.last_study_date).getTime() : 0

      if (localLastUpdate > remoteLastUpdate) {
        // Local más reciente, subir a Supabase
        console.log('🔄 Local data is newer, syncing to Supabase')
        return await this.syncToSupabase()
      } else if (remoteLastUpdate > localLastUpdate) {
        // Remoto más reciente, bajar de Supabase
        console.log('🔄 Remote data is newer, syncing from Supabase')
        return await this.syncFromSupabase()
      } else {
        console.log('✅ Data is in sync')
        return true
      }

    } catch (error) {
      console.error('❌ Error in smart sync:', error)
      return false
    }
  }

  // Métodos privados

  private getLocalProgress(): UserProgress {
    const stored = localStorage.getItem('constimaster-user-progress')
    return stored ? JSON.parse(stored) : defaultUserProgress
  }

  private async syncArticlesToSupabase(articles: { [articleNumber: number]: ArticleProgress }) {
    const articleArray = Object.values(articles)

    for (const article of articleArray) {
      // Convertir fechas de manera segura
      const completedAt = article.completedAt
        ? (typeof article.completedAt === 'string' ? article.completedAt : new Date(article.completedAt).toISOString())
        : null

      const lastStudiedAt = article.lastStudiedAt
        ? (typeof article.lastStudiedAt === 'string' ? article.lastStudiedAt : new Date(article.lastStudiedAt).toISOString())
        : new Date().toISOString()

      // Asegurar que title_id nunca sea null
      const titleId = article.titleId || getArticleTitleId(article.articleNumber)

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: this.userId,
          article_number: article.articleNumber,
          title_id: titleId,
          is_completed: article.completed,
          completed_at: completedAt,
          total_study_time_seconds: article.studyTimeSeconds || 0,
          times_studied: article.timesStudied || 1,
          last_studied_at: lastStudiedAt,
          first_studied_at: lastStudiedAt // Usar la misma fecha si no existe
        }, {
          onConflict: 'user_id,article_number'
        })

      if (error) throw error
    }
  }

  private async syncStatisticsToSupabase(progress: UserProgress) {
    const { error } = await supabase
      .from('user_statistics')
      .upsert({
        user_id: this.userId,
        total_study_time_minutes: Math.floor(progress.totalStudyTime / 60), // Convertir segundos a minutos
        total_articles_studied: progress.totalArticlesStudied,
        current_streak_days: progress.studyStreak,
        max_streak_days: Math.max(progress.studyStreak, 1), // Al menos 1 si hay progreso
        last_study_date: progress.lastStudyDate
          ? (typeof progress.lastStudyDate === 'string'
            ? progress.lastStudyDate.split('T')[0]
            : progress.lastStudyDate.toISOString ? progress.lastStudyDate.toISOString().split('T')[0] : null)
          : null
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  }

  private async syncSettingsToSupabase(settings: UserProgress['settings']) {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: this.userId,
        auto_mark_completed: settings.autoMarkCompleted,
        study_time_threshold: settings.studyTimeThreshold,
        show_progress: settings.showProgress,
        sound_enabled: settings.soundEnabled
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
  }

  private async getArticlesFromSupabase(): Promise<{ [articleNumber: number]: ArticleProgress }> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', this.userId)

    if (error) throw error

    const articles: { [articleNumber: number]: ArticleProgress } = {}

    if (data) {
      data.forEach((item: SupabaseUserProgress) => {
        articles[item.article_number] = {
          articleNumber: item.article_number,
          titleId: item.title_id,
          completed: item.completed,
          completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
          studyTimeSeconds: item.study_time_seconds,
          timesStudied: item.times_studied,
          lastStudiedAt: item.last_studied_at ? new Date(item.last_studied_at) : undefined
        }
      })
    }

    return articles
  }

  private async getStatisticsFromSupabase(): Promise<SupabaseUserStatistics | null> {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return data || null
  }

  private async getSettingsFromSupabase(): Promise<SupabaseUserSettings | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', this.userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return data || null
  }
}

// Instancia global del sync
export const supabaseSync = new SupabaseSync()

/**
 * Hook para usar la sincronización en componentes React
 */
export function useSupabaseSync() {
  const syncToCloud = () => supabaseSync.syncToSupabase()
  const syncFromCloud = () => supabaseSync.syncFromSupabase()
  const smartSync = () => supabaseSync.smartSync()

  return {
    syncToCloud,
    syncFromCloud,
    smartSync
  }
}