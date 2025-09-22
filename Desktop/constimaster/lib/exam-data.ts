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
