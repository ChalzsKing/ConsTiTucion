'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useProgress } from './useUnifiedProgressContext'
import { supabase } from '@/lib/supabase-client'
import {
  allBadges,
  getBadgeById,
  type Badge,
  type BadgeCriteria
} from '@/lib/gamification/badges'
import {
  getLevelFromXP,
  calculateExamXP,
  calculateArticleXP,
  XP_REWARDS,
  getLevelTitle
} from '@/lib/gamification/xp-system'

/**
 * 🏆 Hook de Achievements y Gamificación
 *
 * Detecta automáticamente cuando el usuario desbloquea logros
 * y gestiona XP, niveles y badges
 */

export interface UnlockedBadge {
  badge: Badge
  justUnlocked: boolean
  unlockedAt: string
}

export interface UserXPData {
  totalXP: number
  currentLevel: number
  levelTitle: string
  levelIcon: string
  levelColor: string
  currentLevelXP: number
  nextLevelXP: number
  progressPercentage: number
  xpToNextLevel: number
}

export function useAchievements() {
  const { user } = useAuth()
  const { overall, examHistory, getStudyStreak } = useProgress()

  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([])
  const [xpData, setXPData] = useState<UserXPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([])

  // ====================================
  // CARGAR DATOS DE USUARIO
  // ====================================

  const loadUserData = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Cargar XP del usuario
      const { data: xpRecord, error: xpError } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (xpError && xpError.code !== 'PGRST116') {
        console.error('Error loading XP:', xpError)
      }

      // Si no existe, crear registro
      if (!xpRecord) {
        const { data: newXP } = await supabase
          .from('user_xp')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1
          })
          .select()
          .single()

        if (newXP) {
          updateXPData(newXP.total_xp)
        }
      } else {
        updateXPData(xpRecord.total_xp)
      }

      // Cargar badges desbloqueados
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })

      if (achievementsError && achievementsError.code !== 'PGRST116') {
        console.error('Error loading achievements:', achievementsError)
      }

      if (achievements) {
        const unlocked: UnlockedBadge[] = achievements
          .map(a => {
            const badge = getBadgeById(a.badge_id)
            if (!badge) return null

            return {
              badge,
              justUnlocked: false,
              unlockedAt: a.unlocked_at
            }
          })
          .filter(Boolean) as UnlockedBadge[]

        setUnlockedBadges(unlocked)
      }

    } catch (error) {
      console.error('Error in loadUserData:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // ====================================
  // ACTUALIZAR DATOS DE XP
  // ====================================

  const updateXPData = (totalXP: number) => {
    const levelInfo = getLevelFromXP(totalXP)
    const titleInfo = getLevelTitle(levelInfo.currentLevel)

    setXPData({
      totalXP,
      currentLevel: levelInfo.currentLevel,
      levelTitle: titleInfo.title,
      levelIcon: titleInfo.icon,
      levelColor: titleInfo.color,
      currentLevelXP: levelInfo.currentLevelXP,
      nextLevelXP: levelInfo.nextLevelXP,
      progressPercentage: levelInfo.progressPercentage,
      xpToNextLevel: levelInfo.xpToNextLevel
    })
  }

  // ====================================
  // AÑADIR XP
  // ====================================

  const addXP = useCallback(async (
    amount: number,
    reason: string,
    referenceId?: string
  ): Promise<{ leveledUp: boolean; newLevel?: number }> => {
    if (!user) return { leveledUp: false }

    try {
      const { data, error } = await supabase.rpc('add_user_xp', {
        p_user_id: user.id,
        p_xp_amount: amount,
        p_reason: reason,
        p_reference_id: referenceId
      })

      if (error) throw error

      if (data && data.length > 0) {
        const result = data[0]
        updateXPData(result.new_total_xp)

        return {
          leveledUp: result.leveled_up,
          newLevel: result.leveled_up ? result.new_level : undefined
        }
      }

      return { leveledUp: false }
    } catch (error) {
      console.error('Error adding XP:', error)
      return { leveledUp: false }
    }
  }, [user])

  // ====================================
  // VERIFICAR Y DESBLOQUEAR BADGES
  // ====================================

  const checkBadgeCriteria = useCallback((badge: Badge): boolean => {
    const { criteria } = badge

    switch (criteria.type) {
      case 'articles_completed':
        return overall.completedArticles >= (criteria.value || 0)

      case 'title_completed':
        if (!criteria.titleId) return false
        const titleProgress = overall.titlesProgress.find(t => t.titleId === criteria.titleId)
        return titleProgress?.completedArticles === titleProgress?.totalArticles

      case 'exam_count':
        return examHistory.length >= (criteria.value || 0)

      case 'exam_score':
        if (!criteria.minScore) return false
        return examHistory.some(exam => exam.score_percentage >= criteria.minScore!)

      case 'perfect_exam':
        return examHistory.some(exam => exam.score_percentage === 100)

      case 'streak_days':
        const currentStreak = getStudyStreak()
        return currentStreak >= (criteria.value || 0)

      case 'time_of_day':
        // Esta verificación se hace en tiempo real al estudiar
        if (!criteria.timeRange) return false
        const currentHour = new Date().getHours()
        return currentHour >= criteria.timeRange.start && currentHour < criteria.timeRange.end

      default:
        return false
    }
  }, [overall, examHistory, getStudyStreak])

  const checkAllAchievements = useCallback(async () => {
    if (!user) return []

    const newBadges: Badge[] = []
    const alreadyUnlockedIds = unlockedBadges.map(u => u.badge.id)

    for (const badge of allBadges) {
      // Saltar si ya está desbloqueado
      if (alreadyUnlockedIds.includes(badge.id)) continue

      // Verificar criterio
      if (checkBadgeCriteria(badge)) {
        const success = await unlockBadge(badge)
        if (success) {
          newBadges.push(badge)
        }
      }
    }

    return newBadges
  }, [user, unlockedBadges, checkBadgeCriteria])

  const unlockBadge = useCallback(async (badge: Badge): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabase.rpc('unlock_badge', {
        p_user_id: user.id,
        p_badge_id: badge.id,
        p_xp_reward: badge.xpReward
      })

      if (error) throw error

      if (data) {
        // Actualizar estado local
        const newUnlocked: UnlockedBadge = {
          badge,
          justUnlocked: true,
          unlockedAt: new Date().toISOString()
        }

        setUnlockedBadges(prev => [newUnlocked, ...prev])
        setNewlyUnlockedBadges(prev => [...prev, badge])

        // Recargar XP
        await loadUserData()

        return true
      }

      return false
    } catch (error) {
      console.error('Error unlocking badge:', error)
      return false
    }
  }, [user, loadUserData])

  // ====================================
  // FUNCIONES DE AYUDA
  // ====================================

  const clearNewBadges = useCallback(() => {
    setNewlyUnlockedBadges([])
  }, [])

  const isBadgeUnlocked = useCallback((badgeId: string): boolean => {
    return unlockedBadges.some(u => u.badge.id === badgeId)
  }, [unlockedBadges])

  const getBadgeProgress = useCallback((badge: Badge): {
    current: number
    required: number
    percentage: number
    completed: boolean
  } => {
    const { criteria } = badge

    let current = 0
    let required = criteria.value || 1

    switch (criteria.type) {
      case 'articles_completed':
        current = overall.completedArticles
        break

      case 'exam_count':
        current = examHistory.length
        break

      case 'streak_days':
        current = getStudyStreak()
        break

      case 'title_completed':
        if (criteria.titleId) {
          const titleProgress = overall.titlesProgress.find(t => t.titleId === criteria.titleId)
          current = titleProgress?.completedArticles || 0
          required = titleProgress?.totalArticles || 1
        }
        break

      default:
        required = 1
    }

    const percentage = Math.min(100, Math.round((current / required) * 100))
    const completed = isBadgeUnlocked(badge.id)

    return { current, required, percentage, completed }
  }, [overall, examHistory, getStudyStreak, isBadgeUnlocked])

  // ====================================
  // RETORNO
  // ====================================

  return {
    // Estado
    xpData,
    unlockedBadges,
    newlyUnlockedBadges,
    loading,

    // Acciones
    addXP,
    checkAllAchievements,
    unlockBadge,
    clearNewBadges,

    // Utilidades
    isBadgeUnlocked,
    getBadgeProgress,
    totalBadges: allBadges.length,
    unlockedCount: unlockedBadges.length,
    completionPercentage: Math.round((unlockedBadges.length / allBadges.length) * 100)
  }
}
