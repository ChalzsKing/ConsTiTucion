import fs from 'fs'
import path from 'path'
import {
  parseQuestionsFromText,
  parseMultipleAnswerFiles,
  parseArticleMappingFromCSV,
  combineQuestionsWithAnswers,
  mapQuestionsToArticles
} from '../lib/migration/parse-questions'

async function validateData() {
  console.log('🔍 Validando integridad de archivos de datos...')

  try {
    // Verificar existencia de archivos
    const questionsFile = path.join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
    const answersFile1 = path.join(process.cwd(), 'recursos', '1600 respuestas constitucion.txt')
    const answersFile2 = path.join(process.cwd(), 'recursos', '1600 respuestas constitucion (2).txt')
    const mappingFile = path.join(process.cwd(), 'recursos', 'constitucion_completo.csv')

    console.log('📁 Verificando archivos...')

    const files = [
      { name: 'Preguntas', path: questionsFile },
      { name: 'Respuestas 1', path: answersFile1 },
      { name: 'Respuestas 2', path: answersFile2 },
      { name: 'Mapeo CSV', path: mappingFile }
    ]

    for (const file of files) {
      if (!fs.existsSync(file.path)) {
        throw new Error(`❌ Archivo no encontrado: ${file.name} en ${file.path}`)
      }
      const stats = fs.statSync(file.path)
      console.log(`  ✅ ${file.name}: ${(stats.size / 1024).toFixed(1)} KB`)
    }

    // Leer y parsear archivos
    console.log('\n📋 Parseando datos...')

    const questionsText = fs.readFileSync(questionsFile, 'utf-8')
    const answersText1 = fs.readFileSync(answersFile1, 'utf-8')
    const answersText2 = fs.readFileSync(answersFile2, 'utf-8')
    const mappingCSV = fs.readFileSync(mappingFile, 'utf-8')

    const parsedQuestions = parseQuestionsFromText(questionsText)
    console.log(`  📊 Preguntas parseadas: ${parsedQuestions.length}`)

    const parsedAnswers = parseMultipleAnswerFiles(answersText1, answersText2)
    console.log(`  📊 Respuestas parseadas: ${Object.keys(parsedAnswers).length}`)

    const mappings = parseArticleMappingFromCSV(mappingCSV)
    console.log(`  📊 Mapeos parseados: ${mappings.length}`)

    // Validar coherencia
    console.log('\n🔗 Validando coherencia de datos...')

    const questionsWithAnswers = combineQuestionsWithAnswers(parsedQuestions, parsedAnswers)
    console.log(`  ✅ Preguntas con respuestas: ${questionsWithAnswers.length}`)

    const questionsWithoutAnswers = parsedQuestions.filter(q =>
      !parsedAnswers[q.originalNumber]
    )

    if (questionsWithoutAnswers.length > 0) {
      console.log(`  ⚠️  Preguntas sin respuesta: ${questionsWithoutAnswers.length}`)
      console.log(`     Primeras 5: ${questionsWithoutAnswers.slice(0, 5).map(q => q.originalNumber).join(', ')}`)
    }

    // Remover duplicados
    const uniqueQuestions = questionsWithAnswers.filter((question, index, array) =>
      index === array.findIndex(q => q.originalNumber === question.originalNumber)
    )

    const duplicateCount = questionsWithAnswers.length - uniqueQuestions.length
    if (duplicateCount > 0) {
      console.log(`  🔄 Preguntas duplicadas removidas: ${duplicateCount}`)
    }

    console.log(`  ✅ Preguntas únicas finales: ${uniqueQuestions.length}`)

    // Validar mapeos
    const mappedQuestions = mapQuestionsToArticles(uniqueQuestions, mappings)
    console.log(`  🗂️  Preguntas mapeadas a artículos: ${mappedQuestions.length}`)

    const unmappedQuestions = uniqueQuestions.length - mappedQuestions.length
    if (unmappedQuestions > 0) {
      console.log(`  ⚠️  Preguntas sin mapeo a artículo: ${unmappedQuestions}`)
    }

    // Estadísticas por título
    console.log('\n📊 Distribución por títulos:')
    const titleStats: Record<string, number> = {}

    mappedQuestions.forEach(mq => {
      titleStats[mq.titleId] = (titleStats[mq.titleId] || 0) + 1
    })

    for (const [titleId, count] of Object.entries(titleStats)) {
      console.log(`  ${titleId}: ${count} preguntas`)
    }

    // Validar que tenemos datos para todos los títulos principales
    const expectedTitles = ['titulo1', 'titulo2', 'titulo3', 'titulo4', 'titulo5', 'titulo6', 'titulo7', 'titulo8', 'titulo9', 'titulo10']
    const missingTitles = expectedTitles.filter(title => !titleStats[title])

    if (missingTitles.length > 0) {
      console.log(`  ⚠️  Títulos sin preguntas: ${missingTitles.join(', ')}`)
    }

    console.log('\n✅ Validación completada exitosamente')

    return {
      success: true,
      totalQuestions: uniqueQuestions.length,
      mappedQuestions: mappedQuestions.length,
      titleStats,
      missingTitles
    }

  } catch (error) {
    console.error('❌ Error en validación:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

if (require.main === module) {
  validateData()
}

export { validateData }