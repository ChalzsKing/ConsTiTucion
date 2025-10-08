#!/usr/bin/env node

/**
 * 🔍 VERIFICADOR DE ESQUEMA DE BASE DE DATOS - ConstiMaster
 *
 * Este script verifica que todas las tablas y columnas necesarias
 * existen en Supabase y coinciden con lo que usa el código.
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 VERIFICANDO ESQUEMA DE BASE DE DATOS - ConstiMaster')
console.log('=' .repeat(60))

// ================================
// TABLAS REQUERIDAS POR EL CÓDIGO
// ================================

const REQUIRED_TABLES = {
  'Questions': {
    description: 'Preguntas del examen',
    required: true,
    columns: ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'mapped_article']
  },
  'user_progress': {
    description: 'Progreso del usuario por artículo',
    required: true,
    columns: ['user_id', 'article_number', 'title_id', 'is_completed', 'total_study_time_seconds', 'times_studied', 'last_studied_at', 'completed_at']
  },
  'user_statistics': {
    description: 'Estadísticas generales del usuario',
    required: true,
    columns: ['user_id', 'total_articles_studied', 'total_study_time_minutes', 'current_streak_days', 'last_study_date']
  },
  'exam_history': {
    description: 'Historial de exámenes realizados',
    required: false, // No existe en schema base
    columns: ['user_id', 'exam_type', 'total_questions', 'correct_answers', 'score_percentage', 'completed_at']
  },
  'daily_activity': {
    description: 'Actividad diaria del usuario',
    required: false, // No existe en schema base
    columns: ['user_id', 'date', 'articles_studied', 'exams_taken', 'study_time_minutes']
  }
}

// ================================
// FUNCIÓN: VERIFICAR TABLA
// ================================

async function checkTable(tableName, tableInfo) {
  console.log(`\n📋 Verificando tabla: ${tableName}`)
  console.log(`   Descripción: ${tableInfo.description}`)
  console.log(`   Requerida: ${tableInfo.required ? 'SÍ' : 'NO (opcional)'}`)

  try {
    // Intentar consultar la tabla
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(0) // Solo verificar que existe, no obtener datos

    if (error) {
      if (tableInfo.required) {
        console.log(`   ❌ ERROR: ${error.message}`)
        return { table: tableName, status: 'ERROR', required: true, error: error.message }
      } else {
        console.log(`   ⚠️ NO EXISTE (pero es opcional)`)
        return { table: tableName, status: 'MISSING_OPTIONAL', required: false }
      }
    }

    console.log(`   ✅ EXISTE`)

    // Verificar columnas específicas haciendo una consulta con select
    try {
      const columnCheckQuery = tableInfo.columns.join(', ')
      const { error: columnError } = await supabase
        .from(tableName)
        .select(columnCheckQuery)
        .limit(0)

      if (columnError) {
        console.log(`   ⚠️ PROBLEMA CON COLUMNAS: ${columnError.message}`)
        return {
          table: tableName,
          status: 'COLUMN_ISSUES',
          required: tableInfo.required,
          error: columnError.message
        }
      }

      console.log(`   ✅ TODAS LAS COLUMNAS EXISTEN`)
      return { table: tableName, status: 'OK', required: tableInfo.required }

    } catch (colError) {
      console.log(`   ⚠️ ERROR VERIFICANDO COLUMNAS: ${colError.message}`)
      return {
        table: tableName,
        status: 'COLUMN_CHECK_ERROR',
        required: tableInfo.required,
        error: colError.message
      }
    }

  } catch (err) {
    console.log(`   ❌ ERROR INESPERADO: ${err.message}`)
    return { table: tableName, status: 'UNEXPECTED_ERROR', required: tableInfo.required, error: err.message }
  }
}

// ================================
// FUNCIÓN PRINCIPAL
// ================================

async function main() {
  console.log('\n🔄 Iniciando verificación...\n')

  const results = []

  // Verificar cada tabla
  for (const [tableName, tableInfo] of Object.entries(REQUIRED_TABLES)) {
    const result = await checkTable(tableName, tableInfo)
    results.push(result)
  }

  // ================================
  // RESUMEN FINAL
  // ================================

  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE VERIFICACIÓN')
  console.log('='.repeat(60))

  const okTables = results.filter(r => r.status === 'OK')
  const errorTables = results.filter(r => r.status === 'ERROR')
  const columnIssues = results.filter(r => r.status === 'COLUMN_ISSUES')
  const missingOptional = results.filter(r => r.status === 'MISSING_OPTIONAL')

  console.log(`✅ Tablas funcionando: ${okTables.length}`)
  console.log(`❌ Errores críticos: ${errorTables.length}`)
  console.log(`⚠️ Problemas de columnas: ${columnIssues.length}`)
  console.log(`⚠️ Tablas opcionales faltantes: ${missingOptional.length}`)

  if (errorTables.length > 0) {
    console.log('\n🚨 ERRORES CRÍTICOS:')
    errorTables.forEach(result => {
      console.log(`   ${result.table}: ${result.error}`)
    })
  }

  if (columnIssues.length > 0) {
    console.log('\n⚠️ PROBLEMAS DE COLUMNAS:')
    columnIssues.forEach(result => {
      console.log(`   ${result.table}: ${result.error}`)
    })
  }

  if (missingOptional.length > 0) {
    console.log('\n💡 TABLAS OPCIONALES FALTANTES:')
    missingOptional.forEach(result => {
      console.log(`   ${result.table}: Se puede crear posteriormente`)
    })
  }

  // Determinar estado general
  const hasErrors = errorTables.length > 0 || columnIssues.length > 0

  if (!hasErrors) {
    console.log('\n🎉 ¡ESQUEMA BÁSICO FUNCIONAL!')
    console.log('✅ El código principal debería funcionar')
    if (missingOptional.length > 0) {
      console.log('💡 Las tablas opcionales se pueden crear después para funcionalidad completa')
    }
  } else {
    console.log('\n🔧 ESQUEMA REQUIERE ATENCIÓN')
    console.log('❌ Hay problemas que deben corregirse')
  }

  console.log('\n📝 Ejecutar: npm run dev y probar en http://localhost:3001')
}

// Ejecutar verificación
main().catch(console.error)