'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

// ================================
// INTERFACES
// ================================

export interface ChartData {
  labels: string[]
  datasets: any[]
}

export interface ProgressChartsProps {
  dailyActivity: any[]
  examHistory: any[]
  userProgress: any[]
  statistics: any
}

// ================================
// COMPONENTE PRINCIPAL
// ================================

export function ProgressCharts({ dailyActivity, examHistory, userProgress, statistics }: ProgressChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Actividad Diaria */}
      <StudyActivityChart dailyActivity={dailyActivity} />

      {/* Gráfico de Rendimiento en Exámenes */}
      <ExamPerformanceChart examHistory={examHistory} />

      {/* Gráfico de Progreso por Títulos */}
      <TitlesProgressChart userProgress={userProgress} />

      {/* Gráfico de Distribución de Tiempo */}
      <StudyTimeDistribution userProgress={userProgress} />
    </div>
  )
}

// ================================
// GRÁFICO: ACTIVIDAD DIARIA
// ================================

function StudyActivityChart({ dailyActivity }: { dailyActivity: any[] }) {
  // Preparar datos de los últimos 14 días
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    return date.toISOString().split('T')[0]
  })

  const activityMap = dailyActivity.reduce((acc, activity) => {
    acc[activity.activity_date] = activity
    return acc
  }, {})

  const studyTimeData = last14Days.map(date => {
    const activity = activityMap[date]
    return activity ? activity.study_time_minutes : 0
  })

  const articlesData = last14Days.map(date => {
    const activity = activityMap[date]
    return activity ? activity.articles_studied : 0
  })

  const chartData = {
    labels: last14Days.map(date => {
      const d = new Date(date)
      return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }),
    datasets: [
      {
        label: 'Tiempo de Estudio (min)',
        data: studyTimeData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Artículos Estudiados',
        data: articlesData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  }

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Minutos'
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Artículos'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Diaria</CardTitle>
        <CardDescription>
          Tu progreso de estudio en los últimos 14 días
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Line data={chartData} options={options} />
      </CardContent>
    </Card>
  )
}

// ================================
// GRÁFICO: RENDIMIENTO EXÁMENES
// ================================

function ExamPerformanceChart({ examHistory }: { examHistory: any[] }) {
  // Tomar los últimos 10 exámenes
  const recentExams = examHistory.slice(0, 10).reverse()

  const chartData = {
    labels: recentExams.map((exam, index) => {
      const date = new Date(exam.completed_at)
      const examType = exam.exam_type === 'title' ? 'Título' :
                      exam.exam_type === 'article' ? 'Art.' : 'General'
      return `${examType} ${index + 1}`
    }),
    datasets: [
      {
        label: 'Puntuación (%)',
        data: recentExams.map(exam => exam.score_percentage),
        backgroundColor: recentExams.map(exam =>
          exam.score_percentage >= 80 ? 'rgba(34, 197, 94, 0.8)' :
          exam.score_percentage >= 60 ? 'rgba(251, 191, 36, 0.8)' :
          'rgba(239, 68, 68, 0.8)'
        ),
        borderColor: recentExams.map(exam =>
          exam.score_percentage >= 80 ? 'rgb(34, 197, 94)' :
          exam.score_percentage >= 60 ? 'rgb(251, 191, 36)' :
          'rgb(239, 68, 68)'
        ),
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const exam = recentExams[context.dataIndex]
            if (!exam) return ''
            return [
              `Puntuación: ${context.parsed.y}%`,
              `Correctas: ${exam.correct_answers}/${exam.total_questions}`,
              `Fecha: ${new Date(exam.completed_at).toLocaleDateString()}`
            ]
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Exámenes Recientes'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Puntuación (%)'
        }
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento en Exámenes</CardTitle>
        <CardDescription>
          Puntuaciones de tus últimos 10 exámenes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentExams.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Realiza algunos exámenes para ver tu progreso
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ================================
// GRÁFICO: PROGRESO POR TÍTULOS
// ================================

function TitlesProgressChart({ userProgress }: { userProgress: any[] }) {
  const titles = [
    { id: 'preliminar', name: 'Preliminar', color: 'rgba(168, 85, 247, 0.8)' },
    { id: 'titulo1', name: 'Título I', color: 'rgba(59, 130, 246, 0.8)' },
    { id: 'titulo2', name: 'Título II', color: 'rgba(34, 197, 94, 0.8)' },
    { id: 'titulo3', name: 'Título III', color: 'rgba(251, 191, 36, 0.8)' },
    { id: 'titulo4', name: 'Título IV', color: 'rgba(239, 68, 68, 0.8)' },
    { id: 'titulo5', name: 'Título V', color: 'rgba(236, 72, 153, 0.8)' },
    { id: 'titulo6', name: 'Título VI', color: 'rgba(20, 184, 166, 0.8)' },
    { id: 'titulo7', name: 'Título VII', color: 'rgba(245, 101, 101, 0.8)' },
    { id: 'titulo8', name: 'Título VIII', color: 'rgba(139, 92, 246, 0.8)' }
  ]

  const progressByTitle = titles.map(title => {
    const titleProgress = userProgress.filter(p => p.title_id === title.id)
    const completed = titleProgress.filter(p => p.is_completed).length
    const total = titleProgress.length
    return {
      ...title,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }).filter(title => title.total > 0) // Solo mostrar títulos con artículos

  const chartData = {
    labels: progressByTitle.map(title => title.name),
    datasets: [
      {
        label: 'Artículos Completados',
        data: progressByTitle.map(title => title.completed),
        backgroundColor: progressByTitle.map(title => title.color),
        borderColor: progressByTitle.map(title => title.color.replace('0.8', '1')),
        borderWidth: 1
      },
      {
        label: 'Artículos Restantes',
        data: progressByTitle.map(title => title.total - title.completed),
        backgroundColor: progressByTitle.map(() => 'rgba(156, 163, 175, 0.3)'),
        borderColor: progressByTitle.map(() => 'rgba(156, 163, 175, 0.6)'),
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const title = progressByTitle[context.dataIndex]
            if (!title) return ''
            if (context.datasetIndex === 0) {
              return `Completados: ${context.parsed.y} (${title.percentage}%)`
            } else {
              return `Restantes: ${context.parsed.y}`
            }
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Títulos Constitucionales'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Artículos'
        }
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso por Títulos</CardTitle>
        <CardDescription>
          Artículos completados en cada título constitucional
        </CardDescription>
      </CardHeader>
      <CardContent>
        {progressByTitle.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Comienza a estudiar artículos para ver tu progreso
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ================================
// GRÁFICO: DISTRIBUCIÓN TIEMPO
// ================================

function StudyTimeDistribution({ userProgress }: { userProgress: any[] }) {
  const titles = [
    { id: 'preliminar', name: 'Preliminar', color: '#A855F7' },
    { id: 'titulo1', name: 'Título I', color: '#3B82F6' },
    { id: 'titulo2', name: 'Título II', color: '#22C55E' },
    { id: 'titulo3', name: 'Título III', color: '#FBBF24' },
    { id: 'titulo4', name: 'Título IV', color: '#EF4444' },
    { id: 'titulo5', name: 'Título V', color: '#EC4899' },
    { id: 'titulo6', name: 'Título VI', color: '#14B8A6' },
    { id: 'titulo7', name: 'Título VII', color: '#F59E0B' },
    { id: 'titulo8', name: 'Título VIII', color: '#8B5CF6' }
  ]

  const timeByTitle = titles.map(title => {
    const titleProgress = userProgress.filter(p => p.title_id === title.id)
    const totalMinutes = titleProgress.reduce((sum, p) => sum + Math.floor(p.total_study_time_seconds / 60), 0)
    return {
      ...title,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10
    }
  }).filter(title => title.totalMinutes > 0)

  const chartData = {
    labels: timeByTitle.map(title => title.name),
    datasets: [
      {
        label: 'Tiempo de Estudio',
        data: timeByTitle.map(title => title.totalMinutes),
        backgroundColor: timeByTitle.map(title => title.color + '80'), // 50% opacity
        borderColor: timeByTitle.map(title => title.color),
        borderWidth: 2
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const title = timeByTitle[context.dataIndex]
            if (!title) return ''
            return [
              `Tiempo: ${title.totalHours}h`,
              `Minutos: ${title.totalMinutes}`
            ]
          }
        }
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución del Tiempo</CardTitle>
        <CardDescription>
          Tiempo dedicado a cada título constitucional
        </CardDescription>
      </CardHeader>
      <CardContent>
        {timeByTitle.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Estudia algunos artículos para ver la distribución de tiempo
          </div>
        )}
      </CardContent>
    </Card>
  )
}