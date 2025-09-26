import { constitutionData } from "./constitution-data"
import { generateTitleExam as supabaseGenerateTitleExam, generateGeneralExam as supabaseGenerateGeneralExam, type ExamQuestion as SupabaseExamQuestion } from "./supabase-client"

export interface ExamQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  articleNumber?: number
  titleId?: string
  userAnswer?: number
  isCorrect?: boolean
}

export interface ExamResult {
  id: string
  type: "title" | "general"
  titleId?: string
  questions: ExamQuestion[]
  score: number
  totalQuestions: number
  percentage: number
  completedAt: Date
  timeSpent: number // in seconds
}

// Función para convertir SupabaseExamQuestion a ExamQuestion
function convertSupabaseToExamQuestion(supabaseQuestion: SupabaseExamQuestion): ExamQuestion {
  return {
    id: supabaseQuestion.id,
    question: supabaseQuestion.question_text,
    options: [
      supabaseQuestion.option_a,
      supabaseQuestion.option_b,
      supabaseQuestion.option_c,
      supabaseQuestion.option_d
    ],
    correctAnswer: supabaseQuestion.correct_answer,
    articleNumber: supabaseQuestion.articleNumber,
    titleId: supabaseQuestion.titleId
  }
}

export async function generateTitleExam(titleId: string, questionCount = 10): Promise<ExamQuestion[]> {
  try {
    const supabaseQuestions = await supabaseGenerateTitleExam(titleId, questionCount)
    return supabaseQuestions.map(convertSupabaseToExamQuestion)
  } catch (error) {
    console.error('Error generating title exam:', error)
    return []
  }
}

export async function generateGeneralExam(questionCount = 20): Promise<ExamQuestion[]> {
  try {
    const supabaseQuestions = await supabaseGenerateGeneralExam(questionCount)
    return supabaseQuestions.map(convertSupabaseToExamQuestion)
  } catch (error) {
    console.error('Error generating general exam:', error)
    return []
  }
}

// Nueva función: Calcula puntuación basada en respuestas del usuario
export function calculateScore(questions: ExamQuestion[]): {
  score: number
  percentage: number
  correctAnswers: ExamQuestion[]
  incorrectAnswers: ExamQuestion[]
  questionsWithResults: ExamQuestion[]
} {
  // Marcar cada pregunta como correcta/incorrecta basado en userAnswer
  const questionsWithResults = questions.map(question => {
    const isCorrect = question.userAnswer === question.correctAnswer
    return {
      ...question,
      isCorrect
    }
  })

  const correctAnswers = questionsWithResults.filter((q) => q.isCorrect)
  const incorrectAnswers = questionsWithResults.filter((q) => !q.isCorrect)
  const score = correctAnswers.length
  const percentage = Math.round((score / questions.length) * 100)

  return {
    score,
    percentage,
    correctAnswers,
    incorrectAnswers,
    questionsWithResults
  }
}

// Función legacy: mantener para compatibilidad (usa preguntas ya marcadas como correctas/incorrectas)
export function calculateExamResult(questions: ExamQuestion[]): {
  score: number
  percentage: number
  correctAnswers: ExamQuestion[]
  incorrectAnswers: ExamQuestion[]
} {
  const correctAnswers = questions.filter((q) => q.isCorrect)
  const incorrectAnswers = questions.filter((q) => !q.isCorrect)
  const score = correctAnswers.length
  const percentage = Math.round((score / questions.length) * 100)

  return {
    score,
    percentage,
    correctAnswers,
    incorrectAnswers,
  }
}

export function getMotivationalMessage(percentage: number): string {
  if (percentage >= 90) return "¡Excelente! Dominas la Constitución como un verdadero experto."
  if (percentage >= 80) return "¡Muy bien! Tienes un conocimiento sólido de la Constitución."
  if (percentage >= 70) return "¡Buen trabajo! Vas por el buen camino, sigue practicando."
  if (percentage >= 60) return "¡Bien! Con un poco más de estudio alcanzarás la excelencia."
  if (percentage >= 50) return "¡Sigue así! Cada pregunta te acerca más al dominio completo."
  return "¡No te desanimes! La constancia es la clave del éxito. ¡Sigue practicando!"
}

// 💾 EXAM RESULTS PERSISTENCE FUNCTIONS

const EXAM_RESULTS_KEY = 'constimaster-exam-results'

export function saveExamResult(examResult: Omit<ExamResult, 'id'>): ExamResult {
  try {
    // Generate unique ID
    const id = `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create complete exam result
    const completeResult: ExamResult = {
      ...examResult,
      id,
      completedAt: new Date()
    }

    // Get existing results
    const existingResults = getExamResults()

    // Add new result
    const updatedResults = [completeResult, ...existingResults]

    // Keep only last 50 results to avoid localStorage bloat
    const limitedResults = updatedResults.slice(0, 50)

    // Save to localStorage
    localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(limitedResults))

    console.log(`✅ Exam result saved with ID: ${id}`)
    return completeResult

  } catch (error) {
    console.error('❌ Error saving exam result:', error)
    throw error
  }
}

export function getExamResults(): ExamResult[] {
  try {
    const stored = localStorage.getItem(EXAM_RESULTS_KEY)
    if (!stored) return []

    const results = JSON.parse(stored) as ExamResult[]

    // Convert date strings back to Date objects
    return results.map(result => ({
      ...result,
      completedAt: new Date(result.completedAt)
    }))

  } catch (error) {
    console.error('❌ Error loading exam results:', error)
    return []
  }
}

export function getExamResultById(id: string): ExamResult | null {
  try {
    const results = getExamResults()
    return results.find(result => result.id === id) || null
  } catch (error) {
    console.error('❌ Error finding exam result:', error)
    return null
  }
}

export function deleteExamResult(id: string): boolean {
  try {
    const results = getExamResults()
    const filteredResults = results.filter(result => result.id !== id)

    localStorage.setItem(EXAM_RESULTS_KEY, JSON.stringify(filteredResults))
    console.log(`🗑️ Exam result deleted: ${id}`)
    return true

  } catch (error) {
    console.error('❌ Error deleting exam result:', error)
    return false
  }
}

export function getExamStatistics(): {
  totalExams: number
  averageScore: number
  averagePercentage: number
  bestScore: number
  recentExams: ExamResult[]
  examsByType: { general: number; title: number }
} {
  try {
    const results = getExamResults()

    if (results.length === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        averagePercentage: 0,
        bestScore: 0,
        recentExams: [],
        examsByType: { general: 0, title: 0 }
      }
    }

    const totalExams = results.length
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalExams
    const averagePercentage = results.reduce((sum, r) => sum + r.percentage, 0) / totalExams
    const bestScore = Math.max(...results.map(r => r.percentage))
    const recentExams = results.slice(0, 5) // Last 5 exams

    const examsByType = results.reduce(
      (acc, result) => {
        acc[result.type]++
        return acc
      },
      { general: 0, title: 0 }
    )

    return {
      totalExams,
      averageScore: Math.round(averageScore * 10) / 10,
      averagePercentage: Math.round(averagePercentage * 10) / 10,
      bestScore,
      recentExams,
      examsByType
    }

  } catch (error) {
    console.error('❌ Error calculating exam statistics:', error)
    return {
      totalExams: 0,
      averageScore: 0,
      averagePercentage: 0,
      bestScore: 0,
      recentExams: [],
      examsByType: { general: 0, title: 0 }
    }
  }
}

export function clearAllExamResults(): boolean {
  try {
    localStorage.removeItem(EXAM_RESULTS_KEY)
    console.log('🧹 All exam results cleared')
    return true
  } catch (error) {
    console.error('❌ Error clearing exam results:', error)
    return false
  }
}

