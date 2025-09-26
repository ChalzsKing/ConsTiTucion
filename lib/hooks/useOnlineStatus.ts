"use client"

import { useState, useEffect } from 'react'

/**
 * Hook para detectar el estado de conexión a internet
 * @returns {boolean} true si está online, false si está offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Verificar estado inicial
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    // Event listeners para cambios de conexión
    const handleOnline = () => {
      setIsOnline(true)
      console.log('🌐 Connection restored')

      // Dispatch evento personalizado para que otros componentes puedan reaccionar
      window.dispatchEvent(new CustomEvent('connection-restored'))
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log('📡 Connection lost')

      // Dispatch evento personalizado
      window.dispatchEvent(new CustomEvent('connection-lost'))
    }

    // Agregar event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

/**
 * Hook avanzado que incluye auto-sync cuando se restaura la conexión
 */
export function useOnlineSync(onConnectionRestored?: () => void) {
  const isOnline = useOnlineStatus()
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
    } else if (wasOffline && isOnline) {
      // Se restauró la conexión después de estar offline
      setWasOffline(false)

      // Ejecutar callback si se proporciona
      if (onConnectionRestored) {
        console.log('🔄 Auto-syncing after connection restored...')
        setTimeout(onConnectionRestored, 1000) // Pequeño delay para asegurar estabilidad
      }
    }
  }, [isOnline, wasOffline, onConnectionRestored])

  return {
    isOnline,
    wasOffline: wasOffline && !isOnline,
    justReconnected: wasOffline && isOnline
  }
}

/**
 * Hook para mostrar notificaciones de estado de conexión
 */
export function useConnectionNotifications() {
  const [notification, setNotification] = useState<{
    type: 'online' | 'offline'
    message: string
    visible: boolean
  } | null>(null)

  useEffect(() => {
    const handleConnectionLost = () => {
      setNotification({
        type: 'offline',
        message: 'Sin conexión a internet. Los datos se guardarán localmente.',
        visible: true
      })

      // Ocultar notificación después de 5 segundos
      setTimeout(() => {
        setNotification(prev => prev ? { ...prev, visible: false } : null)
      }, 5000)
    }

    const handleConnectionRestored = () => {
      setNotification({
        type: 'online',
        message: 'Conexión restaurada. Sincronizando datos...',
        visible: true
      })

      // Ocultar notificación después de 3 segundos
      setTimeout(() => {
        setNotification(prev => prev ? { ...prev, visible: false } : null)
      }, 3000)
    }

    // Escuchar eventos de conexión
    window.addEventListener('connection-lost', handleConnectionLost)
    window.addEventListener('connection-restored', handleConnectionRestored)

    return () => {
      window.removeEventListener('connection-lost', handleConnectionLost)
      window.removeEventListener('connection-restored', handleConnectionRestored)
    }
  }, [])

  const dismissNotification = () => {
    setNotification(prev => prev ? { ...prev, visible: false } : null)
  }

  return {
    notification,
    dismissNotification
  }
}