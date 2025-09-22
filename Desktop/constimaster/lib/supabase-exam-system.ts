import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface SupabaseQuestion {
  id: number
  original_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: number
  created_at: string
}

export interface QuestionWithMapping extends SupabaseQuestion {
  question_articles: {
    title_id: string
    article_number: number
  }[]
}

export interface ExamQuestion extends SupabaseQuestion {
  userAnswer?: number
  isCorrect?: boolean
  titleId?: string
  articleNumber?: number
}

export interface ExamResult {
  id: string
  type: 'title' | 'article' | 'general'
  titleId?: string
  articleNumber?: number
  questions: ExamQuestion[]
  score: number
  totalQuestions: number
  percentage: number
  completedAt: Date
  timeSpent: number // in seconds
}

// Generate exam by specific article
export async function generateArticleExam(articleNumber: number, questionCount = 10): Promise<ExamQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_articles!inner(title_id, article_number)
      `)
      .eq('question_articles.article_number', articleNumber)
      .limit(questionCount * 2) // Get more to randomize

    if (error) throw error

    // Randomize and limit
    const shuffled = data?.sort(() => Math.random() - 0.5) || []
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    return selected.map(question => ({
      ...question,
      articleNumber,
      titleId: question.question_articles[0]?.title_id
    }))

  } catch (error) {
    console.error('Error generating article exam:', error)
    return []
  }
}

// Generate exam by constitutional title
export async function generateTitleExam(titleId: string, questionCount = 20): Promise<ExamQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_articles!inner(title_id, article_number)
      `)
      .eq('question_articles.title_id', titleId)
      .limit(questionCount * 2) // Get more to randomize

    if (error) throw error

    // Randomize and limit
    const shuffled = data?.sort(() => Math.random() - 0.5) || []
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    return selected.map(question => ({
      ...question,
      titleId,
      articleNumber: question.question_articles[0]?.article_number
    }))

  } catch (error) {
    console.error('Error generating title exam:', error)
    return []
  }
}

// Generate general mixed exam
export async function generateGeneralExam(questionCount = 25): Promise<ExamQuestion[]> {
  try {
    // Get random questions from different titles
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_articles(title_id, article_number)
      `)
      .limit(questionCount * 3) // Get more for better randomization

    if (error) throw error

    // Randomize and limit
    const shuffled = data?.sort(() => Math.random() - 0.5) || []
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    return selected.map(question => ({
      ...question,
      titleId: question.question_articles?.[0]?.title_id,
      articleNumber: question.question_articles?.[0]?.article_number
    }))

  } catch (error) {
    console.error('Error generating general exam:', error)
    return []
  }
}

// Generate exam by multiple articles
export async function generateMultiArticleExam(articleNumbers: number[], questionsPerArticle = 3): Promise<ExamQuestion[]> {
  try {
    const allQuestions: ExamQuestion[] = []

    for (const articleNumber of articleNumbers) {
      const questions = await generateArticleExam(articleNumber, questionsPerArticle)
      allQuestions.push(...questions)
    }

    // Shuffle the combined questions
    return allQuestions.sort(() => Math.random() - 0.5)

  } catch (error) {
    console.error('Error generating multi-article exam:', error)
    return []
  }
}

// Get questions for specific constitutional sections
export async function getQuestionsBySection(section: 'derechos' | 'corona' | 'cortes' | 'gobierno'): Promise<ExamQuestion[]> {
  const titleMapping = {
    derechos: 'titulo1',
    corona: 'titulo2',
    cortes: 'titulo3',
    gobierno: 'titulo4'
  }

  return generateTitleExam(titleMapping[section], 15)
}

// Calculate exam results
export function calculateExamResult(questions: ExamQuestion[]): {
  score: number
  percentage: number
  correctAnswers: ExamQuestion[]
  incorrectAnswers: ExamQuestion[]
  byTitle: Record<string, { correct: number; total: number; percentage: number }>
} {
  const correctAnswers = questions.filter(q => q.isCorrect)
  const incorrectAnswers = questions.filter(q => !q.isCorrect)
  const score = correctAnswers.length
  const percentage = Math.round((score / questions.length) * 100)

  // Calculate results by title
  const byTitle: Record<string, { correct: number; total: number; percentage: number }> = {}

  questions.forEach(question => {
    const titleId = question.titleId || 'unknown'
    if (!byTitle[titleId]) {
      byTitle[titleId] = { correct: 0, total: 0, percentage: 0 }
    }

    byTitle[titleId].total++
    if (question.isCorrect) {
      byTitle[titleId].correct++
    }
  })

  // Calculate percentages
  Object.keys(byTitle).forEach(titleId => {
    const stats = byTitle[titleId]
    stats.percentage = Math.round((stats.correct / stats.total) * 100)
  })

  return {
    score,
    percentage,
    correctAnswers,
    incorrectAnswers,
    byTitle
  }
}

// Get motivational message based on performance
export function getMotivationalMessage(percentage: number): string {
  if (percentage >= 95) return "¡Perfecto! Dominas la Constitución como un verdadero experto constitucional."
  if (percentage >= 90) return "¡Excelente! Tu conocimiento constitucional es sobresaliente."
  if (percentage >= 80) return "¡Muy bien! Tienes un conocimiento sólido de la Constitución."
  if (percentage >= 70) return "¡Buen trabajo! Vas por el buen camino, sigue practicando."
  if (percentage >= 60) return "¡Bien! Con un poco más de estudio alcanzarás la excelencia."
  if (percentage >= 50) return "¡Sigue así! Cada pregunta te acerca más al dominio completo."
  return "¡No te desanimes! La constancia es la clave del éxito. ¡Sigue practicando!"
}

// Search questions by text
export async function searchQuestions(searchTerm: string, limit = 20): Promise<SupabaseQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .ilike('question_text', `%${searchTerm}%`)
      .limit(limit)

    if (error) throw error
    return data || []

  } catch (error) {
    console.error('Error searching questions:', error)
    return []
  }
}

// Get question statistics
export async function getQuestionStatistics() {
  try {
    const { data: totalQuestions, error: totalError } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })

    if (totalError) throw totalError

    const { data: titleStats, error: titleError } = await supabase
      .from('question_articles')
      .select('title_id')

    if (titleError) throw titleError

    // Count by title
    const byTitle: Record<string, number> = {}
    titleStats?.forEach(item => {
      byTitle[item.title_id] = (byTitle[item.title_id] || 0) + 1
    })

    return {
      totalQuestions: totalQuestions?.length || 0,
      questionsByTitle: byTitle
    }

  } catch (error) {
    console.error('Error getting question statistics:', error)
    return {
      totalQuestions: 0,
      questionsByTitle: {}
    }
  }
}

// Export all exam generation functions
export const ExamGenerator = {
  byArticle: generateArticleExam,
  byTitle: generateTitleExam,
  general: generateGeneralExam,
  multiArticle: generateMultiArticleExam,
  bySection: getQuestionsBySection
}