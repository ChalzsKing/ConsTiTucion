import fs from 'fs'
import path from 'path'
import { migrateQuestionsToSupabase } from '../lib/migration/migrate-to-supabase'

async function runMigration() {
  console.log('🚀 Iniciando migración completa a Supabase...')

  try {
    // Leer archivos de recursos
    const questionsFile = path.join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
    const answersFile1 = path.join(process.cwd(), 'recursos', '1600 respuestas constitucion.txt')
    const answersFile2 = path.join(process.cwd(), 'recursos', '1600 respuestas constitucion (2).txt')
    const mappingFile = path.join(process.cwd(), 'recursos', 'constitucion_completo.csv')

    console.log('📁 Verificando archivos de recursos...')

    if (!fs.existsSync(questionsFile)) {
      throw new Error(`Archivo de preguntas no encontrado: ${questionsFile}`)
    }
    if (!fs.existsSync(answersFile1)) {
      throw new Error(`Archivo de respuestas 1 no encontrado: ${answersFile1}`)
    }
    if (!fs.existsSync(answersFile2)) {
      throw new Error(`Archivo de respuestas 2 no encontrado: ${answersFile2}`)
    }
    if (!fs.existsSync(mappingFile)) {
      throw new Error(`Archivo de mapeo no encontrado: ${mappingFile}`)
    }

    console.log('✅ Todos los archivos encontrados')

    // Leer contenido de archivos
    const questionsText = fs.readFileSync(questionsFile, 'utf-8')
    const answersText1 = fs.readFileSync(answersFile1, 'utf-8')
    const answersText2 = fs.readFileSync(answersFile2, 'utf-8')
    const mappingCSV = fs.readFileSync(mappingFile, 'utf-8')

    console.log('📊 Archivos leídos:')
    console.log(`- Preguntas: ${questionsText.length} caracteres`)
    console.log(`- Respuestas 1: ${answersText1.length} caracteres`)
    console.log(`- Respuestas 2: ${answersText2.length} caracteres`)
    console.log(`- Mapeo: ${mappingCSV.length} caracteres`)

    // Ejecutar migración
    const result = await migrateQuestionsToSupabase(
      questionsText,
      answersText1,
      answersText2,
      mappingCSV
    )

    if (result.success) {
      console.log('🎉 ¡Migración completada exitosamente!')
      console.log(`📊 Preguntas insertadas: ${result.totalQuestions}`)
      console.log(`🔗 Mapeos creados: ${result.totalMappings}`)
    } else {
      console.error('❌ Error en la migración:', result.error)
      process.exit(1)
    }

  } catch (error) {
    console.error('💥 Error crítico:', error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runMigration()
}

export { runMigration }