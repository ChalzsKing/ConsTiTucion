'use client'

import React, { useState } from 'react'
import { useDataExport, ExportOptions } from '@/lib/hooks/useDataExport'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  FileText,
  Database,
  Calendar,
  Clock,
  Target,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// ================================
// COMPONENTE PRINCIPAL
// ================================

export function DataExportDialog({ children }: { children: React.ReactNode }) {
  const { exportData, getExportSummary, isDataAvailable, formats } = useDataExport()

  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Estado del formulario de exportación
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    includePersonalData: false,
    includeExamHistory: true,
    includeStudyProgress: true,
    includeStatistics: true,
    dateRange: undefined
  })

  const [useDateRange, setUseDateRange] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // ================================
  // HANDLERS
  // ================================

  const handleExport = async () => {
    setIsExporting(true)
    setExportStatus({ type: null, message: '' })

    try {
      const exportOptions: ExportOptions = {
        ...options,
        dateRange: useDateRange && startDate && endDate ? {
          start: startDate,
          end: endDate
        } : undefined
      }

      const result = await exportData(exportOptions)

      if (result.success) {
        setExportStatus({
          type: 'success',
          message: result.message
        })
        setTimeout(() => {
          setIsOpen(false)
          setExportStatus({ type: null, message: '' })
        }, 2000)
      } else {
        setExportStatus({
          type: 'error',
          message: result.message
        })
      }
    } catch (error) {
      setExportStatus({
        type: 'error',
        message: 'Error inesperado al exportar los datos'
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Obtener resumen de la exportación
  const exportSummary = React.useMemo(() => {
    const finalOptions: ExportOptions = {
      ...options,
      dateRange: useDateRange && startDate && endDate ? {
        start: startDate,
        end: endDate
      } : undefined
    }
    return getExportSummary(finalOptions)
  }, [options, useDateRange, startDate, endDate, getExportSummary])

  // ================================
  // RENDER
  // ================================

  if (!isDataAvailable) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <div>
            {children}
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exportar Datos</DialogTitle>
            <DialogDescription>
              No hay datos disponibles para exportar
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Comienza a estudiar y realizar exámenes para generar datos que puedas exportar.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Exportar Datos
          </DialogTitle>
          <DialogDescription>
            Descarga tu progreso y estadísticas en diferentes formatos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selección de formato */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Formato de Exportación</Label>
            <div className="grid grid-cols-1 gap-3">
              {formats.map(format => (
                <Card
                  key={format.value}
                  className={`cursor-pointer transition-colors ${
                    options.format === format.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleOptionChange('format', format.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {format.value === 'csv' && <FileText className="h-5 w-5 text-green-600" />}
                        {format.value === 'json' && <Database className="h-5 w-5 text-blue-600" />}
                        {format.value === 'pdf' && <FileText className="h-5 w-5 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{format.label}</span>
                          {options.format === format.value && (
                            <Badge variant="default" className="text-xs">Seleccionado</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{format.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Contenido a incluir */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Contenido a Incluir</Label>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="statistics"
                  checked={options.includeStatistics}
                  onCheckedChange={(checked) => handleOptionChange('includeStatistics', checked)}
                />
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="statistics">Estadísticas Generales</Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="examHistory"
                  checked={options.includeExamHistory}
                  onCheckedChange={(checked) => handleOptionChange('includeExamHistory', checked)}
                />
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="examHistory">Historial de Exámenes</Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="studyProgress"
                  checked={options.includeStudyProgress}
                  onCheckedChange={(checked) => handleOptionChange('includeStudyProgress', checked)}
                />
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="studyProgress">Progreso de Estudio</Label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  id="personalData"
                  checked={options.includePersonalData}
                  onCheckedChange={(checked) => handleOptionChange('includePersonalData', checked)}
                />
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="personalData">Datos Personales (notas, respuestas detalladas)</Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Filtro de fechas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="dateRange"
                checked={useDateRange}
                onCheckedChange={setUseDateRange}
              />
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="dateRange">Filtrar por Rango de Fechas</Label>
              </div>
            </div>

            {useDateRange && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Resumen de la exportación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen de Exportación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Estadísticas:</span>
                  <Badge variant="outline">{exportSummary.totalStatistics}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Exámenes:</span>
                  <Badge variant="outline">{exportSummary.totalExams}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Progreso:</span>
                  <Badge variant="outline">{exportSummary.totalProgress}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Tamaño aprox:</span>
                  <Badge variant="outline">{exportSummary.estimatedSize}</Badge>
                </div>
              </div>
              {exportSummary.dateRange && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Rango: {exportSummary.dateRange.start} a {exportSummary.dateRange.end}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estado de exportación */}
          {exportStatus.type && (
            <Alert variant={exportStatus.type === 'error' ? 'destructive' : 'default'}>
              {exportStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{exportStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || (useDateRange && (!startDate || !endDate))}
            >
              {isExporting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Datos
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}