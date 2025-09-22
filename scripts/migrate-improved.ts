import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

// Cargar variables de entorno
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import {
  parseQuestionsImproved,
  parseAnswersImproved,
  combineQuestionsWithAnswersImproved,
  ParsedQuestion
} from '../lib/migration/improved-parser'
import { parseArticleMappingFromCSV, mapQuestionsToArticles } from '../lib/migration/parse-questions'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface DatabaseQuestion {
  original_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: number
}

interface DatabaseQuestionArticle {
  question_id: number
  original_question_number: number
  title_id: string
  article_number: number
}

async function migrateImproved(batchRange?: { start: number; end: number }) {
  console.log('🚀 Iniciando migración mejorada a Supabase...')

  try {
    // Leer archivos
    const questionsFile = join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
    const answersFile1 = join(process.cwd(), 'recursos', '1600 respuestas constitucion.txt')
    const answersFile2 = join(process.cwd(), 'recursos', '1600 respuestas constitucion (2).txt')
    const mappingFile = join(process.cwd(), 'recursos', 'constitucion_completo.csv')

    const questionsText = fs.readFileSync(questionsFile, 'utf-8')
    const answersText1 = fs.readFileSync(answersFile1, 'utf-8')
    const answersText2 = fs.readFileSync(answersFile2, 'utf-8')
    const mappingCSV = fs.readFileSync(mappingFile, 'utf-8')

    // Parsear con el parser mejorado
    console.log('📋 Parseando preguntas...')
    const questions = parseQuestionsImproved(questionsText)

    console.log('📋 Parseando respuestas...')
    const answers = parseAnswersImproved(answersText1, answersText2)

    console.log('🔗 Combinando preguntas con respuestas...')
    const questionsWithAnswers = combineQuestionsWithAnswersImproved(questions, answers)

    // Filtrar por rango si se especifica
    let filteredQuestions = questionsWithAnswers
    if (batchRange) {
      filteredQuestions = questionsWithAnswers.filter(q =>
        q.originalNumber >= batchRange.start && q.originalNumber <= batchRange.end
      )
      console.log(`🎯 Filtrando preguntas ${batchRange.start}-${batchRange.end}: ${filteredQuestions.length} preguntas`)
    }

    // Parsear mapeos de artículos
    console.log('🗂️ Parseando mapeos de artículos...')
    const mappings = parseArticleMappingFromCSV(mappingCSV)
    const mappedQuestions = mapQuestionsToArticles(filteredQuestions, mappings)

    console.log(`📊 Resumen de datos a migrar:`)
    console.log(`  - Preguntas totales: ${questionsWithAnswers.length}`)
    console.log(`  - Preguntas en este lote: ${filteredQuestions.length}`)
    console.log(`  - Preguntas mapeadas: ${mappedQuestions.length}`)

    // Insertar preguntas
    console.log('💾 Insertando preguntas en Supabase...')
    const insertedQuestions = await insertQuestions(filteredQuestions)

    // Insertar mapeos
    console.log('🔗 Insertando mapeos de artículos...')
    await insertQuestionArticleMappings(mappedQuestions, insertedQuestions)

    console.log('✅ Migración completada exitosamente!')

    return {
      success: true,
      totalQuestions: insertedQuestions.length,
      totalMappings: mappedQuestions.length,
      range: batchRange
    }

  } catch (error) {
    console.error('❌ Error en migración:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

async function insertQuestions(questions: ParsedQuestion[]): Promise<Array<{ id: number; original_number: number }>> {
  const batchSize = 100
  const results: Array<{ id: number; original_number: number }> = []

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize)

    const dbQuestions: DatabaseQuestion[] = batch.map(q => ({
      original_number: q.originalNumber,
      question_text: q.questionText,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_answer: q.correctAnswer
    }))

    const { data, error } = await supabase
      .from('questions')
      .insert(dbQuestions)
      .select('id, original_number')

    if (error) {
      console.error(`Error insertando lote ${i / batchSize + 1}:`, error)
      throw error
    }

    if (data) {
      results.push(...data)
    }

    console.log(`  ✅ Lote ${i / batchSize + 1}/${Math.ceil(questions.length / batchSize)} insertado`)
  }

  return results
}

async function insertQuestionArticleMappings(
  mappedQuestions: Array<{
    question: ParsedQuestion
    articleId: string
    titleId: string
    articleNumber: number
  }>,
  insertedQuestions: Array<{ id: number; original_number: number }>
) {
  const batchSize = 100

  // Crear mapa de IDs
  const questionIdMap = new Map<number, number>()
  insertedQuestions.forEach(q => {
    questionIdMap.set(q.original_number, q.id)
  })

  for (let i = 0; i < mappedQuestions.length; i += batchSize) {
    const batch = mappedQuestions.slice(i, i + batchSize)

    const dbMappings: DatabaseQuestionArticle[] = batch
      .map(item => {
        const questionId = questionIdMap.get(item.question.originalNumber)
        if (!questionId) return null

        return {
          question_id: questionId,
          original_question_number: item.question.originalNumber,
          title_id: item.titleId,
          article_number: item.articleNumber
        }
      })
      .filter((item): item is DatabaseQuestionArticle => item !== null)

    if (dbMappings.length === 0) continue

    const { error } = await supabase
      .from('question_articles')
      .insert(dbMappings)

    if (error) {
      console.error(`Error insertando mapeos lote ${i / batchSize + 1}:`, error)
      throw error
    }

    console.log(`  ✅ Mapeos lote ${i / batchSize + 1}/${Math.ceil(mappedQuestions.length / batchSize)} insertado`)
  }
}

// Función para migrar solo el primer tramo
async function migrateFirstBatch() {
  console.log('🎯 Migrando primer tramo: Título Preliminar + Títulos 1-3 (preguntas 1-400)')
  return await migrateImproved({ start: 1, end: 400 })
}

// Función para migrar todo
async function migrateAll() {
  console.log('🎯 Migrando todas las preguntas')
  return await migrateImproved()
}

if (require.main === module) {
  const args = process.argv.slice(2)

  if (args.includes('--first-batch')) {
    migrateFirstBatch()
  } else if (args.includes('--all')) {
    migrateAll()
  } else {
    console.log('Uso:')
    console.log('  npx tsx scripts/migrate-improved.ts --first-batch   # Migrar primer tramo')
    console.log('  npx tsx scripts/migrate-improved.ts --all          # Migrar todo')
  }
}

export { migrateImproved, migrateFirstBatch, migrateAll }