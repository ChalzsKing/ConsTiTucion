// Question data for Spanish Constitution articles
export interface Question {
  id: number
  articleNumber: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export const questionsData: Question[] = [
  {
    id: 1,
    articleNumber: 1,
    question: "¿Cuáles son los valores superiores del ordenamiento jurídico español según el artículo 1?",
    options: [
      "La libertad, la justicia, la igualdad y el pluralismo político",
      "La democracia, la libertad, la justicia y la solidaridad",
      "La igualdad, la fraternidad, la libertad y la justicia",
      "El pluralismo político, la soberanía, la libertad y la democracia",
    ],
    correctAnswer: 0,
    explanation:
      "El artículo 1 establece expresamente que España propugna como valores superiores la libertad, la justicia, la igualdad y el pluralismo político.",
  },
  {
    id: 2,
    articleNumber: 2,
    question: "Según el artículo 2, ¿en quién reside la soberanía nacional?",
    options: [
      "En el Rey como Jefe del Estado",
      "En el pueblo español",
      "En las Cortes Generales",
      "En el Gobierno de la Nación",
    ],
    correctAnswer: 1,
    explanation:
      "El artículo 2 es claro: 'La soberanía nacional reside en el pueblo español, del que emanan los poderes del Estado.'",
  },
  {
    id: 3,
    articleNumber: 3,
    question: "¿Cuál es la forma política del Estado español según el artículo 3?",
    options: ["República parlamentaria", "Monarquía absoluta", "Monarquía parlamentaria", "Estado federal"],
    correctAnswer: 2,
    explanation: "El artículo 3 establece que 'La forma política del Estado español es la Monarquía parlamentaria.'",
  },
]

export function getQuestionForArticle(articleNumber: number): Question | undefined {
  return questionsData.find((q) => q.articleNumber === articleNumber)
}
