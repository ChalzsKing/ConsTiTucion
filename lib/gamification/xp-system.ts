/**
 * ⭐ Sistema de XP y Niveles - ConstiMaster
 *
 * Calcula experiencia, niveles y progresión del usuario
 */

// ====================================
// CONFIGURACIÓN DE XP
// ====================================

export const XP_REWARDS = {
  // Estudio
  COMPLETE_ARTICLE: 10,
  COMPLETE_TITLE: 100,
  STUDY_SESSION_30MIN: 5,
  STUDY_SESSION_1HOUR: 15,
  STUDY_SESSION_2HOURS: 50,

  // Exámenes
  EXAM_PASS_50: 20,
  EXAM_PASS_70: 50,
  EXAM_PASS_90: 100,
  EXAM_PERFECT: 200,
  EXAM_COMPLETE: 10,

  // Rachas
  DAILY_STREAK: 5,
  WEEKLY_STREAK: 35,
  MONTHLY_STREAK: 150,

  // Logros
  UNLOCK_BADGE_COMMON: 50,
  UNLOCK_BADGE_RARE: 100,
  UNLOCK_BADGE_EPIC: 250,
  UNLOCK_BADGE_LEGENDARY: 500,

  // Otros
  FIRST_TIME_BONUS: 25,
  REFERRAL_BONUS: 100,
} as const

// ====================================
// SISTEMA DE NIVELES
// ====================================

export interface Level {
  level: number
  xpRequired: number
  title: string
  icon: string
  color: string
}

/**
 * Calcular XP requerido para un nivel específico
 * Fórmula: XP = 100 * (1.5 ^ (level - 1))
 */
export function getXPForLevel(level: number): number {
  if (level === 1) return 0
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

/**
 * Calcular XP total acumulado hasta un nivel
 */
export function getTotalXPForLevel(level: number): number {
  let total = 0
  for (let i = 1; i <= level; i++) {
    total += getXPForLevel(i)
  }
  return total
}

/**
 * Obtener nivel basado en XP total
 */
export function getLevelFromXP(totalXP: number): {
  currentLevel: number
  currentLevelXP: number
  nextLevelXP: number
  progressPercentage: number
  xpToNextLevel: number
} {
  let level = 1
  let xpAccumulated = 0

  // Encontrar el nivel actual
  while (xpAccumulated + getXPForLevel(level + 1) <= totalXP) {
    xpAccumulated += getXPForLevel(level + 1)
    level++
  }

  const currentLevelXP = totalXP - xpAccumulated
  const nextLevelXP = getXPForLevel(level + 1)
  const progressPercentage = Math.floor((currentLevelXP / nextLevelXP) * 100)
  const xpToNextLevel = nextLevelXP - currentLevelXP

  return {
    currentLevel: level,
    currentLevelXP,
    nextLevelXP,
    progressPercentage,
    xpToNextLevel
  }
}

/**
 * Definición de niveles con títulos y estilos
 */
export const LEVEL_TITLES: Record<number, { title: string; icon: string; color: string }> = {
  1: { title: 'Novato', icon: '🌱', color: 'text-gray-500' },
  2: { title: 'Aprendiz', icon: '📖', color: 'text-blue-500' },
  3: { title: 'Estudiante', icon: '🎓', color: 'text-blue-600' },
  5: { title: 'Aplicado', icon: '📚', color: 'text-green-500' },
  10: { title: 'Conocedor', icon: '🧠', color: 'text-green-600' },
  15: { title: 'Experto', icon: '💡', color: 'text-purple-500' },
  20: { title: 'Maestro', icon: '👨‍🏫', color: 'text-purple-600' },
  30: { title: 'Gran Maestro', icon: '🎖️', color: 'text-orange-500' },
  40: { title: 'Sabio', icon: '🧙', color: 'text-red-500' },
  50: { title: 'Leyenda', icon: '👑', color: 'text-yellow-500' },
  75: { title: 'Inmortal', icon: '💎', color: 'text-cyan-500' },
  100: { title: 'Dios Constitucional', icon: '⚡', color: 'text-amber-500' }
}

/**
 * Obtener título para un nivel
 */
export function getLevelTitle(level: number): { title: string; icon: string; color: string } {
  // Buscar el título más cercano al nivel actual
  const levels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a)

  const closestLevel = levels.find(l => level >= l) || 1

  return LEVEL_TITLES[closestLevel]
}

/**
 * Calcular todas las milestones de nivel (niveles con título especial)
 */
export function getLevelMilestones(): number[] {
  return Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => a - b)
}

/**
 * Verificar si un nivel es milestone (tiene título especial)
 */
export function isLevelMilestone(level: number): boolean {
  return level in LEVEL_TITLES
}

// ====================================
// UTILIDADES DE XP
// ====================================

/**
 * Formatear XP con separadores de miles
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString('es-ES')
}

/**
 * Calcular XP ganado por completar artículo
 */
export function calculateArticleXP(studyTimeSeconds: number): number {
  let xp = XP_REWARDS.COMPLETE_ARTICLE

  // Bonus por tiempo de estudio
  const studyTimeMinutes = studyTimeSeconds / 60
  if (studyTimeMinutes >= 5) xp += 5
  if (studyTimeMinutes >= 10) xp += 10

  return xp
}

/**
 * Calcular XP ganado por examen
 */
export function calculateExamXP(scorePercentage: number): number {
  if (scorePercentage === 100) {
    return XP_REWARDS.EXAM_PERFECT
  } else if (scorePercentage >= 90) {
    return XP_REWARDS.EXAM_PASS_90
  } else if (scorePercentage >= 70) {
    return XP_REWARDS.EXAM_PASS_70
  } else if (scorePercentage >= 50) {
    return XP_REWARDS.EXAM_PASS_50
  }
  return XP_REWARDS.EXAM_COMPLETE
}

/**
 * Calcular XP por racha
 */
export function calculateStreakXP(streakDays: number): number {
  if (streakDays >= 30) {
    return XP_REWARDS.MONTHLY_STREAK
  } else if (streakDays >= 7) {
    return XP_REWARDS.WEEKLY_STREAK
  } else if (streakDays >= 1) {
    return XP_REWARDS.DAILY_STREAK
  }
  return 0
}

/**
 * Calcular XP total posible en la aplicación
 */
export function calculateMaxPossibleXP(): {
  articles: number
  titles: number
  exams: number
  badges: number
  total: number
} {
  const articles = 169 * XP_REWARDS.COMPLETE_ARTICLE // 169 artículos
  const titles = 10 * XP_REWARDS.COMPLETE_TITLE // 10 títulos
  const exams = 1000 * XP_REWARDS.EXAM_PERFECT // Estimación exámenes
  const badges = 50 * XP_REWARDS.UNLOCK_BADGE_LEGENDARY // Estimación badges

  return {
    articles,
    titles,
    exams,
    badges,
    total: articles + titles + exams + badges
  }
}

// ====================================
// RANKING Y COMPARACIÓN
// ====================================

/**
 * Calcular percentil del usuario
 */
export function calculatePercentile(userXP: number, allUsersXP: number[]): number {
  if (allUsersXP.length === 0) return 100

  const usersBelow = allUsersXP.filter(xp => xp < userXP).length
  return Math.round((usersBelow / allUsersXP.length) * 100)
}

/**
 * Obtener rango del usuario en leaderboard
 */
export function getUserRank(userXP: number, allUsersXP: number[]): number {
  const sortedXP = [...allUsersXP].sort((a, b) => b - a)
  const rank = sortedXP.findIndex(xp => xp === userXP)
  return rank === -1 ? allUsersXP.length : rank + 1
}

// ====================================
// ESTIMACIONES Y PROYECCIONES
// ====================================

/**
 * Estimar tiempo para llegar al siguiente nivel
 */
export function estimateTimeToNextLevel(
  currentXP: number,
  dailyXPAverage: number
): {
  days: number
  description: string
} {
  const { xpToNextLevel } = getLevelFromXP(currentXP)

  if (dailyXPAverage === 0) {
    return { days: Infinity, description: 'Empieza a estudiar para progresar' }
  }

  const daysNeeded = Math.ceil(xpToNextLevel / dailyXPAverage)

  let description = ''
  if (daysNeeded === 1) {
    description = '¡Mañana subirás de nivel!'
  } else if (daysNeeded <= 7) {
    description = `En ${daysNeeded} días subirás de nivel`
  } else if (daysNeeded <= 30) {
    description = `En ${Math.ceil(daysNeeded / 7)} semanas subirás de nivel`
  } else {
    description = `En ${Math.ceil(daysNeeded / 30)} meses subirás de nivel`
  }

  return { days: daysNeeded, description }
}

/**
 * Calcular XP promedio diario
 */
export function calculateDailyXPAverage(
  totalXP: number,
  daysSinceStart: number
): number {
  if (daysSinceStart === 0) return 0
  return Math.floor(totalXP / daysSinceStart)
}
