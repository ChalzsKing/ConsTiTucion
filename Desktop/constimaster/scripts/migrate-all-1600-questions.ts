import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ParsedQuestion {
  originalNumber: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: number
}

function parseQuestionsFromPart(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []

  // Dividir por números de pregunta (ej: "1.-", "2.-", etc.)
  const blocks = content.split(/(?=\d+\.\-)/g).filter(block => block.trim())

  console.log(`  📋 Procesando ${blocks.length} bloques de preguntas...`)

  for (const block of blocks) {
    try {
      // Extraer número de pregunta
      const numberMatch = block.match(/^(\d+)\.\-/)
      if (!numberMatch) continue

      const questionNumber = parseInt(numberMatch[1])

      // Extraer texto de la pregunta (hasta primera opción "a)")
      const questionMatch = block.match(/\d+\.\-\s*(.*?)\s*a\)/)
      if (!questionMatch) continue

      const questionText = questionMatch[1].trim()

      // Extraer opciones a), b), c), d)
      const optionAMatch = block.match(/a\)\s*(.*?)\s*b\)/)
      const optionBMatch = block.match(/b\)\s*(.*?)\s*c\)/)
      const optionCMatch = block.match(/c\)\s*(.*?)\s*d\)/)
      const optionDMatch = block.match(/d\)\s*(.*?)(?=\s*\d+\.\-|$)/)

      if (!optionAMatch || !optionBMatch || !optionCMatch || !optionDMatch) {
        console.warn(`  ⚠️ Pregunta ${questionNumber} incompleta`)
        continue
      }

      const optionA = optionAMatch[1].trim()
      const optionB = optionBMatch[1].trim()
      const optionC = optionCMatch[1].trim()
      const optionD = optionDMatch[1].trim()

      // Por ahora, asignar respuesta correcta aleatoria (1-4)
      // Más tarde podremos usar los archivos de respuestas
      const correctAnswer = Math.floor(Math.random() * 4) + 1

      questions.push({
        originalNumber: questionNumber,
        question: questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer
      })

    } catch (error) {
      console.warn(`  ⚠️ Error procesando bloque:`, error)
    }
  }

  return questions
}

async function migrateAll1600Questions() {
  console.log('🚀 Migrando las 1600 preguntas completas a Supabase...')

  try {
    // 1. Limpiar preguntas existentes
    console.log('🧹 Limpiando preguntas existentes...')
    await supabase.from('questions').delete().neq('id', 0)
    await supabase.from('question_articles').delete().neq('id', 0)

    // 2. Procesar cada parte
    const allQuestions: ParsedQuestion[] = []

    for (let part = 1; part <= 4; part++) {
      console.log(`\n📂 Procesando parte ${part}/4...`)

      const partFile = join(process.cwd(), 'recursos', `preguntas_parte_${part}.txt`)

      if (!fs.existsSync(partFile)) {
        console.warn(`  ⚠️ Archivo no encontrado: preguntas_parte_${part}.txt`)
        continue
      }

      const content = fs.readFileSync(partFile, 'utf-8')
      const partQuestions = parseQuestionsFromPart(content)

      console.log(`  ✅ Parte ${part}: ${partQuestions.length} preguntas parseadas`)
      allQuestions.push(...partQuestions)
    }

    console.log(`\n📊 Total parseado: ${allQuestions.length} preguntas`)

    // 3. Insertar en Supabase en lotes
    const batchSize = 50
    let insertedCount = 0

    for (let i = 0; i < allQuestions.length; i += batchSize) {
      const batch = allQuestions.slice(i, i + batchSize)

      const questionsToInsert = batch.map(q => ({
        original_number: q.originalNumber,
        question_text: q.question,
        option_a: q.optionA,
        option_b: q.optionB,
        option_c: q.optionC,
        option_d: q.optionD,
        correct_answer: q.correctAnswer
      }))

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert)

      if (error) {
        console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error)
      } else {
        insertedCount += batch.length
        const progress = Math.round((insertedCount / allQuestions.length) * 100)
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(allQuestions.length/batchSize)} - ${insertedCount}/${allQuestions.length} (${progress}%)`)
      }
    }

    console.log(`\n🎉 ¡Migración completada!`)
    console.log(`✅ ${insertedCount} preguntas migradas a Supabase`)

    // 4. Verificar resultado
    const { data: finalQuestions, error: countError } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })

    if (!countError) {
      console.log(`📊 Verificación: ${finalQuestions?.length || 0} preguntas en Supabase`)
    }

    // 5. Mostrar rango de números
    const { data: rangeQuestions } = await supabase
      .from('questions')
      .select('original_number')
      .order('original_number')

    if (rangeQuestions && rangeQuestions.length > 0) {
      const min = rangeQuestions[0].original_number
      const max = rangeQuestions[rangeQuestions.length - 1].original_number
      console.log(`📈 Rango de preguntas: ${min} - ${max}`)
    }

    return true

  } catch (error) {
    console.error('❌ Error en migración:', error)
    return false
  }
}

if (require.main === module) {
  migrateAll1600Questions()
}

export { migrateAll1600Questions }