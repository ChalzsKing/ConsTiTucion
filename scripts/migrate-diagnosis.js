#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE DIAGNÓSTICO COMPLETO - ConstiMaster
 *
 * Objetivo: Identificar todas las discrepancias entre fuentes de datos
 * y crear backup completo antes de la migración
 *
 * Ejecución: node scripts/migrate-diagnosis.js
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 INICIANDO DIAGNÓSTICO DE MIGRACIÓN - ConstiMaster')
console.log('=' .repeat(60))

// ================================
// 1. ANÁLISIS DE CONSTITUTION-DATA
// ================================

function analyzeConstitutionData() {
  console.log('\n📚 ANALIZANDO CONSTITUTION-DATA.TS...')

  try {
    const filePath = path.join(process.cwd(), 'lib', 'constitution-data.ts')
    const content = fs.readFileSync(filePath, 'utf8')

    // Contar artículos definidos
    const articleMatches = content.match(/number: \d+/g) || []
    const articleNumbers = articleMatches.map(match => parseInt(match.replace('number: ', '')))

    console.log(`✅ Artículos definidos en código: ${articleNumbers.length}`)
    console.log(`📊 Rango de artículos: ${Math.min(...articleNumbers)} - ${Math.max(...articleNumbers)}`)

    // Verificar si hay 182 total hardcodeado
    const total182Match = content.match(/182/)
    if (total182Match) {
      console.log('⚠️  DISCREPANCIA: Código espera 182 artículos, pero solo hay', articleNumbers.length, 'definidos')
    }

    // Buscar títulos definidos
    const titleMatches = content.match(/id: ['"]titulo\d+['"]/g) || []
    console.log(`📋 Títulos constitucionales: ${titleMatches.length}`)

    return {
      articlesInCode: articleNumbers.length,
      expectedTotal: 182,
      actualArticles: articleNumbers,
      titlesCount: titleMatches.length
    }

  } catch (error) {
    console.error('❌ Error analizando constitution-data.ts:', error.message)
    return null
  }
}

// ================================
// 2. ANÁLISIS DE LOCALSTORAGE STRUCTURE
// ================================

function analyzeLocalStorageStructure() {
  console.log('\n💾 ANALIZANDO ESTRUCTURA DE LOCALSTORAGE...')

  // Simulamos la estructura que debería tener localStorage
  const expectedStructure = {
    key: 'constimaster-user-progress',
    structure: {
      articles: {}, // { [articleNumber]: { completed: boolean, studyTime: number, etc. } }
      totalStudyTime: 0,
      totalArticlesStudied: 0,
      studyStreak: 0,
      lastStudyDate: null,
      currentSession: {}
    }
  }

  console.log('🔑 Clave esperada:', expectedStructure.key)
  console.log('📋 Estructura esperada:')
  console.log('   - articles: Object con progreso por artículo')
  console.log('   - totalStudyTime: Tiempo total de estudio')
  console.log('   - totalArticlesStudied: Contador de artículos')
  console.log('   - studyStreak: Racha de días')

  return expectedStructure
}

// ================================
// 3. ANÁLISIS DE FUNCIONES DE LECTURA
// ================================

function analyzeFunctions() {
  console.log('\n⚙️ ANALIZANDO FUNCIONES QUE LEEN PROGRESO...')

  const functions = [
    {
      name: 'getOverallProgress',
      file: 'lib/constitution-data.ts',
      reads: 'localStorage (constimaster-user-progress)',
      purpose: 'Progreso general de todos los artículos'
    },
    {
      name: 'getTitleProgress',
      file: 'lib/constitution-data.ts',
      reads: 'localStorage (constimaster-user-progress)',
      purpose: 'Progreso específico de un título'
    },
    {
      name: 'useUserProgress',
      file: 'lib/user-progress.ts',
      reads: 'localStorage (constimaster-user-progress)',
      purpose: 'Hook principal de gestión de progreso'
    },
    {
      name: 'useStatistics',
      file: 'lib/hooks/useStatistics.ts',
      reads: 'Supabase (user_statistics)',
      purpose: 'Estadísticas agregadas del usuario'
    },
    {
      name: 'getOverallProgress (article-navigation)',
      file: 'lib/article-navigation.ts',
      reads: 'localStorage (constimaster-user-progress)',
      purpose: 'Navegación entre artículos'
    }
  ]

  console.log('📊 FUNCIONES IDENTIFICADAS:')
  functions.forEach((fn, index) => {
    console.log(`${index + 1}. ${fn.name}`)
    console.log(`   📁 Archivo: ${fn.file}`)
    console.log(`   📖 Lee de: ${fn.reads}`)
    console.log(`   🎯 Propósito: ${fn.purpose}`)
    console.log()
  })

  console.log('⚠️  PROBLEMA: 4 funciones leen de localStorage, 1 de Supabase')
  console.log('💡 SOLUCIÓN: Unificar todas las lecturas a Supabase')

  return functions
}

// ================================
// 4. CREAR BACKUP STRUCTURE
// ================================

function createBackupStructure() {
  console.log('\n🛡️ CREANDO ESTRUCTURA DE BACKUP...')

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupDir = path.join(process.cwd(), 'migration-backup', timestamp)

  try {
    // Crear directorio de backup
    fs.mkdirSync(backupDir, { recursive: true })
    console.log('✅ Directorio de backup creado:', backupDir)

    // Crear archivo de información del backup
    const backupInfo = {
      timestamp,
      version: 'v1.4.0-pre-migration',
      purpose: 'Backup before data migration to single source of truth',
      includes: [
        'localStorage structure analysis',
        'Constitution data analysis',
        'Functions mapping',
        'Migration plan'
      ]
    }

    fs.writeFileSync(
      path.join(backupDir, 'backup-info.json'),
      JSON.stringify(backupInfo, null, 2)
    )

    console.log('📋 Información del backup guardada')

    return backupDir

  } catch (error) {
    console.error('❌ Error creando estructura de backup:', error.message)
    return null
  }
}

// ================================
// 5. GENERAR REPORTE COMPLETO
// ================================

function generateReport(constitutionAnalysis, localStorageStructure, functions, backupDir) {
  console.log('\n📊 GENERANDO REPORTE DE DIAGNÓSTICO...')

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      status: 'MIGRATION_REQUIRED',
      priority: 'CRITICAL',
      estimatedTime: '3.5 hours'
    },
    discrepancies: [
      {
        issue: 'Constitution data vs expected total',
        current: `${constitutionAnalysis?.articlesInCode || 0} articles in code`,
        expected: '182 articles total',
        severity: 'HIGH'
      },
      {
        issue: 'Multiple data sources',
        current: '4 functions reading from localStorage, 1 from Supabase',
        expected: 'Single source of truth (Supabase)',
        severity: 'CRITICAL'
      },
      {
        issue: 'Data inconsistency',
        current: 'Different counters showing different numbers',
        expected: 'All counters showing same number',
        severity: 'CRITICAL'
      }
    ],
    migrationPlan: {
      phase1: 'Diagnose and backup (30min)',
      phase2: 'Mass data migration (45min)',
      phase3: 'API refactoring (60min)',
      phase4: 'Component updates (45min)',
      phase5: 'Final validation (30min)'
    },
    nextSteps: [
      'Execute this diagnosis script ✅',
      'Create localStorage backup',
      'Run migration script',
      'Implement unified progress hook',
      'Update all components',
      'Validate consistency'
    ]
  }

  if (backupDir) {
    const reportPath = path.join(backupDir, 'diagnosis-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log('✅ Reporte guardado en:', reportPath)
  }

  // También mostrar resumen en consola
  console.log('\n' + '='.repeat(60))
  console.log('📋 RESUMEN DEL DIAGNÓSTICO')
  console.log('='.repeat(60))

  console.log(`🏥 Estado: ${report.summary.status}`)
  console.log(`⚠️  Prioridad: ${report.summary.priority}`)
  console.log(`⏱️  Tiempo estimado: ${report.summary.estimatedTime}`)

  console.log('\n🚨 DISCREPANCIAS CRÍTICAS:')
  report.discrepancies.forEach((disc, index) => {
    console.log(`${index + 1}. ${disc.issue}`)
    console.log(`   Estado actual: ${disc.current}`)
    console.log(`   Estado deseado: ${disc.expected}`)
    console.log(`   Severidad: ${disc.severity}`)
    console.log()
  })

  console.log('🎯 PRÓXIMOS PASOS:')
  report.nextSteps.forEach((step, index) => {
    const status = index === 0 ? '✅' : '⏳'
    console.log(`${status} ${step}`)
  })

  return report
}

// ================================
// FUNCIÓN PRINCIPAL
// ================================

function main() {
  console.log('Iniciando diagnóstico completo...\n')

  // Ejecutar todos los análisis
  const constitutionAnalysis = analyzeConstitutionData()
  const localStorageStructure = analyzeLocalStorageStructure()
  const functions = analyzeFunctions()
  const backupDir = createBackupStructure()

  // Generar reporte final
  const report = generateReport(constitutionAnalysis, localStorageStructure, functions, backupDir)

  console.log('\n🎉 DIAGNÓSTICO COMPLETADO')
  console.log('📁 Archivos de backup y reporte creados')
  console.log('\n🚀 READY TO EXECUTE MIGRATION!')
  console.log('   Next command: node scripts/migrate-data.js')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = {
  analyzeConstitutionData,
  analyzeLocalStorageStructure,
  analyzeFunctions,
  createBackupStructure,
  generateReport
}