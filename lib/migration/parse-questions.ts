export interface ParsedQuestion {
  originalNumber: number
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: number // 0=A, 1=B, 2=C, 3=D
}

export interface ArticleMapping {
  articleId: string
  questionNumbers: number[]
}

export function parseQuestionsFromText(textContent: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []

  // Split by question numbers, but keep the delimiter
  const questionBlocks = textContent.split(/(?=\d+\.-)/g).filter(block => block.trim())

  for (const block of questionBlocks) {
    const trimmedBlock = block.trim()
    if (!trimmedBlock) continue

    // Extract question number
    const numberMatch = trimmedBlock.match(/^(\d+)\.-/)
    if (!numberMatch) continue

    const questionNumber = parseInt(numberMatch[1])

    // Extract question text (everything until first "a)")
    const questionMatch = trimmedBlock.match(/^\d+\.- (.+?)(?=\s+a\))/s)
    if (!questionMatch) continue

    const questionText = questionMatch[1].trim().replace(/:\s*$/, '') // Remove trailing colon

    // Extract options
    const optionAMatch = trimmedBlock.match(/a\)\s*(.+?)(?=\s+b\))/s)
    const optionBMatch = trimmedBlock.match(/b\)\s*(.+?)(?=\s+c\))/s)
    const optionCMatch = trimmedBlock.match(/c\)\s*(.+?)(?=\s+d\))/s)
    const optionDMatch = trimmedBlock.match(/d\)\s*(.+?)(?=\s+\d+\.-|$)/s)

    const optionA = optionAMatch?.[1]?.trim()
    const optionB = optionBMatch?.[1]?.trim()
    const optionC = optionCMatch?.[1]?.trim()
    const optionD = optionDMatch?.[1]?.trim()

    // Only add if all parts are found
    if (questionText && optionA && optionB && optionC && optionD) {
      questions.push({
        originalNumber: questionNumber,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: 0 // Will be set from answers file
      })
    }
  }

  return questions
}

export function parseAnswersFromText(textContent: string): Record<number, number> {
  const answers: Record<number, number> = {}
  const lines = textContent.split('\n')

  for (const line of lines) {
    const match = line.match(/^(\d+)\.-\s*([ABCD])/)
    if (match) {
      const questionNumber = parseInt(match[1])
      const answer = match[2]

      // Convert letter to number: A=0, B=1, C=2, D=3
      const answerIndex = answer.charCodeAt(0) - 'A'.charCodeAt(0)
      answers[questionNumber] = answerIndex
    }
  }

  return answers
}

export function parseMultipleAnswerFiles(answersText1: string, answersText2: string): Record<number, number> {
  const answers1 = parseAnswersFromText(answersText1)
  const answers2 = parseAnswersFromText(answersText2)

  // Combine both answer sets
  return { ...answers1, ...answers2 }
}

export function parseArticleMappingFromCSV(csvContent: string): ArticleMapping[] {
  const mappings: ArticleMapping[] = []
  const lines = csvContent.split('\n')

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const [articleId, questionsStr] = line.split(',')
    if (!articleId || !questionsStr) continue

    // Parse question numbers (could be comma-separated in quotes)
    const cleanQuestionsStr = questionsStr.replace(/"/g, '')
    const questionNumbers = cleanQuestionsStr.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num))

    if (questionNumbers.length > 0) {
      mappings.push({
        articleId: articleId.trim(),
        questionNumbers
      })
    }
  }

  return mappings
}

export function combineQuestionsWithAnswers(
  questions: ParsedQuestion[],
  answers: Record<number, number>
): ParsedQuestion[] {
  return questions.map(question => ({
    ...question,
    correctAnswer: answers[question.originalNumber] || 0
  }))
}

export function mapQuestionsToArticles(
  questions: ParsedQuestion[],
  mappings: ArticleMapping[]
): Array<{
  question: ParsedQuestion
  articleId: string
  titleId: string
  articleNumber: number
}> {
  const result: Array<{
    question: ParsedQuestion
    articleId: string
    titleId: string
    articleNumber: number
  }> = []

  for (const mapping of mappings) {
    for (const questionNumber of mapping.questionNumbers) {
      const question = questions.find(q => q.originalNumber === questionNumber)
      if (question) {
        // Parse article info
        const { titleId, articleNumber } = parseArticleId(mapping.articleId)

        result.push({
          question,
          articleId: mapping.articleId,
          titleId,
          articleNumber
        })
      }
    }
  }

  return result
}

function parseArticleId(articleId: string): { titleId: string; articleNumber: number } {
  // Handle different formats like "1.1", "27", "10-55", etc.

  // Simple number (like "27")
  if (/^\d+$/.test(articleId)) {
    const num = parseInt(articleId)
    return {
      titleId: getTitleForArticle(num),
      articleNumber: num
    }
  }

  // Article with subsection (like "1.1")
  if (/^\d+\.\d+$/.test(articleId)) {
    const mainNumber = parseInt(articleId.split('.')[0])
    return {
      titleId: getTitleForArticle(mainNumber),
      articleNumber: mainNumber
    }
  }

  // Range (like "10-55")
  if (/^\d+-\d+$/.test(articleId)) {
    const startNumber = parseInt(articleId.split('-')[0])
    return {
      titleId: getTitleForArticle(startNumber),
      articleNumber: startNumber
    }
  }

  // Special cases or values in parentheses
  if (articleId.includes('(')) {
    // Extract main number before parentheses
    const match = articleId.match(/^(\d+)/)
    if (match) {
      const num = parseInt(match[1])
      return {
        titleId: getTitleForArticle(num),
        articleNumber: num
      }
    }
  }

  // Default fallback
  return {
    titleId: 'preliminar',
    articleNumber: 1
  }
}

function getTitleForArticle(articleNumber: number): string {
  if (articleNumber >= 1 && articleNumber <= 9) return 'preliminar'
  if (articleNumber >= 10 && articleNumber <= 55) return 'titulo1'
  if (articleNumber >= 56 && articleNumber <= 65) return 'titulo2'
  if (articleNumber >= 66 && articleNumber <= 96) return 'titulo3'
  if (articleNumber >= 97 && articleNumber <= 107) return 'titulo4'
  if (articleNumber >= 108 && articleNumber <= 116) return 'titulo5'
  if (articleNumber >= 117 && articleNumber <= 127) return 'titulo6'
  if (articleNumber >= 128 && articleNumber <= 136) return 'titulo7'
  if (articleNumber >= 137 && articleNumber <= 158) return 'titulo8'
  if (articleNumber >= 159 && articleNumber <= 165) return 'titulo9'
  if (articleNumber >= 166 && articleNumber <= 169) return 'titulo10'
  return 'disposiciones'
}