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

async function fixMappings() {
  console.log('🔧 Arreglando mapeos de artículos...')

  try {
    // 1. Obtener las preguntas existentes en Supabase
    console.log('📋 Obteniendo preguntas existentes de Supabase...')
    const { data: existingQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('id, original_number')

    if (questionsError) throw questionsError

    console.log(`✅ Encontradas ${existingQuestions?.length || 0} preguntas en Supabase`)

    // 2. Parsear los archivos originales para obtener mapeos
    console.log('📂 Parseando archivos originales...')
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

    const mappings = parseArticleMappingFromCSV(mappingCSV)
    const mappedQuestions = mapQuestionsToArticles(questionsWithAnswers, mappings)

    console.log(`✅ ${mappedQuestions.length} preguntas con mapeos disponibles`)

    // 3. Crear mapa de ID de Supabase por número original
    const supabaseIdMap = new Map<number, number>()
    existingQuestions?.forEach(q => {
      supabaseIdMap.set(q.original_number, q.id)
    })

    // 4. Filtrar solo las preguntas que están en Supabase
    const validMappings = mappedQuestions.filter(mq =>
      supabaseIdMap.has(mq.question.originalNumber)
    )

    console.log(`✅ ${validMappings.length} mapeos válidos para insertar`)

    // 5. Insertar mapeos en lotes
    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < validMappings.length; i += batchSize) {
      const batch = validMappings.slice(i, i + batchSize)

      const mappingData = batch.map(item => ({
        question_id: supabaseIdMap.get(item.question.originalNumber)!,
        original_question_number: item.question.originalNumber,
        title_id: item.titleId,
        article_number: item.articleNumber
      }))

      const { error } = await supabase
        .from('question_articles')
        .insert(mappingData)

      if (error) {
        console.error(`Error insertando lote ${i / batchSize + 1}:`, error)
        // Continuar con el siguiente lote
      } else {
        insertedCount += mappingData.length
        console.log(`  ✅ Lote ${i / batchSize + 1}/${Math.ceil(validMappings.length / batchSize)} insertado`)
      }
    }

    console.log(`🎉 ¡Mapeos arreglados! ${insertedCount} mapeos insertados correctamente`)

    // 6. Verificar resultado
    const { data: finalMappings, error: verifyError } = await supabase
      .from('question_articles')
      .select('*', { count: 'exact' })

    if (!verifyError) {
      console.log(`✅ Verificación: ${finalMappings?.length || 0} mapeos totales en la base de datos`)
    }

    return true

  } catch (error) {
    console.error('❌ Error arreglando mapeos:', error)
    return false
  }
}

if (require.main === module) {
  fixMappings()
}

export { fixMappings }