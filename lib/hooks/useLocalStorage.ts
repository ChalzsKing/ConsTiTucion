"use client"

import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook para manejar localStorage con TypeScript y hidratación SSR segura
 *
 * @param key - La clave de localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 * @returns [value, setValue, removeValue] tuple
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // Función para obtener valor de localStorage
  const getValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue])

  // Inicializar desde localStorage en client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStoredValue(getValue())
      setIsInitialized(true)
    }
  }, [getValue])

  // Función para actualizar el valor
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(currentValue => {
        // Permitir función updater como useState
        const valueToStore = value instanceof Function ? value(currentValue) : value

        // Solo guardar en localStorage si estamos en el cliente
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))

          // Dispatch evento personalizado para sincronización entre tabs
          window.dispatchEvent(
            new CustomEvent('localStorage-change', {
              detail: { key, value: valueToStore }
            })
          )
        }

        return valueToStore
      })
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key])

  // Función para eliminar el valor
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)

        // Dispatch evento de eliminación
        window.dispatchEvent(
          new CustomEvent('localStorage-change', {
            detail: { key, value: null }
          })
        )
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Escuchar cambios en localStorage desde otras pestañas
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      // Schedule update for next tick to avoid render phase updates
      setTimeout(() => {
        if ('detail' in e) {
          // Evento customizado (misma pestaña)
          if (e.detail.key === key) {
            setStoredValue(e.detail.value ?? initialValue)
          }
        } else {
          // Evento nativo (otras pestañas)
          if (e.key === key) {
            const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue
            setStoredValue(newValue)
          }
        }
      }, 0)
    }

    // Escuchar eventos de localStorage
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('localStorage-change', handleStorageChange as EventListener)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('localStorage-change', handleStorageChange as EventListener)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue, isInitialized] as const
}

/**
 * Hook especializado para objetos que se actualizan frecuentemente
 */
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
) {
  const [value, setValue, removeValue, isInitialized] = useLocalStorage(key, initialValue)

  // Función para actualizar propiedades específicas
  const updateProperty = useCallback((property: keyof T, newValue: T[keyof T]) => {
    setValue(current => ({
      ...current,
      [property]: newValue
    }))
  }, [setValue])

  // Función para actualizar múltiples propiedades
  const updateProperties = useCallback((updates: Partial<T>) => {
    setValue(current => ({
      ...current,
      ...updates
    }))
  }, [setValue])

  return [
    value,
    setValue,
    removeValue,
    isInitialized,
    updateProperty,
    updateProperties
  ] as const
}

/**
 * Hook para arrays con operaciones comunes
 */
export function useLocalStorageArray<T>(key: string, initialValue: T[] = []) {
  const [value, setValue, removeValue, isInitialized] = useLocalStorage(key, initialValue)

  const addItem = useCallback((item: T) => {
    setValue(current => [...current, item])
  }, [setValue])

  const removeItem = useCallback((index: number) => {
    setValue(current => current.filter((_, i) => i !== index))
  }, [setValue])

  const updateItem = useCallback((index: number, newItem: T) => {
    setValue(current =>
      current.map((item, i) => i === index ? newItem : item)
    )
  }, [setValue])

  const clear = useCallback(() => {
    setValue([])
  }, [setValue])

  return [
    value,
    setValue,
    removeValue,
    isInitialized,
    addItem,
    removeItem,
    updateItem,
    clear
  ] as const
}