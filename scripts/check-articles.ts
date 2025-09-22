import { config } from 'dotenv'
import { join } from 'path'

// Cargar variables de entorno
config({ path: join(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkArticlesWithQuestions() {
  try {
    const { data, error } = await supabase
      .from('question_articles')
      .select('article_number, title_id')
      .order('article_number')

    if (error) {
      console.error('Error:', error)
      return
    }

    console.log('📋 Artículos con preguntas en Supabase:')
    data.forEach(item => {
      console.log(`- Artículo ${item.article_number} (Título: ${item.title_id})`)
    })

    const uniqueArticles = [...new Set(data.map(item => item.article_number))].sort((a, b) => a - b)
    console.log(`\n✅ Total: ${uniqueArticles.length} artículos únicos con preguntas`)

    if (uniqueArticles.length > 0) {
      console.log(`📊 Rango: Artículo ${uniqueArticles[0]} - ${uniqueArticles[uniqueArticles.length - 1]}`)
    }

    // Agrupar por título
    const byTitle: Record<string, number[]> = {}
    data.forEach(item => {
      if (!byTitle[item.title_id]) {
        byTitle[item.title_id] = []
      }
      byTitle[item.title_id].push(item.article_number)
    })

    console.log('\n📚 Por títulos:')
    Object.keys(byTitle).forEach(titleId => {
      const articles = [...new Set(byTitle[titleId])].sort((a, b) => a - b)
      console.log(`  ${titleId}: ${articles.length} artículos (${articles[0]}-${articles[articles.length - 1]})`)
    })

  } catch (err) {
    console.error('❌ Error:', err)
  }
}

checkArticlesWithQuestions()