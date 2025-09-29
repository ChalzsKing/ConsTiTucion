import { supabase } from './supabase-client'
import { getArticleTitleId } from './article-title-mapping'

// ================================
// FORZAR SINCRONIZACIÓN COMPLETA
// ================================

export async function forceSyncAllData(userId: string) {
  console.log('🔄 Iniciando sincronización forzada completa...')

  try {
    // 1. Obtener todos los datos del localStorage
    const localData = collectAllLocalData()
    console.log('📊 Datos locales encontrados:', localData)

    // 2. Sincronizar progreso de artículos
    if (localData.articles && Object.keys(localData.articles).length > 0) {
      await syncArticleProgress(userId, localData.articles)
    }

    // 3. Sincronizar estadísticas generales
    if (localData.statistics) {
      await syncGeneralStatistics(userId, localData.statistics)
    }

    // 4. Crear actividad diaria para hoy
    await createTodayActivity(userId, localData.articles)

    console.log('✅ Sincronización forzada completada')
    return true

  } catch (error) {
    console.error('❌ Error en sincronización forzada:', error)
    return false
  }
}

function collectAllLocalData() {
  const data: any = {
    articles: {},
    statistics: {},
    examResults: []
  }

  // Buscar datos de progreso en diferentes formatos posibles
  const progressKeys = [
    'constimaster-user-progress', // Clave actual del sistema
    'userProgress',
    'constitutionProgress',
    'articleProgress',
    'studyProgress'
  ]

  progressKeys.forEach(key => {
    const rawData = localStorage.getItem(key)
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData)
        console.log(`📝 Encontrados datos en '${key}':`, parsed)

        // Si tiene estructura de artículos
        if (parsed.articles) {
          Object.assign(data.articles, parsed.articles)
        } else if (typeof parsed === 'object') {
          // Podría ser directamente los artículos
          Object.keys(parsed).forEach(articleKey => {
            const item = parsed[articleKey]
            if (item && typeof item === 'object' && (item.articleNumber || item.completed !== undefined)) {
              data.articles[articleKey] = item
            }
          })
        }

        // Si tiene estadísticas
        if (parsed.statistics) {
          Object.assign(data.statistics, parsed.statistics)
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo parsear '${key}':`, error)
      }
    }
  })

  // Buscar resultados de exámenes
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('exam-') || key.includes('examResult')) {
      try {
        const examData = JSON.parse(localStorage.getItem(key) || '{}')
        if (examData && examData.score !== undefined) {
          data.examResults.push(examData)
        }
      } catch (error) {
        console.warn(`⚠️ Resultado de examen corrupto en '${key}'`)
      }
    }
  })

  return data
}

async function syncArticleProgress(userId: string, articles: any) {
  console.log('📚 Sincronizando progreso de artículos...')

  const articleArray = Object.values(articles).filter((article: any) =>
    article && typeof article === 'object' && article.articleNumber
  )

  console.log(`📊 Sincronizando ${articleArray.length} artículos...`)

  for (const article of articleArray as any[]) {
    try {
      // Asegurar que tenga title_id
      const titleId = article.titleId || getArticleTitleId(article.articleNumber)

      // Convertir fechas de manera segura
      const completedAt = article.completedAt
        ? (typeof article.completedAt === 'string' ? article.completedAt : new Date(article.completedAt).toISOString())
        : null

      const lastStudiedAt = article.lastStudiedAt
        ? (typeof article.lastStudiedAt === 'string' ? article.lastStudiedAt : new Date(article.lastStudiedAt).toISOString())
        : new Date().toISOString()

      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          article_number: article.articleNumber,
          title_id: titleId,
          is_completed: Boolean(article.completed),
          completed_at: completedAt,
          total_study_time_seconds: article.studyTimeSeconds || 0,
          times_studied: article.timesStudied || 1,
          last_studied_at: lastStudiedAt,
          first_studied_at: article.firstStudiedAt || lastStudiedAt
        }, {
          onConflict: 'user_id,article_number'
        })

      if (error) {
        console.error(`❌ Error sincronizando artículo ${article.articleNumber}:`, error)
      } else {
        console.log(`✅ Artículo ${article.articleNumber} sincronizado`)
      }
    } catch (error) {
      console.error(`❌ Error procesando artículo ${article.articleNumber}:`, error)
    }
  }
}

async function syncGeneralStatistics(userId: string, statistics: any) {
  console.log('📊 Sincronizando estadísticas generales...')

  try {
    // Contar artículos completados de los datos locales
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)

    const completedArticles = progressData?.filter(p => p.is_completed).length || 0
    const totalStudyTime = progressData?.reduce((sum, p) => sum + (p.total_study_time_seconds || 0), 0) || 0

    const { error } = await supabase
      .from('user_statistics')
      .upsert({
        user_id: userId,
        total_articles_studied: completedArticles,
        total_study_time_minutes: Math.floor(totalStudyTime / 60),
        current_streak_days: completedArticles > 0 ? 1 : 0, // Al menos 1 día si hay progreso
        max_streak_days: completedArticles > 0 ? 1 : 0,
        last_study_date: new Date().toISOString().split('T')[0]
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('❌ Error sincronizando estadísticas:', error)
    } else {
      console.log('✅ Estadísticas generales sincronizadas')
    }
  } catch (error) {
    console.error('❌ Error en syncGeneralStatistics:', error)
  }
}

async function createTodayActivity(userId: string, articles: any) {
  console.log('📅 Creando actividad diaria...')

  try {
    const today = new Date().toISOString().split('T')[0]
    const completedToday = Object.values(articles).filter((article: any) => {
      if (!article.completedAt) return false
      const completedDate = new Date(article.completedAt).toISOString().split('T')[0]
      return completedDate === today
    }).length

    const { error } = await supabase
      .from('daily_activity')
      .upsert({
        user_id: userId,
        activity_date: today,
        articles_studied: completedToday,
        exams_taken: 0, // Se actualizará cuando haga exámenes
        questions_answered: 0,
        correct_answers: 0,
        study_time_minutes: 10, // Estimado
        xp_earned: completedToday * 50
      }, {
        onConflict: 'user_id,activity_date'
      })

    if (error) {
      console.error('❌ Error creando actividad diaria:', error)
    } else {
      console.log('✅ Actividad diaria creada')
    }
  } catch (error) {
    console.error('❌ Error en createTodayActivity:', error)
  }
}

// Función para ejecutar desde la consola del navegador
export function debugSyncData() {
  console.log('=== DEBUG: DATOS DE SINCRONIZACIÓN ===')

  // Mostrar datos localStorage
  console.log('📝 localStorage keys:', Object.keys(localStorage).filter(k =>
    k.includes('progress') || k.includes('Progress') || k.includes('exam')
  ))

  // Mostrar progreso principal (clave actual)
  const currentProgress = localStorage.getItem('constimaster-user-progress')
  if (currentProgress) {
    try {
      const parsed = JSON.parse(currentProgress)
      console.log('📊 constimaster-user-progress:', parsed)
      console.log('📈 Artículos completados:', Object.keys(parsed.articles || {}).length)
      console.log('📈 Total estudiados:', parsed.totalArticlesStudied || 0)
    } catch (e) {
      console.log('❌ constimaster-user-progress corrupted')
    }
  }

  // Mostrar progreso anterior (para compatibilidad)
  const userProgress = localStorage.getItem('userProgress')
  if (userProgress) {
    try {
      const parsed = JSON.parse(userProgress)
      console.log('📊 userProgress (legacy):', parsed)
    } catch (e) {
      console.log('❌ userProgress corrupted')
    }
  }

  return 'Debug info shown above'
}

// Función para verificar discrepancias entre localStorage y Supabase
export async function verifyDataConsistency() {
  try {
    console.log('🔍 Verificando consistencia de datos...')

    // Obtener datos locales
    const localProgress = localStorage.getItem('constimaster-user-progress')
    let localArticlesCount = 0

    if (localProgress) {
      const parsed = JSON.parse(localProgress)
      localArticlesCount = Object.keys(parsed.articles || {}).length
      console.log('📱 localStorage - Artículos completados:', localArticlesCount)
    }

    // Obtener datos de Supabase
    const { data: { user } } = await (window as any).supabase.auth.getUser()

    if (user) {
      const { data: userStats } = await (window as any).supabase
        .from('user_statistics')
        .select('total_articles_studied')
        .eq('user_id', user.id)
        .single()

      const { data: userProgress } = await (window as any).supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)

      console.log('🗄️ Supabase user_statistics - Artículos:', userStats?.total_articles_studied || 0)
      console.log('🗄️ Supabase user_progress - Artículos completados:', userProgress?.length || 0)

      // Mostrar discrepancias
      if (localArticlesCount !== (userStats?.total_articles_studied || 0)) {
        console.warn('⚠️ DISCREPANCIA: localStorage vs user_statistics')
      }

      if (localArticlesCount !== (userProgress?.length || 0)) {
        console.warn('⚠️ DISCREPANCIA: localStorage vs user_progress')
      }

      if ((userStats?.total_articles_studied || 0) !== (userProgress?.length || 0)) {
        console.warn('⚠️ DISCREPANCIA: user_statistics vs user_progress')
      }
    }

    return 'Verificación completada'
  } catch (error) {
    console.error('❌ Error verificando consistencia:', error)
    return false
  }
}

// Función para ejecutar la sincronización desde la consola del navegador
export async function forceSync() {
  try {
    console.log('🚀 Iniciando sincronización forzada desde consola...')

    // Verificar si hay usuario autenticado
    const { data: { user } } = await (window as any).supabase.auth.getUser()

    if (!user) {
      console.error('❌ No hay usuario autenticado. Inicia sesión primero.')
      return false
    }

    const success = await forceSyncAllData(user.id)

    if (success) {
      console.log('✅ Sincronización forzada completada exitosamente')
      console.log('🔄 Recarga la página para ver los cambios en las estadísticas')
    } else {
      console.log('❌ Error en la sincronización forzada')
    }

    return success
  } catch (error) {
    console.error('❌ Error ejecutando sincronización forzada:', error)
    return false
  }
}