'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Calendar,
  Clock,
  Target,
  Filter,
  Search,
  Eye,
  Download,
  TrendingUp,
  Award
} from 'lucide-react'

// ================================
// INTERFACES
// ================================

export interface ExamHistoryEntry {
  id: number
  exam_type: 'article' | 'title' | 'general'
  exam_identifier: string | null
  title_name: string | null
  total_questions: number
  correct_answers: number
  incorrect_answers: number
  score_percentage: number
  time_taken_seconds: number | null
  completed_at: string
  questions_data: any
}

export interface ExamHistoryDetailedProps {
  examHistory: ExamHistoryEntry[]
  loading?: boolean
  onRefresh?: () => void
}

// ================================
// COMPONENTE PRINCIPAL
// ================================

export function ExamHistoryDetailed({ examHistory, loading = false, onRefresh }: ExamHistoryDetailedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date_desc')
  const [selectedExam, setSelectedExam] = useState<ExamHistoryEntry | null>(null)

  // ================================
  // FUNCIONES DE FILTRADO Y ORDENAMIENTO
  // ================================

  const filteredAndSortedExams = React.useMemo(() => {
    let filtered = examHistory

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.exam_identifier?.includes(searchTerm) ||
        exam.exam_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(exam => exam.exam_type === filterType)
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
        case 'date_asc':
          return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
        case 'score_desc':
          return b.score_percentage - a.score_percentage
        case 'score_asc':
          return a.score_percentage - b.score_percentage
        case 'time_desc':
          return (b.time_taken_seconds || 0) - (a.time_taken_seconds || 0)
        case 'time_asc':
          return (a.time_taken_seconds || 0) - (b.time_taken_seconds || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [examHistory, searchTerm, filterType, sortBy])

  // ================================
  // FUNCIONES DE UTILIDAD
  // ================================

  const formatTime = (seconds: number | null): string => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getExamTypeName = (type: string): string => {
    switch (type) {
      case 'article': return 'Artículo'
      case 'title': return 'Título'
      case 'general': return 'General'
      default: return type
    }
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  // ================================
  // CÁLCULOS DE ESTADÍSTICAS
  // ================================

  const stats = React.useMemo(() => {
    const total = filteredAndSortedExams.length
    const avgScore = total > 0
      ? Math.round(filteredAndSortedExams.reduce((sum, exam) => sum + exam.score_percentage, 0) / total)
      : 0
    const bestScore = total > 0
      ? Math.max(...filteredAndSortedExams.map(exam => exam.score_percentage))
      : 0
    const totalQuestions = filteredAndSortedExams.reduce((sum, exam) => sum + exam.total_questions, 0)
    const totalCorrect = filteredAndSortedExams.reduce((sum, exam) => sum + exam.correct_answers, 0)

    return {
      total,
      avgScore,
      bestScore,
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      totalQuestions,
      totalCorrect
    }
  }, [filteredAndSortedExams])

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Exámenes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Promedio</p>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mejor Puntuación</p>
                <p className="text-2xl font-bold">{stats.bestScore}%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisión</p>
                <p className="text-2xl font-bold">{stats.accuracy}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCorrect}/{stats.totalQuestions}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de filtrado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historial de Exámenes</span>
            <Button onClick={onRefresh} variant="outline" size="sm">
              Actualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exámenes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="article">Artículo</SelectItem>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenamiento */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Fecha (reciente)</SelectItem>
                <SelectItem value="date_asc">Fecha (antiguo)</SelectItem>
                <SelectItem value="score_desc">Puntuación (alta)</SelectItem>
                <SelectItem value="score_asc">Puntuación (baja)</SelectItem>
                <SelectItem value="time_desc">Tiempo (más)</SelectItem>
                <SelectItem value="time_asc">Tiempo (menos)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla de exámenes */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando historial...</p>
            </div>
          ) : filteredAndSortedExams.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {examHistory.length === 0
                  ? 'Aún no has realizado ningún examen'
                  : 'No se encontraron exámenes con los filtros aplicados'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Examen</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Preguntas</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {getExamTypeName(exam.exam_type)}
                          {exam.exam_identifier && ` ${exam.exam_identifier}`}
                        </p>
                        {exam.title_name && (
                          <p className="text-sm text-muted-foreground">
                            {exam.title_name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {new Date(exam.completed_at).toLocaleDateString('es-ES')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getScoreBadgeVariant(exam.score_percentage)}>
                          {exam.score_percentage}%
                        </Badge>
                        <Progress
                          value={exam.score_percentage}
                          className="w-20"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatTime(exam.time_taken_seconds)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {exam.correct_answers}/{exam.total_questions}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedExam(exam)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalles del Examen</DialogTitle>
                            <DialogDescription>
                              Revisión completa del examen realizado
                            </DialogDescription>
                          </DialogHeader>
                          {selectedExam && (
                            <ExamDetailsDialog exam={selectedExam} />
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ================================
// COMPONENTE DE DETALLES DE EXAMEN
// ================================

function ExamDetailsDialog({ exam }: { exam: ExamHistoryEntry }) {
  return (
    <div className="space-y-4">
      {/* Información general */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium">Tipo de Examen</p>
          <p className="text-sm text-muted-foreground">
            {exam.exam_type === 'article' && `Artículo ${exam.exam_identifier}`}
            {exam.exam_type === 'title' && exam.title_name}
            {exam.exam_type === 'general' && 'Examen General'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Fecha</p>
          <p className="text-sm text-muted-foreground">
            {new Date(exam.completed_at).toLocaleString('es-ES')}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Puntuación</p>
          <p className="text-sm text-muted-foreground">
            {exam.score_percentage}% ({exam.correct_answers}/{exam.total_questions})
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Tiempo</p>
          <p className="text-sm text-muted-foreground">
            {exam.time_taken_seconds ?
              `${Math.floor(exam.time_taken_seconds / 60)}:${(exam.time_taken_seconds % 60).toString().padStart(2, '0')}` :
              'N/A'
            }
          </p>
        </div>
      </div>

      {/* Progreso visual */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Respuestas Correctas</span>
          <span>{exam.correct_answers}/{exam.total_questions}</span>
        </div>
        <Progress value={exam.score_percentage} />
      </div>

      {/* Preguntas (si están disponibles) */}
      {exam.questions_data && Array.isArray(exam.questions_data) && (
        <div className="space-y-3">
          <h4 className="font-medium">Preguntas del Examen</h4>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {exam.questions_data.map((question: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg">
                <p className="text-sm font-medium mb-2">
                  {index + 1}. {question.question_text}
                </p>
                <div className="text-xs space-y-1">
                  <p className={question.isCorrect ? 'text-green-600' : 'text-red-600'}>
                    Tu respuesta: {['A', 'B', 'C', 'D'][question.userAnswer]}
                    {question.isCorrect ? ' ✓' : ' ✗'}
                  </p>
                  {!question.isCorrect && (
                    <p className="text-green-600">
                      Respuesta correcta: {['A', 'B', 'C', 'D'][question.correct_answer]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}