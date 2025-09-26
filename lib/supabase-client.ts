import { createClient } from '@supabase/supabase-js'
import { frontendToSupabaseTitle } from './title-mapping'

// Variables de entorno para el cliente (Next.js)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Las variables de entorno de Supabase no están configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función auxiliar para convertir respuesta de letra a índice
function convertAnswerToIndex(answer: string): number {
  const answerMap: { [key: string]: number } = {
    'a': 0,
    'b': 1,
    'c': 2,
    'd': 3
  }
  return answerMap[answer?.toLowerCase()] || 0
}

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
    console.log('Fetching questions for article:', articleNumber)

    // Buscar preguntas que coincidan con el artículo:
    // - Exacto: "32" para artículo 32
    // - Con subdivisión: "32.1", "32.2" para artículo 32
    const articleStr = articleNumber.toString()

    const query = `mapped_article.eq.${articleStr},mapped_article.like.${articleStr}.%`

    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .or(query)
      .limit(questionCount * 3) // Obtener más para randomizar

    if (error) {
      console.error('Error fetching questions:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return []
    }

    // Randomizar y limitar
    const shuffled = data.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    return selected.map(question => ({
      ...question,
      articleNumber,
      titleId: question.title_id,
      original_number: question.id, // Usar el ID como número original
      correct_answer: convertAnswerToIndex(question.correct_answer)
    }))

  } catch (error) {
    console.error('Error generating article exam for article', articleNumber, ':', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return []
  }
}

// Generar examen por título constitucional
export async function generateTitleExam(titleId: string, questionCount = 10): Promise<ExamQuestion[]> {
  try {
    // Convertir el titleId del frontend al formato de Supabase
    const supabaseTitleId = frontendToSupabaseTitle(titleId)
    console.log(`Generating exam for title: ${titleId} -> ${supabaseTitleId}`)

    const { data, error } = await supabase
      .from('Questions')
      .select('*')
      .eq('title_id', supabaseTitleId)
      .limit(questionCount * 2)

    if (error) throw error

    if (!data || data.length === 0) {
      return []
    }

    const shuffled = data.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length))

    return selected.map(question => ({
      ...question,
      titleId: question.title_id,
      articleNumber: question.mapped_article ? parseInt(question.mapped_article) : undefined,
      original_number: question.id,
      correct_answer: convertAnswerToIndex(question.correct_answer)
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
      .from('Questions')
      .select('*')
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
      titleId: question.title_id,
      articleNumber: question.mapped_article ? parseInt(question.mapped_article) : undefined,
      original_number: question.id,
      correct_answer: convertAnswerToIndex(question.correct_answer)
    }))

  } catch (error) {
    console.error('Error generating general exam:', error)
    return []
  }
}

// Obtener estadísticas de preguntas
export async function getQuestionStatistics() {
  try {
    const { data, error } = await supabase
      .from('Questions')
      .select('id, title_id, mapped_article')

    if (error) throw error

    if (!data) {
      return {
        totalQuestions: 0,
        questionsByTitle: {},
        questionsByArticle: {}
      }
    }

    // Contar por título
    const byTitle: Record<string, number> = {}
    const byArticle: Record<string, number> = {}

    data.forEach(question => {
      // Contar por título
      if (question.title_id) {
        byTitle[question.title_id] = (byTitle[question.title_id] || 0) + 1
      }

      // Contar por artículo (solo si tiene mapped_article)
      if (question.mapped_article) {
        byArticle[question.mapped_article] = (byArticle[question.mapped_article] || 0) + 1
      }
    })

    return {
      totalQuestions: data.length,
      questionsByTitle: byTitle,
      questionsByArticle: byArticle
    }

  } catch (error) {
    console.error('Error getting question statistics:', error)
    return {
      totalQuestions: 0,
      questionsByTitle: {},
      questionsByArticle: {}
    }
  }
}