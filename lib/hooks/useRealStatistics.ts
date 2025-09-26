import { useState, useEffect } from 'react'
import { getQuestionStatistics } from '@/lib/supabase-client'

export interface RealStatistics {
  totalQuestions: number
  questionsByTitle: Record<string, number>
  questionsByArticle: Record<string, number>
}

export function useRealStatistics() {
  const [statistics, setStatistics] = useState<RealStatistics>({
    totalQuestions: 0,
    questionsByTitle: {},
    questionsByArticle: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatistics() {
      try {
        setLoading(true)
        setError(null)

        const stats = await getQuestionStatistics()
        setStatistics(stats)
      } catch (err) {
        console.error('Error fetching real statistics:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  return { statistics, loading, error }
}

// Helper function to generate title statistics with real data
export function generateRealTitleStats(questionsByTitle: Record<string, number>) {
  const titleNames: Record<string, string> = {
    'preliminar': 'Título Preliminar',
    'titulo1': 'Título I - Derechos y Deberes Fundamentales',
    'titulo2': 'Título II - La Corona',
    'titulo3': 'Título III - Las Cortes Generales',
    'titulo4': 'Título IV - El Gobierno y la Administración',
    'titulo5': 'Título V - Relaciones entre el Gobierno y las Cortes',
    'titulo6': 'Título VI - Del Poder Judicial',
    'titulo7': 'Título VII - Economía y Hacienda',
    'titulo8': 'Título VIII - Organización Territorial del Estado',
    'titulo9': 'Título IX - Tribunal Constitucional',
    'titulo10': 'Título X - Reforma Constitucional',
    'titulo11': 'Título XI - Disposiciones adicionales',
    'disposiciones': 'Disposiciones'
  }

  return Object.entries(questionsByTitle)
    .filter(([titleId]) => titleNames[titleId]) // Only include known titles
    .map(([titleId, questionCount]) => ({
      id: titleId,
      name: titleNames[titleId],
      questionCount,
      // Mock progress data - in a real app, this would come from user progress
      totalQuestions: questionCount,
      correctAnswers: Math.floor(questionCount * 0.7), // 70% mock success rate
      averageAccuracy: 70 + Math.random() * 25, // 70-95% mock accuracy
      timeStudied: Math.floor(questionCount * 2.5), // ~2.5 minutes per question
      lastStudied: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last week
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Helper function to generate article statistics with real data
export function generateRealArticleStats(questionsByArticle: Record<string, number>) {
  return Object.entries(questionsByArticle)
    .map(([articleId, questionCount]) => ({
      id: `article-${articleId}`,
      number: articleId,
      questionCount,
      // Mock progress data
      completed: Math.random() > 0.3, // 70% completion rate
      accuracy: 60 + Math.random() * 35, // 60-95% accuracy
      timeSpent: Math.floor(questionCount * 1.5), // ~1.5 minutes per question
      lastAttempt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last month
    }))
    .sort((a, b) => {
      // Sort numerically by article number
      const aNum = parseFloat(a.number) || 0
      const bNum = parseFloat(b.number) || 0
      return aNum - bNum
    })
}