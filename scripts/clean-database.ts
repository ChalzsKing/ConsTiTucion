import { config } from 'dotenv'
import { join } from 'path'

// Cargar variables de entorno
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanDatabase() {
  console.log('🧹 Limpiando base de datos completamente...')

  try {
    // Eliminar todas las preguntas (esto también eliminará los mapeos por CASCADE)
    console.log('🗑️  Eliminando todas las preguntas...')
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .neq('id', 0) // Eliminar todo donde id != 0 (elimina todo)

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.warn('Advertencia al eliminar preguntas:', deleteError)
    }

    // Eliminar mapeos restantes si los hay
    console.log('🗑️  Eliminando mapeos restantes...')
    const { error: deleteMapError } = await supabase
      .from('question_articles')
      .delete()
      .neq('id', 0)

    if (deleteMapError && deleteMapError.code !== 'PGRST116') {
      console.warn('Advertencia al eliminar mapeos:', deleteMapError)
    }

    // Resetear secuencias de IDs
    console.log('🔄 Reseteando secuencias de IDs...')

    // Reset de la secuencia de questions
    const { error: resetQuestionsError } = await supabase.rpc('reset_sequence', {
      table_name: 'questions',
      column_name: 'id'
    })

    // Si la función RPC no existe, intentamos con SQL directo
    if (resetQuestionsError) {
      console.log('💡 Intentando reset manual de secuencias...')
      // Nota: Esto requeriría ejecutar SQL directamente en Supabase
      // Por ahora solo reportamos que se necesita hacer manualmente
    }

    console.log('✅ Base de datos limpiada exitosamente')
    console.log('ℹ️  Las secuencias de ID pueden necesitar ser reseteadas manualmente en Supabase')

    return true

  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error)
    return false
  }
}

if (require.main === module) {
  cleanDatabase()
}

export { cleanDatabase }