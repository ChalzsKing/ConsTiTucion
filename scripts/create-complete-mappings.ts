import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

// Cargar variables de entorno
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function parseCSVMappings(csvContent: string) {
  const lines = csvContent.split('\n').slice(1) // Skip header
  const mappings: Array<{article: string, questionNumbers: number[]}> = []

  for (const line of lines) {
    if (!line.trim()) continue

    const [article, questionsStr] = line.split(',')
    if (!article || !questionsStr) continue

    const cleanArticle = article.replace(/"/g, '').trim()
    const cleanQuestions = questionsStr.replace(/"/g, '').trim()

    // Parse question numbers (can be comma-separated)
    const questionNumbers = cleanQuestions.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))

    if (questionNumbers.length > 0) {
      mappings.push({
        article: cleanArticle,
        questionNumbers
      })
    }
  }

  return mappings
}

// Convertir artículo string a número y título
function parseArticleInfo(articleStr: string) {
  // Ejemplos: "1.1" -> artículo 1, "95" -> artículo 95, "1 (valores)" -> artículo 1

  const cleanStr = articleStr.replace(/\s*\(.*\)/, '').trim() // Remover "(valores)"

  if (cleanStr.includes('.')) {
    const [main] = cleanStr.split('.')
    return {
      articleNumber: parseInt(main),
      titleId: getArticleTitle(parseInt(main))
    }
  } else {
    const num = parseInt(cleanStr)
    return {
      articleNumber: num,
      titleId: getArticleTitle(num)
    }
  }
}

function getArticleTitle(articleNumber: number): string {
  // Mapeo de artículos a títulos constitucionales
  if (articleNumber >= 1 && articleNumber <= 9) return 'titulo-preliminar'
  if (articleNumber >= 10 && articleNumber <= 29) return 'titulo-i'
  if (articleNumber >= 30 && articleNumber <= 38) return 'titulo-ii'
  if (articleNumber >= 39 && articleNumber <= 55) return 'titulo-iii'
  if (articleNumber >= 56 && articleNumber <= 96) return 'titulo-iv'
  if (articleNumber >= 97 && articleNumber <= 107) return 'titulo-v'
  if (articleNumber >= 108 && articleNumber <= 116) return 'titulo-vi'
  if (articleNumber >= 117 && articleNumber <= 127) return 'titulo-vii'
  if (articleNumber >= 128 && articleNumber <= 136) return 'titulo-viii'
  if (articleNumber >= 137 && articleNumber <= 158) return 'titulo-ix'
  if (articleNumber >= 159 && articleNumber <= 165) return 'titulo-x'
  if (articleNumber >= 166 && articleNumber <= 169) return 'disposiciones-adicionales'
  return 'otros'
}

async function createCompleteMappings() {
  console.log('🔧 Creando mapeos completos desde CSV...')

  try {
    // 1. Leer CSV de mapeos
    const csvPath = join(process.cwd(), 'recursos', 'constitucion_completo.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const csvMappings = parseCSVMappings(csvContent)

    console.log(`📋 ${csvMappings.length} mapeos encontrados en CSV`)

    // 2. Obtener preguntas disponibles en Supabase
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, original_number')

    if (questionsError) throw questionsError

    const questionMap = new Map<number, number>()
    questions?.forEach(q => questionMap.set(q.original_number, q.id))

    console.log(`✅ ${questions?.length} preguntas disponibles en Supabase`)

    // 3. Limpiar mapeos existentes
    console.log('🧹 Limpiando mapeos existentes...')
    await supabase.from('question_articles').delete().neq('id', 0)

    // 4. Crear nuevos mapeos basados en CSV
    let insertedCount = 0
    let skippedCount = 0

    for (const mapping of csvMappings) {
      const articleInfo = parseArticleInfo(mapping.article)

      for (const questionNumber of mapping.questionNumbers) {
        const questionId = questionMap.get(questionNumber)

        if (questionId) {
          const { error } = await supabase
            .from('question_articles')
            .insert({
              question_id: questionId,
              original_question_number: questionNumber,
              title_id: articleInfo.titleId,
              article_number: articleInfo.articleNumber
            })

          if (!error) {
            insertedCount++
          } else {
            console.error(`❌ Error insertando pregunta ${questionNumber}:`, error)
          }
        } else {
          skippedCount++
        }
      }
    }

    console.log(`🎉 ¡Mapeos creados!`)
    console.log(`✅ ${insertedCount} mapeos insertados`)
    console.log(`⚠️ ${skippedCount} preguntas saltadas (no disponibles en Supabase)`)

    // 5. Verificar resultado
    const { data: finalMappings } = await supabase
      .from('question_articles')
      .select('*', { count: 'exact' })

    console.log(`📊 Total final: ${finalMappings?.length} mapeos en base de datos`)

    // 6. Estadísticas por título
    const { data: stats } = await supabase
      .from('question_articles')
      .select('title_id, article_number')
      .order('title_id, article_number')

    if (stats) {
      const byTitle: Record<string, Set<number>> = {}
      stats.forEach(item => {
        if (!byTitle[item.title_id]) byTitle[item.title_id] = new Set()
        byTitle[item.title_id].add(item.article_number)
      })

      console.log('\n📚 Mapeos por título:')
      Object.keys(byTitle).sort().forEach(titleId => {
        const articles = Array.from(byTitle[titleId]).sort((a, b) => a - b)
        console.log(`  ${titleId}: ${articles.length} artículos`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

if (require.main === module) {
  createCompleteMappings()
}

export { createCompleteMappings }