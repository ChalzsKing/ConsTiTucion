#!/usr/bin/env node

/**
 * 🔄 MIGRACIÓN CON AUTENTICACIÓN - ConstiMaster
 *
 * Este script asume que tienes un usuario autenticado
 * o que temporalmente deshabilitas RLS
 */

const fs = require('fs')
const path = require('path')

console.log('🔄 MIGRACIÓN SIMPLIFICADA - ConstiMaster')
console.log('=' .repeat(60))

// ================================
// GENERAR SQL PARA MIGRACIÓN MANUAL
// ================================

function generateMigrationSQL() {
  console.log('\n📝 GENERANDO SQL DE MIGRACIÓN...')

  // Datos de prueba que simularían localStorage
  const sampleData = {
    userId: 'demo-user-123',
    articles: [
      { number: 1, titleId: 'preliminar', completed: true, studyTime: 120 },
      { number: 10, titleId: 'titulo1', completed: true, studyTime: 180 },
      { number: 15, titleId: 'titulo1', completed: true, studyTime: 240 },
      { number: 27, titleId: 'titulo1', completed: true, studyTime: 300 },
      { number: 32, titleId: 'titulo1', completed: true, studyTime: 200 }
    ]
  }

  const today = new Date().toISOString().split('T')[0]

  let sql = `-- 🚀 MIGRACIÓN DE DATOS CONSTIMASTER
-- Generado: ${new Date().toISOString()}
-- Propósito: Migrar datos de localStorage a Supabase

-- IMPORTANTE: Ejecutar este SQL en Supabase SQL Editor
-- con un usuario que tenga permisos de admin

BEGIN;

-- Temporalmente deshabilitar RLS para migración
ALTER TABLE user_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity DISABLE ROW LEVEL SECURITY;

`

  // 1. Insertar progreso de artículos
  sql += `
-- 1. MIGRAR PROGRESO DE ARTÍCULOS
`

  sampleData.articles.forEach(article => {
    sql += `INSERT INTO user_progress (
  user_id, article_number, title_id, article_title,
  is_completed, times_studied, total_study_time_seconds,
  first_studied_at, last_studied_at, completed_at
) VALUES (
  '${sampleData.userId}',
  ${article.number},
  '${article.titleId}',
  'Artículo ${article.number}',
  ${article.completed},
  1,
  ${article.studyTime},
  NOW() - INTERVAL '${Math.floor(Math.random() * 5)} days',
  NOW() - INTERVAL '${Math.floor(Math.random() * 2)} days',
  ${article.completed ? "NOW() - INTERVAL '1 day'" : 'NULL'}
)
ON CONFLICT (user_id, article_number)
DO UPDATE SET
  is_completed = EXCLUDED.is_completed,
  total_study_time_seconds = EXCLUDED.total_study_time_seconds,
  times_studied = EXCLUDED.times_studied;

`
  })

  // 2. Calcular y actualizar estadísticas
  const totalArticles = sampleData.articles.length
  const totalStudyTime = sampleData.articles.reduce((sum, art) => sum + art.studyTime, 0)
  const totalMinutes = Math.floor(totalStudyTime / 60)

  sql += `
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
  '${sampleData.userId}',
  ${totalArticles},
  ${totalMinutes},
  1,
  1,
  '${today}',
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

`

  // 3. Actualizar actividad diaria
  sql += `
-- 3. ACTUALIZAR ACTIVIDAD DIARIA
INSERT INTO daily_activity (
  user_id,
  activity_date,
  articles_studied,
  study_time_minutes,
  xp_earned
) VALUES (
  '${sampleData.userId}',
  '${today}',
  ${totalArticles},
  ${totalMinutes},
  ${totalArticles * 10}
)
ON CONFLICT (user_id, activity_date)
DO UPDATE SET
  articles_studied = EXCLUDED.articles_studied,
  study_time_minutes = EXCLUDED.study_time_minutes,
  xp_earned = EXCLUDED.xp_earned;

`

  // 4. Re-habilitar RLS
  sql += `
-- 4. RE-HABILITAR RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;

COMMIT;

-- 📊 VERIFICACIÓN POST-MIGRACIÓN
-- Ejecutar estas queries para verificar datos:

SELECT 'user_progress' as tabla, COUNT(*) as registros
FROM user_progress
WHERE user_id = '${sampleData.userId}';

SELECT 'user_statistics' as tabla, total_articles_studied, total_study_time_minutes
FROM user_statistics
WHERE user_id = '${sampleData.userId}';

SELECT 'daily_activity' as tabla, articles_studied, study_time_minutes
FROM daily_activity
WHERE user_id = '${sampleData.userId}' AND activity_date = '${today}';
`

  return sql
}

// ================================
// GENERAR JAVASCRIPT PARA FRONTEND
// ================================

function generateFrontendMigration() {
  console.log('\n⚛️ GENERANDO CÓDIGO PARA FRONTEND...')

  const code = `// 🔄 MIGRACIÓN FRONTEND - ConstiMaster
// Ejecutar este código en la consola del navegador (F12)
// cuando estés logueado en la aplicación

async function migrateLocalStorageToSupabase() {
  console.log('🚀 Iniciando migración localStorage → Supabase...');

  // 1. Obtener datos de localStorage
  const localData = localStorage.getItem('constimaster-user-progress');
  if (!localData) {
    console.log('❌ No se encontraron datos en localStorage');
    return;
  }

  const progress = JSON.parse(localData);
  const articles = progress.articles || {};

  console.log('📊 Datos encontrados:', Object.keys(articles).length, 'artículos');

  // 2. Verificar que estamos autenticados
  if (!window.supabase) {
    console.log('❌ Supabase no disponible');
    return;
  }

  const { data: { user } } = await window.supabase.auth.getUser();
  if (!user) {
    console.log('❌ Usuario no autenticado');
    return;
  }

  console.log('✅ Usuario autenticado:', user.id);

  // 3. Migrar artículos a user_progress
  const articleEntries = Object.values(articles);
  const progressRecords = articleEntries.map(article => ({
    user_id: user.id,
    article_number: article.articleNumber,
    title_id: article.titleId || 'titulo1',
    article_title: \`Artículo \${article.articleNumber}\`,
    is_completed: article.completed || false,
    times_studied: article.timesStudied || 1,
    total_study_time_seconds: article.studyTimeSeconds || 0,
    first_studied_at: article.completedAt || new Date().toISOString(),
    last_studied_at: article.lastStudiedAt || new Date().toISOString(),
    completed_at: article.completed ? (article.completedAt || new Date().toISOString()) : null
  }));

  console.log('📝 Migrando', progressRecords.length, 'artículos...');

  const { data: progressData, error: progressError } = await window.supabase
    .from('user_progress')
    .upsert(progressRecords, {
      onConflict: 'user_id,article_number',
      ignoreDuplicates: false
    });

  if (progressError) {
    console.error('❌ Error migrando progreso:', progressError);
    return;
  }

  console.log('✅ Progreso migrado exitosamente');

  // 4. Actualizar estadísticas
  const completedCount = progressRecords.filter(p => p.is_completed).length;
  const totalStudyTime = progressRecords.reduce((sum, p) => sum + p.total_study_time_seconds, 0);

  const statisticsData = {
    user_id: user.id,
    total_articles_studied: completedCount,
    total_study_time_minutes: Math.floor(totalStudyTime / 60),
    current_streak_days: 1,
    max_streak_days: 1,
    last_study_date: new Date().toISOString().split('T')[0]
  };

  const { data: statsData, error: statsError } = await window.supabase
    .from('user_statistics')
    .upsert(statisticsData, {
      onConflict: 'user_id',
      ignoreDuplicates: false
    });

  if (statsError) {
    console.error('❌ Error actualizando estadísticas:', statsError);
    return;
  }

  console.log('✅ Estadísticas actualizadas');

  // 5. Verificar migración
  const { data: verifyProgress } = await window.supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_completed', true);

  const { data: verifyStats } = await window.supabase
    .from('user_statistics')
    .select('*')
    .eq('user_id', user.id)
    .single();

  console.log('📊 VERIFICACIÓN:');
  console.log('   localStorage:', Object.keys(articles).length, 'artículos');
  console.log('   user_progress:', verifyProgress?.length || 0, 'artículos');
  console.log('   user_statistics:', verifyStats?.total_articles_studied || 0, 'artículos');

  if (Object.keys(articles).length === verifyProgress?.length &&
      verifyProgress?.length === verifyStats?.total_articles_studied) {
    console.log('🎉 MIGRACIÓN EXITOSA - Todos los contadores coinciden');

    // Opcional: hacer backup de localStorage antes de limpiar
    console.log('💾 Guardando backup de localStorage...');
    localStorage.setItem('constimaster-user-progress-backup', localData);
    console.log('✅ Backup guardado en: constimaster-user-progress-backup');

  } else {
    console.log('⚠️ DISCREPANCIAS DETECTADAS - No limpiar localStorage aún');
  }
}

// Ejecutar migración
migrateLocalStorageToSupabase();`

  return code
}

// ================================
// FUNCIÓN PRINCIPAL
// ================================

function main() {
  console.log('🔧 Generando scripts de migración...\n')

  // 1. Generar SQL
  const sqlScript = generateMigrationSQL()
  const sqlPath = path.join(process.cwd(), 'migration-backup', 'migrate-manual.sql')
  fs.writeFileSync(sqlPath, sqlScript)
  console.log('✅ SQL generado:', sqlPath)

  // 2. Generar JavaScript para frontend
  const jsScript = generateFrontendMigration()
  const jsPath = path.join(process.cwd(), 'migration-backup', 'migrate-frontend.js')
  fs.writeFileSync(jsPath, jsScript)
  console.log('✅ JavaScript generado:', jsPath)

  console.log('\n📋 OPCIONES DE MIGRACIÓN:')
  console.log('1. 🗄️  SQL Manual: Ejecutar migrate-manual.sql en Supabase SQL Editor')
  console.log('2. ⚛️  Frontend: Ejecutar migrate-frontend.js en consola del navegador')
  console.log('3. 🔄 Híbrido: Combinar ambos métodos')

  console.log('\n🚀 RECOMENDACIÓN:')
  console.log('Usar opción 2 (Frontend) si tienes usuario autenticado')
  console.log('Usar opción 1 (SQL) para migración masiva o datos de prueba')

  console.log('\n🎯 PRÓXIMO PASO:')
  console.log('Ejecutar la migración elegida y verificar resultados')
}

// Ejecutar
if (require.main === module) {
  main()
}

module.exports = { generateMigrationSQL, generateFrontendMigration }