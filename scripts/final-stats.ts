import { config } from 'dotenv'
import { join } from 'path'

// Cargar variables de entorno ANTES de importar supabase
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getFinalStats() {
  console.log('📊 Verificando estadísticas finales de la migración...')

  try {
    // Contar total de preguntas
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, original_number')

    if (questionsError) throw questionsError

    console.log(`✅ Total de preguntas migradas: ${questions?.length || 0}`)

    // Contar mapeos de artículos
    const { data: mappings, error: mappingsError } = await supabase
      .from('question_articles')
      .select('id, title_id')

    if (mappingsError) throw mappingsError

    console.log(`✅ Total de mapeos de artículos: ${mappings?.length || 0}`)

    // Estadísticas por título
    const titleStats: Record<string, number> = {}
    mappings?.forEach(mapping => {
      titleStats[mapping.title_id] = (titleStats[mapping.title_id] || 0) + 1
    })

    console.log('\n📊 Distribución por títulos:')
    for (const [titleId, count] of Object.entries(titleStats)) {
      console.log(`  ${titleId}: ${count} preguntas`)
    }

    // Probar consulta básica
    console.log('\n🧪 Prueba de consulta básica...')
    const { data: sampleQuestions, error: sampleError } = await supabase
      .from('questions')
      .select('original_number, question_text, correct_answer')
      .limit(3)

    if (sampleError) throw sampleError

    console.log('✅ Muestra de preguntas:')
    sampleQuestions?.forEach(q => {
      console.log(`  ${q.original_number}: ${q.question_text.substring(0, 60)}... (Respuesta: ${['A', 'B', 'C', 'D'][q.correct_answer]})`)
    })

    // Probar consulta con join
    console.log('\n🔗 Prueba de consulta con mapeos...')
    const { data: questionsWithMappings, error: joinError } = await supabase
      .from('questions')
      .select(`
        original_number,
        question_text,
        question_articles!inner(title_id, article_number)
      `)
      .eq('question_articles.title_id', 'titulo1')
      .limit(2)

    if (joinError) {
      console.log('⚠️  Error en consulta con join:', joinError.message)
    } else {
      console.log(`✅ Preguntas del Título I encontradas: ${questionsWithMappings?.length || 0}`)
      questionsWithMappings?.forEach(q => {
        console.log(`  ${q.original_number}: ${q.question_text.substring(0, 50)}...`)
      })
    }

    console.log('\n🎉 ¡Migración completada exitosamente!')

    return {
      success: true,
      totalQuestions: questions?.length || 0,
      totalMappings: mappings?.length || 0,
      titleStats
    }

  } catch (error) {
    console.error('❌ Error verificando estadísticas:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

if (require.main === module) {
  getFinalStats()
}

export { getFinalStats }