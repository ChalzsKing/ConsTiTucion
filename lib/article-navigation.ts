import { constitutionData, type Article, type ConstitutionTitle } from './constitution-data'

/**
 * Información de navegación para un artículo
 */
export interface ArticleNavigation {
  current: Article
  previous: Article | null
  next: Article | null
  title: ConstitutionTitle
  titleProgress: {
    currentIndex: number
    totalArticles: number
    completedArticles: number
    completionPercentage: number
  }
}

/**
 * Función para obtener información de navegación de un artículo
 */
export function getArticleNavigation(articleNumber: number): ArticleNavigation | null {
  // Encontrar el artículo y su título
  let currentArticle: Article | null = null
  let currentTitle: ConstitutionTitle | null = null
  let articleIndexInTitle = -1

  for (const title of constitutionData) {
    const articleIndex = title.articles.findIndex(article => article.number === articleNumber)
    if (articleIndex !== -1) {
      currentArticle = title.articles[articleIndex]
      currentTitle = title
      articleIndexInTitle = articleIndex
      break
    }
  }

  if (!currentArticle || !currentTitle) {
    return null
  }

  // Encontrar artículo anterior y siguiente
  const previousArticle = articleIndexInTitle > 0
    ? currentTitle.articles[articleIndexInTitle - 1]
    : getPreviousArticleFromPreviousTitle(currentTitle.id)

  const nextArticle = articleIndexInTitle < currentTitle.articles.length - 1
    ? currentTitle.articles[articleIndexInTitle + 1]
    : getNextArticleFromNextTitle(currentTitle.id)

  // Calcular progreso del título
  const completedArticles = currentTitle.articles.filter(article => article.completed).length
  const completionPercentage = Math.round((completedArticles / currentTitle.articles.length) * 100)

  return {
    current: currentArticle,
    previous: previousArticle,
    next: nextArticle,
    title: currentTitle,
    titleProgress: {
      currentIndex: articleIndexInTitle,
      totalArticles: currentTitle.articles.length,
      completedArticles,
      completionPercentage
    }
  }
}

/**
 * Obtener el último artículo del título anterior
 */
function getPreviousArticleFromPreviousTitle(currentTitleId: string): Article | null {
  const currentTitleIndex = constitutionData.findIndex(title => title.id === currentTitleId)

  if (currentTitleIndex > 0) {
    const previousTitle = constitutionData[currentTitleIndex - 1]
    return previousTitle.articles[previousTitle.articles.length - 1] || null
  }

  return null
}

/**
 * Obtener el primer artículo del título siguiente
 */
function getNextArticleFromNextTitle(currentTitleId: string): Article | null {
  const currentTitleIndex = constitutionData.findIndex(title => title.id === currentTitleId)

  if (currentTitleIndex !== -1 && currentTitleIndex < constitutionData.length - 1) {
    const nextTitle = constitutionData[currentTitleIndex + 1]
    return nextTitle.articles[0] || null
  }

  return null
}

/**
 * Obtener todos los artículos en orden secuencial
 */
export function getAllArticlesSequential(): Article[] {
  return constitutionData.flatMap(title => title.articles)
}

/**
 * Obtener artículo por número
 */
export function getArticleByNumber(articleNumber: number): Article | null {
  for (const title of constitutionData) {
    const article = title.articles.find(article => article.number === articleNumber)
    if (article) {
      return article
    }
  }
  return null
}

/**
 * Obtener breadcrumbs para un artículo
 */
export function getArticleBreadcrumbs(articleNumber: number): Array<{
  id: string
  label: string
  href?: string
}> {
  const navigation = getArticleNavigation(articleNumber)

  if (!navigation) {
    return []
  }

  return [
    {
      id: 'home',
      label: 'Constitución',
      href: '/'
    },
    {
      id: 'title',
      label: navigation.title.title,
      href: `/?title=${navigation.title.id}`
    },
    {
      id: 'article',
      label: `Artículo ${navigation.current.number}`,
    }
  ]
}

/**
 * Calcular progreso general de la constitución
 */
export function getOverallProgress(): {
  totalArticles: number
  completedArticles: number
  completionPercentage: number
  titleProgress: Array<{
    titleId: string
    title: string
    completedArticles: number
    totalArticles: number
    percentage: number
  }>
} {
  let totalArticles = 0
  let totalCompleted = 0
  const titleProgress = []

  for (const title of constitutionData) {
    const titleCompleted = title.articles.filter(article => article.completed).length
    const titleTotal = title.articles.length

    totalArticles += titleTotal
    totalCompleted += titleCompleted

    titleProgress.push({
      titleId: title.id,
      title: title.title,
      completedArticles: titleCompleted,
      totalArticles: titleTotal,
      percentage: Math.round((titleCompleted / titleTotal) * 100)
    })
  }

  return {
    totalArticles,
    completedArticles: totalCompleted,
    completionPercentage: Math.round((totalCompleted / totalArticles) * 100),
    titleProgress
  }
}

/**
 * Obtener próximos artículos recomendados
 */
export function getRecommendedNextArticles(currentArticleNumber: number, limit: number = 3): Article[] {
  const allArticles = getAllArticlesSequential()
  const currentIndex = allArticles.findIndex(article => article.number === currentArticleNumber)

  if (currentIndex === -1) return []

  // Obtener los siguientes artículos disponibles que no estén completados
  const nextArticles = allArticles
    .slice(currentIndex + 1)
    .filter(article => article.available && !article.completed)
    .slice(0, limit)

  return nextArticles
}