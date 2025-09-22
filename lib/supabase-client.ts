import { createClient } from '@supabase/supabase-js'

// Variables de entorno para el cliente (Next.js)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export interface ExamQuestion extends SupabaseQuestion {
  userAnswer?: number
  isCorrect?: boolean
  titleId?: string
  articleNumber?: number
}

// Generar examen por artículo específico
export async function generateArticleExam(articleNumber: number, questionCount = 1): Promise<ExamQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_articles!inner(title_id, article_number)
      `)
      .eq('question_articles.article_number', articleNumber)
      .limit(questionCount * 2) // Obtener más para randomizar

    if (error) {
      console.error('Error fetching questions:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`No se encontraron preguntas para el artículo ${articleNumber}`)
      return []
    }

    // Randomizar y limitar
    const shuffled = data.sort(() => Math.random() - 0.5)
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

// Generar examen por título constitucional
export async function generateTitleExam(titleId: string, questionCount = 10): Promise<ExamQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_articles!inner(title_id, article_number)
      `)
      .eq('question_articles.title_id', titleId)
      .limit(questionCount * 2)

    if (error) throw error

    if (!data || data.length === 0) {
      return []
    }

    const shuffled = data.sort(() => Math.random() - 0.5)
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

// Generar examen general con preguntas aleatorias
export async function generateGeneralExam(questionCount = 20): Promise<ExamQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        question_articles(title_id, article_number)
      `)
      .limit(questionCount * 3) // Get more than needed to ensure randomness

    if (error) throw error

    if (!data || data.length === 0) {
      return []
    }

    // Shuffle and select questions
    const shuffled = data.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    return selected.map(question => ({
      ...question,
      titleId: question.question_articles[0]?.title_id,
      articleNumber: question.question_articles[0]?.article_number
    }))

  } catch (error) {
    console.error('Error generating general exam:', error)
    return []
  }
}

// Obtener estadísticas de preguntas
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

    // Contar por título
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