import fs from 'fs'
import path from 'path'
import {
  parseQuestionsImproved,
  parseAnswersImproved,
  combineQuestionsWithAnswersImproved
} from '../lib/migration/improved-parser'

async function testImprovedParser() {
  console.log('🧪 Probando el parser mejorado...')

  try {
    const questionsFile = path.join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
    const answersFile1 = path.join(process.cwd(), 'recursos', '1600 respuestas constitucion.txt')
    const answersFile2 = path.join(process.cwd(), 'recursos', '1600 respuestas constitucion (2).txt')

    // Leer archivos
    const questionsText = fs.readFileSync(questionsFile, 'utf-8')
    const answersText1 = fs.readFileSync(answersFile1, 'utf-8')
    const answersText2 = fs.readFileSync(answersFile2, 'utf-8')

    console.log('📋 Parseando preguntas con parser mejorado...')
    const questions = parseQuestionsImproved(questionsText)

    console.log('📋 Parseando respuestas...')
    const answers = parseAnswersImproved(answersText1, answersText2)

    console.log('🔗 Combinando preguntas con respuestas...')
    const questionsWithAnswers = combineQuestionsWithAnswersImproved(questions, answers)

    console.log('\n📊 Resultados:')
    console.log(`  Preguntas parseadas: ${questions.length}`)
    console.log(`  Respuestas parseadas: ${Object.keys(answers).length}`)
    console.log(`  Preguntas con respuestas: ${questionsWithAnswers.length}`)

    // Mostrar muestra de las primeras preguntas
    console.log('\n📝 Muestra de las primeras 3 preguntas:')
    questionsWithAnswers.slice(0, 3).forEach(q => {
      const correctLetter = ['A', 'B', 'C', 'D'][q.correctAnswer]
      console.log(`\n${q.originalNumber}.- ${q.questionText.substring(0, 80)}...`)
      console.log(`  a) ${q.optionA.substring(0, 50)}...`)
      console.log(`  b) ${q.optionB.substring(0, 50)}...`)
      console.log(`  c) ${q.optionC.substring(0, 50)}...`)
      console.log(`  d) ${q.optionD.substring(0, 50)}...`)
      console.log(`  ✅ Respuesta correcta: ${correctLetter}`)
    })

    // Verificar distribución de números de pregunta
    const questionNumbers = questionsWithAnswers.map(q => q.originalNumber).sort((a, b) => a - b)
    console.log('\n📊 Rango de preguntas:')
    console.log(`  Primera pregunta: ${questionNumbers[0]}`)
    console.log(`  Última pregunta: ${questionNumbers[questionNumbers.length - 1]}`)
    console.log(`  Total únicas: ${new Set(questionNumbers).size}`)

    // Verificar duplicados
    const duplicates = questionNumbers.filter((num, index) => questionNumbers.indexOf(num) !== index)
    if (duplicates.length > 0) {
      console.log(`  ⚠️  Preguntas duplicadas: ${duplicates.length}`)
    }

    return {
      success: true,
      totalQuestions: questions.length,
      questionsWithAnswers: questionsWithAnswers.length,
      firstQuestion: questionNumbers[0],
      lastQuestion: questionNumbers[questionNumbers.length - 1]
    }

  } catch (error) {
    console.error('❌ Error en prueba:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

if (require.main === module) {
  testImprovedParser()
}

export { testImprovedParser }