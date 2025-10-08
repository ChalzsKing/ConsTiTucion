-- 🚀 MIGRACIÓN DE DATOS CONSTIMASTER (CORREGIDA)
-- Generado: 2025-09-29T13:55:00.000Z
-- Propósito: Migrar datos de localStorage a Supabase con UUID válido

-- IMPORTANTE: Ejecutar este SQL en Supabase SQL Editor
-- con un usuario que tenga permisos de admin

BEGIN;

-- Temporalmente deshabilitar RLS para migración
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity DISABLE ROW LEVEL SECURITY;

-- Generar un UUID válido para usuario de prueba
-- Usando gen_random_uuid() para generar UUID único
DO $$
DECLARE
    demo_user_id UUID := gen_random_uuid();
BEGIN
    RAISE NOTICE 'Usuario de prueba creado con ID: %', demo_user_id;

    -- 1. MIGRAR PROGRESO DE ARTÍCULOS
    INSERT INTO user_progress (
      user_id, article_number, title_id, article_title,
      is_completed, times_studied, total_study_time_seconds,
      first_studied_at, last_studied_at, completed_at
    ) VALUES
    (demo_user_id, 1, 'preliminar', 'Artículo 1', true, 1, 120,
     NOW() - INTERVAL '2 days', NOW(), NOW() - INTERVAL '1 day'),
    (demo_user_id, 10, 'titulo1', 'Artículo 10', true, 1, 180,
     NOW() - INTERVAL '4 days', NOW(), NOW() - INTERVAL '1 day'),
    (demo_user_id, 15, 'titulo1', 'Artículo 15', true, 1, 240,
     NOW() - INTERVAL '1 days', NOW(), NOW() - INTERVAL '1 day'),
    (demo_user_id, 27, 'titulo1', 'Artículo 27', true, 1, 300,
     NOW() - INTERVAL '0 days', NOW(), NOW() - INTERVAL '1 day'),
    (demo_user_id, 32, 'titulo1', 'Artículo 32', true, 1, 200,
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
    ON CONFLICT (user_id, article_number)
    DO UPDATE SET
      is_completed = EXCLUDED.is_completed,
      total_study_time_seconds = EXCLUDED.total_study_time_seconds,
      times_studied = EXCLUDED.times_studied;

    -- 2. ACTUALIZAR ESTADÍSTICAS DEL USUARIO
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
      total_incorrect_answers
    ) VALUES (
      demo_user_id,
      5,
      17,
      1,
      1,
      CURRENT_DATE,
      0,
      0,
      0,
      0
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      total_articles_studied = EXCLUDED.total_articles_studied,
      total_study_time_minutes = EXCLUDED.total_study_time_minutes,
      current_streak_days = EXCLUDED.current_streak_days,
      last_study_date = EXCLUDED.last_study_date,
      updated_at = NOW();

    -- 3. ACTUALIZAR ACTIVIDAD DIARIA
    INSERT INTO daily_activity (
      user_id,
      activity_date,
      articles_studied,
      study_time_minutes,
      xp_earned
    ) VALUES (
      demo_user_id,
      CURRENT_DATE,
      5,
      17,
      50
    )
    ON CONFLICT (user_id, activity_date)
    DO UPDATE SET
      articles_studied = EXCLUDED.articles_studied,
      study_time_minutes = EXCLUDED.study_time_minutes,
      xp_earned = EXCLUDED.xp_earned;

    -- 4. VERIFICACIÓN INMEDIATA
    RAISE NOTICE 'Datos insertados correctamente para usuario: %', demo_user_id;

END $$;

-- 4. RE-HABILITAR RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

COMMIT;

-- 📊 VERIFICACIÓN POST-MIGRACIÓN
-- Estas queries mostrarán los datos insertados:

SELECT 'user_progress' as tabla, COUNT(*) as registros, user_id
FROM user_progress
GROUP BY user_id
ORDER BY registros DESC
LIMIT 3;

SELECT 'user_statistics' as tabla, user_id, total_articles_studied, total_study_time_minutes
FROM user_statistics
ORDER BY total_articles_studied DESC
LIMIT 3;

SELECT 'daily_activity' as tabla, user_id, articles_studied, study_time_minutes
FROM daily_activity
WHERE activity_date = CURRENT_DATE
ORDER BY articles_studied DESC
LIMIT 3;