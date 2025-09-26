// Lista de títulos que tienen preguntas disponibles en Supabase
// Los datos usan directamente titulo1, titulo2, etc., tanto en constitution-data como en Supabase
export const AVAILABLE_TITLES = [
  'titulo1',    // 164 preguntas
  'titulo2',    // 220 preguntas
  'titulo3',    // 234 preguntas
  'titulo4',    // 35 preguntas
  'titulo5',    // 36 preguntas
  'titulo6',    // 141 preguntas
  'titulo7',    // 33 preguntas
  'titulo8',    // 107 preguntas
] as const

export type AvailableTitle = typeof AVAILABLE_TITLES[number]

// Función para verificar si un título tiene preguntas disponibles
export function isTitleAvailable(titleId: string): boolean {
  return AVAILABLE_TITLES.includes(titleId as AvailableTitle)
}

// No necesitamos mapeo ya que tanto frontend como Supabase usan el mismo formato
export function frontendToSupabaseTitle(titleId: string): string {
  return titleId // Sin conversión necesaria
}

export function supabaseToFrontendTitle(titleId: string): string {
  return titleId // Sin conversión necesaria
}