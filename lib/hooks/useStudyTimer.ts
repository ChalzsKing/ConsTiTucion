'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useStatistics } from './useStatistics'

// ================================
// INTERFACES
// ================================

export interface StudySession {
  articleNumber: number
  titleId: string
  articleTitle?: string
  startTime: number
  endTime?: number
  totalSeconds: number
  isCompleted: boolean
}

export interface TimerState {
  isRunning: boolean
  seconds: number
  formattedTime: string
  sessionStartTime: number | null
}

// ================================
// HOOK PRINCIPAL
// ================================

export function useStudyTimer(articleNumber?: number, titleId?: string, articleTitle?: string) {
  const { updateStudyProgress } = useStatistics()

  // Estado del timer
  const [isRunning, setIsRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  // Referencias para el intervalo y tracking
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSaveRef = useRef<number>(0)
  const accumulatedTimeRef = useRef<number>(0)

  // ================================
  // FUNCIONES PRINCIPALES
  // ================================

  const startTimer = useCallback(() => {
    if (!isRunning && articleNumber && titleId) {
      setIsRunning(true)
      setSessionStartTime(Date.now())

      // Guardar en localStorage para persistencia
      const sessionData = {
        articleNumber,
        titleId,
        articleTitle,
        startTime: Date.now(),
        accumulatedTime: accumulatedTimeRef.current
      }
      localStorage.setItem('currentStudySession', JSON.stringify(sessionData))
    }
  }, [isRunning, articleNumber, titleId, articleTitle])

  const pauseTimer = useCallback(() => {
    if (isRunning) {
      setIsRunning(false)

      // Actualizar tiempo acumulado
      const currentTime = Date.now()
      if (sessionStartTime) {
        const sessionTime = Math.floor((currentTime - sessionStartTime) / 1000)
        accumulatedTimeRef.current += sessionTime
      }

      // Actualizar localStorage
      const sessionData = {
        articleNumber,
        titleId,
        articleTitle,
        startTime: sessionStartTime,
        accumulatedTime: accumulatedTimeRef.current
      }
      localStorage.setItem('currentStudySession', JSON.stringify(sessionData))
    }
  }, [isRunning, sessionStartTime, articleNumber, titleId, articleTitle])

  const stopTimer = useCallback(async (markAsCompleted = false) => {
    if (articleNumber && titleId) {
      // Detener el timer
      setIsRunning(false)

      // Calcular tiempo total de la sesión
      let totalTime = accumulatedTimeRef.current
      if (sessionStartTime && isRunning) {
        const currentSessionTime = Math.floor((Date.now() - sessionStartTime) / 1000)
        totalTime += currentSessionTime
      }

      // Guardar progreso en la base de datos
      try {
        await updateStudyProgress({
          article_number: articleNumber,
          title_id: titleId,
          article_title: articleTitle,
          study_time_seconds: totalTime,
          is_completed: markAsCompleted
        })

        if (markAsCompleted) {
          setIsCompleted(true)
        }

        // Limpiar localStorage
        localStorage.removeItem('currentStudySession')

        // Reset del timer
        reset()

        return totalTime
      } catch (error) {
        console.error('Error saving study progress:', error)
        return totalTime
      }
    }
    return 0
  }, [articleNumber, titleId, articleTitle, sessionStartTime, isRunning, updateStudyProgress])

  const reset = useCallback(() => {
    setIsRunning(false)
    setSeconds(0)
    setSessionStartTime(null)
    setIsCompleted(false)
    accumulatedTimeRef.current = 0
    lastSaveRef.current = 0

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Limpiar localStorage
    localStorage.removeItem('currentStudySession')
  }, [])

  const markAsCompleted = useCallback(async () => {
    const totalTime = await stopTimer(true)
    return totalTime
  }, [stopTimer])

  // ================================
  // FUNCIONES DE UTILIDAD
  // ================================

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalStudyTime = (): number => {
    let total = accumulatedTimeRef.current
    if (sessionStartTime && isRunning) {
      const currentSessionTime = Math.floor((Date.now() - sessionStartTime) / 1000)
      total += currentSessionTime
    }
    return total
  }

  const saveProgressPeriodically = useCallback(async () => {
    if (!articleNumber || !titleId || !isRunning) return

    const currentTime = getTotalStudyTime()
    const timeSinceLastSave = currentTime - lastSaveRef.current

    // Guardar cada 30 segundos de estudio activo
    if (timeSinceLastSave >= 30) {
      try {
        await updateStudyProgress({
          article_number: articleNumber,
          title_id: titleId,
          article_title: articleTitle,
          study_time_seconds: currentTime,
          is_completed: isCompleted
        })
        lastSaveRef.current = currentTime
      } catch (error) {
        console.error('Error in periodic save:', error)
      }
    }
  }, [articleNumber, titleId, articleTitle, isRunning, isCompleted, updateStudyProgress])

  // ================================
  // FUNCIONES DE RECUPERACIÓN
  // ================================

  const restoreSession = useCallback(() => {
    const savedSession = localStorage.getItem('currentStudySession')
    if (savedSession && articleNumber && titleId) {
      try {
        const sessionData = JSON.parse(savedSession)

        // Verificar que es la misma sesión
        if (sessionData.articleNumber === articleNumber && sessionData.titleId === titleId) {
          accumulatedTimeRef.current = sessionData.accumulatedTime || 0

          // Si había una sesión activa, preguntar si quiere continuar
          if (sessionData.startTime && !sessionData.endTime) {
            const elapsedSinceStart = Math.floor((Date.now() - sessionData.startTime) / 1000)

            // Si han pasado menos de 1 hora, ofrecer restaurar
            if (elapsedSinceStart < 3600) {
              const shouldRestore = window.confirm(
                `Tienes una sesión de estudio activa de ${formatTime(accumulatedTimeRef.current)}. ¿Quieres continuar?`
              )

              if (shouldRestore) {
                setSeconds(accumulatedTimeRef.current)
                return true
              }
            }
          } else {
            // Restaurar tiempo acumulado sin activar el timer
            setSeconds(accumulatedTimeRef.current)
            return true
          }
        }
      } catch (error) {
        console.error('Error restoring session:', error)
      }
    }
    return false
  }, [articleNumber, titleId])

  // ================================
  // EFECTOS
  // ================================

  // Efecto para el contador principal
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  // Efecto para guardado periódico
  useEffect(() => {
    if (isRunning) {
      const saveInterval = setInterval(saveProgressPeriodically, 10000) // Cada 10 segundos
      return () => clearInterval(saveInterval)
    }
  }, [isRunning, saveProgressPeriodically])

  // Efecto para restaurar sesión al montar
  useEffect(() => {
    if (articleNumber && titleId) {
      restoreSession()
    }
  }, [articleNumber, titleId, restoreSession])

  // Efecto para cleanup al desmontar
  useEffect(() => {
    return () => {
      // Guardar progreso antes de desmontar si hay tiempo acumulado
      if (articleNumber && titleId && getTotalStudyTime() > 0) {
        pauseTimer()
      }
    }
  }, [articleNumber, titleId, pauseTimer])

  // ================================
  // VALOR DE RETORNO
  // ================================

  const timerState: TimerState = {
    isRunning,
    seconds: getTotalStudyTime(),
    formattedTime: formatTime(getTotalStudyTime()),
    sessionStartTime
  }

  return {
    // Estado del timer
    ...timerState,
    isCompleted,

    // Controles del timer
    start: startTimer,
    pause: pauseTimer,
    stop: stopTimer,
    reset,
    markAsCompleted,

    // Utilidades
    formatTime,
    getTotalStudyTime,
    restoreSession,

    // Estado para UI
    canStart: !isRunning && articleNumber && titleId,
    canPause: isRunning,
    canStop: seconds > 0 || accumulatedTimeRef.current > 0,
    hasProgress: seconds > 0 || accumulatedTimeRef.current > 0
  }
}