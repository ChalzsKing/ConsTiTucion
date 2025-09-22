// Load environment variables
import { config } from 'dotenv'
import { join } from 'path'

// Load .env.local file explicitly
config({ path: join(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
import {
  parseQuestionsFromText,
  parseAnswersFromText,
  parseMultipleAnswerFiles,
  parseArticleMappingFromCSV,
  combineQuestionsWithAnswers,
  mapQuestionsToArticles,
  type ParsedQuestion
} from './parse-questions'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for migrations

console.log('🔧 Environment check:')
console.log('- Supabase URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing')
console.log('- Service Key:', supabaseServiceKey ? '✅ Loaded' : '❌ Missing')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface DatabaseQuestion {
  original_number: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: number
}

export interface DatabaseQuestionArticle {
  question_id: number
  original_question_number: number
  title_id: string
  article_number: number
}

export async function migrateQuestionsToSupabase(
  questionsText: string,
  answersText1: string,
  answersText2: string,
  mappingCSV: string
) {
  console.log('🚀 Starting migration to Supabase...')

  try {
    // Step 1: Parse all data
    console.log('📋 Parsing questions...')
    const parsedQuestions = parseQuestionsFromText(questionsText)
    console.log(`Found ${parsedQuestions.length} questions`)

    console.log('📋 Parsing answers from both files...')
    const parsedAnswers = parseMultipleAnswerFiles(answersText1, answersText2)
    console.log(`Found ${Object.keys(parsedAnswers).length} answers total`)

    console.log('📋 Parsing article mappings...')
    const mappings = parseArticleMappingFromCSV(mappingCSV)
    console.log(`Found ${mappings.length} article mappings`)

    // Step 2: Combine questions with answers
    console.log('🔗 Combining questions with answers...')
    const questionsWithAnswers = combineQuestionsWithAnswers(parsedQuestions, parsedAnswers)

    // Step 2.5: Remove duplicates by original_number
    console.log('🔄 Removing duplicate questions...')
    const uniqueQuestions = questionsWithAnswers.filter((question, index, array) =>
      index === array.findIndex(q => q.originalNumber === question.originalNumber)
    )
    console.log(`Removed ${questionsWithAnswers.length - uniqueQuestions.length} duplicate questions`)
    console.log(`Final unique questions: ${uniqueQuestions.length}`)

    // Step 3: Map questions to articles
    console.log('🗂️ Mapping questions to articles...')
    const mappedQuestions = mapQuestionsToArticles(uniqueQuestions, mappings)
    console.log(`Mapped ${mappedQuestions.length} question-article relationships`)

    // Step 4: Create database tables if they don't exist
    console.log('📚 Setting up database tables...')
    await setupDatabaseTables()

    // Step 5: Insert questions
    console.log('💾 Inserting questions into database...')
    const insertedQuestions = await insertQuestions(uniqueQuestions)
    console.log(`Inserted ${insertedQuestions.length} questions`)

    // Step 6: Insert question-article mappings
    console.log('🔗 Inserting question-article mappings...')
    await insertQuestionArticleMappings(mappedQuestions, insertedQuestions)

    console.log('✅ Migration completed successfully!')

    return {
      success: true,
      totalQuestions: insertedQuestions.length,
      totalMappings: mappedQuestions.length
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function setupDatabaseTables() {
  console.log('Creating questions table...')

  // Create questions table
  const { error: questionsError } = await supabase
    .from('questions')
    .select('id')
    .limit(1)

  // If table doesn't exist, we need to create it via SQL Editor in Supabase Dashboard
  if (questionsError && questionsError.code === 'PGRST116') {
    console.log('⚠️  Tables need to be created manually in Supabase.')
    console.log('📋 Please run this SQL in your Supabase SQL Editor:')
    console.log(`
-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  original_number INTEGER UNIQUE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_original_number ON questions(original_number);

-- Create question_articles table
CREATE TABLE IF NOT EXISTS question_articles (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  original_question_number INTEGER NOT NULL,
  title_id TEXT NOT NULL,
  article_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(question_id, title_id, article_number)
);

CREATE INDEX IF NOT EXISTS idx_question_articles_title ON question_articles(title_id);
CREATE INDEX IF NOT EXISTS idx_question_articles_article ON question_articles(article_number);
CREATE INDEX IF NOT EXISTS idx_question_articles_question ON question_articles(question_id);
    `)

    throw new Error('Please create the tables in Supabase SQL Editor first, then run the migration again.')
  }

  console.log('✅ Tables are ready!')
}

async function insertQuestions(questions: ParsedQuestion[]): Promise<Array<{ id: number; original_number: number }>> {
  const batchSize = 100
  const results: Array<{ id: number; original_number: number }> = []

  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize)

    const dbQuestions: DatabaseQuestion[] = batch.map(q => ({
      original_number: q.originalNumber,
      question_text: q.questionText,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_answer: q.correctAnswer
    }))

    const { data, error } = await supabase
      .from('questions')
      .insert(dbQuestions)
      .select('id, original_number')

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      throw error
    }

    if (data) {
      results.push(...data)
    }

    console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(questions.length / batchSize)}`)
  }

  return results
}

async function insertQuestionArticleMappings(
  mappedQuestions: Array<{
    question: ParsedQuestion
    articleId: string
    titleId: string
    articleNumber: number
  }>,
  insertedQuestions: Array<{ id: number; original_number: number }>
) {
  const batchSize = 100

  // Create lookup map for question IDs
  const questionIdMap = new Map<number, number>()
  insertedQuestions.forEach(q => {
    questionIdMap.set(q.original_number, q.id)
  })

  for (let i = 0; i < mappedQuestions.length; i += batchSize) {
    const batch = mappedQuestions.slice(i, i + batchSize)

    const dbMappings: DatabaseQuestionArticle[] = batch
      .map(item => {
        const questionId = questionIdMap.get(item.question.originalNumber)
        if (!questionId) return null

        return {
          question_id: questionId,
          original_question_number: item.question.originalNumber,
          title_id: item.titleId,
          article_number: item.articleNumber
        }
      })
      .filter((item): item is DatabaseQuestionArticle => item !== null)

    if (dbMappings.length === 0) continue

    const { error } = await supabase
      .from('question_articles')
      .insert(dbMappings)

    if (error) {
      console.error(`Error inserting mapping batch ${i / batchSize + 1}:`, error)
      throw error
    }

    console.log(`Inserted mapping batch ${i / batchSize + 1}/${Math.ceil(mappedQuestions.length / batchSize)}`)
  }
}

// Utility functions for querying
export async function getQuestionsByArticle(articleNumber: number, limit = 10) {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_articles!inner(*)
    `)
    .eq('question_articles.article_number', articleNumber)
    .limit(limit)

  if (error) throw error
  return data
}

export async function getQuestionsByTitle(titleId: string, limit = 20) {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      question_articles!inner(*)
    `)
    .eq('question_articles.title_id', titleId)
    .limit(limit)

  if (error) throw error
  return data
}

export async function getRandomQuestions(limit = 10) {
  // Note: In production, you might want to use a better random selection method
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .limit(limit * 2) // Get more to randomize

  if (error) throw error

  // Shuffle and return requested number
  const shuffled = data?.sort(() => Math.random() - 0.5)
  return shuffled?.slice(0, limit) || []
}