-- ================================================
-- CORRECCIÓN: Insertar artículos faltantes
-- ================================================
-- Ejecuta este script en Supabase SQL Editor

-- Primero, verificar qué artículos ya existen
SELECT article_number, is_completed
FROM user_progress
WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f'
ORDER BY article_number;

-- ================================================
-- Insertar TODOS los artículos completados (1-11, 107, 159)
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
  -- Artículos 1-9 (Título Preliminar)
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 1, 'preliminar', true, 3, 18, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 2, 'preliminar', true, 1, 10, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 3, 'preliminar', true, 2, 13, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 4, 'preliminar', true, 1, 10, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 5, 'preliminar', true, 1, 10, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 6, 'preliminar', true, 1, 10, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 7, 'preliminar', true, 1, 10, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 8, 'preliminar', true, 1, 10, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 9, 'preliminar', true, 1, 10, NOW(), NOW()),

  -- Artículos 10-11 (Título I)
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 10, 'titulo1', true, 1, 10, NOW(), NOW()),
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 11, 'titulo1', true, 5, 16, NOW(), NOW()),

  -- Artículo 107 (Título IV)
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 107, 'titulo4', true, 1, 10, NOW(), NOW()),

  -- Artículo 159 (Disposiciones)
  ('74678d1b-217f-4c24-a698-d266b7f22a0f', 159, 'disposiciones', true, 3, 423, NOW(), NOW())

ON CONFLICT (user_id, article_number) DO UPDATE SET
  is_completed = EXCLUDED.is_completed,
  times_studied = GREATEST(user_progress.times_studied, EXCLUDED.times_studied),
  total_study_time_seconds = GREATEST(user_progress.total_study_time_seconds, EXCLUDED.total_study_time_seconds),
  last_studied_at = EXCLUDED.last_studied_at,
  completed_at = COALESCE(user_progress.completed_at, EXCLUDED.completed_at);

-- ================================================
-- Actualizar user_statistics con el conteo correcto
-- ================================================

UPDATE user_statistics
SET
  total_articles_studied = 13,
  total_study_time_minutes = (
    SELECT COALESCE(SUM(total_study_time_seconds) / 60, 0)::integer
    FROM user_progress
    WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f'
  ),
  updated_at = NOW()
WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f';

-- ================================================
-- Verificar que todo esté correcto
-- ================================================

-- Ver todos los artículos completados
SELECT article_number, title_id, is_completed, total_study_time_seconds
FROM user_progress
WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f'
  AND is_completed = true
ORDER BY article_number;

-- Ver estadísticas actualizadas
SELECT total_articles_studied, total_study_time_minutes, total_exams_taken
FROM user_statistics
WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f';

-- Contar artículos completados
SELECT COUNT(*) as total_completados
FROM user_progress
WHERE user_id = '74678d1b-217f-4c24-a698-d266b7f22a0f'
  AND is_completed = true;

-- ================================================
-- ✅ RESULTADO ESPERADO:
-- ================================================
-- total_completados: 13
-- total_articles_studied: 13
-- total_study_time_minutes: ~8 minutos (calculado desde user_progress)
