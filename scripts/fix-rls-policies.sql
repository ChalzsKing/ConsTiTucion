-- 🔧 SCRIPT PARA CORREGIR POLÍTICAS RLS - user_statistics
-- Ejecutar en Supabase SQL Editor si hay errores 406

-- ================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES
-- ================================

DROP POLICY IF EXISTS "Users can view their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can insert their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON user_statistics;

-- ================================
-- 2. CREAR POLÍTICAS CORRECTAS
-- ================================

-- Política de SELECT (lectura)
CREATE POLICY "Enable read access for authenticated users"
ON user_statistics
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política de INSERT (creación)
CREATE POLICY "Enable insert for authenticated users"
ON user_statistics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política de UPDATE (actualización)
CREATE POLICY "Enable update for authenticated users"
ON user_statistics
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================
-- 3. VERIFICAR QUE RLS ESTÁ HABILITADO
-- ================================

ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- ================================
-- 4. VERIFICAR POLÍTICAS CREADAS
-- ================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_statistics';

-- ================================
-- 5. CREAR REGISTRO INICIAL PARA USUARIO
-- ================================

-- Ejecutar solo si necesitas crear manualmente el registro inicial
-- Reemplaza 'YOUR_USER_ID' con tu user_id real

-- INSERT INTO user_statistics (
--   user_id,
--   total_articles_studied,
--   total_study_time_minutes,
--   current_streak_days,
--   max_streak_days,
--   total_exams_taken,
--   total_questions_answered,
--   total_correct_answers,
--   total_incorrect_answers,
--   best_exam_score,
--   average_exam_score,
--   titles_progress,
--   achievements,
--   total_xp,
--   current_level
-- ) VALUES (
--   'YOUR_USER_ID'::uuid,
--   0, 0, 0, 0, 0, 0, 0, 0, 0.00, 0.00,
--   '{}'::jsonb,
--   '[]'::jsonb,
--   0, 1
-- )
-- ON CONFLICT (user_id) DO NOTHING;
