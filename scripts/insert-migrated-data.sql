-- ================================================
-- MIGRACIÓN MANUAL DE DATOS: localStorage → Supabase
-- ================================================
-- Ejecuta este script en Supabase SQL Editor
-- Dashboard → SQL Editor → New Query

-- ================================================
-- 1. INSERTAR PROGRESO DE ARTÍCULOS
-- ================================================

INSERT INTO user_progress (
  user_id,
  article_number,
  title_id,
  is_completed,
  times_studied,
  total_study_time_seconds,
  last_studied_at,
  completed_at
) VALUES
  -- Artículo 1 (Preliminar) - COMPLETADO
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 1, 'preliminar', true, 3, 18, '2025-09-30T17:30:21.028Z', '2025-09-27T18:55:28.127Z'),

  -- Artículo 2 (Preliminar) - NO COMPLETADO
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 2, 'preliminar', false, 1, 1, '2025-09-30T17:21:47.478Z', NULL),

  -- Artículo 3 (Preliminar) - COMPLETADO
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 3, 'preliminar', true, 2, 13, '2025-09-30T17:30:41.877Z', '2025-09-30T17:30:41.877Z'),

  -- Artículo 4 (Preliminar) - NO COMPLETADO
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 4, 'preliminar', false, 1, 1, '2025-09-30T17:30:46.268Z', NULL),

  -- Artículo 11 (Título I) - COMPLETADO
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 11, 'titulo1', true, 5, 16, '2025-09-30T17:22:10.638Z', '2025-09-30T17:21:46.143Z'),

  -- Artículo 31 (Título I) - NO COMPLETADO
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 31, 'titulo1', false, 1, 0, '2025-09-30T17:22:48.533Z', NULL),

  -- Artículo 159 (Disposiciones) - COMPLETADO
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 159, 'disposiciones', true, 3, 423, '2025-09-30T17:22:48.533Z', '2025-09-30T17:22:48.533Z')

ON CONFLICT (user_id, article_number) DO UPDATE SET
  is_completed = EXCLUDED.is_completed,
  times_studied = EXCLUDED.times_studied,
  total_study_time_seconds = EXCLUDED.total_study_time_seconds,
  last_studied_at = EXCLUDED.last_studied_at,
  completed_at = EXCLUDED.completed_at;

-- ================================================
-- 2. INSERTAR HISTORIAL DE EXÁMENES
-- ================================================

INSERT INTO exam_history (
  user_id,
  exam_type,
  exam_identifier,
  title_name,
  total_questions,
  correct_answers,
  incorrect_answers,
  score_percentage,
  time_taken_seconds,
  questions_data,
  completed_at
) VALUES (
  '74678d1b-217f-4c24-a698-d266b7f22a0f',
  'general',
  NULL,
  'Examen General',
  20,
  3,
  17,
  15.0,
  35,
  '[{"id":42,"articleNumber":14,"titleId":"titulo1","userAnswer":0,"isCorrect":false},{"id":48,"articleNumber":20,"titleId":"titulo1","userAnswer":0,"isCorrect":false},{"id":26,"articleNumber":6,"titleId":"preliminar","userAnswer":0,"isCorrect":false},{"id":53,"articleNumber":55,"titleId":"titulo1","userAnswer":0,"isCorrect":true},{"id":51,"articleNumber":13,"titleId":"titulo1","userAnswer":1,"isCorrect":false},{"id":55,"articleNumber":25,"titleId":"titulo1","userAnswer":1,"isCorrect":false},{"id":22,"articleNumber":4,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":27,"articleNumber":41,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":7,"articleNumber":8,"titleId":"preliminar","userAnswer":0,"isCorrect":false},{"id":32,"articleNumber":54,"titleId":"titulo1","userAnswer":0,"isCorrect":false},{"id":45,"articleNumber":55,"titleId":"titulo1","userAnswer":0,"isCorrect":false},{"id":87,"articleNumber":23,"titleId":"titulo1","userAnswer":2,"isCorrect":false},{"id":14,"articleNumber":2,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":1,"articleNumber":2,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":24,"articleNumber":1,"titleId":"preliminar","userAnswer":1,"isCorrect":true},{"id":3,"articleNumber":9,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":47,"articleNumber":54,"titleId":"titulo1","userAnswer":1,"isCorrect":true},{"id":34,"articleNumber":28,"titleId":"titulo1","userAnswer":1,"isCorrect":false},{"id":58,"articleNumber":33,"titleId":"titulo1","userAnswer":1,"isCorrect":false},{"id":9,"articleNumber":3,"titleId":"preliminar","userAnswer":1,"isCorrect":false}]'::jsonb,
  '2025-09-24T21:47:16.137Z'
);

-- ================================================
-- 3. INSERTAR/ACTUALIZAR ESTADÍSTICAS DE USUARIO
-- ================================================

INSERT INTO user_statistics (
  user_id,
  total_articles_studied,
  total_study_time_minutes,
  current_streak_days,
  max_streak_days,
  last_study_date,
  total_exams_taken,
  total_questions_answered,
  total_correct_answers,
  total_incorrect_answers,
  best_exam_score,
  average_exam_score,
  titles_progress,
  achievements,
  total_xp,
  current_level
) VALUES (
  '74678d1b-217f-4c24-a698-d266b7f22a0f',
  4,                    -- 4 artículos completados (1, 3, 11, 159)
  473,                  -- 473 minutos de estudio total
  1,                    -- Racha actual: 1 día
  1,                    -- Racha máxima: 1 día
  CURRENT_DATE,         -- Último día de estudio: hoy
  1,                    -- 1 examen realizado
  20,                   -- 20 preguntas respondidas
  3,                    -- 3 respuestas correctas
  17,                   -- 17 respuestas incorrectas
  15.0,                 -- Mejor puntuación: 15%
  15.0,                 -- Promedio: 15%
  '{}'::jsonb,          -- Progreso por títulos (se calcula dinámicamente)
  '[]'::jsonb,          -- Sin logros aún
  200,                  -- XP total (4 artículos × 50 XP)
  1                     -- Nivel 1
)
ON CONFLICT (user_id) DO UPDATE SET
  total_articles_studied = EXCLUDED.total_articles_studied,
  total_study_time_minutes = EXCLUDED.total_study_time_minutes,
  current_streak_days = EXCLUDED.current_streak_days,
  max_streak_days = EXCLUDED.max_streak_days,
  last_study_date = EXCLUDED.last_study_date,
  total_exams_taken = EXCLUDED.total_exams_taken,
  total_questions_answered = EXCLUDED.total_questions_answered,
  total_correct_answers = EXCLUDED.total_correct_answers,
  total_incorrect_answers = EXCLUDED.total_incorrect_answers,
  best_exam_score = EXCLUDED.best_exam_score,
  average_exam_score = EXCLUDED.average_exam_score,
  total_xp = EXCLUDED.total_xp,
  updated_at = NOW();

-- ================================================
-- 4. INSERTAR ACTIVIDAD DIARIA (HOY)
-- ================================================

INSERT INTO daily_activity (
  user_id,
  activity_date,
  articles_studied,
  exams_taken,
  questions_answered,
  correct_answers,
  study_time_minutes,
  xp_earned
) VALUES (
  '74678d1b-217f-4c24-a698-d266b7f22a0f',
  CURRENT_DATE,
  4,                    -- 4 artículos estudiados hoy
  1,                    -- 1 examen realizado hoy
  20,                   -- 20 preguntas respondidas
  3,                    -- 3 correctas
  473,                  -- 473 minutos de estudio
  200                   -- 200 XP ganados
)
ON CONFLICT (user_id, activity_date) DO UPDATE SET
  articles_studied = EXCLUDED.articles_studied,
  exams_taken = EXCLUDED.exams_taken,
  questions_answered = EXCLUDED.questions_answered,
  correct_answers = EXCLUDED.correct_answers,
  study_time_minutes = EXCLUDED.study_time_minutes,
  xp_earned = EXCLUDED.xp_earned,
  updated_at = NOW();

-- ================================================
-- 5. VERIFICAR QUE LOS DATOS SE INSERTARON
-- ================================================

-- Verificar artículos
SELECT COUNT(*) as total_articles,
       COUNT(*) FILTER (WHERE is_completed = true) as completed_articles
FROM user_progress
WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f';

-- Verificar exámenes
SELECT COUNT(*) as total_exams
FROM exam_history
WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f';

-- Verificar estadísticas
SELECT total_articles_studied, total_exams_taken, total_study_time_minutes
FROM user_statistics
WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f';

-- ================================================
-- ✅ RESULTADO ESPERADO:
-- ================================================
-- total_articles: 7 (todos los artículos registrados)
-- completed_articles: 4 (artículos 1, 3, 11, 159)
-- total_exams: 1 (un examen general)
-- total_articles_studied: 4
-- total_exams_taken: 1
-- total_study_time_minutes: 473
