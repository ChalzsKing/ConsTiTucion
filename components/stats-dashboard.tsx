'use client'

import React from 'react'
import { useProgress } from '@/lib/hooks/useUnifiedProgressContext'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProgressCharts } from '@/components/charts/progress-charts'
import { DataExportDialog } from '@/components/data-export-dialog'
import {
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
  Download,
  RefreshCw,
  Star
} from 'lucide-react'

// ================================
// COMPONENTE PRINCIPAL
// ================================

export function StatsDashboard() {
  const { user } = useAuth()

  // Hook desde contexto global - actualización en tiempo real
  const {
    overall,
    statistics: unifiedStats,
    examHistory,
    dailyActivity,
    loading,
    error,
    refreshData,
    getRecentActivity,
    getStudyStreak
  } = useProgress()

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Inicia sesión para ver tus estadísticas</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando estadísticas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={refreshData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    )
  }

  const recentActivity = getRecentActivity(7)
  const currentStreak = getStudyStreak()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">📊 Estadísticas</h1>
          <p className="text-muted-foreground">
            Tu progreso en el estudio de la Constitución Española
          </p>
        </div>
        <div className="flex space-x-2">
          <DataExportDialog>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </DataExportDialog>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Artículos Estudiados"
          value={unifiedStats.totalArticlesStudied}
          total={overall.totalArticles}
          icon={BookOpen}
          color="blue"
        />
        <MetricCard
          title="Exámenes Realizados"
          value={unifiedStats.totalExamsTaken}
          icon={Target}
          color="green"
        />
        <MetricCard
          title="Tiempo de Estudio"
          value={`${Math.floor(unifiedStats.totalStudyTimeMinutes / 60)}h ${unifiedStats.totalStudyTimeMinutes % 60}m`}
          icon={Clock}
          color="purple"
        />
        <MetricCard
          title="Racha Actual"
          value={`${currentStreak} días`}
          icon={Star}
          color="orange"
        />
      </div>

      {/* Tabs de Contenido */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="exams">Exámenes</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rendimiento General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Rendimiento General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Mejor Puntuación</span>
                  <Badge variant="secondary">
                    {unifiedStats?.averageExamScore || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Promedio de Exámenes</span>
                  <Badge variant="secondary">
                    {unifiedStats?.averageExamScore || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Preguntas Correctas</span>
                  <Badge variant="secondary">
                    0 / 0
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Precisión</span>
                  <Badge variant="secondary">
                    0%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Logros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Logros y Nivel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Nivel Actual</span>
                  <Badge variant="default">
                    Nivel 1
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>XP Total</span>
                  <Badge variant="secondary">
                    0 XP
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Racha Máxima</span>
                  <Badge variant="secondary">
                    {unifiedStats?.currentStreakDays || 0} días
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Aún no tienes logros. ¡Sigue estudiando!
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Gráficos */}
        <TabsContent value="charts" className="space-y-4">
          <ProgressCharts
            dailyActivity={dailyActivity}
            examHistory={examHistory}
            userProgress={overall.titlesProgress}
            statistics={unifiedStats}
          />
        </TabsContent>

        {/* Tab: Progreso */}
        <TabsContent value="progress" className="space-y-4">
          <ProgressByTitles
            userProgress={overall.titlesProgress}
            getProgressByTitle={() => null}
          />
        </TabsContent>

        {/* Tab: Exámenes */}
        <TabsContent value="exams" className="space-y-4">
          <ExamHistorySection examHistory={examHistory} />
        </TabsContent>

        {/* Tab: Actividad */}
        <TabsContent value="activity" className="space-y-4">
          <ActivitySection
            dailyActivity={dailyActivity}
            recentActivity={recentActivity}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ================================
// COMPONENTES AUXILIARES
// ================================

interface MetricCardProps {
  title: string
  value: string | number
  total?: number
  icon: React.ElementType
  color: 'blue' | 'green' | 'purple' | 'orange'
}

function MetricCard({ title, value, total, icon: Icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  }

  const percentage = total ? Math.round((Number(value) / total) * 100) : null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {value}
              {total && <span className="text-sm text-muted-foreground"> / {total}</span>}
            </p>
            {percentage !== null && (
              <p className="text-sm text-muted-foreground">
                {percentage}% completado
              </p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
        </div>
        {percentage !== null && (
          <Progress value={percentage} className="mt-2" />
        )}
      </CardContent>
    </Card>
  )
}

function ProgressByTitles({ userProgress, getProgressByTitle }: {
  userProgress: any[]
  getProgressByTitle: (titleId: string) => { completed: number, total: number, percentage: number }
}) {
  const titles = [
    { id: 'preliminar', name: 'Título Preliminar' },
    { id: 'titulo1', name: 'Título I - Derechos Fundamentales' },
    { id: 'titulo2', name: 'Título II - La Corona' },
    { id: 'titulo3', name: 'Título III - Cortes Generales' },
    { id: 'titulo4', name: 'Título IV - Gobierno y Administración' },
    { id: 'titulo5', name: 'Título V - Relaciones Gobierno-Cortes' },
    { id: 'titulo6', name: 'Título VI - Poder Judicial' },
    { id: 'titulo7', name: 'Título VII - Economía y Hacienda' },
    { id: 'titulo8', name: 'Título VIII - Organización Territorial' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso por Títulos</CardTitle>
        <CardDescription>
          Tu avance en cada sección de la Constitución
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {titles.map(title => {
          const progress = getProgressByTitle(title.id)
          return (
            <div key={title.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{title.name}</span>
                <Badge variant="outline">
                  {progress.completed} / {progress.total}
                </Badge>
              </div>
              <Progress value={progress.percentage} />
              <p className="text-sm text-muted-foreground">
                {progress.percentage}% completado
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function ExamHistorySection({ examHistory }: { examHistory: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Exámenes</CardTitle>
        <CardDescription>
          Tus últimos {examHistory.length} exámenes realizados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {examHistory.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aún no has realizado ningún examen
          </p>
        ) : (
          <div className="space-y-3">
            {examHistory.slice(0, 10).map((exam, index) => (
              <div key={exam.id} className="flex justify-between items-center p-3 rounded-lg border">
                <div>
                  <p className="font-medium">
                    {exam.exam_type === 'title' && exam.title_name}
                    {exam.exam_type === 'article' && `Artículo ${exam.exam_identifier}`}
                    {exam.exam_type === 'general' && 'Examen General'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(exam.completed_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={exam.score_percentage >= 70 ? "default" : "secondary"}
                  >
                    {exam.score_percentage}%
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {exam.correct_answers}/{exam.total_questions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActivitySection({ dailyActivity, recentActivity }: {
  dailyActivity: any[]
  recentActivity: any[]
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente (7 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay actividad en los últimos 7 días
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex justify-between items-center p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">
                      {new Date(activity.activity_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.study_time_minutes} min estudiando
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline">
                      {activity.articles_studied} artículos
                    </Badge>
                    <Badge variant="outline">
                      {activity.exams_taken} exámenes
                    </Badge>
                    <Badge variant="outline">
                      +{activity.xp_earned} XP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}