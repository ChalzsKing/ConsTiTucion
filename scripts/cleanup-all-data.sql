-- 🧹 LIMPIAR TODOS LOS DATOS - ConstiMaster
-- Este script elimina TODOS los datos de progreso para empezar limpio

BEGIN;

-- Temporalmente deshabilitar RLS
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity DISABLE ROW LEVEL SECURITY;

-- 1. ELIMINAR TODOS LOS DATOS DE TU USUARIO
DELETE FROM daily_activity WHERE user_id = '91e35f2e-cb9b-4424-988e-d0395ecc0690';
DELETE FROM user_statistics WHERE user_id = '91e35f2e-cb9b-4424-988e-d0395ecc0690';
DELETE FROM user_progress WHERE user_id = '91e35f2e-cb9b-4424-988e-d0395ecc0690';

-- Re-habilitar RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verificar que está limpio
SELECT 'user_progress' as tabla, COUNT(*) as registros
FROM user_progress
WHERE user_id = '91e35f2e-cb9b-4424-988e-d0395ecc0690';

SELECT 'user_statistics' as tabla, COUNT(*) as registros
FROM user_statistics
WHERE user_id = '91e35f2e-cb9b-4424-988e-d0395ecc0690';

SELECT 'daily_activity' as tabla, COUNT(*) as registros
FROM daily_activity
WHERE user_id = '91e35f2e-cb9b-4424-988e-d0395ecc0690';