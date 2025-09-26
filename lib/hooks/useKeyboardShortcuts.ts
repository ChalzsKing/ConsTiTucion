"use client"

import { useEffect, useCallback } from 'react'

/**
 * Configuración para un atajo de teclado
 */
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  callback: () => void
  description: string
  preventDefault?: boolean
}

/**
 * Hook para gestionar atajos de teclado
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Ignorar si está escribiendo en un input/textarea
    const activeElement = document.activeElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.hasAttribute('contenteditable'))
    ) {
      return
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const altMatches = !!shortcut.altKey === event.altKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey
      const metaMatches = !!shortcut.metaKey === event.metaKey

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        shortcut.callback()
        break
      }
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])

  return {
    shortcuts: shortcuts.map(shortcut => ({
      key: shortcut.key,
      ctrlKey: shortcut.ctrlKey,
      altKey: shortcut.altKey,
      shiftKey: shortcut.shiftKey,
      metaKey: shortcut.metaKey,
      description: shortcut.description
    }))
  }
}

/**
 * Hook especializado para navegación de artículos
 */
export function useArticleNavigationShortcuts({
  onPrevious,
  onNext,
  onComplete,
  onBack,
  enabled = true
}: {
  onPrevious?: () => void
  onNext?: () => void
  onComplete?: () => void
  onBack?: () => void
  enabled?: boolean
}) {
  const shortcuts: KeyboardShortcut[] = []

  if (onPrevious) {
    shortcuts.push({
      key: 'ArrowLeft',
      callback: onPrevious,
      description: '← Artículo anterior'
    })
  }

  if (onNext) {
    shortcuts.push({
      key: 'ArrowRight',
      callback: onNext,
      description: '→ Artículo siguiente'
    })
  }

  if (onComplete) {
    shortcuts.push({
      key: ' ', // Spacebar
      callback: onComplete,
      description: 'Espacio: Marcar completado'
    })
  }

  if (onBack) {
    shortcuts.push({
      key: 'Escape',
      callback: onBack,
      description: 'Esc: Volver al mapa'
    })
  }

  return useKeyboardShortcuts(shortcuts, enabled)
}

/**
 * Hook para atajos de examen
 */
export function useExamShortcuts({
  onSelectAnswer,
  onNext,
  onPrevious,
  onSubmit,
  enabled = true
}: {
  onSelectAnswer?: (index: number) => void
  onNext?: () => void
  onPrevious?: () => void
  onSubmit?: () => void
  enabled?: boolean
}) {
  const shortcuts: KeyboardShortcut[] = []

  if (onSelectAnswer) {
    // Opciones A, B, C, D
    for (let i = 0; i < 4; i++) {
      const letter = String.fromCharCode(65 + i) // A, B, C, D
      shortcuts.push({
        key: letter.toLowerCase(),
        callback: () => onSelectAnswer(i),
        description: `${letter}: Seleccionar opción ${letter}`
      })

      // También números 1, 2, 3, 4
      shortcuts.push({
        key: (i + 1).toString(),
        callback: () => onSelectAnswer(i),
        description: `${i + 1}: Seleccionar opción ${letter}`
      })
    }
  }

  if (onNext) {
    shortcuts.push({
      key: 'ArrowRight',
      callback: onNext,
      description: '→ Siguiente pregunta'
    })
  }

  if (onPrevious) {
    shortcuts.push({
      key: 'ArrowLeft',
      callback: onPrevious,
      description: '← Pregunta anterior'
    })
  }

  if (onSubmit) {
    shortcuts.push({
      key: 'Enter',
      callback: onSubmit,
      description: 'Enter: Enviar respuesta'
    })
  }

  return useKeyboardShortcuts(shortcuts, enabled)
}

/**
 * Componente para mostrar atajos de teclado disponibles
 */
export interface ShortcutsHelpProps {
  shortcuts: Array<{
    key: string
    ctrlKey?: boolean
    altKey?: boolean
    shiftKey?: boolean
    metaKey?: boolean
    description: string
  }>
  className?: string
}

export function formatShortcutKey(shortcut: {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
}): string {
  const parts: string[] = []

  if (shortcut.metaKey) parts.push('⌘')
  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('⇧')

  // Formatear la tecla principal
  let mainKey = shortcut.key
  switch (shortcut.key.toLowerCase()) {
    case ' ':
      mainKey = 'Espacio'
      break
    case 'arrowleft':
      mainKey = '←'
      break
    case 'arrowright':
      mainKey = '→'
      break
    case 'arrowup':
      mainKey = '↑'
      break
    case 'arrowdown':
      mainKey = '↓'
      break
    case 'escape':
      mainKey = 'Esc'
      break
    case 'enter':
      mainKey = 'Enter'
      break
    default:
      mainKey = shortcut.key.toUpperCase()
  }

  parts.push(mainKey)
  return parts.join(' + ')
}