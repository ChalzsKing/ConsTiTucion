const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkProgressData() {
  console.log('🔍 Verificando datos de progreso...\n')

  // Usar un userId fijo (reemplaza con tu userId real)
  const userId = '74678d1b-217f-4c24-a698-d266b7f22a0f'
  console.log(`👤 Verificando datos para usuario: ${userId}\n`)

  // 1. Contar artículos en user_progress
  const { data: progressData, error: progressError } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)

  const progressCount = progressData?.length || 0
  const completedCount = progressData?.filter(p => p.is_completed).length || 0

  console.log('📚 user_progress:')
  console.log(`   Total registros: ${progressCount}`)
  console.log(`   Completados: ${completedCount}`)

  if (progressData && progressData.length > 0) {
    const sortedArticles = progressData.map(p => p.article_number).sort((a,b) => a-b)
    const completedArticles = progressData.filter(p => p.is_completed).map(p => p.article_number).sort((a,b) => a-b)
    console.log('   Artículos registrados:', sortedArticles.join(', '))
    console.log('   Artículos completados:', completedArticles.join(', '))
  }

  // 2. Revisar user_statistics
  const { data: statsData, error: statsError } = await supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', userId)
    .single()

  console.log('\n📊 user_statistics:')
  if (statsData) {
    console.log(`   total_articles_studied: ${statsData.total_articles_studied}`)
    console.log(`   total_study_time_minutes: ${statsData.total_study_time_minutes}`)
    console.log(`   total_exams_taken: ${statsData.total_exams_taken}`)
    console.log(`   current_streak_days: ${statsData.current_streak_days}`)
    console.log(`   average_exam_score: ${statsData.average_exam_score}`)
  } else {
    console.log('   ⚠️ No hay datos en user_statistics')
    if (statsError) console.log('   Error:', statsError.message)
  }

  // 3. Revisar exam_history
  const { data: examData, error: examError } = await supabase
    .from('exam_history')
    .select('*')
    .eq('user_id', userId)

  const examCount = examData?.length || 0

  console.log('\n📝 exam_history:')
  console.log(`   Total exámenes: ${examCount}`)
  if (examData && examData.length > 0) {
    examData.forEach(exam => {
      console.log(`   - ${exam.exam_type}: ${exam.correct_answers}/${exam.total_questions} (${exam.score_percentage}%)`)
    })
  }

  // 4. Comparar inconsistencias
  console.log('\n⚠️ ANÁLISIS DE INCONSISTENCIAS:')
  const articlesInProgress = progressCount
  const articlesCompleted = completedCount
  const articlesInStats = statsData?.total_articles_studied || 0
  const examsInHistory = examCount
  const examsInStats = statsData?.total_exams_taken || 0

  console.log(`   user_progress tiene ${articlesInProgress} registros, ${articlesCompleted} completados`)
  console.log(`   user_statistics dice ${articlesInStats} artículos estudiados`)
  console.log(`   exam_history tiene ${examsInHistory} exámenes`)
  console.log(`   user_statistics dice ${examsInStats} exámenes realizados`)

  if (articlesCompleted !== articlesInStats) {
    console.log(`\n❌ INCONSISTENCIA: user_progress (${articlesCompleted}) ≠ user_statistics (${articlesInStats})`)
    console.log('   💡 Solución: Actualizar user_statistics.total_articles_studied')
  } else {
    console.log('\n✅ Artículos: Contadores coherentes')
  }

  if (examsInHistory !== examsInStats) {
    console.log(`\n❌ INCONSISTENCIA: exam_history (${examsInHistory}) ≠ user_statistics (${examsInStats})`)
    console.log('   💡 Solución: Actualizar user_statistics.total_exams_taken')
  } else {
    console.log('✅ Exámenes: Contadores coherentes')
  }
}

checkProgressData().catch(console.error)
