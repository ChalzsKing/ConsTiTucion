import { getQuestionStatistics, searchQuestions } from '../lib/supabase-exam-system'

async function checkDatabase() {
  console.log('🔍 Verificando estado de la base de datos en Supabase...')

  try {
    // Obtener estadísticas
    const stats = await getQuestionStatistics()

    console.log('\n📊 Estadísticas de la base de datos:')
    console.log(`Total de preguntas: ${stats.totalQuestions}`)

    console.log('\nPreguntas por título:')
    for (const [titleId, count] of Object.entries(stats.questionsByTitle)) {
      console.log(`  ${titleId}: ${count} preguntas`)
    }

    // Buscar algunas preguntas de muestra
    console.log('\n🔍 Muestra de preguntas en la base de datos:')
    const sampleQuestions = await searchQuestions('constitución', 5)

    for (const question of sampleQuestions) {
      console.log(`\nPregunta ${question.original_number}:`)
      console.log(`  ${question.question_text.substring(0, 100)}...`)
      console.log(`  Opción A: ${question.option_a}`)
      console.log(`  Respuesta correcta: ${question.correct_answer}`)
    }

    console.log('\n✅ Verificación completa')

  } catch (error) {
    console.error('❌ Error verificando la base de datos:', error)
  }
}

if (require.main === module) {
  checkDatabase()
}

export { checkDatabase }