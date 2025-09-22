import { config } from 'dotenv'
import { join } from 'path'
import fs from 'fs'

// Cargar variables de entorno
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function backupDatabase() {
  console.log('💾 Creando backup de la base de datos actual...')

  try {
    // Backup de preguntas
    console.log('📋 Respaldando preguntas...')
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')

    if (questionsError && questionsError.code !== 'PGRST116') {
      throw questionsError
    }

    // Backup de mapeos pregunta-artículo
    console.log('🔗 Respaldando mapeos pregunta-artículo...')
    const { data: mappings, error: mappingsError } = await supabase
      .from('question_articles')
      .select('*')

    if (mappingsError && mappingsError.code !== 'PGRST116') {
      throw mappingsError
    }

    // Crear directorio de backup
    const backupDir = join(process.cwd(), 'backup')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir)
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    // Guardar backups
    if (questions && questions.length > 0) {
      const questionsBackup = join(backupDir, `questions_backup_${timestamp}.json`)
      fs.writeFileSync(questionsBackup, JSON.stringify(questions, null, 2))
      console.log(`✅ Backup de preguntas guardado: ${questions.length} registros`)
    } else {
      console.log('ℹ️  No hay preguntas para respaldar')
    }

    if (mappings && mappings.length > 0) {
      const mappingsBackup = join(backupDir, `question_articles_backup_${timestamp}.json`)
      fs.writeFileSync(mappingsBackup, JSON.stringify(mappings, null, 2))
      console.log(`✅ Backup de mapeos guardado: ${mappings.length} registros`)
    } else {
      console.log('ℹ️  No hay mapeos para respaldar')
    }

    console.log('💾 Backup completado exitosamente')
    return true

  } catch (error) {
    console.error('❌ Error creando backup:', error)
    return false
  }
}

if (require.main === module) {
  backupDatabase()
}

export { backupDatabase }