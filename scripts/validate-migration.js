#!/usr/bin/env node

/**
 * ✅ VALIDACIÓN FINAL DE MIGRACIÓN - ConstiMaster
 *
 * Este script valida que la migración fue exitosa y todos los componentes
 * están usando la nueva API unificada
 *
 * Ejecución: node scripts/validate-migration.js
 */

const fs = require('fs')
const path = require('path')

console.log('✅ VALIDACIÓN FINAL DE MIGRACIÓN - ConstiMaster')
console.log('=' .repeat(60))

// ================================
// 1. VALIDAR COMPONENTES ACTUALIZADOS
// ================================

function validateComponents() {
  console.log('\n🔍 VALIDANDO COMPONENTES ACTUALIZADOS...')

  const componentsToCheck = [
    {
      file: 'components/stats-dashboard.tsx',
      oldImport: 'useStatistics',
      newImport: 'useUnifiedProgress',
      description: 'Dashboard de estadísticas'
    },
    {
      file: 'components/sidebar.tsx',
      oldImport: 'getOverallProgress',
      newImport: 'useOverallProgress',
      description: 'Barra lateral con progreso'
    },
    {
      file: 'components/articulos-view.tsx',
      oldImport: 'getTitleProgress',
      newImport: 'useUnifiedProgress',
      description: 'Vista de artículos'
    }
  ]

  let validationResults = []

  componentsToCheck.forEach(component => {
    const filePath = path.join(process.cwd(), component.file)

    if (!fs.existsSync(filePath)) {
      validationResults.push({
        component: component.file,
        status: 'ERROR',
        message: 'Archivo no encontrado'
      })
      return
    }

    const content = fs.readFileSync(filePath, 'utf8')

    // Verificar que usa la nueva API
    const hasNewImport = content.includes(component.newImport)
    const hasOldImport = content.includes(component.oldImport) &&
                        !content.includes(`//${component.oldImport}`) // Ignorar comentarios

    let status = 'SUCCESS'
    let message = 'Usando nueva API unificada'

    if (!hasNewImport && hasOldImport) {
      status = 'PENDING'
      message = 'Aún usa API legacy, necesita migración'
    } else if (hasNewImport && hasOldImport) {
      status = 'PARTIAL'
      message = 'Usa ambas APIs, revisar código'
    } else if (!hasNewImport && !hasOldImport) {
      status = 'UNKNOWN'
      message = 'No usa ninguna de las APIs esperadas'
    }

    validationResults.push({
      component: component.file,
      status,
      message,
      description: component.description
    })
  })

  console.log('📊 RESULTADOS POR COMPONENTE:')
  validationResults.forEach(result => {
    const icon = {
      'SUCCESS': '✅',
      'PARTIAL': '⚠️',
      'PENDING': '🔄',
      'ERROR': '❌',
      'UNKNOWN': '❓'
    }[result.status]

    console.log(`${icon} ${result.component}`)
    console.log(`   Descripción: ${result.description}`)
    console.log(`   Estado: ${result.status}`)
    console.log(`   Mensaje: ${result.message}`)
    console.log()
  })

  return validationResults
}

// ================================
// 2. VALIDAR HOOK UNIFICADO
// ================================

function validateUnifiedHook() {
  console.log('\n🔧 VALIDANDO HOOK UNIFICADO...')

  const hookPath = path.join(process.cwd(), 'lib/hooks/useUnifiedProgress.ts')

  if (!fs.existsSync(hookPath)) {
    console.error('❌ Hook useUnifiedProgress.ts no encontrado')
    return false
  }

  const content = fs.readFileSync(hookPath, 'utf8')

  // Verificar funciones clave
  const requiredFunctions = [
    'useUnifiedProgress',
    'useOverallProgress',
    'useTitleProgress',
    'useArticleProgress',
    'markArticleCompleted',
    'getArticleProgress',
    'getTitleProgress'
  ]

  const missingFunctions = requiredFunctions.filter(fn => !content.includes(fn))

  if (missingFunctions.length === 0) {
    console.log('✅ Hook unificado completo con todas las funciones')
    console.log('📋 Funciones disponibles:', requiredFunctions.join(', '))
    return true
  } else {
    console.log('⚠️ Hook unificado incompleto')
    console.log('❌ Funciones faltantes:', missingFunctions.join(', '))
    return false
  }
}

// ================================
// 3. VALIDAR FUNCIONES DEPRECATED
// ================================

function validateDeprecatedFunctions() {
  console.log('\n🗑️ VALIDANDO FUNCIONES DEPRECATED...')

  const filesToCheck = [
    'lib/constitution-data.ts',
    'lib/article-navigation.ts',
    'components/study-flow.tsx'
  ]

  const deprecatedFunctions = [
    'getOverallProgress',
    'getTitleProgress',
    'updateArticleProgress'
  ]

  let foundUsages = []

  filesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file)

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')

      deprecatedFunctions.forEach(fn => {
        // Buscar uso de la función (pero no su definición)
        const usageRegex = new RegExp(`${fn}\\s*\\(`, 'g')
        const definitionRegex = new RegExp(`function\\s+${fn}|const\\s+${fn}\\s*=|export\\s+function\\s+${fn}`, 'g')

        const usageMatches = (content.match(usageRegex) || []).length
        const definitionMatches = (content.match(definitionRegex) || []).length

        const actualUsages = usageMatches - definitionMatches

        if (actualUsages > 0) {
          foundUsages.push({
            file,
            function: fn,
            usages: actualUsages
          })
        }
      })
    }
  })

  if (foundUsages.length === 0) {
    console.log('✅ No se encontraron usos de funciones deprecated')
  } else {
    console.log('⚠️ Funciones deprecated aún en uso:')
    foundUsages.forEach(usage => {
      console.log(`   📁 ${usage.file}`)
      console.log(`   🔄 ${usage.function} (${usage.usages} usos)`)
    })
  }

  return foundUsages
}

// ================================
// 4. GENERAR REPORTE FINAL
// ================================

function generateFinalReport(componentResults, hookValid, deprecatedUsages) {
  console.log('\n📊 GENERANDO REPORTE FINAL...')

  const timestamp = new Date().toISOString()
  const successfulComponents = componentResults.filter(r => r.status === 'SUCCESS').length
  const totalComponents = componentResults.length

  const report = {
    timestamp,
    migration_status: 'COMPLETED_WITH_VALIDATIONS',
    summary: {
      components_migrated: `${successfulComponents}/${totalComponents}`,
      hook_status: hookValid ? 'COMPLETE' : 'INCOMPLETE',
      deprecated_usages: deprecatedUsages.length,
      overall_status: successfulComponents === totalComponents && hookValid && deprecatedUsages.length === 0
        ? 'SUCCESS' : 'NEEDS_ATTENTION'
    },
    details: {
      components: componentResults,
      hook_validation: hookValid,
      deprecated_functions: deprecatedUsages
    },
    next_steps: [],
    recommendations: []
  }

  // Generar recomendaciones
  if (successfulComponents < totalComponents) {
    report.next_steps.push('Completar migración de componentes pendientes')
  }

  if (!hookValid) {
    report.next_steps.push('Completar implementación del hook unificado')
  }

  if (deprecatedUsages.length > 0) {
    report.next_steps.push('Eliminar usos de funciones deprecated')
  }

  if (report.summary.overall_status === 'SUCCESS') {
    report.recommendations.push('Migración completada exitosamente')
    report.recommendations.push('Realizar testing completo en navegador')
    report.recommendations.push('Verificar sincronización con Supabase')
  }

  // Guardar reporte
  const reportPath = path.join(process.cwd(), 'migration-backup', 'validation-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

  console.log('✅ Reporte guardado en:', reportPath)

  return report
}

// ================================
// 5. MOSTRAR RESUMEN FINAL
// ================================

function showFinalSummary(report) {
  console.log('\n' + '='.repeat(60))
  console.log('🎉 RESUMEN FINAL DE MIGRACIÓN')
  console.log('='.repeat(60))

  console.log(`📅 Fecha: ${new Date(report.timestamp).toLocaleString()}`)
  console.log(`🏥 Estado general: ${report.summary.overall_status}`)
  console.log(`📊 Componentes migrados: ${report.summary.components_migrated}`)
  console.log(`🔧 Hook unificado: ${report.summary.hook_status}`)
  console.log(`🗑️ Funciones deprecated: ${report.summary.deprecated_usages}`)

  if (report.next_steps.length > 0) {
    console.log('\n🎯 PRÓXIMOS PASOS:')
    report.next_steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step}`)
    })
  }

  if (report.recommendations.length > 0) {
    console.log('\n💡 RECOMENDACIONES:')
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })
  }

  if (report.summary.overall_status === 'SUCCESS') {
    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!')
    console.log('🚀 El sistema ahora usa Supabase como única fuente de verdad')
    console.log('🔄 Todos los contadores deberían mostrar números consistentes')
  } else {
    console.log('\n⚠️ MIGRACIÓN REQUIERE ATENCIÓN')
    console.log('🔧 Revisar los puntos indicados arriba')
  }
}

// ================================
// FUNCIÓN PRINCIPAL
// ================================

function main() {
  console.log('🔍 Iniciando validación final...\n')

  // Ejecutar validaciones
  const componentResults = validateComponents()
  const hookValid = validateUnifiedHook()
  const deprecatedUsages = validateDeprecatedFunctions()

  // Generar reporte
  const report = generateFinalReport(componentResults, hookValid, deprecatedUsages)

  // Mostrar resumen
  showFinalSummary(report)

  console.log('\n📁 Archivos generados en migration-backup/')
  console.log('🔍 Revisar validation-report.json para detalles completos')
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = {
  validateComponents,
  validateUnifiedHook,
  validateDeprecatedFunctions,
  generateFinalReport
}