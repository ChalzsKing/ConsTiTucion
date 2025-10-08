-- 🚀 MIGRACIÓN CON USUARIO REAL - ConstiMaster
-- Este script usa el primer usuario existente en auth.users

BEGIN;

-- Temporalmente deshabilitar RLS para migración
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity DISABLE ROW LEVEL SECURITY;

-- Usar el primer usuario existente
DO $$
DECLARE
    existing_user_id UUID;
    user_email TEXT;
BEGIN
    -- Obtener el primer usuario existente
    SELECT id, email INTO existing_user_id, user_email
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 1;

    -- Verificar que existe un usuario
    IF existing_user_id IS NULL THEN
        RAISE EXCEPTION 'No se encontraron usuarios en auth.users. Primero registra un usuario en la aplicación.';
    END IF;

    RAISE NOTICE 'Usando usuario existente: % (ID: %)', user_email, existing_user_id;

    -- 1. MIGRAR PROGRESO DE ARTÍCULOS
    INSERT INTO user_progress (
      user_id, article_number, title_id, article_title,
      is_completed, times_studied, total_study_time_seconds,
      first_studied_at, last_studied_at, completed_at
    ) VALUES
    (existing_user_id, 1, 'preliminar', 'Artículo 1', true, 1, 120,
     NOW() - INTERVAL '2 days', NOW(), NOW() - INTERVAL '1 day'),
    (existing_user_id, 10, 'titulo1', 'Artículo 10', true, 1, 180,
     NOW() - INTERVAL '4 days', NOW(), NOW() - INTERVAL '1 day'),
    (existing_user_id, 15, 'titulo1', 'Artículo 15', true, 1, 240,
     NOW() - INTERVAL '1 days', NOW(), NOW() - INTERVAL '1 day'),
    (existing_user_id, 27, 'titulo1', 'Artículo 27', true, 1, 300,
     NOW() - INTERVAL '0 days', NOW(), NOW() - INTERVAL '1 day'),
    (existing_user_id, 32, 'titulo1', 'Artículo 32', true, 1, 200,
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
      existing_user_id,
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
      existing_user_id,
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
    RAISE NOTICE 'Datos insertados correctamente para usuario: % (%)', user_email, existing_user_id;

    -- Mostrar resumen de datos insertados
    PERFORM (
        SELECT RAISE(NOTICE, 'Artículos completados: %', COUNT(*))
        FROM user_progress
        WHERE user_id = existing_user_id AND is_completed = true
    );

END $$;

-- 5. RE-HABILITAR RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

COMMIT;

-- 📊 VERIFICACIÓN POST-MIGRACIÓN
SELECT
    'MIGRACIÓN COMPLETADA' as status,
    up_count.total as "Artículos en user_progress",
    us.total_articles_studied as "Total en user_statistics",
    da.articles_studied as "Actividad hoy"
FROM
    (SELECT COUNT(*) as total FROM user_progress WHERE is_completed = true) up_count,
    (SELECT total_articles_studied FROM user_statistics ORDER BY updated_at DESC LIMIT 1) us,
    (SELECT articles_studied FROM daily_activity WHERE activity_date = CURRENT_DATE ORDER BY updated_at DESC LIMIT 1) da;