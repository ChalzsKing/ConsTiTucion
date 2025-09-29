-- 📊 HITO 5: Estadísticas Personales - Tablas de Supabase
-- Creado: 2025-09-28
-- Propósito: Sistema completo de estadísticas y tracking de usuario

-- ================================
-- 1. TABLA: user_statistics
-- ================================
-- Métricas generales del usuario
CREATE TABLE IF NOT EXISTS user_statistics (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Estadísticas de estudio
  total_articles_studied INTEGER DEFAULT 0,
  total_study_time_minutes INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  max_streak_days INTEGER DEFAULT 0,
  last_study_date DATE,

  -- Estadísticas de exámenes
  total_exams_taken INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_incorrect_answers INTEGER DEFAULT 0,
  best_exam_score DECIMAL(5,2) DEFAULT 0.00,
  average_exam_score DECIMAL(5,2) DEFAULT 0.00,

  -- Progreso por títulos (JSON para flexibilidad)
  titles_progress JSONB DEFAULT '{}',

  -- Logros y gamificación
  achievements JSONB DEFAULT '[]',
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,

  -- Metadatos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraint: Un registro por usuario
  UNIQUE(user_id)
);

-- ================================
-- 2. TABLA: exam_history
-- ================================
-- Historial completo de exámenes realizados
CREATE TABLE IF NOT EXISTS exam_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del examen
  exam_type TEXT NOT NULL CHECK (exam_type IN ('article', 'title', 'general')),
  exam_identifier TEXT, -- Número de artículo o title_id
  title_name TEXT, -- Nombre legible del título

  -- Resultados
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,

  -- Tiempo
  time_taken_seconds INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP DEFAULT NOW(),

  -- Detalles adicionales
  questions_data JSONB, -- Array de preguntas y respuestas para revisión

  -- Índices para consultas rápidas
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- 3. TABLA: user_progress (MEJORADA)
-- ================================
-- Progreso detallado por artículo
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identificación del artículo
  article_number INTEGER NOT NULL,
  title_id TEXT NOT NULL,
  article_title TEXT, -- Título descriptivo del artículo

  -- Progreso de estudio
  is_completed BOOLEAN DEFAULT FALSE,
  times_studied INTEGER DEFAULT 1,
  total_study_time_seconds INTEGER DEFAULT 0,

  -- Timestamps
  first_studied_at TIMESTAMP DEFAULT NOW(),
  last_studied_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- Notas del usuario (opcional)
  user_notes TEXT,

  -- Metadatos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraint: Un registro por usuario y artículo
  UNIQUE(user_id, article_number)
);

-- ================================
-- 4. TABLA: daily_activity
-- ================================
-- Tracking diario para streaks y métricas
CREATE TABLE IF NOT EXISTS daily_activity (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,

  -- Actividades del día
  articles_studied INTEGER DEFAULT 0,
  exams_taken INTEGER DEFAULT 0,
  questions_answered INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  study_time_minutes INTEGER DEFAULT 0,

  -- XP ganado en el día
  xp_earned INTEGER DEFAULT 0,

  -- Metadatos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraint: Un registro por usuario y día
  UNIQUE(user_id, activity_date)
);

-- ================================
-- 5. ÍNDICES PARA RENDIMIENTO
-- ================================
-- Índices en user_statistics
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON user_statistics(user_id);

-- Índices en exam_history
CREATE INDEX IF NOT EXISTS idx_exam_history_user_id ON exam_history(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_history_exam_type ON exam_history(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_history_completed_at ON exam_history(completed_at);

-- Índices en user_progress
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_title_id ON user_progress(title_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(is_completed);

-- Índices en daily_activity
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_id ON daily_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON daily_activity(activity_date);

-- ================================
-- 6. POLÍTICAS RLS (Row Level Security)
-- ================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

-- Políticas para user_statistics
CREATE POLICY "Users can view their own statistics" ON user_statistics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON user_statistics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON user_statistics
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para exam_history
CREATE POLICY "Users can view their own exam history" ON exam_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam history" ON exam_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_progress
CREATE POLICY "Users can view their own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para daily_activity
CREATE POLICY "Users can view their own daily activity" ON daily_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily activity" ON daily_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily activity" ON daily_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- ================================
-- 7. FUNCIONES HELPER (OPCIONAL)
-- ================================

-- Función para actualizar user_statistics automáticamente
CREATE OR REPLACE FUNCTION update_user_statistics_on_exam()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estadísticas cuando se completa un examen
  INSERT INTO user_statistics (user_id, total_exams_taken, total_questions_answered, total_correct_answers, total_incorrect_answers)
  VALUES (NEW.user_id, 1, NEW.total_questions, NEW.correct_answers, NEW.incorrect_answers)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_exams_taken = user_statistics.total_exams_taken + 1,
    total_questions_answered = user_statistics.total_questions_answered + NEW.total_questions,
    total_correct_answers = user_statistics.total_correct_answers + NEW.correct_answers,
    total_incorrect_answers = user_statistics.total_incorrect_answers + NEW.incorrect_answers,
    best_exam_score = GREATEST(user_statistics.best_exam_score, NEW.score_percentage),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estadísticas automáticamente
CREATE TRIGGER trigger_update_statistics_on_exam
  AFTER INSERT ON exam_history
  FOR EACH ROW
  EXECUTE FUNCTION update_user_statistics_on_exam();

-- Función para calcular average_exam_score
CREATE OR REPLACE FUNCTION calculate_average_exam_score(user_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  avg_score DECIMAL(5,2);
BEGIN
  SELECT AVG(score_percentage) INTO avg_score
  FROM exam_history
  WHERE user_id = user_uuid;

  RETURN COALESCE(avg_score, 0.00);
END;
$$ LANGUAGE plpgsql;

-- ================================
-- 8. DATOS INICIALES (OPCIONAL)
-- ================================

-- Crear registro inicial de estadísticas para usuarios existentes
-- (Se ejecutará desde la aplicación cuando el usuario haga login)

-- ================================
-- RESUMEN DE TABLAS CREADAS:
-- ================================
-- ✅ user_statistics: Métricas generales del usuario
-- ✅ exam_history: Historial completo de exámenes
-- ✅ user_progress: Progreso detallado por artículo (mejorada)
-- ✅ daily_activity: Tracking diario para streaks
-- ✅ Índices optimizados para consultas rápidas
-- ✅ Políticas RLS para seguridad
-- ✅ Funciones helper para automatización