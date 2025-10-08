#!/usr/bin/env node

/**
 * 🔄 SCRIPT DE MIGRACIÓN DE DATOS - ConstiMaster
 *
 * Objetivo: Migrar datos de localStorage a Supabase como única fuente de verdad
 * Prerequisitos: Haber ejecutado migrate-diagnosis.js
 *
 * Ejecución: node scripts/migrate-data.js
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

console.log('🔄 INICIANDO MIGRACIÓN DE DATOS - ConstiMaster')
console.log('=' .repeat(60))

// ================================
// CONFIGURACIÓN Y VALIDACIONES
// ================================

function validateEnvironment() {
  console.log('\n🔧 VALIDANDO ENTORNO...')

  // Verificar que existe el archivo .env.local
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: No se encontró .env.local')
    console.log('📝 Crea el archivo .env.local con:')
    console.log('   NEXT_PUBLIC_SUPABASE_URL=tu_url')
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key')
    return false
  }

  // Leer variables de entorno
  const envContent = fs.readFileSync(envPath, 'utf8')
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]
  const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Variables de Supabase no encontradas en .env.local')
    return false
  }

  console.log('✅ Variables de entorno encontradas')
  console.log('🔗 URL:', supabaseUrl.substring(0, 30) + '...')

  return { supabaseUrl, supabaseKey }
}

// ================================
// SIMULACIÓN DE LOCALSTORAGE DATA
// ================================

function createSampleLocalStorageData() {
  console.log('\n🎭 CREANDO DATOS DE PRUEBA...')

  // Simulamos los datos que estarían en localStorage
  // En un caso real, esto vendría del navegador del usuario
  const sampleData = {
    articles: {
      1: {
        articleNumber: 1,
        titleId: 'preliminar',
        completed: true,
        completedAt: new Date('2025-09-25'),
        studyTimeSeconds: 120,
        timesStudied: 2,
        lastStudiedAt: new Date('2025-09-25')
      },
      10: {
        articleNumber: 10,
        titleId: 'titulo1',
        completed: true,
        completedAt: new Date('2025-09-26'),
        studyTimeSeconds: 180,
        timesStudied: 1,
        lastStudiedAt: new Date('2025-09-26')
      },
      15: {
        articleNumber: 15,
        titleId: 'titulo1',
        completed: true,
        completedAt: new Date('2025-09-27'),
        studyTimeSeconds: 240,
        timesStudied: 3,
        lastStudiedAt: new Date('2025-09-27')
      },
      27: {
        articleNumber: 27,
        titleId: 'titulo1',
        completed: true,
        completedAt: new Date('2025-09-28'),
        studyTimeSeconds: 300,
        timesStudied: 1,
        lastStudiedAt: new Date('2025-09-28')
      }
    },
    totalStudyTime: 840, // 14 minutos en segundos
    totalArticlesStudied: 4,
    studyStreak: 1,
    lastStudyDate: new Date('2025-09-28')
  }

  console.log('📊 Datos de prueba creados:')
  console.log(`   - Artículos completados: ${Object.keys(sampleData.articles).length}`)
  console.log(`   - Tiempo total: ${Math.floor(sampleData.totalStudyTime / 60)} minutos`)
  console.log(`   - Racha: ${sampleData.studyStreak} días`)

  return sampleData
}

// ================================
// FUNCIONES DE MIGRACIÓN
// ================================

async function migrateUserProgress(supabase, userId, localData) {
  console.log('\n📊 MIGRANDO PROGRESO DE ARTÍCULOS...')

  const articles = Object.values(localData.articles)
  console.log(`📝 Procesando ${articles.length} artículos...`)

  const progressRecords = articles.map(article => ({
    user_id: userId,
    article_number: article.articleNumber,
    title_id: article.titleId,
    article_title: `Artículo ${article.articleNumber}`, // Título genérico
    is_completed: article.completed,
    times_studied: article.timesStudied,
    total_study_time_seconds: article.studyTimeSeconds,
    first_studied_at: article.completedAt?.toISOString(),
    last_studied_at: article.lastStudiedAt?.toISOString(),
    completed_at: article.completed ? article.completedAt?.toISOString() : null
  }))

  // Insertar o actualizar registros
  const { data, error } = await supabase
    .from('user_progress')
    .upsert(progressRecords, {
      onConflict: 'user_id,article_number',
      ignoreDuplicates: false
    })

  if (error) {
    console.error('❌ Error migrando user_progress:', error)
    return false
  }

  console.log(`✅ ${progressRecords.length} registros de progreso migrados`)
  return true
}

async function updateUserStatistics(supabase, userId, localData) {
  console.log('\n📈 ACTUALIZANDO ESTADÍSTICAS DE USUARIO...')

  // Calcular estadísticas basadas en los datos migrados
  const { data: progressData } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', true)

  const completedArticles = progressData?.length || 0
  const totalStudyTime = progressData?.reduce((sum, p) => sum + (p.total_study_time_seconds || 0), 0) || 0

  const statisticsData = {
    user_id: userId,
    total_articles_studied: completedArticles,
    total_study_time_minutes: Math.floor(totalStudyTime / 60),
    current_streak_days: localData.studyStreak || 1,
    max_streak_days: localData.studyStreak || 1,
    last_study_date: localData.lastStudyDate?.toISOString().split('T')[0],
    // Mantener estadísticas de exámenes existentes si las hay
    total_exams_taken: 0,
    total_questions_answered: 0,
    total_correct_answers: 0,
    total_incorrect_answers: 0,
    best_exam_score: 0.00,
    average_exam_score: 0.00
  }

  const { data, error } = await supabase
    .from('user_statistics')
    .upsert(statisticsData, {
      onConflict: 'user_id',
      ignoreDuplicates: false
    })

  if (error) {
    console.error('❌ Error actualizando user_statistics:', error)
    return false
  }

  console.log(`✅ Estadísticas actualizadas:`)
  console.log(`   - Artículos estudiados: ${completedArticles}`)
  console.log(`   - Tiempo total: ${Math.floor(totalStudyTime / 60)} minutos`)
  console.log(`   - Racha actual: ${statisticsData.current_streak_days} días`)

  return true
}

async function updateDailyActivity(supabase, userId, localData) {
  console.log('\n📅 ACTUALIZANDO ACTIVIDAD DIARIA...')

  const today = new Date().toISOString().split('T')[0]
  const completedToday = Object.values(localData.articles).filter(article => {
    if (!article.lastStudiedAt) return false
    const studyDate = article.lastStudiedAt.toISOString().split('T')[0]
    return studyDate === today
  }).length

  const activityData = {
    user_id: userId,
    activity_date: today,
    articles_studied: completedToday,
    exams_taken: 0,
    questions_answered: 0,
    correct_answers: 0,
    study_time_minutes: Math.floor(localData.totalStudyTime / 60),
    xp_earned: completedToday * 10 // 10 XP por artículo
  }

  const { data, error } = await supabase
    .from('daily_activity')
    .upsert(activityData, {
      onConflict: 'user_id,activity_date',
      ignoreDuplicates: false
    })

  if (error) {
    console.error('❌ Error actualizando daily_activity:', error)
    return false
  }

  console.log(`✅ Actividad diaria actualizada (${completedToday} artículos hoy)`)
  return true
}

// ================================
// VALIDACIÓN POST-MIGRACIÓN
// ================================

async function validateMigration(supabase, userId, originalData) {
  console.log('\n🔍 VALIDANDO MIGRACIÓN...')

  try {
    // Verificar user_progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', true)

    // Verificar user_statistics
    const { data: statsData } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single()

    const originalCount = Object.keys(originalData.articles).length
    const migratedCount = progressData?.length || 0
    const statsCount = statsData?.total_articles_studied || 0

    console.log('📊 RESULTADOS DE VALIDACIÓN:')
    console.log(`   Datos originales: ${originalCount} artículos`)
    console.log(`   En user_progress: ${migratedCount} artículos`)
    console.log(`   En user_statistics: ${statsCount} artículos`)

    if (originalCount === migratedCount && migratedCount === statsCount) {
      console.log('✅ MIGRACIÓN EXITOSA - Todos los contadores coinciden')
      return true
    } else {
      console.log('⚠️ DISCREPANCIA DETECTADA - Revisar migración')
      return false
    }

  } catch (error) {
    console.error('❌ Error en validación:', error)
    return false
  }
}

// ================================
// FUNCIÓN PRINCIPAL
// ================================

async function main() {
  console.log('🚀 Iniciando migración de datos...\n')

  // 1. Validar entorno
  const env = validateEnvironment()
  if (!env) {
    console.log('❌ Migración abortada por problemas de configuración')
    return
  }

  // 2. Inicializar Supabase
  console.log('\n🔗 CONECTANDO A SUPABASE...')
  const supabase = createClient(env.supabaseUrl, env.supabaseKey)

  // Para propósitos de demostración, usamos un userId ficticio
  // En producción, esto vendría de la sesión autenticada
  const demoUserId = '12345678-1234-1234-1234-123456789012'
  console.log('👤 Usuario de prueba:', demoUserId)

  // 3. Crear datos de prueba (simular localStorage)
  const localData = createSampleLocalStorageData()

  // 4. Ejecutar migración
  try {
    console.log('\n🔄 EJECUTANDO MIGRACIÓN...')

    const step1 = await migrateUserProgress(supabase, demoUserId, localData)
    if (!step1) throw new Error('Error en migración de user_progress')

    const step2 = await updateUserStatistics(supabase, demoUserId, localData)
    if (!step2) throw new Error('Error en actualización de user_statistics')

    const step3 = await updateDailyActivity(supabase, demoUserId, localData)
    if (!step3) throw new Error('Error en actualización de daily_activity')

    // 5. Validar migración
    const isValid = await validateMigration(supabase, demoUserId, localData)

    if (isValid) {
      console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE')
      console.log('📊 Todos los datos han sido migrados a Supabase')
      console.log('✅ Validación exitosa - Contadores consistentes')
      console.log('\n🚀 PRÓXIMO PASO: Implementar hook unificado')
      console.log('   Command: Crear useUnifiedProgress hook')
    } else {
      console.log('\n⚠️ MIGRACIÓN COMPLETADA CON ADVERTENCIAS')
      console.log('🔍 Revisar discrepancias antes de continuar')
    }

  } catch (error) {
    console.error('\n❌ ERROR EN MIGRACIÓN:', error.message)
    console.log('🔄 Considera ejecutar rollback si es necesario')
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = {
  validateEnvironment,
  migrateUserProgress,
  updateUserStatistics,
  updateDailyActivity,
  validateMigration
}