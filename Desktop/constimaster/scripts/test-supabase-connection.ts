import { config } from 'dotenv'
import { join } from 'path'

// Cargar variables de entorno
config({ path: join(process.cwd(), '.env.local') })

import { generateArticleExam } from '../lib/supabase-exam-system'

async function testSupabaseConnection() {
  console.log('🧪 Probando conexión a Supabase...')

  try {
    // Probar obtener preguntas para artículo 1
    console.log('🔍 Buscando preguntas para el artículo 1...')
    const questions = await generateArticleExam(1, 1)

    if (questions.length > 0) {
      console.log('✅ Conexión exitosa!')
      console.log(`📋 Pregunta encontrada: ${questions[0].question_text.substring(0, 100)}...`)
      console.log(`📊 Opciones:`)
      console.log(`   A) ${questions[0].option_a}`)
      console.log(`   B) ${questions[0].option_b}`)
      console.log(`   C) ${questions[0].option_c}`)
      console.log(`   D) ${questions[0].option_d}`)
      console.log(`✅ Respuesta correcta: ${['A', 'B', 'C', 'D'][questions[0].correct_answer]}`)
    } else {
      console.log('⚠️  No se encontraron preguntas para el artículo 1')
    }

    // Probar con otro artículo
    console.log('\n🔍 Probando artículo 14...')
    const article14 = await generateArticleExam(14, 1)

    if (article14.length > 0) {
      console.log('✅ También funciona el artículo 14!')
      console.log(`📋 Pregunta: ${article14[0].question_text.substring(0, 80)}...`)
    } else {
      console.log('⚠️  No hay preguntas para el artículo 14')
    }

    return true

  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error)
    return false
  }
}

if (require.main === module) {
  testSupabaseConnection().then(success => {
    if (success) {
      console.log('\n🎉 Sistema de Supabase listo para usar!')
    } else {
      console.log('\n💥 Hay problemas con la conexión')
    }
  })
}

export { testSupabaseConnection }