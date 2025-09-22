import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

// Cargar variables de entorno
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import {
  parseQuestionsImproved,
  parseAnswersImproved,
  combineQuestionsWithAnswersImproved
} from '../lib/migration/improved-parser'
import { parseArticleMappingFromCSV, mapQuestionsToArticles } from '../lib/migration/parse-questions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function completeAllMappings() {
  console.log('🔧 Completando TODOS los mapeos de artículos...')

  try {
    // 1. Limpiar mapeos existentes
    console.log('🧹 Limpiando mapeos existentes...')
    const { error: deleteError } = await supabase
      .from('question_articles')
      .delete()
      .neq('id', 0) // Delete all

    if (deleteError) {
      console.warn('⚠️ Warning al limpiar mapeos:', deleteError)
    }

    // 2. Obtener todas las preguntas existentes en Supabase
    console.log('📋 Obteniendo preguntas existentes de Supabase...')
    const { data: existingQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('id, original_number')

    if (questionsError) throw questionsError

    console.log(`✅ Encontradas ${existingQuestions?.length || 0} preguntas en Supabase`)

    // 3. Parsear los archivos originales para obtener TODOS los mapeos
    console.log('📂 Parseando archivos originales para obtener todos los mapeos...')
    const questionsFile = join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
    const answersFile1 = join(process.cwd(), 'recursos', '1600 respuestas constitucion.txt')
    const answersFile2 = join(process.cwd(), 'recursos', '1600 respuestas constitucion (2).txt')
    const mappingFile = join(process.cwd(), 'recursos', 'constitucion_completo.csv')

    const questionsText = fs.readFileSync(questionsFile, 'utf-8')
    const answersText1 = fs.readFileSync(answersFile1, 'utf-8')
    const answersText2 = fs.readFileSync(answersFile2, 'utf-8')
    const mappingCSV = fs.readFileSync(mappingFile, 'utf-8')

    const parsedQuestions = parseQuestionsImproved(questionsText)
    const answers = parseAnswersImproved(answersText1, answersText2)
    const questionsWithAnswers = combineQuestionsWithAnswersImproved(parsedQuestions, answers)

    console.log(`✅ ${parsedQuestions.length} preguntas parseadas`)
    console.log(`✅ ${answers.length} respuestas parseadas`)
    console.log(`✅ ${questionsWithAnswers.length} preguntas con respuestas combinadas`)

    const mappings = parseArticleMappingFromCSV(mappingCSV)
    const mappedQuestions = mapQuestionsToArticles(questionsWithAnswers, mappings)

    console.log(`✅ ${mappedQuestions.length} preguntas con mapeos disponibles`)

    // 4. Crear mapa de ID de Supabase por número original
    const supabaseIdMap = new Map<number, number>()
    existingQuestions?.forEach(q => {
      supabaseIdMap.set(q.original_number, q.id)
    })

    // 5. Filtrar solo las preguntas que están en Supabase Y tienen mapeo
    const validMappings = mappedQuestions.filter(mq =>
      supabaseIdMap.has(mq.question.originalNumber) &&
      mq.titleId &&
      mq.articleNumber
    )

    console.log(`✅ ${validMappings.length} mapeos válidos para insertar`)

    // 6. Insertar TODOS los mapeos en lotes
    const batchSize = 50
    let insertedCount = 0
    let errors = 0

    for (let i = 0; i < validMappings.length; i += batchSize) {
      const batch = validMappings.slice(i, i + batchSize)

      const mappingData = batch.map(item => ({
        question_id: supabaseIdMap.get(item.question.originalNumber)!,
        original_question_number: item.question.originalNumber,
        title_id: item.titleId,
        article_number: item.articleNumber
      }))

      console.log(`  📤 Insertando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(validMappings.length / batchSize)} (${mappingData.length} mapeos)...`)

      const { error } = await supabase
        .from('question_articles')
        .insert(mappingData)

      if (error) {
        console.error(`  ❌ Error insertando lote ${Math.floor(i / batchSize) + 1}:`, error)
        errors++
      } else {
        insertedCount += mappingData.length
        console.log(`  ✅ Lote ${Math.floor(i / batchSize) + 1} insertado correctamente`)
      }
    }

    console.log(`🎉 ¡Mapeos completados!`)
    console.log(`✅ ${insertedCount} mapeos insertados correctamente`)
    if (errors > 0) {
      console.log(`⚠️ ${errors} lotes con errores`)
    }

    // 7. Verificar resultado final
    const { data: finalMappings, error: verifyError } = await supabase
      .from('question_articles')
      .select('*', { count: 'exact' })

    if (!verifyError) {
      console.log(`📊 Verificación: ${finalMappings?.length || 0} mapeos totales en la base de datos`)
    }

    // 8. Estadísticas por título
    const { data: titleStats, error: titleError } = await supabase
      .from('question_articles')
      .select('title_id, article_number')
      .order('title_id, article_number')

    if (!titleError && titleStats) {
      console.log('\n📚 Mapeos por título:')

      const byTitle: Record<string, Set<number>> = {}
      titleStats.forEach(item => {
        if (!byTitle[item.title_id]) {
          byTitle[item.title_id] = new Set()
        }
        byTitle[item.title_id].add(item.article_number)
      })

      Object.keys(byTitle).sort().forEach(titleId => {
        const articles = Array.from(byTitle[titleId]).sort((a, b) => a - b)
        console.log(`  ${titleId}: ${articles.length} artículos (${articles[0]}-${articles[articles.length - 1]})`)
      })
    }

    return true

  } catch (error) {
    console.error('❌ Error completando mapeos:', error)
    return false
  }
}

if (require.main === module) {
  completeAllMappings()
}

export { completeAllMappings }