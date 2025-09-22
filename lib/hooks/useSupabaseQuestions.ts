import { useState, useEffect } from 'react'
import { generateArticleExam, type ExamQuestion } from '@/lib/supabase-client'

export interface SupabaseQuestion {
  id: number
  original_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: number
  articleNumber?: number
  titleId?: string
}

export function useSupabaseQuestions(articleNumber: number) {
  const [question, setQuestion] = useState<SupabaseQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuestion() {
      try {
        setLoading(true)
        setError(null)

        // Obtener una pregunta del artículo específico
        const questions = await generateArticleExam(articleNumber, 1)

        if (questions.length > 0) {
          const examQuestion = questions[0]

          // Convertir formato ExamQuestion a SupabaseQuestion
          const supabaseQuestion: SupabaseQuestion = {
            id: examQuestion.id,
            original_number: examQuestion.original_number,
            question_text: examQuestion.question_text,
            option_a: examQuestion.option_a,
            option_b: examQuestion.option_b,
            option_c: examQuestion.option_c,
            option_d: examQuestion.option_d,
            correct_answer: examQuestion.correct_answer,
            articleNumber: examQuestion.articleNumber,
            titleId: examQuestion.titleId
          }

          setQuestion(supabaseQuestion)
        } else {
          setQuestion(null)
        }
      } catch (err) {
        console.error('Error fetching question for article:', articleNumber, err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setQuestion(null)
      } finally {
        setLoading(false)
      }
    }

    if (articleNumber) {
      fetchQuestion()
    }
  }, [articleNumber])

  return { question, loading, error }
}

// Hook para obtener múltiples preguntas de un artículo
export function useSupabaseArticleQuestions(articleNumber: number, count: number = 5) {
  const [questions, setQuestions] = useState<SupabaseQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true)
        setError(null)

        const examQuestions = await generateArticleExam(articleNumber, count)

        const supabaseQuestions: SupabaseQuestion[] = examQuestions.map(eq => ({
          id: eq.id,
          original_number: eq.original_number,
          question_text: eq.question_text,
          option_a: eq.option_a,
          option_b: eq.option_b,
          option_c: eq.option_c,
          option_d: eq.option_d,
          correct_answer: eq.correct_answer,
          articleNumber: eq.articleNumber,
          titleId: eq.titleId
        }))

        setQuestions(supabaseQuestions)
      } catch (err) {
        console.error('Error fetching questions for article:', articleNumber, err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setQuestions([])
      } finally {
        setLoading(false)
      }
    }

    if (articleNumber) {
      fetchQuestions()
    }
  }, [articleNumber, count])

  return { questions, loading, error }
}