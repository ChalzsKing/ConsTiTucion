// Sistema de gestión del estado de navegación del usuario
export interface NavigationState {
  lastStudiedTitleId?: string
  lastStudiedArticleId?: number
  expandedTitles: string[]
  isFirstVisit: boolean
  studyPosition?: {
    titleId: string
    articleId: number
    scrollPosition?: number
  }
}

const NAVIGATION_STORAGE_KEY = 'constitutionNavigationState'

// Estado por defecto
const defaultState: NavigationState = {
  expandedTitles: [],
  isFirstVisit: true
}

// Obtener estado actual del localStorage
export function getNavigationState(): NavigationState {
  if (typeof window === 'undefined') return defaultState

  try {
    const stored = localStorage.getItem(NAVIGATION_STORAGE_KEY)
    if (!stored) return defaultState

    const parsed = JSON.parse(stored)
    return { ...defaultState, ...parsed }
  } catch (error) {
    console.warn('Error reading navigation state:', error)
    return defaultState
  }
}

// Guardar estado en localStorage
export function saveNavigationState(state: Partial<NavigationState>) {
  if (typeof window === 'undefined') return

  try {
    const current = getNavigationState()
    const updated = { ...current, ...state }
    localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.warn('Error saving navigation state:', error)
  }
}

// Marcar que el usuario ya no es primerizo
export function markAsReturningUser() {
  saveNavigationState({ isFirstVisit: false })
}

// Guardar la última posición de estudio
export function saveLastStudyPosition(titleId: string, articleId: number) {
  saveNavigationState({
    lastStudiedTitleId: titleId,
    lastStudiedArticleId: articleId,
    studyPosition: {
      titleId,
      articleId,
      scrollPosition: window.scrollY
    }
  })
}

// Obtener títulos que deberían estar expandidos
export function getSmartExpandedTitles(): string[] {
  const state = getNavigationState()

  // Si es primera visita, solo expandir preliminar
  if (state.isFirstVisit) {
    return ['preliminar']
  }

  // Si no es primera visita, usar lógica inteligente
  const smartTitles: string[] = []

  // Siempre incluir títulos previamente expandidos por el usuario
  smartTitles.push(...state.expandedTitles)

  // Si hay una última posición de estudio, expandir ese título
  if (state.lastStudiedTitleId && !smartTitles.includes(state.lastStudiedTitleId)) {
    smartTitles.push(state.lastStudiedTitleId)
  }

  // Si no hay ningún título expandido, expandir preliminar como fallback
  if (smartTitles.length === 0) {
    smartTitles.push('preliminar')
  }

  return smartTitles
}

// Guardar títulos expandidos por el usuario
export function saveExpandedTitles(expandedTitles: string[]) {
  saveNavigationState({ expandedTitles })
}

// Obtener información de continuación de estudio
export function getContinueStudyInfo() {
  const state = getNavigationState()
  return state.studyPosition
}

// Limpiar posición de estudio (cuando el usuario cambia de sección)
export function clearStudyPosition() {
  saveNavigationState({
    studyPosition: undefined,
    lastStudiedTitleId: undefined,
    lastStudiedArticleId: undefined
  })
}

// Hook personalizado para gestión de navegación
export function useNavigationState() {
  return {
    getState: getNavigationState,
    saveState: saveNavigationState,
    markAsReturningUser,
    saveLastStudyPosition,
    getSmartExpandedTitles,
    saveExpandedTitles,
    getContinueStudyInfo,
    clearStudyPosition
  }
}