# Plan de Integración Supabase - ConstitMaster

**Fecha:** 2025-01-21
**Estado:** En ejecución
**Objetivo:** Conectar la aplicación con la base de datos de Supabase migrada

## 📊 Estado Actual

### ✅ Completado
- Migración de 385 preguntas a Supabase
- Base de datos limpia y operativa
- Sistema de exámenes básico funcionando
- Backup de datos realizados

### ❌ Problemas Identificados
- Aplicación usa datos estáticos en `constitution-data.ts`
- Sistema de preguntas separado en `questions-data.ts`
- Progreso guardado solo en localStorage
- Cursos no se desbloquean automáticamente
- No hay conexión entre frontend y Supabase

## 🎯 Plan de Integración

### Fase 1: Conectar Sistema de Preguntas a Supabase
**Estado:** 🔄 Pendiente
**Prioridad:** Alta

**Acciones:**
- [ ] Modificar `study-flow.tsx` para usar `generateArticleExam()`
- [ ] Reemplazar `getQuestionForArticle()` con consultas Supabase
- [ ] Adaptar formato de preguntas al nuevo schema
- [ ] Testear consultas por artículo específico

**Archivos afectados:**
- `components/study-flow.tsx`
- `lib/questions-data.ts` (deprecar)
- `lib/supabase-exam-system.ts`

### Fase 2: Adaptar Componentes para Usar Datos de Supabase
**Estado:** 🔄 Pendiente
**Prioridad:** Alta

**Acciones:**
- [ ] Modificar componentes de examen para usar nuevo formato
- [ ] Actualizar interfaces de TypeScript
- [ ] Implementar loading states para consultas async
- [ ] Manejar errores de conexión a Supabase

**Archivos afectados:**
- `components/exam-view.tsx`
- `components/articulos-view.tsx`
- `types/` (crear nuevos tipos)

### Fase 3: Migrar Sistema de Progreso a Supabase
**Estado:** 🔄 Pendiente
**Prioridad:** Media

**Acciones:**
- [ ] Crear tabla `user_progress` en Supabase
- [ ] Migrar datos de localStorage a Supabase
- [ ] Implementar sistema de autenticación básico
- [ ] Sincronizar progreso en tiempo real

**Archivos afectados:**
- `lib/storage.ts`
- `lib/constitution-data.ts`
- Nuevos: `lib/user-progress.ts`, `lib/auth.ts`

### Fase 4: Probar Desbloqueo de Cursos
**Estado:** 🔄 Pendiente
**Prioridad:** Alta

**Acciones:**
- [ ] Implementar lógica de desbloqueo basada en progreso Supabase
- [ ] Testear secuencia completa: estudiar → pregunta → desbloqueo
- [ ] Verificar que cursos se muestran correctamente
- [ ] Ajustar UI para reflejar estado real

**Archivos afectados:**
- `components/study-flow.tsx`
- `lib/constitution-data.ts`
- `components/dashboard.tsx`

### Fase 5: Verificar Funcionamiento Completo
**Estado:** 🔄 Pendiente
**Prioridad:** Alta

**Acciones:**
- [ ] Test end-to-end de flujo completo
- [ ] Verificar estadísticas y progreso
- [ ] Comprobar rendimiento de consultas
- [ ] Documentar cambios y nuevas funcionalidades

## 🔧 Consideraciones Técnicas

### Schema de Base de Datos
```sql
-- Tablas existentes
questions (id, original_number, question_text, option_a, option_b, option_c, option_d, correct_answer)
question_articles (question_id, title_id, article_number)

-- Nuevas tablas propuestas
user_progress (user_id, article_id, completed, attempts, correct_answers, last_studied)
user_sessions (id, user_id, created_at, device_info)
```

### Cambios en el Frontend
- Migrar de datos síncronos a asíncronos
- Implementar loading states
- Manejar errores de red
- Optimizar consultas para rendimiento

### Compatibilidad
- Mantener backward compatibility durante transición
- Migrar gradualmente usuarios existentes
- Fallback a datos locales si Supabase falla

## 📈 Criterios de Éxito

- [ ] Usuario puede estudiar artículos con preguntas de Supabase
- [ ] Cursos se desbloquean automáticamente tras completar preguntas
- [ ] Progreso se guarda y sincroniza correctamente
- [ ] Estadísticas reflejan actividad real del usuario
- [ ] Sistema funciona sin errores críticos

## 🚨 Riesgos y Mitigaciones

**Riesgo:** Pérdida de progreso de usuarios existentes
**Mitigación:** Script de migración de localStorage a Supabase

**Riesgo:** Degradación de rendimiento por consultas
**Mitigación:** Implementar caché y optimizar consultas

**Riesgo:** Fallos de conexión a Supabase
**Mitigación:** Sistema de fallback a datos locales

## 📝 Notas de Implementación

- Usar React Query para gestión de estado async
- Implementar sistema de caché inteligente
- Considerar modo offline para funcionalidad básica
- Monitorear usage de Supabase para optimizar costos

---

**Próximos pasos:** Comenzar con Fase 1 - Conectar sistema de preguntas