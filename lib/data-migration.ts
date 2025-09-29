import { getArticleTitleId } from './article-title-mapping'

// ================================
// MIGRACIÓN Y LIMPIEZA DE DATOS
// ================================

export function cleanAndMigrateLocalStorage() {
  try {
    console.log('🧹 Iniciando limpieza de datos localStorage...')

    // Limpiar datos corruptos del progreso
    cleanArticleProgress()

    // Limpiar resultados de exámenes antiguos si es necesario
    cleanExamResults()

    console.log('✅ Limpieza de datos completada')
  } catch (error) {
    console.error('❌ Error durante la limpieza de datos:', error)
  }
}

function cleanArticleProgress() {
  const progressKey = 'userProgress'
  const rawData = localStorage.getItem(progressKey)

  if (!rawData) {
    console.log('📝 No hay datos de progreso para limpiar')
    return
  }

  try {
    const progressData = JSON.parse(rawData)
    let hasChanges = false

    // Si es un objeto de progreso con artículos
    if (progressData && typeof progressData === 'object') {
      // Verificar si es el nuevo formato o el antiguo
      if (progressData.articles) {
        // Nuevo formato - limpiar artículos
        Object.keys(progressData.articles).forEach(articleKey => {
          const article = progressData.articles[articleKey]

          if (article && typeof article === 'object') {
            // Asegurar que el artículo tiene title_id
            if (!article.titleId && article.articleNumber) {
              article.titleId = getArticleTitleId(article.articleNumber)
              hasChanges = true
              console.log(`🔧 Agregado title_id '${article.titleId}' al artículo ${article.articleNumber}`)
            }

            // Asegurar que las fechas estén en formato correcto
            if (article.completedAt && typeof article.completedAt !== 'string') {
              article.completedAt = new Date(article.completedAt).toISOString()
              hasChanges = true
            }

            if (article.lastStudiedAt && typeof article.lastStudiedAt !== 'string') {
              article.lastStudiedAt = new Date(article.lastStudiedAt).toISOString()
              hasChanges = true
            }

            // Asegurar valores por defecto
            if (typeof article.studyTimeSeconds !== 'number') {
              article.studyTimeSeconds = 0
              hasChanges = true
            }

            if (typeof article.timesStudied !== 'number') {
              article.timesStudied = 1
              hasChanges = true
            }
          }
        })
      } else {
        // Formato antiguo - podría ser directamente un objeto de artículos
        Object.keys(progressData).forEach(key => {
          const item = progressData[key]

          if (item && typeof item === 'object' && item.articleNumber) {
            // Asegurar que el artículo tiene title_id
            if (!item.titleId && item.articleNumber) {
              item.titleId = getArticleTitleId(item.articleNumber)
              hasChanges = true
              console.log(`🔧 Agregado title_id '${item.titleId}' al artículo ${item.articleNumber}`)
            }

            // Limpiar fechas
            if (item.completedAt && typeof item.completedAt !== 'string') {
              item.completedAt = new Date(item.completedAt).toISOString()
              hasChanges = true
            }

            if (item.lastStudiedAt && typeof item.lastStudiedAt !== 'string') {
              item.lastStudiedAt = new Date(item.lastStudiedAt).toISOString()
              hasChanges = true
            }
          }
        })
      }

      // Guardar los cambios si los hay
      if (hasChanges) {
        localStorage.setItem(progressKey, JSON.stringify(progressData))
        console.log('💾 Datos de progreso actualizados en localStorage')
      } else {
        console.log('✅ Datos de progreso ya están limpios')
      }
    }
  } catch (error) {
    console.error('❌ Error limpiando datos de progreso:', error)
    // En caso de error, podríamos limpiar completamente los datos corruptos
    // localStorage.removeItem(progressKey)
  }
}

function cleanExamResults() {
  const examKeys = Object.keys(localStorage).filter(key =>
    key.startsWith('exam-') || key.includes('examResult')
  )

  let cleanedCount = 0

  examKeys.forEach(key => {
    try {
      const rawData = localStorage.getItem(key)
      if (rawData) {
        const data = JSON.parse(rawData)

        // Verificar si los datos del examen están corruptos
        if (!data || typeof data !== 'object') {
          localStorage.removeItem(key)
          cleanedCount++
          console.log(`🗑️ Eliminado resultado de examen corrupto: ${key}`)
        }
      }
    } catch (error) {
      // Si no se puede parsear, eliminar
      localStorage.removeItem(key)
      cleanedCount++
      console.log(`🗑️ Eliminado resultado de examen corrupto: ${key}`)
    }
  })

  if (cleanedCount > 0) {
    console.log(`🧹 Eliminados ${cleanedCount} resultados de exámenes corruptos`)
  } else {
    console.log('✅ Resultados de exámenes están limpios')
  }
}

// Función para migrar datos antiguos al nuevo formato
export function migrateOldDataFormat() {
  try {
    console.log('🔄 Verificando migración de datos antiguos...')

    // Verificar si hay datos en formato antiguo que necesiten migración
    const oldFormatKeys = [
      'constitutionProgress',
      'studyStats',
      'articleStats'
    ]

    oldFormatKeys.forEach(key => {
      const oldData = localStorage.getItem(key)
      if (oldData) {
        console.log(`📦 Encontrados datos antiguos en '${key}', considerando migración...`)
        // Aquí podrías agregar lógica específica de migración si es necesario
      }
    })

    console.log('✅ Verificación de migración completada')
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  }
}

// Función para resetear completamente los datos si es necesario
export function resetAllLocalData() {
  const keys = Object.keys(localStorage).filter(key =>
    key.includes('Progress') ||
    key.includes('exam') ||
    key.includes('study') ||
    key.includes('constitution')
  )

  keys.forEach(key => {
    localStorage.removeItem(key)
  })

  console.log(`🔄 Reseteados ${keys.length} elementos de localStorage`)
}