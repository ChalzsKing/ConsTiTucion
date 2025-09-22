#!/usr/bin/env tsx

// Load environment variables
import 'dotenv/config'

import { readFileSync } from 'fs'
import { join } from 'path'
import { migrateQuestionsToSupabase } from '../lib/migration/migrate-to-supabase'

async function main() {
  console.log('🚀 Starting Questions Migration to Supabase')
  console.log('=' .repeat(50))

  try {
    // Read source files
    const resourcesPath = join(process.cwd(), 'recursos')

    console.log('📖 Reading source files...')

    const questionsText = readFileSync(
      join(resourcesPath, '1600_preguntas_constitucion_espanola.txt'),
      'utf-8'
    )
    console.log('✅ Questions file loaded')

    const answersText1 = readFileSync(
      join(resourcesPath, '1600 respuestas constitucion.txt'),
      'utf-8'
    )
    console.log('✅ Answers file 1 loaded (1-990)')

    const answersText2 = readFileSync(
      join(resourcesPath, '1600 respuestas constitucion (2).txt'),
      'utf-8'
    )
    console.log('✅ Answers file 2 loaded (990-1641)')

    const mappingCSV = readFileSync(
      join(resourcesPath, 'constitucion_completo.csv'),
      'utf-8'
    )
    console.log('✅ Mapping CSV file loaded')

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
    }

    console.log('✅ Environment variables verified')
    console.log('')

    // Run migration
    const result = await migrateQuestionsToSupabase(
      questionsText,
      answersText1,
      answersText2,
      mappingCSV
    )

    if (result.success) {
      console.log('')
      console.log('🎉 Migration completed successfully!')
      console.log(`📊 Total questions migrated: ${result.totalQuestions}`)
      console.log(`🔗 Total mappings created: ${result.totalMappings}`)
    } else {
      console.error('❌ Migration failed:', result.error)
      process.exit(1)
    }

  } catch (error) {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { main }