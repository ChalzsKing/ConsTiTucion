# 🚨 SOLUCIÓN URGENTE - Error 406 en user_statistics

## 📋 **Problema**
La tabla `user_statistics` está devolviendo error **406 (Not Acceptable)** debido a políticas RLS mal configuradas en Supabase.

---

## 🔧 **SOLUCIÓN 1: Arreglar Políticas RLS (RECOMENDADO)**

### **Paso 1: Ir a Supabase Dashboard**
1. Abre https://app.supabase.com
2. Selecciona el proyecto **ConstiMaster**
3. Ve a **SQL Editor** en el menú lateral

### **Paso 2: Ejecutar Script de Corrección**
Copia y pega el siguiente SQL completo:

```sql
-- 🔧 CORREGIR POLÍTICAS RLS - user_statistics

-- 1. ELIMINAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Users can view their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can insert their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Users can update their own statistics" ON user_statistics;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_statistics;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_statistics;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON user_statistics;

-- 2. DESHABILITAR RLS TEMPORALMENTE (para testing)
ALTER TABLE user_statistics DISABLE ROW LEVEL SECURITY;

-- 3. CREAR POLÍTICAS PERMISIVAS
CREATE POLICY "Allow all for authenticated users"
ON user_statistics
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. HABILITAR RLS DE NUEVO
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'user_statistics';
```

### **Paso 3: Hacer lo mismo para las otras tablas**

```sql
-- ARREGLAR exam_history
DROP POLICY IF EXISTS "Users can view their own exam history" ON exam_history;
DROP POLICY IF EXISTS "Users can insert their own exam history" ON exam_history;

ALTER TABLE exam_history DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
ON exam_history
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE exam_history ENABLE ROW LEVEL SECURITY;

-- ARREGLAR user_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON user_progress;

ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
ON user_progress
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- ARREGLAR daily_activity
DROP POLICY IF EXISTS "Users can view their own daily activity" ON daily_activity;
DROP POLICY IF EXISTS "Users can insert their own daily activity" ON daily_activity;
DROP POLICY IF EXISTS "Users can update their own daily activity" ON daily_activity;

ALTER TABLE daily_activity DISABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
ON daily_activity
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
```

---

## 🔧 **SOLUCIÓN 2: Deshabilitar RLS Completamente (SOLO PARA TESTING)**

Si quieres desactivar RLS temporalmente para continuar el testing:

```sql
-- DESHABILITAR RLS EN TODAS LAS TABLAS (SOLO PARA DESARROLLO)
ALTER TABLE user_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity DISABLE ROW LEVEL SECURITY;
```

⚠️ **IMPORTANTE**: Esta solución **NO ES SEGURA** para producción. Solo úsala para testing local.

---

## 🔧 **SOLUCIÓN 3: Verificar User ID**

Es posible que el `user_id` no se esté pasando correctamente. Verifica tu UUID:

```sql
-- Ver tu user_id desde Supabase
SELECT id, email FROM auth.users;

-- Crear registro manual para tu usuario (REEMPLAZA EL UUID)
INSERT INTO user_statistics (
  user_id,
  total_articles_studied,
  total_study_time_minutes,
  current_streak_days,
  max_streak_days,
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
  '74678d1b-217f-4c24-a698-d266b7f22a0f'::uuid, -- TU USER_ID AQUÍ
  0, 0, 0, 0, 0, 0, 0, 0, 0.00, 0.00,
  '{}'::jsonb,
  '[]'::jsonb,
  0, 1
)
ON CONFLICT (user_id) DO NOTHING;
```

---

## ✅ **DESPUÉS DE APLICAR LA SOLUCIÓN**

1. Recarga la aplicación en **http://localhost:3001**
2. Limpia la caché del navegador (Ctrl + Shift + R)
3. Vuelve a iniciar sesión
4. Verifica que no aparece el error 406

---

## 🔍 **VERIFICAR QUE FUNCIONÓ**

En la consola del navegador, deberías ver:
- ✅ Sin errores 406
- ✅ Datos cargando correctamente
- ✅ Dashboard de estadísticas funcionando

---

**Ejecuta la SOLUCIÓN 1 en Supabase SQL Editor AHORA y reporta el resultado.** 🚀
