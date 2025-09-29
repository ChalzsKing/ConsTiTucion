'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useStatistics } from './useStatistics'

// ================================
// INTERFACES
// ================================

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf'
  includePersonalData: boolean
  includeExamHistory: boolean
  includeStudyProgress: boolean
  includeStatistics: boolean
  dateRange?: {
    start: string
    end: string
  }
}

export interface ExportData {
  user: {
    id: string
    email: string
    exportDate: string
  }
  statistics?: any
  examHistory?: any[]
  userProgress?: any[]
  dailyActivity?: any[]
}

// ================================
// HOOK PRINCIPAL
// ================================

export function useDataExport() {
  const { user } = useAuth()
  const { statistics, examHistory, userProgress, dailyActivity } = useStatistics()

  // ================================
  // FUNCIONES DE EXPORT
  // ================================

  const prepareExportData = (options: ExportOptions): ExportData => {
    const exportData: ExportData = {
      user: {
        id: user?.id || '',
        email: user?.email || '',
        exportDate: new Date().toISOString()
      }
    }

    // Incluir estadísticas generales
    if (options.includeStatistics && statistics) {
      exportData.statistics = {
        ...statistics,
        export_date: new Date().toISOString()
      }
    }

    // Incluir historial de exámenes
    if (options.includeExamHistory && examHistory) {
      let filteredExams = examHistory

      // Aplicar filtro de fechas si está especificado
      if (options.dateRange) {
        const startDate = new Date(options.dateRange.start)
        const endDate = new Date(options.dateRange.end)

        filteredExams = examHistory.filter(exam => {
          const examDate = new Date(exam.completed_at)
          return examDate >= startDate && examDate <= endDate
        })
      }

      exportData.examHistory = filteredExams.map(exam => ({
        id: exam.id,
        exam_type: exam.exam_type,
        exam_identifier: exam.exam_identifier,
        title_name: exam.title_name,
        total_questions: exam.total_questions,
        correct_answers: exam.correct_answers,
        incorrect_answers: exam.incorrect_answers,
        score_percentage: exam.score_percentage,
        time_taken_seconds: exam.time_taken_seconds,
        completed_at: exam.completed_at,
        // Solo incluir preguntas si se especifica incluir datos personales
        ...(options.includePersonalData && { questions_data: exam.questions_data })
      }))
    }

    // Incluir progreso de estudio
    if (options.includeStudyProgress && userProgress) {
      exportData.userProgress = userProgress.map(progress => ({
        article_number: progress.article_number,
        title_id: progress.title_id,
        article_title: progress.article_title,
        is_completed: progress.is_completed,
        times_studied: progress.times_studied,
        total_study_time_seconds: progress.total_study_time_seconds,
        first_studied_at: progress.first_studied_at,
        last_studied_at: progress.last_studied_at,
        completed_at: progress.completed_at,
        // Solo incluir notas si se especifica incluir datos personales
        ...(options.includePersonalData && { user_notes: progress.user_notes })
      }))
    }

    // Incluir actividad diaria (siempre si está disponible)
    if (dailyActivity) {
      let filteredActivity = dailyActivity

      // Aplicar filtro de fechas
      if (options.dateRange) {
        const startDate = new Date(options.dateRange.start)
        const endDate = new Date(options.dateRange.end)

        filteredActivity = dailyActivity.filter(activity => {
          const activityDate = new Date(activity.activity_date)
          return activityDate >= startDate && activityDate <= endDate
        })
      }

      exportData.dailyActivity = filteredActivity
    }

    return exportData
  }

  // ================================
  // EXPORT A CSV
  // ================================

  const exportToCSV = (options: ExportOptions): string => {
    const data = prepareExportData(options)
    let csvContent = ''

    // Header del archivo
    csvContent += `# ConstiMaster - Exportación de Datos\n`
    csvContent += `# Usuario: ${data.user.email}\n`
    csvContent += `# Fecha de exportación: ${new Date(data.user.exportDate).toLocaleString('es-ES')}\n\n`

    // Estadísticas generales
    if (data.statistics) {
      csvContent += `## ESTADÍSTICAS GENERALES\n`
      csvContent += `Campo,Valor\n`
      csvContent += `Total Artículos Estudiados,${data.statistics.total_articles_studied}\n`
      csvContent += `Tiempo Total de Estudio (min),${data.statistics.total_study_time_minutes}\n`
      csvContent += `Racha Actual (días),${data.statistics.current_streak_days}\n`
      csvContent += `Racha Máxima (días),${data.statistics.max_streak_days}\n`
      csvContent += `Total Exámenes Realizados,${data.statistics.total_exams_taken}\n`
      csvContent += `Total Preguntas Respondidas,${data.statistics.total_questions_answered}\n`
      csvContent += `Total Respuestas Correctas,${data.statistics.total_correct_answers}\n`
      csvContent += `Mejor Puntuación (%),${data.statistics.best_exam_score}\n`
      csvContent += `Puntuación Promedio (%),${data.statistics.average_exam_score}\n`
      csvContent += `XP Total,${data.statistics.total_xp}\n`
      csvContent += `Nivel Actual,${data.statistics.current_level}\n\n`
    }

    // Historial de exámenes
    if (data.examHistory && data.examHistory.length > 0) {
      csvContent += `## HISTORIAL DE EXÁMENES\n`
      csvContent += `Fecha,Tipo,Identificador,Título,Total Preguntas,Correctas,Incorrectas,Puntuación (%),Tiempo (seg)\n`

      data.examHistory.forEach(exam => {
        csvContent += `${new Date(exam.completed_at).toLocaleDateString('es-ES')},`
        csvContent += `${exam.exam_type},`
        csvContent += `${exam.exam_identifier || ''},`
        csvContent += `"${exam.title_name || ''}",`
        csvContent += `${exam.total_questions},`
        csvContent += `${exam.correct_answers},`
        csvContent += `${exam.incorrect_answers},`
        csvContent += `${exam.score_percentage},`
        csvContent += `${exam.time_taken_seconds || ''}\n`
      })
      csvContent += `\n`
    }

    // Progreso por artículos
    if (data.userProgress && data.userProgress.length > 0) {
      csvContent += `## PROGRESO POR ARTÍCULOS\n`
      csvContent += `Artículo,Título,Nombre Artículo,Completado,Veces Estudiado,Tiempo Total (seg),Primera Vez,Última Vez,Completado En\n`

      data.userProgress.forEach(progress => {
        csvContent += `${progress.article_number},`
        csvContent += `${progress.title_id},`
        csvContent += `"${progress.article_title || ''}",`
        csvContent += `${progress.is_completed ? 'Sí' : 'No'},`
        csvContent += `${progress.times_studied},`
        csvContent += `${progress.total_study_time_seconds},`
        csvContent += `${new Date(progress.first_studied_at).toLocaleDateString('es-ES')},`
        csvContent += `${new Date(progress.last_studied_at).toLocaleDateString('es-ES')},`
        csvContent += `${progress.completed_at ? new Date(progress.completed_at).toLocaleDateString('es-ES') : ''}\n`
      })
      csvContent += `\n`
    }

    // Actividad diaria
    if (data.dailyActivity && data.dailyActivity.length > 0) {
      csvContent += `## ACTIVIDAD DIARIA\n`
      csvContent += `Fecha,Artículos Estudiados,Exámenes Realizados,Preguntas Respondidas,Respuestas Correctas,Tiempo Estudio (min),XP Ganado\n`

      data.dailyActivity.forEach(activity => {
        csvContent += `${activity.activity_date},`
        csvContent += `${activity.articles_studied},`
        csvContent += `${activity.exams_taken},`
        csvContent += `${activity.questions_answered},`
        csvContent += `${activity.correct_answers},`
        csvContent += `${activity.study_time_minutes},`
        csvContent += `${activity.xp_earned}\n`
      })
    }

    return csvContent
  }

  // ================================
  // EXPORT A JSON
  // ================================

  const exportToJSON = (options: ExportOptions): string => {
    const data = prepareExportData(options)
    return JSON.stringify(data, null, 2)
  }

  // ================================
  // GENERACIÓN DE REPORTES PDF
  // ================================

  const generatePDFReport = (options: ExportOptions): string => {
    const data = prepareExportData(options)

    // Para PDF necesitaríamos una librería como jsPDF
    // Por ahora retornamos un texto formateado que puede convertirse
    let report = ''

    report += `CONSTIMASTER - REPORTE DE PROGRESO\n`
    report += `=====================================\n\n`
    report += `Usuario: ${data.user.email}\n`
    report += `Fecha del reporte: ${new Date(data.user.exportDate).toLocaleDateString('es-ES')}\n\n`

    if (data.statistics) {
      report += `ESTADÍSTICAS GENERALES\n`
      report += `----------------------\n`
      report += `• Artículos estudiados: ${data.statistics.total_articles_studied} / 182\n`
      report += `• Tiempo total de estudio: ${Math.floor(data.statistics.total_study_time_minutes / 60)}h ${data.statistics.total_study_time_minutes % 60}m\n`
      report += `• Exámenes realizados: ${data.statistics.total_exams_taken}\n`
      report += `• Mejor puntuación: ${data.statistics.best_exam_score}%\n`
      report += `• Puntuación promedio: ${data.statistics.average_exam_score}%\n`
      report += `• Racha actual: ${data.statistics.current_streak_days} días\n`
      report += `• Nivel actual: ${data.statistics.current_level}\n\n`
    }

    if (data.examHistory && data.examHistory.length > 0) {
      report += `ÚLTIMOS EXÁMENES\n`
      report += `----------------\n`
      data.examHistory.slice(0, 10).forEach((exam, index) => {
        report += `${index + 1}. ${exam.exam_type === 'title' ? exam.title_name : 'Artículo ' + exam.exam_identifier} - `
        report += `${exam.score_percentage}% (${exam.correct_answers}/${exam.total_questions}) - `
        report += `${new Date(exam.completed_at).toLocaleDateString('es-ES')}\n`
      })
      report += `\n`
    }

    return report
  }

  // ================================
  // FUNCIONES DE DESCARGA
  // ================================

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const exportData = async (options: ExportOptions) => {
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const userPrefix = user.email?.split('@')[0] || 'usuario'

    try {
      switch (options.format) {
        case 'csv':
          const csvContent = exportToCSV(options)
          downloadFile(csvContent, `constimaster-${userPrefix}-${timestamp}.csv`, 'text/csv;charset=utf-8')
          break

        case 'json':
          const jsonContent = exportToJSON(options)
          downloadFile(jsonContent, `constimaster-${userPrefix}-${timestamp}.json`, 'application/json')
          break

        case 'pdf':
          const pdfContent = generatePDFReport(options)
          downloadFile(pdfContent, `constimaster-${userPrefix}-${timestamp}.txt`, 'text/plain;charset=utf-8')
          break

        default:
          throw new Error('Formato de exportación no soportado')
      }

      return {
        success: true,
        message: `Datos exportados exitosamente en formato ${options.format.toUpperCase()}`
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      return {
        success: false,
        message: 'Error al exportar los datos'
      }
    }
  }

  // ================================
  // FUNCIONES DE UTILIDAD
  // ================================

  const getExportSummary = (options: ExportOptions) => {
    const data = prepareExportData(options)

    return {
      totalStatistics: data.statistics ? 1 : 0,
      totalExams: data.examHistory?.length || 0,
      totalProgress: data.userProgress?.length || 0,
      totalDailyActivity: data.dailyActivity?.length || 0,
      estimatedSize: estimateDataSize(data),
      dateRange: options.dateRange
    }
  }

  const estimateDataSize = (data: ExportData): string => {
    const jsonSize = JSON.stringify(data).length
    const sizeInKB = Math.round(jsonSize / 1024)

    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`
    } else {
      return `${Math.round(sizeInKB / 1024 * 100) / 100} MB`
    }
  }

  return {
    exportData,
    getExportSummary,
    isDataAvailable: !!(statistics || examHistory?.length || userProgress?.length),
    formats: [
      { value: 'csv', label: 'CSV (Excel)', description: 'Tabla de datos para Excel' },
      { value: 'json', label: 'JSON', description: 'Datos estructurados' },
      { value: 'pdf', label: 'PDF (Reporte)', description: 'Reporte visual' }
    ]
  }
}