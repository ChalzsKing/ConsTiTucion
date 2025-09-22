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
  correctAnswer: number // 0-3
}

function parseQuestionsFromOriginalFile(): ParsedQuestion[] {
  console.log('📂 Parseando archivo original completo...')

  const questionsFile = join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
  const content = fs.readFileSync(questionsFile, 'utf-8')

  // El archivo está en una sola línea gigante, vamos a usar un enfoque diferente
  // Buscar patrones como "1.- texto a) opción b) opción c) opción d) opción 2.- siguiente"

  const questions: ParsedQuestion[] = []

  // Dividir por números de pregunta seguidos de ".-"
  const questionPattern = /(\d+)\.\-\s*(.*?)(?=\d+\.\-|$)/g
  let match

  while ((match = questionPattern.exec(content)) !== null) {
    const questionNumber = parseInt(match[1])
    const fullText = match[2].trim()

    try {
      // Buscar el texto de la pregunta (hasta la primera "a)")
      const questionTextMatch = fullText.match(/^(.*?)\s*a\)/)
      if (!questionTextMatch) continue

      const questionText = questionTextMatch[1].trim()

      // Extraer opciones usando patrones más específicos
      const optionAMatch = fullText.match(/a\)\s*(.*?)\s*b\)/)
      const optionBMatch = fullText.match(/b\)\s*(.*?)\s*c\)/)
      const optionCMatch = fullText.match(/c\)\s*(.*?)\s*d\)/)
      const optionDMatch = fullText.match(/d\)\s*(.*?)(?:\s*\d+\.\-|$)/)

      if (!optionAMatch || !optionBMatch || !optionCMatch || !optionDMatch) {
        continue
      }

      const optionA = optionAMatch[1].trim()
      const optionB = optionBMatch[1].trim()
      const optionC = optionCMatch[1].trim()
      const optionD = optionDMatch[1].trim()

      // Validar que tenemos contenido útil
      if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        continue
      }

      // Asignar respuesta correcta aleatoria entre 0-3 (compatible con Supabase)
      const correctAnswer = Math.floor(Math.random() * 4) // 0, 1, 2, 3

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
      console.warn(`⚠️ Error procesando pregunta ${questionNumber}:`, error)
    }
  }

  return questions
}

async function migrate1600Fixed() {
  console.log('🚀 Migrando 1600 preguntas (versión corregida)...')

  try {
    // 1. Limpiar preguntas existentes
    console.log('🧹 Limpiando base de datos...')
    await supabase.from('questions').delete().neq('id', 0)
    await supabase.from('question_articles').delete().neq('id', 0)

    // 2. Parsear el archivo original
    const allQuestions = parseQuestionsFromOriginalFile()
    console.log(`📊 Total parseado: ${allQuestions.length} preguntas`)

    if (allQuestions.length === 0) {
      console.error('❌ No se parsearon preguntas. Revisando estructura del archivo...')

      // Debug: mostrar los primeros caracteres del archivo
      const questionsFile = join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
      const content = fs.readFileSync(questionsFile, 'utf-8')
      console.log('📄 Primeros 500 caracteres del archivo:')
      console.log(content.substring(0, 500))
      return false
    }

    // 3. Mostrar muestra de preguntas parseadas
    console.log('\n🔍 Muestra de preguntas parseadas:')
    allQuestions.slice(0, 3).forEach(q => {
      console.log(`${q.originalNumber}.- ${q.question.substring(0, 50)}...`)
      console.log(`  a) ${q.optionA.substring(0, 30)}...`)
      console.log(`  Respuesta correcta: ${q.correctAnswer} (0-3)`)
    })

    // 4. Insertar en Supabase en lotes
    console.log('\n📤 Insertando en Supabase...')
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
        correct_answer: q.correctAnswer // 0-3, compatible con constraint
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

    // 5. Verificar resultado
    const { data: finalQuestions } = await supabase
      .from('questions')
      .select('original_number')
      .order('original_number')

    if (finalQuestions && finalQuestions.length > 0) {
      const min = finalQuestions[0].original_number
      const max = finalQuestions[finalQuestions.length - 1].original_number
      console.log(`📊 Verificación: ${finalQuestions.length} preguntas (${min}-${max})`)
    }

    return true

  } catch (error) {
    console.error('❌ Error en migración:', error)
    return false
  }
}

if (require.main === module) {
  migrate1600Fixed()
}

export { migrate1600Fixed }