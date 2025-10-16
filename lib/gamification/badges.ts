/**
 * 🏆 Sistema de Badges y Logros - ConstiMaster
 *
 * Define todos los logros desbloqueables de la aplicación
 */

export type BadgeCategory = 'study' | 'titles' | 'exams' | 'streaks' | 'special'

export type BadgeCriteriaType =
  | 'articles_completed'
  | 'title_completed'
  | 'exam_score'
  | 'exam_count'
  | 'streak_days'
  | 'study_time_hours'
  | 'perfect_exam'
  | 'time_of_day'

export interface BadgeCriteria {
  type: BadgeCriteriaType
  value?: number
  titleId?: string
  minScore?: number
  timeRange?: { start: number; end: number } // Para logros por hora del día
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string // Emoji o nombre de icono
  category: BadgeCategory
  criteria: BadgeCriteria
  xpReward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// ====================================
// 🎓 LOGROS DE ESTUDIO
// ====================================

const studyBadges: Badge[] = [
  {
    id: 'first-step',
    name: 'Primer Paso',
    description: 'Completa tu primer artículo',
    icon: '🎯',
    category: 'study',
    criteria: { type: 'articles_completed', value: 1 },
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'dedicated-student',
    name: 'Estudiante Dedicado',
    description: 'Completa 10 artículos',
    icon: '📚',
    category: 'study',
    criteria: { type: 'articles_completed', value: 10 },
    xpReward: 100,
    rarity: 'common'
  },
  {
    id: 'advanced-learner',
    name: 'Conocedor Avanzado',
    description: 'Completa 50 artículos',
    icon: '🎓',
    category: 'study',
    criteria: { type: 'articles_completed', value: 50 },
    xpReward: 250,
    rarity: 'rare'
  },
  {
    id: 'constitutional-master',
    name: 'Maestro Constitucional',
    description: 'Completa todos los 169 artículos',
    icon: '👑',
    category: 'study',
    criteria: { type: 'articles_completed', value: 169 },
    xpReward: 1000,
    rarity: 'legendary'
  },
  {
    id: 'early-bird',
    name: 'Madrugador',
    description: 'Estudia antes de las 8:00 AM',
    icon: '🌅',
    category: 'study',
    criteria: {
      type: 'time_of_day',
      timeRange: { start: 0, end: 8 }
    },
    xpReward: 75,
    rarity: 'rare'
  },
  {
    id: 'night-owl',
    name: 'Búho Nocturno',
    description: 'Estudia después de las 11:00 PM',
    icon: '🦉',
    category: 'study',
    criteria: {
      type: 'time_of_day',
      timeRange: { start: 23, end: 24 }
    },
    xpReward: 75,
    rarity: 'rare'
  },
  {
    id: 'marathon-session',
    name: 'Maratón de Estudio',
    description: 'Estudia durante 2 horas seguidas',
    icon: '⏱️',
    category: 'study',
    criteria: { type: 'study_time_hours', value: 2 },
    xpReward: 150,
    rarity: 'epic'
  }
]

// ====================================
// 📚 LOGROS POR TÍTULOS
// ====================================

const titleBadges: Badge[] = [
  {
    id: 'preliminar-complete',
    name: 'Preliminar Completo',
    description: 'Completa el Título Preliminar',
    icon: '📖',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'preliminar' },
    xpReward: 100,
    rarity: 'common'
  },
  {
    id: 'rights-defender',
    name: 'Defensor de Derechos',
    description: 'Completa el Título I - Derechos Fundamentales',
    icon: '⚖️',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'titulo1' },
    xpReward: 200,
    rarity: 'rare'
  },
  {
    id: 'royalist',
    name: 'Realista',
    description: 'Completa el Título II - La Corona',
    icon: '👑',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'titulo2' },
    xpReward: 150,
    rarity: 'common'
  },
  {
    id: 'legislator',
    name: 'Legislador',
    description: 'Completa el Título III - Cortes Generales',
    icon: '🏛️',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'titulo3' },
    xpReward: 200,
    rarity: 'rare'
  },
  {
    id: 'governor',
    name: 'Gobernante',
    description: 'Completa el Título IV - Del Gobierno',
    icon: '🏢',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'titulo4' },
    xpReward: 150,
    rarity: 'common'
  },
  {
    id: 'controller',
    name: 'Controlador',
    description: 'Completa el Título V - Relaciones Gobierno-Cortes',
    icon: '🔗',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'titulo5' },
    xpReward: 150,
    rarity: 'common'
  },
  {
    id: 'judge',
    name: 'Juez',
    description: 'Completa el Título VI - Poder Judicial',
    icon: '⚖️',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'titulo6' },
    xpReward: 150,
    rarity: 'common'
  },
  {
    id: 'economist',
    name: 'Economista',
    description: 'Completa el Título VII - Economía y Hacienda',
    icon: '💰',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'titulo7' },
    xpReward: 150,
    rarity: 'common'
  },
  {
    id: 'autonomist',
    name: 'Autonomista',
    description: 'Completa el Título VIII - Organización Territorial',
    icon: '🗺️',
    category: 'titles',
    criteria: { type: 'title_completed', titleId: 'titulo8' },
    xpReward: 200,
    rarity: 'rare'
  }
]

// ====================================
// ✅ LOGROS DE EXÁMENES
// ====================================

const examBadges: Badge[] = [
  {
    id: 'first-exam',
    name: 'Primer Examen',
    description: 'Completa tu primer examen',
    icon: '📝',
    category: 'exams',
    criteria: { type: 'exam_count', value: 1 },
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'passed',
    name: 'Aprobado',
    description: 'Consigue 50% o más en un examen',
    icon: '✅',
    category: 'exams',
    criteria: { type: 'exam_score', minScore: 50 },
    xpReward: 75,
    rarity: 'common'
  },
  {
    id: 'notable',
    name: 'Notable',
    description: 'Consigue 70% o más en un examen',
    icon: '🌟',
    category: 'exams',
    criteria: { type: 'exam_score', minScore: 70 },
    xpReward: 100,
    rarity: 'rare'
  },
  {
    id: 'excellent',
    name: 'Sobresaliente',
    description: 'Consigue 90% o más en un examen',
    icon: '⭐',
    category: 'exams',
    criteria: { type: 'exam_score', minScore: 90 },
    xpReward: 200,
    rarity: 'epic'
  },
  {
    id: 'perfect-score',
    name: 'Matrícula de Honor',
    description: 'Consigue 100% en un examen',
    icon: '💯',
    category: 'exams',
    criteria: { type: 'perfect_exam' },
    xpReward: 500,
    rarity: 'legendary'
  },
  {
    id: 'perseverant',
    name: 'Perseverante',
    description: 'Completa 10 exámenes',
    icon: '💪',
    category: 'exams',
    criteria: { type: 'exam_count', value: 10 },
    xpReward: 150,
    rarity: 'rare'
  },
  {
    id: 'exam-expert',
    name: 'Experto Examinado',
    description: 'Completa 50 exámenes',
    icon: '🎯',
    category: 'exams',
    criteria: { type: 'exam_count', value: 50 },
    xpReward: 400,
    rarity: 'epic'
  }
]

// ====================================
// 🔥 LOGROS DE RACHAS
// ====================================

const streakBadges: Badge[] = [
  {
    id: 'streak-3',
    name: 'Racha de 3',
    description: 'Estudia 3 días consecutivos',
    icon: '🔥',
    category: 'streaks',
    criteria: { type: 'streak_days', value: 3 },
    xpReward: 75,
    rarity: 'common'
  },
  {
    id: 'streak-7',
    name: 'Semana Completa',
    description: 'Estudia 7 días consecutivos',
    icon: '🔥🔥',
    category: 'streaks',
    criteria: { type: 'streak_days', value: 7 },
    xpReward: 150,
    rarity: 'rare'
  },
  {
    id: 'streak-30',
    name: 'Mes Completo',
    description: 'Estudia 30 días consecutivos',
    icon: '🔥🔥🔥',
    category: 'streaks',
    criteria: { type: 'streak_days', value: 30 },
    xpReward: 500,
    rarity: 'legendary'
  },
  {
    id: 'streak-100',
    name: 'Centenario',
    description: 'Estudia 100 días consecutivos',
    icon: '💎',
    category: 'streaks',
    criteria: { type: 'streak_days', value: 100 },
    xpReward: 2000,
    rarity: 'legendary'
  }
]

// ====================================
// 🌟 LOGROS ESPECIALES
// ====================================

const specialBadges: Badge[] = [
  {
    id: 'weekend-warrior',
    name: 'Guerrero del Fin de Semana',
    description: 'Estudia en sábado o domingo',
    icon: '🎮',
    category: 'special',
    criteria: { type: 'time_of_day' }, // Lógica especial en hook
    xpReward: 50,
    rarity: 'common'
  }
]

// ====================================
// EXPORTAR TODOS LOS BADGES
// ====================================

export const allBadges: Badge[] = [
  ...studyBadges,
  ...titleBadges,
  ...examBadges,
  ...streakBadges,
  ...specialBadges
]

export const badgesByCategory = {
  study: studyBadges,
  titles: titleBadges,
  exams: examBadges,
  streaks: streakBadges,
  special: specialBadges
}

/**
 * Obtener badge por ID
 */
export function getBadgeById(id: string): Badge | undefined {
  return allBadges.find(badge => badge.id === id)
}

/**
 * Obtener badges por categoría
 */
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return badgesByCategory[category] || []
}

/**
 * Obtener color por rareza
 */
export function getRarityColor(rarity: Badge['rarity']): string {
  const colors = {
    common: 'text-gray-500',
    rare: 'text-blue-500',
    epic: 'text-purple-500',
    legendary: 'text-yellow-500'
  }
  return colors[rarity]
}

/**
 * Obtener color de fondo por rareza
 */
export function getRarityBgColor(rarity: Badge['rarity']): string {
  const colors = {
    common: 'bg-gray-100 dark:bg-gray-800',
    rare: 'bg-blue-100 dark:bg-blue-900',
    epic: 'bg-purple-100 dark:bg-purple-900',
    legendary: 'bg-yellow-100 dark:bg-yellow-900'
  }
  return colors[rarity]
}

/**
 * Total de badges disponibles
 */
export const TOTAL_BADGES = allBadges.length

/**
 * Total de XP disponible
 */
export const TOTAL_XP_AVAILABLE = allBadges.reduce((sum, badge) => sum + badge.xpReward, 0)
