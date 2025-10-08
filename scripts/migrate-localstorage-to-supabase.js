const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * 🔄 SCRIPT DE MIGRACIÓN: localStorage → Supabase
 *
 * Este script migra todos los datos de localStorage a Supabase
 * para tener una única fuente de verdad.
 */

async function migrateLocalStorageToSupabase() {
  console.log('🔄 Iniciando migración de localStorage a Supabase...\n')

  // IMPORTANTE: Cambia este userId por el tuyo (lo viste en la consola)
  const userId = '74678d1b-217f-4c24-a698-d266b7f22a0f'
  console.log(`👤 Usuario objetivo: ${userId}\n`)

  // ================================
  // PASO 1: DATOS DE LOCALSTORAGE (REALES DEL USUARIO)
  // ================================

  const localStorageProgress = {"articles":{"1":{"articleNumber":1,"completed":true,"studyTimeSeconds":18,"timesStudied":3,"lastStudiedAt":"2025-09-30T17:30:21.028Z","completedAt":"2025-09-27T18:55:28.127Z"},"2":{"articleNumber":2,"completed":false,"studyTimeSeconds":1,"timesStudied":1,"lastStudiedAt":"2025-09-30T17:21:47.478Z"},"3":{"articleNumber":3,"completed":true,"studyTimeSeconds":13,"timesStudied":2,"lastStudiedAt":"2025-09-30T17:30:41.877Z","completedAt":"2025-09-30T17:30:41.877Z"},"4":{"articleNumber":4,"completed":false,"studyTimeSeconds":1,"timesStudied":1,"lastStudiedAt":"2025-09-30T17:30:46.268Z"},"11":{"articleNumber":11,"completed":true,"studyTimeSeconds":16,"timesStudied":5,"lastStudiedAt":"2025-09-30T17:22:10.638Z","completedAt":"2025-09-30T17:21:46.143Z"},"31":{"articleNumber":31,"completed":false,"studyTimeSeconds":0,"timesStudied":1,"lastStudiedAt":"2025-09-30T17:22:48.533Z"},"159":{"articleNumber":159,"completed":true,"studyTimeSeconds":423,"timesStudied":3,"lastStudiedAt":"2025-09-30T17:22:48.533Z","completedAt":"2025-09-30T17:22:48.533Z"}},"totalStudyTime":473,"totalArticlesStudied":4,"studyStreak":1}

  const constitutionStudyItems = [{"id":"unit_2","type":"studyUnit","articleKey":"2","questionIds":[1,14,896],"easeFactor":2.5,"repetitions":0,"interval":1,"nextReviewDate":"2025-09-19T15:41:31.930Z","totalReviews":0,"created":"2025-09-19T15:41:31.930Z"},{"id":"unit_1.1","type":"studyUnit","articleKey":"1.1","questionIds":[2,24],"easeFactor":2.5,"repetitions":0,"interval":1,"nextReviewDate":"2025-09-19T15:41:31.930Z","totalReviews":0,"created":"2025-09-19T15:41:31.930Z"},{"id":"unit_1.2","type":"studyUnit","articleKey":"1.2","questionIds":[9],"easeFactor":2.5,"repetitions":0,"interval":1,"nextReviewDate":"2025-09-19T15:41:31.930Z","totalReviews":0,"created":"2025-09-19T15:41:31.930Z"},{"id":"unit_1.3","type":"studyUnit","articleKey":"1.3","questionIds":[10],"easeFactor":2.5,"repetitions":0,"interval":1,"nextReviewDate":"2025-09-19T15:41:31.930Z","totalReviews":0,"created":"2025-09-19T15:41:31.930Z"}]

  const examResults = [{"type":"general","questions":[{"id":42,"question":"Del derecho de asilo en España:","options":["Sólo podrán gozar los ciudadanos de otros países.","Sólo podrán gozar los apátridas.","Podrán gozar del mismo los ciudadanos españoles perseguidos en otros países.","Se disfrutará por sus beneficiarios en los términos establecidos en la Ley."],"correctAnswer":3,"articleNumber":14,"titleId":"titulo1","userAnswer":0,"isCorrect":false},{"id":48,"question":"La labor que la Constitución asigna a los poderes públicos respecto a los ciudadanos disminuidos:","options":["No impone a los poderes públicos una función de amparo especial de los disminuidos para el disfrute de sus derechos.","Se limita a los que lo sean por causas físicas, y tiendo únicamente a realizar una política de previsión y tratamiento.","Abarca sólo a los disminuidos físicos y sensoriales, debiendo ser realizada una política no exclusivamente de prevención y tratamiento, sino, además, de rehabilitación e integración.","Las políticas orientadas a los disminuidos físicos y sensoriales, también irán dirigidas a los disminuidos psíquicos."],"correctAnswer":3,"articleNumber":20,"titleId":"titulo1","userAnswer":0,"isCorrect":false},{"id":26,"question":"Los partidos políticos:","options":["Concurren a la formación de la voluntad institucional.","Expresan el pluralismo ideológico en todos los campos.","Son instrumento fundamental para la participación política.","Participan en la manifestación de la voluntad de las agrupaciones políticas."],"correctAnswer":2,"articleNumber":6,"titleId":"preliminar","userAnswer":0,"isCorrect":false},{"id":53,"question":"Sólo uno de los siguientes derechos podrá ser suspendido en caso de se acuerde la declaración de estado de excepción o de sitio:","options":["Derecho de huelga.","Derecho de petición colectiva.","Derecho a obtener la tutela efectiva de Jueces y Tribunales.","Derecho de creación de centros docentes."],"correctAnswer":0,"articleNumber":55,"titleId":"titulo1","userAnswer":0,"isCorrect":true},{"id":51,"question":"El derecho a participar en los asuntos públicos:","options":["Podrá corresponder a los ciudadanos extranjeros, tanto para el sufragio activo como para el pasivo en las elecciones municipales.","Sólo corresponde a los ciudadanos españoles.","Podrá corresponder a los ciudadanos extranjeros, pero sólo para el derecho de sufragio activo en las elecciones municipales.","Nunca puede corresponder a los extranjeros."],"correctAnswer":0,"articleNumber":13,"titleId":"titulo1","userAnswer":1,"isCorrect":false},{"id":55,"question":"La Administración:","options":["Podrá poner sanciones que, subsidiariamente, impliquen privación de libertad.","No podrá imponer sanciones privativas de documentos oficiales.","No podrá imponer sanciones pecuniarias.","No podrá poner sanciones que directamente impliquen privación de libertad."],"correctAnswer":3,"articleNumber":25,"titleId":"titulo1","userAnswer":1,"isCorrect":false},{"id":22,"question":"La bandera de España está formada por tres franjas, roja, amarilla y roja:","options":["Verticalmente colocadas, siendo la amarilla de doble anchura que cada una de las rojas.","Horizontalmente colocadas, siendo la roja de doble anchura que cada una de las amarillas.","Horizontalmente colocadas, siendo las tres franjas de igual anchura.","Horizontalmente colocadas, siendo la amarilla de doble anchura que cada una de las rojas."],"correctAnswer":3,"articleNumber":4,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":27,"question":"Corresponde a los poderes públicos:","options":["Afianzar los obstáculos que impidan un equivocado o desmesurado empleo de la libertad individual.","Regular los cauces necesarios para alcanzar el disfrute por los ciudadanos de una seguridad plena.","Facilitar la participación de los ciudadanos en la vida cultural y social.","Facilitar la participación de los ciudadanos con capacidad en la vida política."],"correctAnswer":2,"articleNumber":41,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":7,"question":"Las Fuerzas Armadas están constituidas por:","options":["El Ejército de Tierra, con el apoyo logístico de la Armada y del Ejército del Aire.","La Junta de Jefes de Estado Mayor.","El Ejército de Tierra, la Armada y el Ejército del Aire.","El Ejército de Tierra, la Armada, el Ejército del Aire, y el conjunto de cuerpos y fuerzas de Seguridad del Estado."],"correctAnswer":2,"articleNumber":8,"titleId":"preliminar","userAnswer":0,"isCorrect":false},{"id":32,"question":"El Defensor del Pueblo:","options":["Es designado por el Congreso de los Diputados, dando cuenta de su actividad al Rey.","Es designado por las Cortes Generales, a las que dará cuenta.","Es designado por el Gobierno de la Nación, al que dará cuenta.","Es designado por el Rey, dando cuenta de su actividad a las Cortes Generales."],"correctAnswer":1,"articleNumber":54,"titleId":"titulo1","userAnswer":0,"isCorrect":false},{"id":45,"question":"Sólo uno de los siguientes derechos podrá ser suspendido de forma individual en los casos previstos:","options":["Todas las otras respuestas son falsas.","Derecho a no permanecer preventivamente detenido por un plazo superior a las setenta y dos horas.","Derecho a ser asistido por Abogado en las diligencias policiales y judiciales.","Derecho a la seguridad."],"correctAnswer":1,"articleNumber":55,"titleId":"titulo1","userAnswer":0,"isCorrect":false},{"id":87,"question":"¿Qué artículo de la Constitución recoge el derecho y el deber de trabajar?","options":["El artículo 33.","El artículo 39.","El artículo 37.","El artículo 35."],"correctAnswer":3,"articleNumber":23,"titleId":"titulo1","userAnswer":2,"isCorrect":false},{"id":14,"question":"Respecto a las nacionalidades y regiones que integran a la Nación Española, la Constitución les reconoce y garantiza:","options":["El derecho a la solidaridad entre ellas, pero no el derecho a la autonomía políticamente entendida.","El Derecho a su libre federación o confederación.","El Derecho a la libre autodeterminación.","El derecho a la autonomía."],"correctAnswer":3,"articleNumber":2,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":1,"question":"La Constitución se fundamenta:","options":["En la unidad de la Nación Española.","En el compromiso de unidad de todos los pueblos y nacionalidades integrantes de la Nación Española.","En la indisoluble unidad de la Nación Española.","En la pluralidad de pueblos integrantes de la Nación Española."],"correctAnswer":2,"articleNumber":2,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":24,"question":"Según la Constitución Española, nuestro país se ha constituido:","options":["En una Monarquía democrática de Derecho.","En un Estado social y democrático de Derecho.","En una Nación socialdemocrática de Derecho.","En un Estado respetuoso del Derecho y de la Democracia."],"correctAnswer":1,"articleNumber":1,"titleId":"preliminar","userAnswer":1,"isCorrect":true},{"id":3,"question":"Sólo uno de los siguientes principios está garantizado constitucionalmente:","options":["La responsabilidad e interdicción de la arbitrariedad de la Administración Pública, tanto nacional, como autonómica o local.","La responsabilidad de la Administración Pública.","La interdicción de la arbitrariedad del poder judicial.","La responsabilidad e interdicción de la arbitrariedad de los poderes públicos."],"correctAnswer":3,"articleNumber":9,"titleId":"preliminar","userAnswer":1,"isCorrect":false},{"id":47,"question":"¿Cuál es el origen de la figura del Defensor del Pueblo?","options":["Los tribunales consuetudinarios.","El Ombudsman.","Los Tribunales de Honor.","Los jurados populares."],"correctAnswer":1,"articleNumber":54,"titleId":"titulo1","userAnswer":1,"isCorrect":true},{"id":34,"question":"El derecho a sindicarse libremente:","options":["El ejercicio de tal derecho por parte de los funcionarios no presenta peculiaridad alguna.","Lo tienen todos los trabajadores.","Podrá ser limitado, o exceptuado, a las Fuerzas Armadas.","No podrá ser restringido su ejercicio a otros cuerpos aunque estén sometidos a la disciplina militar."],"correctAnswer":2,"articleNumber":28,"titleId":"titulo1","userAnswer":1,"isCorrect":false},{"id":58,"question":"El condenado a pena de prisión que estuviere cumpliendo condena:","options":["Gozará de cuantos derechos fundamentales reconoce la Constitución, a excepción de los que se vean expresamente limitados por el contenido del fallo condenatorio, el sentido de la pena y la Ley penitenciaria.","La Ley penitenciaria no contiene limitación alguna al ejercicio de los derechos fundamentales por el condenado que cumple pena privativa de libertad.","Gozará de cuantos derechos fundamentales reconoce la Constitución a excepción del que le permite fijar su residencia en cualquier parte del Estado, y entrar o salir del mismo libremente.","No gozará de ninguno de los derechos fundamentales reconocidos en la Constitución."],"correctAnswer":0,"articleNumber":33,"titleId":"titulo1","userAnswer":1,"isCorrect":false},{"id":9,"question":"Las demás lenguas de las respectivas Comunidades Autónomas:","options":["Serán las únicas lenguas oficiales en las respectivas comunidades de acuerdo con sus Estatutos.","Deben ser conocidas y empleadas por todos los españoles que residan o visiten la comunidad autónoma afectada.","Serán también oficiales en las respectivas comunidades autónomas de acuerdo con sus Estatutos.","Son oficiales también el resto del Estado."],"correctAnswer":2,"articleNumber":3,"titleId":"preliminar","userAnswer":1,"isCorrect":false}],"score":3,"totalQuestions":20,"percentage":15,"timeSpent":35,"id":"exam-1758750436137-8cngc6rag","completedAt":"2025-09-24T21:47:16.137Z"}]

  console.log('📦 Datos a migrar:')
  console.log(`   - Artículos: ${localStorageProgress.totalArticlesStudied}`)
  console.log(`   - Tiempo de estudio: ${localStorageProgress.totalStudyTime} minutos`)
  console.log(`   - Exámenes: ${examResults.length}`)
  console.log(`   - Study items: ${constitutionStudyItems.length}\n`)

  // ================================
  // PASO 2: MIGRAR PROGRESO DE ARTÍCULOS
  // ================================

  console.log('📚 Migrando progreso de artículos...')

  if (localStorageProgress.articles && Object.keys(localStorageProgress.articles).length > 0) {
    const articlesToMigrate = []

    for (const [articleKey, articleData] of Object.entries(localStorageProgress.articles)) {
      const articleNumber = parseInt(articleKey)

      // Determinar el titleId basado en el número de artículo
      let titleId = 'preliminar'
      if (articleNumber >= 10 && articleNumber <= 55) titleId = 'titulo1'
      else if (articleNumber >= 56 && articleNumber <= 65) titleId = 'titulo2'
      else if (articleNumber >= 66 && articleNumber <= 96) titleId = 'titulo3'
      else if (articleNumber >= 97 && articleNumber <= 107) titleId = 'titulo4'
      else if (articleNumber >= 108 && articleNumber <= 116) titleId = 'titulo5'
      else if (articleNumber >= 117 && articleNumber <= 127) titleId = 'titulo6'
      else if (articleNumber >= 128 && articleNumber <= 136) titleId = 'titulo7'
      else if (articleNumber >= 137 && articleNumber <= 158) titleId = 'titulo8'
      else if (articleNumber >= 159) titleId = 'disposiciones'

      articlesToMigrate.push({
        user_id: userId,
        article_number: articleNumber,
        title_id: titleId,
        is_completed: articleData.completed || false,
        times_studied: articleData.timesStudied || 1,
        total_study_time_seconds: articleData.studyTime || 0,
        last_studied_at: articleData.lastStudied || new Date().toISOString(),
        completed_at: articleData.completed ? (articleData.completedAt || new Date().toISOString()) : null
      })
    }

    if (articlesToMigrate.length > 0) {
      const { error } = await supabase
        .from('user_progress')
        .upsert(articlesToMigrate, {
          onConflict: 'user_id,article_number'
        })

      if (error) {
        console.error('❌ Error migrando artículos:', error)
      } else {
        console.log(`✅ Migrados ${articlesToMigrate.length} artículos a user_progress`)
      }
    }
  }

  // ================================
  // PASO 3: MIGRAR constitutionStudyItems
  // ================================

  console.log('\n📖 Migrando constitutionStudyItems...')

  if (constitutionStudyItems.length > 0) {
    const itemsToMigrate = []

    for (const item of constitutionStudyItems) {
      if (item.articleNumber) {
        let titleId = 'preliminar'
        const articleNumber = item.articleNumber

        if (articleNumber >= 10 && articleNumber <= 55) titleId = 'titulo1'
        else if (articleNumber >= 56 && articleNumber <= 65) titleId = 'titulo2'
        else if (articleNumber >= 66 && articleNumber <= 96) titleId = 'titulo3'
        else if (articleNumber >= 97 && articleNumber <= 107) titleId = 'titulo4'
        else if (articleNumber >= 108 && articleNumber <= 116) titleId = 'titulo5'
        else if (articleNumber >= 117 && articleNumber <= 127) titleId = 'titulo6'
        else if (articleNumber >= 128 && articleNumber <= 136) titleId = 'titulo7'
        else if (articleNumber >= 137 && articleNumber <= 158) titleId = 'titulo8'
        else if (articleNumber >= 159) titleId = 'disposiciones'

        itemsToMigrate.push({
          user_id: userId,
          article_number: articleNumber,
          title_id: titleId,
          is_completed: item.completed || false,
          times_studied: item.timesRead || 1,
          total_study_time_seconds: item.timeSpent || 0,
          last_studied_at: item.lastRead || new Date().toISOString(),
          completed_at: item.completed ? new Date().toISOString() : null
        })
      }
    }

    if (itemsToMigrate.length > 0) {
      const { error } = await supabase
        .from('user_progress')
        .upsert(itemsToMigrate, {
          onConflict: 'user_id,article_number'
        })

      if (error) {
        console.error('❌ Error migrando study items:', error)
      } else {
        console.log(`✅ Migrados ${itemsToMigrate.length} study items a user_progress`)
      }
    }
  }

  // ================================
  // PASO 4: MIGRAR EXÁMENES
  // ================================

  console.log('\n📝 Migrando historial de exámenes...')

  if (examResults.length > 0) {
    const examsToMigrate = examResults.map(exam => ({
      user_id: userId,
      exam_type: exam.examType || 'general',
      exam_identifier: exam.titleId || null,
      title_name: exam.titleName || null,
      total_questions: exam.totalQuestions || 10,
      correct_answers: exam.correctAnswers || 0,
      incorrect_answers: (exam.totalQuestions || 10) - (exam.correctAnswers || 0),
      score_percentage: exam.scorePercentage || 0,
      time_taken_seconds: exam.timeTaken || null,
      questions_data: exam.questions || null,
      completed_at: exam.completedAt || new Date().toISOString()
    }))

    const { error } = await supabase
      .from('exam_history')
      .insert(examsToMigrate)

    if (error) {
      console.error('❌ Error migrando exámenes:', error)
    } else {
      console.log(`✅ Migrados ${examsToMigrate.length} exámenes a exam_history`)
    }
  }

  // ================================
  // PASO 5: ACTUALIZAR user_statistics
  // ================================

  console.log('\n📊 Actualizando user_statistics...')

  const completedArticles = Object.values(localStorageProgress.articles || {})
    .filter(a => a.completed).length

  const statsData = {
    user_id: userId,
    total_articles_studied: completedArticles,
    total_study_time_minutes: localStorageProgress.totalStudyTime || 0,
    current_streak_days: localStorageProgress.studyStreak || 0,
    max_streak_days: localStorageProgress.studyStreak || 0,
    last_study_date: new Date().toISOString().split('T')[0],
    total_exams_taken: examResults.length,
    total_questions_answered: examResults.reduce((sum, e) => sum + (e.totalQuestions || 0), 0),
    total_correct_answers: examResults.reduce((sum, e) => sum + (e.correctAnswers || 0), 0),
    total_incorrect_answers: examResults.reduce((sum, e) => sum + ((e.totalQuestions || 0) - (e.correctAnswers || 0)), 0),
    best_exam_score: examResults.length > 0 ? Math.max(...examResults.map(e => e.scorePercentage || 0)) : 0,
    average_exam_score: examResults.length > 0
      ? examResults.reduce((sum, e) => sum + (e.scorePercentage || 0), 0) / examResults.length
      : 0,
    titles_progress: {},
    achievements: [],
    total_xp: completedArticles * 50,
    current_level: 1
  }

  const { error: statsError } = await supabase
    .from('user_statistics')
    .upsert(statsData, {
      onConflict: 'user_id'
    })

  if (statsError) {
    console.error('❌ Error actualizando estadísticas:', statsError)
  } else {
    console.log('✅ Estadísticas actualizadas correctamente')
  }

  // ================================
  // RESUMEN FINAL
  // ================================

  console.log('\n' + '='.repeat(50))
  console.log('✅ MIGRACIÓN COMPLETADA')
  console.log('='.repeat(50))
  console.log(`📚 Artículos migrados: ${completedArticles}`)
  console.log(`📝 Exámenes migrados: ${examResults.length}`)
  console.log(`⏱️ Tiempo de estudio: ${localStorageProgress.totalStudyTime} min`)
  console.log(`\n💡 PRÓXIMO PASO: Recarga la página en el navegador`)
  console.log('   Los datos ahora deberían mostrarse desde Supabase')
}

migrateLocalStorageToSupabase().catch(console.error)
