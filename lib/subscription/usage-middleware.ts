import { supabase } from '../supabase-client'

export interface UsageCheckResult {
  allowed: boolean
  reason?: string
  remainingExams?: number
}

/**
 * Verificar si un usuario puede realizar un examen
 * @param userId - ID del usuario
 * @param examType - Tipo de examen ('general' | 'title')
 * @param titleId - ID del título (requerido si examType === 'title')
 * @returns Resultado de la verificación con información adicional
 */
export async function checkUsageLimits(
  userId: string,
  examType: 'general' | 'title',
  titleId?: string
): Promise<UsageCheckResult> {
  try {
    // 1. Obtener suscripción del usuario
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError)
      return {
        allowed: false,
        reason: 'Error al verificar suscripción'
      }
    }

    // 2. Si es usuario PRO, permitir acceso ilimitado
    if (
      subscription &&
      (subscription.plan_type === 'pro' || subscription.plan_type === 'annual') &&
      subscription.status === 'active'
    ) {
      return { allowed: true }
    }

    // 3. Usuario FREE - verificar límites del mes actual
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const { data: limits, error: limitsError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', currentMonth.toISOString())
      .single()

    if (limitsError && limitsError.code !== 'PGRST116') {
      console.error('Error fetching usage limits:', limitsError)
      return {
        allowed: false,
        reason: 'Error al verificar límites de uso'
      }
    }

    // Si no existen límites, crear registro del mes actual
    if (!limits) {
      const periodStart = new Date()
      periodStart.setDate(1)
      periodStart.setHours(0, 0, 0, 0)

      const periodEnd = new Date(periodStart)
      periodEnd.setMonth(periodEnd.getMonth() + 1)
      periodEnd.setDate(0)
      periodEnd.setHours(23, 59, 59, 999)

      const { data: newLimits, error: createError } = await supabase
        .from('usage_limits')
        .insert({
          user_id: userId,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
          general_exams_taken: 0,
          general_exams_limit: 5,
          title_exams_count: {},
          title_exams_limit: 1
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating usage limits:', createError)
        return {
          allowed: false,
          reason: 'Error al crear límites de uso'
        }
      }

      // Nuevos límites creados, permitir el primer examen
      return { allowed: true, remainingExams: examType === 'general' ? 5 : 1 }
    }

    // 4. Verificar límites según tipo de examen
    if (examType === 'general') {
      const remaining = limits.general_exams_limit - limits.general_exams_taken

      if (limits.general_exams_taken >= limits.general_exams_limit) {
        return {
          allowed: false,
          reason: `Has alcanzado el límite de ${limits.general_exams_limit} exámenes generales este mes`,
          remainingExams: 0
        }
      }

      return { allowed: true, remainingExams: remaining }
    }

    if (examType === 'title') {
      if (!titleId) {
        return {
          allowed: false,
          reason: 'Se requiere especificar el ID del título'
        }
      }

      const titleExamCount = limits.title_exams_count[titleId] || 0

      if (titleExamCount >= limits.title_exams_limit) {
        return {
          allowed: false,
          reason: `Ya has realizado el examen de este título. Límite: ${limits.title_exams_limit} por título al mes`,
          remainingExams: 0
        }
      }

      return { allowed: true, remainingExams: limits.title_exams_limit - titleExamCount }
    }

    return {
      allowed: false,
      reason: 'Tipo de examen no válido'
    }
  } catch (error: any) {
    console.error('Error in checkUsageLimits:', error)
    return {
      allowed: false,
      reason: 'Error al verificar límites de uso'
    }
  }
}

/**
 * Incrementar contador de exámenes después de completar uno
 * @param userId - ID del usuario
 * @param examType - Tipo de examen ('general' | 'title')
 * @param titleId - ID del título (requerido si examType === 'title')
 */
export async function incrementExamCounter(
  userId: string,
  examType: 'general' | 'title',
  titleId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si es usuario PRO (PRO no tiene límites)
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', userId)
      .single()

    if (
      subscription &&
      (subscription.plan_type === 'pro' || subscription.plan_type === 'annual') &&
      subscription.status === 'active'
    ) {
      // Usuario PRO, no incrementar contadores
      return { success: true }
    }

    // Obtener límites actuales
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const { data: limits, error: fetchError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', currentMonth.toISOString())
      .single()

    if (fetchError || !limits) {
      return {
        success: false,
        error: 'No se encontraron límites de uso'
      }
    }

    // Incrementar según tipo de examen
    if (examType === 'general') {
      const { error: updateError } = await supabase
        .from('usage_limits')
        .update({
          general_exams_taken: limits.general_exams_taken + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', limits.id)

      if (updateError) {
        console.error('Error updating general exam count:', updateError)
        return {
          success: false,
          error: 'Error al actualizar contador de exámenes'
        }
      }

      return { success: true }
    }

    if (examType === 'title') {
      if (!titleId) {
        return {
          success: false,
          error: 'Se requiere especificar el ID del título'
        }
      }

      const currentCount = limits.title_exams_count[titleId] || 0
      const newTitleExamsCount = {
        ...limits.title_exams_count,
        [titleId]: currentCount + 1
      }

      const { error: updateError } = await supabase
        .from('usage_limits')
        .update({
          title_exams_count: newTitleExamsCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', limits.id)

      if (updateError) {
        console.error('Error updating title exam count:', updateError)
        return {
          success: false,
          error: 'Error al actualizar contador de exámenes'
        }
      }

      return { success: true }
    }

    return {
      success: false,
      error: 'Tipo de examen no válido'
    }
  } catch (error: any) {
    console.error('Error in incrementExamCounter:', error)
    return {
      success: false,
      error: 'Error al incrementar contador'
    }
  }
}

/**
 * Verificar si un usuario tiene acceso a una feature premium
 * @param userId - ID del usuario
 * @param feature - Nombre de la feature ('advanced_stats' | 'export_data' | 'gamification')
 */
export async function hasFeatureAccess(
  userId: string,
  feature: string
): Promise<boolean> {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('user_id', userId)
      .single()

    if (error || !subscription) {
      return false
    }

    // Features disponibles solo para PRO
    const premiumFeatures = [
      'advanced_stats',
      'export_data',
      'gamification',
      'unlimited_exams',
      'exam_history'
    ]

    // Si es una feature premium, verificar plan PRO
    if (premiumFeatures.includes(feature)) {
      return (
        (subscription.plan_type === 'pro' || subscription.plan_type === 'annual') &&
        subscription.status === 'active'
      )
    }

    // Features básicas disponibles para todos
    return true
  } catch (error) {
    console.error('Error checking feature access:', error)
    return false
  }
}
