"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/auth-context'
import { supabase } from '../supabase-client'

export interface Subscription {
  id: string
  user_id: string
  plan_type: 'free' | 'pro' | 'annual'
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'trialing'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  stripe_price_id?: string
  current_period_start?: string
  current_period_end?: string
  trial_ends_at?: string
  cancel_at_period_end: boolean
  canceled_at?: string
  created_at: string
  updated_at: string
}

export interface UsageLimits {
  id: string
  user_id: string
  period_start: string
  period_end: string
  general_exams_taken: number
  general_exams_limit: number
  title_exams_count: Record<string, number>
  title_exams_limit: number
  created_at: string
  updated_at: string
}

export interface SubscriptionHook {
  // Estado
  subscription: Subscription | null
  usageLimits: UsageLimits | null
  loading: boolean
  error: string | null

  // Funciones de verificación
  isPro: () => boolean
  isFree: () => boolean
  canTakeGeneralExam: () => boolean
  canTakeTitleExam: (titleId: string) => boolean
  hasFeatureAccess: (feature: string) => boolean

  // Funciones de actualización
  incrementGeneralExamCount: () => Promise<void>
  incrementTitleExamCount: (titleId: string) => Promise<void>
  refreshLimits: () => Promise<void>

  // Información útil
  getGeneralExamsRemaining: () => number
  getTitleExamCount: (titleId: string) => number
}

export function useSubscription(): SubscriptionHook {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar suscripción y límites del usuario
  useEffect(() => {
    if (!user) {
      // Usuario NO autenticado - sin límites, debe registrarse
      console.log('🔍 No user authenticated - must register to take exams')
      setSubscription(null)
      setUsageLimits(null)
      setLoading(false)
      return
    }

    loadSubscriptionData()
  }, [user])

  const loadSubscriptionData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Loading subscription data for user:', user.id)

      // Cargar suscripción
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('📊 Subscription query result:', { subData, subError })

      if (subError && subError.code !== 'PGRST116') {
        // PGRST116 = no rows found
        console.error('❌ Subscription error:', subError)
        throw subError
      }

      // Si no existe, crear suscripción FREE por defecto
      if (!subData) {
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'free',
            status: 'active'
          })
          .select()
          .single()

        if (createError) throw createError
        setSubscription(newSub)
      } else {
        setSubscription(subData)
      }

      // Cargar límites del mes actual
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      console.log('🔍 Loading usage limits...')

      const { data: limitsData, error: limitsError } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', currentMonth.toISOString())
        .single()

      console.log('📊 Usage limits query result:', { limitsData, limitsError })

      if (limitsError && limitsError.code !== 'PGRST116') {
        console.error('❌ Usage limits error:', limitsError)
        throw limitsError
      }

      // Si no existen límites del mes actual, crearlos
      if (!limitsData) {
        const periodStart = new Date()
        periodStart.setDate(1)
        periodStart.setHours(0, 0, 0, 0)

        const periodEnd = new Date(periodStart)
        periodEnd.setMonth(periodEnd.getMonth() + 1)
        periodEnd.setDate(0) // Último día del mes
        periodEnd.setHours(23, 59, 59, 999)

        const { data: newLimits, error: createLimitsError } = await supabase
          .from('usage_limits')
          .insert({
            user_id: user.id,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
            general_exams_taken: 0,
            general_exams_limit: 5,
            title_exams_count: {},
            title_exams_limit: 1
          })
          .select()
          .single()

        if (createLimitsError) throw createLimitsError
        setUsageLimits(newLimits)
      } else {
        setUsageLimits(limitsData)
      }
    } catch (err: any) {
      console.error('Error loading subscription data:', err)
      setError(err.message || 'Error al cargar datos de suscripción')
    } finally {
      setLoading(false)
    }
  }

  // Verificar si el usuario es PRO
  const isPro = (): boolean => {
    if (!subscription) return false
    return (
      (subscription.plan_type === 'pro' || subscription.plan_type === 'annual') &&
      subscription.status === 'active'
    )
  }

  // Verificar si el usuario es FREE
  const isFree = (): boolean => {
    return !isPro()
  }

  // Verificar si puede hacer examen general
  const canTakeGeneralExam = (): boolean => {
    // Si no hay usuario autenticado, no puede hacer exámenes
    if (!user) return false
    if (isPro()) return true
    if (!usageLimits) return false

    return usageLimits.general_exams_taken < usageLimits.general_exams_limit
  }

  // Verificar si puede hacer examen de título
  const canTakeTitleExam = (titleId: string): boolean => {
    // Si no hay usuario autenticado, no puede hacer exámenes
    if (!user) return false
    if (isPro()) return true
    if (!usageLimits) return false

    const count = usageLimits.title_exams_count[titleId] || 0
    return count < usageLimits.title_exams_limit
  }

  // Verificar acceso a features premium
  const hasFeatureAccess = (feature: string): boolean => {
    if (isPro()) return true

    const freeFeatures = ['study', 'articles', 'basic_exams']
    return freeFeatures.includes(feature)
  }

  // Incrementar contador de exámenes generales
  const incrementGeneralExamCount = async (): Promise<void> => {
    if (!user || !usageLimits || isPro()) return

    try {
      const { error } = await supabase
        .from('usage_limits')
        .update({
          general_exams_taken: usageLimits.general_exams_taken + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', usageLimits.id)

      if (error) throw error

      // Actualizar estado local
      setUsageLimits({
        ...usageLimits,
        general_exams_taken: usageLimits.general_exams_taken + 1
      })
    } catch (err: any) {
      console.error('Error incrementing general exam count:', err)
      throw err
    }
  }

  // Incrementar contador de exámenes por título
  const incrementTitleExamCount = async (titleId: string): Promise<void> => {
    if (!user || !usageLimits || isPro()) return

    try {
      const currentCount = usageLimits.title_exams_count[titleId] || 0
      const newTitleExamsCount = {
        ...usageLimits.title_exams_count,
        [titleId]: currentCount + 1
      }

      const { error } = await supabase
        .from('usage_limits')
        .update({
          title_exams_count: newTitleExamsCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', usageLimits.id)

      if (error) throw error

      // Actualizar estado local
      setUsageLimits({
        ...usageLimits,
        title_exams_count: newTitleExamsCount
      })
    } catch (err: any) {
      console.error('Error incrementing title exam count:', err)
      throw err
    }
  }

  // Refrescar límites desde la base de datos
  const refreshLimits = async (): Promise<void> => {
    await loadSubscriptionData()
  }

  // Obtener exámenes generales restantes
  const getGeneralExamsRemaining = (): number => {
    if (isPro()) return 999999 // Ilimitado
    if (!usageLimits) return 0

    return Math.max(
      0,
      usageLimits.general_exams_limit - usageLimits.general_exams_taken
    )
  }

  // Obtener contador de exámenes por título
  const getTitleExamCount = (titleId: string): number => {
    if (!usageLimits) return 0
    return usageLimits.title_exams_count[titleId] || 0
  }

  return {
    subscription,
    usageLimits,
    loading,
    error,
    isPro,
    isFree,
    canTakeGeneralExam,
    canTakeTitleExam,
    hasFeatureAccess,
    incrementGeneralExamCount,
    incrementTitleExamCount,
    refreshLimits,
    getGeneralExamsRemaining,
    getTitleExamCount
  }
}
