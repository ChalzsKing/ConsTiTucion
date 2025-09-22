export interface ParsedQuestion {
  originalNumber: number
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: number // 0=A, 1=B, 2=C, 3=D
}

export function parseQuestionsImproved(textContent: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = []

  // El archivo tiene todas las preguntas en una línea continua
  // Primero necesitamos dividir por patrones de pregunta

  // Patrón más robusto que captura el número de pregunta seguido de ".-"
  const questionPattern = /(\d+)\.-\s*(.+?)(?=\s+\d+\.-|$)/g
  const matches = [...textContent.matchAll(questionPattern)]

  console.log(`🔍 Encontrados ${matches.length} bloques de preguntas`)

  for (const match of matches) {
    const questionNumber = parseInt(match[1])
    const questionBlock = match[2].trim()

    // Ahora extraer el texto de la pregunta y las opciones
    // Patrón: [texto pregunta] a) [opción] b) [opción] c) [opción] d) [opción]

    // Buscar donde termina la pregunta (antes de "a)")
    const questionEndMatch = questionBlock.match(/^(.+?)(?=\s+a\))/s)
    if (!questionEndMatch) {
      console.warn(`⚠️  No se pudo extraer pregunta ${questionNumber}`)
      continue
    }

    const questionText = questionEndMatch[1].trim().replace(/:\s*$/, '')

    // Extraer opciones con patrones más flexibles
    const optionAMatch = questionBlock.match(/a\)\s*(.+?)(?=\s+b\))/s)
    const optionBMatch = questionBlock.match(/b\)\s*(.+?)(?=\s+c\))/s)
    const optionCMatch = questionBlock.match(/c\)\s*(.+?)(?=\s+d\))/s)
    const optionDMatch = questionBlock.match(/d\)\s*(.+?)$/s)

    const optionA = optionAMatch?.[1]?.trim()
    const optionB = optionBMatch?.[1]?.trim()
    const optionC = optionCMatch?.[1]?.trim()
    const optionD = optionDMatch?.[1]?.trim()

    // Solo agregar si encontramos todas las partes
    if (questionText && optionA && optionB && optionC && optionD) {
      questions.push({
        originalNumber: questionNumber,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer: 0 // Será actualizado cuando combinemos con respuestas
      })
    } else {
      console.warn(`⚠️  Pregunta ${questionNumber} incompleta:`, {
        hasQuestion: !!questionText,
        hasA: !!optionA,
        hasB: !!optionB,
        hasC: !!optionC,
        hasD: !!optionD
      })
    }
  }

  console.log(`✅ Parseadas ${questions.length} preguntas completas`)
  return questions
}

export function parseAnswersImproved(answersText1: string, answersText2: string): Record<number, number> {
  const answers: Record<number, number> = {}

  // Función para parsear un archivo de respuestas
  function parseAnswerFile(content: string) {
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Patrón: número.- letra
      const match = trimmed.match(/^(\d+)\.-\s*([ABCD])$/i)
      if (match) {
        const questionNum = parseInt(match[1])
        const answerLetter = match[2].toUpperCase()

        // Convertir letra a número (A=0, B=1, C=2, D=3)
        const answerNum = answerLetter.charCodeAt(0) - 65

        answers[questionNum] = answerNum
      }
    }
  }

  parseAnswerFile(answersText1)
  parseAnswerFile(answersText2)

  return answers
}

export function combineQuestionsWithAnswersImproved(
  questions: ParsedQuestion[],
  answers: Record<number, number>
): ParsedQuestion[] {
  return questions
    .filter(question => answers[question.originalNumber] !== undefined)
    .map(question => ({
      ...question,
      correctAnswer: answers[question.originalNumber]
    }))
}