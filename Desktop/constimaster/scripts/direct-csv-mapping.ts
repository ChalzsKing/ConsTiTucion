import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapeo de números de artículo a títulos
function getArticleTitle(articleNumber: number): string {
  if (articleNumber >= 1 && articleNumber <= 9) return 'titulo-preliminar'
  if (articleNumber >= 10 && articleNumber <= 55) return 'titulo-i'
  if (articleNumber >= 56 && articleNumber <= 65) return 'titulo-ii'
  if (articleNumber >= 66 && articleNumber <= 96) return 'titulo-iii'
  if (articleNumber >= 97 && articleNumber <= 107) return 'titulo-iv'
  if (articleNumber >= 108 && articleNumber <= 116) return 'titulo-v'
  if (articleNumber >= 117 && articleNumber <= 127) return 'titulo-vi'
  if (articleNumber >= 128 && articleNumber <= 136) return 'titulo-vii'
  if (articleNumber >= 137 && articleNumber <= 158) return 'titulo-viii'
  if (articleNumber >= 159 && articleNumber <= 165) return 'titulo-ix'
  return 'otros'
}

function parseArticleString(articleStr: string): number {
  // "1.1" -> 1, "95" -> 95, "1 (valores)" -> 1
  const clean = articleStr.replace(/\s*\(.*\)/, '').trim()

  if (clean.includes('.')) {
    return parseInt(clean.split('.')[0])
  }
  return parseInt(clean)
}

async function createDirectMappings() {
  console.log('🎯 Creando mapeos directos desde CSV...')

  try {
    // 1. Leer el CSV
    const csvPath = join(process.cwd(), 'recursos', 'constitucion_completo.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n').slice(1) // Skip header

    console.log(`📋 Procesando ${lines.length} líneas del CSV`)

    // 2. Obtener preguntas disponibles en Supabase
    const { data: questions } = await supabase
      .from('questions')
      .select('id, original_number')

    const questionMap = new Map<number, number>()
    questions?.forEach(q => questionMap.set(q.original_number, q.id))

    console.log(`📊 Preguntas disponibles en Supabase: ${questions?.length}`)

    // 3. Limpiar mapeos existentes
    console.log('🧹 Limpiando mapeos existentes...')
    await supabase.from('question_articles').delete().neq('id', 0)

    // 4. Procesar cada línea del CSV
    let mappingsToInsert = []
    let totalFound = 0
    let totalMissing = 0

    for (const line of lines) {
      if (!line.trim()) continue

      const [articleStr, questionsStr] = line.split(',')
      if (!articleStr || !questionsStr) continue

      const articleNumber = parseArticleString(articleStr.replace(/"/g, '').trim())
      const titleId = getArticleTitle(articleNumber)

      // Parse question numbers
      const questionNumbers = questionsStr
        .replace(/"/g, '')
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n))

      // Ver cuáles existen en Supabase
      for (const questionNumber of questionNumbers) {
        const questionId = questionMap.get(questionNumber)

        if (questionId) {
          mappingsToInsert.push({
            question_id: questionId,
            original_question_number: questionNumber,
            title_id: titleId,
            article_number: articleNumber
          })
          totalFound++
        } else {
          totalMissing++
        }
      }
    }

    console.log(`✅ Encontradas: ${totalFound} preguntas que existen en Supabase`)
    console.log(`⚠️ Faltantes: ${totalMissing} preguntas no disponibles en Supabase`)

    // 5. Insertar en lotes
    const batchSize = 100
    let insertedCount = 0

    for (let i = 0; i < mappingsToInsert.length; i += batchSize) {
      const batch = mappingsToInsert.slice(i, i + batchSize)

      const { error } = await supabase
        .from('question_articles')
        .insert(batch)

      if (error) {
        console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error)
      } else {
        insertedCount += batch.length
        console.log(`✅ Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(mappingsToInsert.length/batchSize)} insertado`)
      }
    }

    console.log(`\n🎉 ¡Mapeos completados!`)
    console.log(`✅ ${insertedCount} mapeos insertados correctamente`)

    // 6. Estadísticas finales
    const { data: finalStats } = await supabase
      .from('question_articles')
      .select('title_id, article_number')

    if (finalStats) {
      const byTitle: Record<string, Set<number>> = {}
      finalStats.forEach(item => {
        if (!byTitle[item.title_id]) byTitle[item.title_id] = new Set()
        byTitle[item.title_id].add(item.article_number)
      })

      console.log('\n📚 Mapeos finales por título:')
      Object.keys(byTitle).sort().forEach(titleId => {
        const articles = Array.from(byTitle[titleId]).sort((a, b) => a - b)
        const range = articles.length > 0 ? `(${articles[0]}-${articles[articles.length-1]})` : ''
        console.log(`  ${titleId}: ${articles.length} artículos ${range}`)
      })

      console.log(`\n📊 Total: ${finalStats.length} mapeos | ${Object.keys(byTitle).length} títulos | ${new Set(finalStats.map(s => s.article_number)).size} artículos únicos`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

if (require.main === module) {
  createDirectMappings()
}

export { createDirectMappings }