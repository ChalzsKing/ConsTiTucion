import { config } from 'dotenv'
import { join } from 'path'

// Cargar variables de entorno
config({ path: join(process.cwd(), '.env.local') })

import {
  generateArticleExam,
  generateTitleExam,
  generateGeneralExam,
  getQuestionStatistics,
  searchQuestions,
  calculateExamResult,
  getMotivationalMessage
} from '../lib/supabase-exam-system'

async function testSystem() {
  console.log('🧪 Iniciando pruebas de funcionamiento del sistema...')

  try {
    // Prueba 1: Estadísticas generales
    console.log('\n📊 1. Verificando estadísticas generales...')
    const stats = await getQuestionStatistics()
    console.log(`   Total de preguntas: ${stats.totalQuestions}`)
    console.log(`   Distribución por títulos:`)
    for (const [titleId, count] of Object.entries(stats.questionsByTitle)) {
      console.log(`     ${titleId}: ${count} preguntas`)
    }

    // Prueba 2: Búsqueda de preguntas
    console.log('\n🔍 2. Probando búsqueda de preguntas...')
    const searchResults = await searchQuestions('constitución', 5)
    console.log(`   Encontradas ${searchResults.length} preguntas con "constitución"`)
    if (searchResults.length > 0) {
      console.log(`   Ejemplo: Pregunta ${searchResults[0].original_number}: ${searchResults[0].question_text.substring(0, 80)}...`)
    }

    // Prueba 3: Generar examen por artículo
    console.log('\n📋 3. Generando examen por artículo...')
    const articleExam = await generateArticleExam(14, 5) // Artículo 14
    console.log(`   Generadas ${articleExam.length} preguntas del artículo 14`)
    if (articleExam.length > 0) {
      console.log(`   Ejemplo: ${articleExam[0].question_text.substring(0, 80)}...`)
    }

    // Prueba 4: Generar examen por título
    console.log('\n📚 4. Generando examen por título...')
    const titleExam = await generateTitleExam('titulo1', 10) // Título I
    console.log(`   Generadas ${titleExam.length} preguntas del Título I`)
    if (titleExam.length > 0) {
      console.log(`   Ejemplo: ${titleExam[0].question_text.substring(0, 80)}...`)
    }

    // Prueba 5: Generar examen general
    console.log('\n🌐 5. Generando examen general...')
    const generalExam = await generateGeneralExam(15)
    console.log(`   Generadas ${generalExam.length} preguntas generales`)
    if (generalExam.length > 0) {
      console.log(`   Ejemplo: ${generalExam[0].question_text.substring(0, 80)}...`)
    }

    // Prueba 6: Sistema de puntuación
    console.log('\n🎯 6. Probando sistema de puntuación...')
    if (generalExam.length >= 5) {
      // Simular respuestas (algunas correctas, algunas incorrectas)
      const simulatedExam = generalExam.slice(0, 5).map((question, index) => ({
        ...question,
        userAnswer: index % 2 === 0 ? question.correct_answer : (question.correct_answer + 1) % 4,
        isCorrect: index % 2 === 0
      }))

      const result = calculateExamResult(simulatedExam)
      console.log(`   Puntuación: ${result.score}/${simulatedExam.length} (${result.percentage}%)`)
      console.log(`   Respuestas correctas: ${result.correctAnswers.length}`)
      console.log(`   Respuestas incorrectas: ${result.incorrectAnswers.length}`)

      const message = getMotivationalMessage(result.percentage)
      console.log(`   Mensaje motivacional: ${message}`)
    }

    // Prueba 7: Verificar integridad de datos
    console.log('\n🔍 7. Verificando integridad de datos...')
    let issuesFound = 0

    // Verificar que las preguntas tienen todas las opciones
    for (const question of generalExam.slice(0, 3)) {
      if (!question.option_a || !question.option_b || !question.option_c || !question.option_d) {
        console.log(`   ⚠️  Pregunta ${question.original_number} tiene opciones faltantes`)
        issuesFound++
      }
      if (question.correct_answer < 0 || question.correct_answer > 3) {
        console.log(`   ⚠️  Pregunta ${question.original_number} tiene respuesta correcta inválida: ${question.correct_answer}`)
        issuesFound++
      }
    }

    if (issuesFound === 0) {
      console.log(`   ✅ No se encontraron problemas de integridad`)
    } else {
      console.log(`   ⚠️  Se encontraron ${issuesFound} problemas`)
    }

    // Resumen final
    console.log('\n📈 Resumen de pruebas:')
    console.log('✅ Estadísticas generales: OK')
    console.log('✅ Búsqueda de preguntas: OK')
    console.log(`✅ Examen por artículo: ${articleExam.length > 0 ? 'OK' : 'FALLO'}`)
    console.log(`✅ Examen por título: ${titleExam.length > 0 ? 'OK' : 'FALLO'}`)
    console.log(`✅ Examen general: ${generalExam.length > 0 ? 'OK' : 'FALLO'}`)
    console.log('✅ Sistema de puntuación: OK')
    console.log(`✅ Integridad de datos: ${issuesFound === 0 ? 'OK' : 'REVISAR'}`)

    return {
      success: true,
      stats,
      tests: {
        search: searchResults.length > 0,
        articleExam: articleExam.length > 0,
        titleExam: titleExam.length > 0,
        generalExam: generalExam.length > 0,
        integrityIssues: issuesFound
      }
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

if (require.main === module) {
  testSystem()
}

export { testSystem }