// 🔄 MIGRACIÓN FRONTEND - ConstiMaster
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
    article_title: `Artículo ${article.articleNumber}`,
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
migrateLocalStorageToSupabase();