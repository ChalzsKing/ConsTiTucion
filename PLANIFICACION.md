# Plan de Desarrollo ConstiMaster - Estructura por Acciones y Micrometas

## 📊 Estado Actual del Proyecto

### ✅ **COMPLETADO** (Logros conseguidos)
- [x] **Estructura base de Next.js con TypeScript**
- [x] **Sistema de navegación con sidebar**
- [x] **Contenido completo de la Constitución Española** (artículos 1-169)
- [x] **Componentes UI básicos con Tailwind CSS**
- [x] **Sistema de estados de aplicación** (main, studying, exam, exam-results)
- [x] **Progreso visual en sidebar**
- [x] **Arquitectura de componentes modulares**
- [x] **🎯 BASE DE DATOS SUPABASE COMPLETA** (1593 preguntas)
- [x] **🎯 CONFIGURACIÓN RLS FUNCIONAL**
- [x] **🎯 SISTEMA DE CONSULTAS OPTIMIZADO** (artículos exactos y subdivisiones)
- [x] **🎯 CONEXIÓN FUNCIONAL** con base de datos en producción

### ✅ **COMPLETADO ADICIONAL** (Nuevos logros)
- [x] ✅ **Flujo de estudio de artículos** (navegación completa, breadcrumbs, shortcuts)
- [x] ✅ **Sistema de exámenes** (completo con puntuación y persistencia)
- [x] ✅ **Exámenes por título** (8 títulos disponibles con mapeo completo)
- [x] ✅ **Persistencia de progreso usuario** (localStorage + Supabase sync)
- [x] ✅ **🎯 SISTEMA DE AUTENTICACIÓN COMPLETO** (Google OAuth + Email/Password)
- [x] ✅ **🎯 POLÍTICAS RLS AJUSTADAS** (Acceso público a preguntas, usuarios autenticados)
- [x] ✅ **🎯 PERFILES DE USUARIO** (Gestión completa de datos personales)
- [x] ✅ **🎯 RUTAS PROTEGIDAS** (Middleware automático de autenticación)

### ⚠️ **EN PROGRESO** (Implementación parcial)
- [ ] **Estadísticas y métricas avanzadas** (falta tabla user_statistics en Supabase)

### ❌ **PENDIENTE** (Por implementar)
- [ ] **Sistema freemium y límites de uso**
- [ ] **Gamificación y logros**
- [ ] **Marketing y SEO**
- [ ] **Monetización con Stripe**

---

## 🎯 **HITOS Y MICROMETAS**

### **HITO 1: EXÁMENES FUNCIONALES COMPLETOS** ⚡
**Meta**: Usuario puede hacer examen completo, ver resultados y repaso
**Prioridad**: MÁXIMA

**Acciones requeridas**: **1 tarea restante**
- [x] ✅ Conectar base de datos Supabase
- [x] ✅ Configurar políticas RLS
- [x] ✅ **1.1** Implementar función `calculateScore(answers)` → Calcular puntuación sobre respuestas
- [x] ✅ **1.2** Crear componente `ExamResults` → Pantalla de resultados con puntuación
- [x] ✅ **1.3** Añadir revisión de respuestas → Mostrar correctas/incorrectas con explicaciones
- [x] ✅ **1.4** Implementar exámenes de título → Sistema completo con 8 títulos disponibles (titulo1-titulo8)
- [x] ✅ **1.5** Función `saveExamResult()` → Guardar resultado en localStorage con sistema completo de persistencia
- [x] ✅ **1.6** Navegación post-examen → Botones "Repetir" / "Nuevo examen" / "Estudiar errores"

**Progreso**: 8/8 = 100% ✅ **¡HITO COMPLETADO!**

---

### **HITO 2: PERSISTENCIA TOTAL DE DATOS** 💾
**Meta**: Progreso se guarda automáticamente y persiste entre sesiones
**Prioridad**: ALTA

**Acciones requeridas**: **6 tareas**
- [x] ✅ **2.1** Crear hook `useLocalStorage` → Custom hook para persistencia automática
- [x] ✅ **2.2** Implementar `saveProgress()` → Guardar artículos completados, tiempo estudio
- [x] ✅ **2.3** Implementar `loadProgress()` → Cargar estado completo al iniciar app
- [x] ✅ **2.4** Crear tabla `user_progress` → Schema en Supabase con progreso detallado
- [x] ✅ **2.5** Función sync localStorage ↔ Supabase → Sincronización bidireccional
- [x] ✅ **2.6** Handle offline/online → Detectar conexión y sincronizar automáticamente

**Progreso**: 6/6 = 100% ✅ **¡HITO COMPLETADO!**

---

### **HITO 3: NAVEGACIÓN FLUIDA DE ESTUDIO** 🔄
**Meta**: Usuario navega sin problemas entre artículos manteniendo contexto
**Prioridad**: ALTA

**Acciones requeridas**: **5 tareas**
- [x] ✅ **3.1** Mejorar componente `StudyFlow` → Navegación anterior/siguiente funcional
- [x] ✅ **3.2** Implementar breadcrumbs → "Título I > Artículo 15" navegable
- [x] ✅ **3.3** Barra de progreso en tiempo real → % completado del título/total
- [x] ✅ **3.4** Auto-marcar como completado → Sistema automático por tiempo de estudio
- [x] ✅ **3.5** Keyboard shortcuts → Flechas ←→ para navegar, Espacio para marcar, Esc para volver

**Progreso**: 5/5 = 100% ✅ **¡HITO COMPLETADO!**

---

### **HITO 4: AUTENTICACIÓN COMPLETA** 🔐
**Meta**: Usuario puede crear cuenta, login y tener perfil personalizado
**Prioridad**: MEDIA-ALTA

**Acciones requeridas**: **10 tareas**
- [x] ✅ **4.1** Configurar Supabase Auth → Enable email auth en dashboard
- [x] ✅ **4.2** Crear `AuthContext` → React context para gestión de usuario global
- [x] ✅ **4.3** Componente `LoginForm` → Form de inicio de sesión con validación
- [x] ✅ **4.4** Componente `RegisterForm` → Form de registro con confirmación email
- [x] ✅ **4.5** Componente `PasswordReset` → Recuperar contraseña vía email
- [x] ✅ **4.6** Protected routes → HOC/middleware para rutas que requieren login
- [x] ✅ **4.7** Componente `UserProfile` → Mostrar/editar nombre, avatar, preferencias
- [x] ✅ **4.8** Auth middleware → Verificar JWT token en todas las requests
- [x] ✅ **4.9** Social auth Google → OAuth integration con Google Sign-In
- [x] ✅ **4.10** Logout functionality → Cerrar sesión y limpiar estado

**Progreso**: 10/10 = 100% ✅ **¡HITO COMPLETADO!**

---

### **HITO 5: ESTADÍSTICAS PERSONALES** 📊
**Meta**: Usuario ve gráficos detallados de progreso y rendimiento
**Prioridad**: ALTA (requerido para eliminar errores actuales)

**⚠️ PROBLEMA ACTUAL**: Error `user_statistics table not found` impide sync completo

**Acciones requeridas**: **10 tareas**
- [ ] **5.1** Crear tabla `user_statistics` en Supabase → Schema para métricas de usuario
- [ ] **5.2** Crear tabla `exam_history` → Historial completo de exámenes realizados
- [ ] **5.3** Configurar políticas RLS para nuevas tablas → Acceso seguro por usuario
- [ ] **5.4** Hook `useStatistics` → Obtener y procesar datos del usuario autenticado
- [ ] **5.5** Componente `StatsDashboard` → Panel principal con métricas clave
- [ ] **5.6** Gráfico de progreso temporal → Chart.js con progreso por días/semanas
- [ ] **5.7** Métricas por título constitucional → Rendimiento por sección con colores
- [ ] **5.8** Histórico de exámenes → Lista/tabla de resultados pasados con filtros
- [ ] **5.9** Tracking tiempo de estudio → Cronómetro por artículo y total
- [ ] **5.10** Export de datos → Botones descarga CSV/PDF con estadísticas

**Progreso**: 0/10 = 0% ❌

---

### **HITO 6: GAMIFICACIÓN BÁSICA** 🎮
**Meta**: Usuario obtiene logros, badges y ve progreso gamificado
**Prioridad**: MEDIA

**Acciones requeridas**: **8 tareas**
- [ ] **6.1** Definir sistema de badges → Lista de 20+ logros disponibles
- [ ] **6.2** Hook `useAchievements` → Lógica detectar logros conseguidos
- [ ] **6.3** Componente `BadgeDisplay` → Grid de badges obtenidos/por obtener
- [ ] **6.4** Sistema de XP/puntos → XP por estudio, exámenes, logros
- [ ] **6.5** Racha de días consecutivos → Tracking daily streak de uso
- [ ] **6.6** Levels de usuario → Principiante → Intermedio → Experto → Maestro
- [ ] **6.7** Notificaciones de logros → Toast/modal al conseguir nuevo badge
- [ ] **6.8** Leaderboard básico → Top 10 usuarios si auth activado

**Progreso**: 0/8 = 0% ❌

---

### **HITO 7: MARKETING & SEO** 📈
**Meta**: App es encontrable, trackeable y optimizada para crecimiento
**Prioridad**: MEDIA

**Acciones requeridas**: **12 tareas**
- [ ] **7.1** Landing page optimizada → Hero section + features + testimonios
- [ ] **7.2** Meta tags completos → OpenGraph, Twitter cards, JSON-LD
- [ ] **7.3** Google Analytics 4 → Implementar tracking de eventos personalizados
- [ ] **7.4** Sitemap.xml dinámico → Auto-generar para artículos y páginas
- [ ] **7.5** Blog structure → /blog con artículos SEO sobre constitución
- [ ] **7.6** Newsletter signup → Mailchimp/ConvertKit integration en footer
- [ ] **7.7** Social sharing → Botones compartir resultados en RRSS
- [ ] **7.8** Referral system → Código de invitación con rewards
- [ ] **7.9** A/B testing setup → Framework para experimentos (Vercel)
- [ ] **7.10** Search Console → Configurar Google Search Console
- [ ] **7.11** Speed optimization → Lighthouse score > 90
- [ ] **7.12** Schema markup → Rich snippets para educación

**Progreso**: 0/12 = 0% ❌

---

### **HITO 8: MONETIZACIÓN Y PLANES** 💰
**Meta**: Sistema de pagos funcional con modelo freemium
**Prioridad**: MEDIA-BAJA

**Acciones requeridas**: **8 tareas**
- [ ] **8.1** Definir Free vs Pro → Límites claros, features premium
- [ ] **8.2** Stripe integration → Pagos one-time y suscripciones
- [ ] **8.3** Componentes paywall → Bloqueo elegante features premium
- [ ] **8.4** Billing dashboard → Gestión suscripción, cambiar plan
- [ ] **8.5** Invoice generation → Facturas automáticas PDF
- [ ] **8.6** Cancel/upgrade flows → UX para cambios de plan
- [ ] **8.7** Free trial → 7 días premium gratis
- [ ] **8.8** Affiliate program → Comisiones por referidos

**Progreso**: 0/8 = 0% ❌

---

### **HITO 9: OPTIMIZACIÓN AVANZADA** 🚀
**Meta**: App optimizada, PWA y experiencia premium
**Prioridad**: BAJA

**Acciones requeridas**: **10 tareas**
- [ ] **9.1** PWA completo → Service Worker, manifest, offline
- [ ] **9.2** Push notifications → Recordatorios estudio
- [ ] **9.3** Lazy loading completo → Componentes y rutas
- [ ] **9.4** Image optimization → Next.js Image, WebP
- [ ] **9.5** Caching estratégico → Redis/CDN para assets
- [ ] **9.6** Dark mode completo → Toggle persistente
- [ ] **9.7** Accesibilidad (a11y) → Screen readers, keyboard nav
- [ ] **9.8** Onboarding interactivo → Tour guiado nuevos usuarios
- [ ] **9.9** Error boundaries → Manejo elegante de errores
- [ ] **9.10** Bundle optimization → Tree shaking, code splitting

**Progreso**: 0/10 = 0% ❌

---

## 📊 **RESUMEN EJECUTIVO**

### **Progreso Total**
- ✅ **Tareas completadas**: 34
- ⏳ **Tareas pendientes**: 51
- 📈 **Progreso general**: **40%**

### **Distribución por Hito**
1. **Exámenes Funcionales**: 100% (8/8) ✅ **¡COMPLETADO!**
2. **Persistencia Datos**: 100% (6/6) ✅ **¡COMPLETADO!**
3. **Navegación Fluida**: 100% (5/5) ✅ **¡COMPLETADO!**
4. **Autenticación**: 100% (10/10) ✅ **¡COMPLETADO!**
5. **Estadísticas**: 0% (0/10)
6. **Gamificación**: 0% (0/8)
7. **Marketing/SEO**: 0% (0/12)
8. **Monetización**: 0% (0/8)
9. **Optimización**: 0% (0/10)

---

## 🎯 **PRÓXIMAS ACCIONES INMEDIATAS**

### **🎉 HITO 1 COMPLETADO** (8/8 acciones):
1. ~~**Acción 1.1**: `calculateScore(answers)` function~~ ✅ COMPLETADA
2. ~~**Acción 1.2**: `ExamResults` component~~ ✅ COMPLETADA
3. ~~**Acción 1.3**: Review answers functionality~~ ✅ COMPLETADA
4. ~~**Acción 1.4**: Timer countdown~~ ❌ OMITIDA (por solicitud usuario)
5. ~~**Acción 1.5**: `saveExamResult()` function~~ ✅ COMPLETADA
6. ~~**Acción 1.6**: Post-exam navigation~~ ✅ COMPLETADA

### **🎉 HITO 2 COMPLETADO** (6/6 acciones):
1. ~~**Acción 2.1**: Hook `useLocalStorage`~~ ✅ COMPLETADA
2. ~~**Acción 2.2**: Sistema `saveProgress()`~~ ✅ COMPLETADA
3. ~~**Acción 2.3**: Sistema `loadProgress()`~~ ✅ COMPLETADA
4. ~~**Acción 2.4**: Tabla `user_progress` Supabase~~ ✅ COMPLETADA
5. ~~**Acción 2.5**: Sync localStorage ↔ Supabase~~ ✅ COMPLETADA
6. ~~**Acción 2.6**: Detección offline/online~~ ✅ COMPLETADA

### **🎉 HITO 3 COMPLETADO** (5/5 acciones):
1. ~~**Acción 3.1**: Mejorar `StudyFlow` con navegación~~ ✅ COMPLETADA
2. ~~**Acción 3.2**: Breadcrumbs navegables~~ ✅ COMPLETADA
3. ~~**Acción 3.3**: Barra progreso tiempo real~~ ✅ COMPLETADA
4. ~~**Acción 3.4**: Auto-marcar completado~~ ✅ COMPLETADA
5. ~~**Acción 3.5**: Keyboard shortcuts~~ ✅ COMPLETADA

### **🎉 HITO 4 COMPLETADO** (10/10 acciones):
1. ~~**Acción 4.1**: Configurar Supabase Auth~~ ✅ COMPLETADA
2. ~~**Acción 4.2**: Crear `AuthContext`~~ ✅ COMPLETADA
3. ~~**Acción 4.3**: Componente `LoginForm`~~ ✅ COMPLETADA
4. ~~**Acción 4.4**: Componente `RegisterForm`~~ ✅ COMPLETADA
5. ~~**Acción 4.5**: Componente `PasswordReset`~~ ✅ COMPLETADA
6. ~~**Acción 4.6**: Protected routes~~ ✅ COMPLETADA
7. ~~**Acción 4.7**: Componente `UserProfile`~~ ✅ COMPLETADA
8. ~~**Acción 4.8**: Auth middleware~~ ✅ COMPLETADA
9. ~~**Acción 4.9**: Social auth Google~~ ✅ COMPLETADA
10. ~~**Acción 4.10**: Logout functionality~~ ✅ COMPLETADA

### **🚀 Próximo HITO: HITO 5 - Estadísticas Personales** (0/10 acciones):

### **Criterio de Éxito por Acción**
- ✅ **Acción completada** = Funcionalidad testeada y funcionando
- ⚠️ **Acción en progreso** = Código escrito pero no funcional
- ❌ **Acción pendiente** = No iniciada

---

## 🏗️ **ARQUITECTURA TÉCNICA ACTUALIZADA**

### **Base de Datos Supabase** (Implementado + Pendiente)
```sql
-- ✅ IMPLEMENTADO
Questions (id, question_text, option_a, option_b, option_c, option_d, correct_answer, mapped_article)

-- ⏳ PENDIENTE
users (id, email, created_at, settings, subscription_status)
user_progress (user_id, article_id, completed_at, study_time)
exam_sessions (id, user_id, exam_type, score, completed_at)
exam_answers (session_id, question_id, user_answer, is_correct)
achievements (user_id, achievement_type, earned_at)
statistics (user_id, date, articles_studied, exam_scores)
```

### **Stack Tecnológico**
- ✅ **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- ✅ **Base de datos**: Supabase (PostgreSQL)
- ✅ **Hosting**: Vercel
- ⏳ **Auth**: Supabase Auth
- ⏳ **Pagos**: Stripe
- ⏳ **Analytics**: Google Analytics 4
- ⏳ **Email**: Resend/ConvertKit

### **Estado Global**
- ⏳ Zustand para estado de aplicación
- ⏳ React Context para autenticación
- ⏳ SWR/TanStack Query para cache de datos

---

## 💰 **COSTOS Y ROI**

### **Infraestructura Mensual**
- **Vercel Pro**: $20/mes
- **Supabase Pro**: $25/mes
- **Stripe fees**: ~3% de ingresos
- **ConvertKit**: $29/mes
- **Dominio**: $1/mes
- **Total base**: ~$75/mes

### **Modelo de Monetización - FREEMIUM**
- **Plan Free**:
  - ✅ Acceso completo a contenido constitucional (artículos 1-169)
  - ✅ Sistema de estudio con navegación y progreso ilimitado
  - ⚠️ **Límites de exámenes**:
    - 5 rondas de examen por mes
    - 1 examen por título (máximo 8 exámenes por título)
    - 1 examen general por mes
  - ⚠️ Sin estadísticas avanzadas ni exportación de datos
- **Plan Pro**: €4.99/mes
  - ✅ **Exámenes completamente ilimitados** (sin restricciones)
  - ✅ Estadísticas detalladas y gráficos avanzados
  - ✅ Exportación de datos (CSV/PDF)
  - ✅ Historial completo de exámenes
  - ✅ Gamificación completa (badges, logros, rankings)
- **Plan Anual**: €49.99/año (2 meses gratis)

### **Proyección de Ingresos**
- **100 usuarios Pro**: €499/mes
- **500 usuarios Pro**: €2,495/mes
- **1000 usuarios Pro**: €4,990/mes

---

## 🎯 **MÉTRICAS DE ÉXITO POR HITO**

### **HITO 1 - Exámenes**
- [ ] Usuario completa examen sin errores técnicos
- [ ] Puntuación se calcula correctamente
- [ ] Revisión de respuestas funcional

### **HITO 4 - Auth**
- [ ] Registro/login funciona sin errores
- [ ] Datos persisten entre sesiones
- [ ] Social auth operativo

### **HITO 7 - Marketing**
- [ ] Landing page convierte > 5%
- [ ] Organic traffic > 1000/mes
- [ ] Newsletter signup > 10%

---

**Última actualización**: 2025-09-27
**Estado actual**: ✅ 4 de 9 hitos completados (44%) - Sistema de autenticación Google OAuth completado
**Próxima revisión**: Tras completar HITO 5 (Estadísticas)

### 🎉 **LOGROS RECIENTES**

#### **HITO 4 - Autenticación Completa** (2025-09-27)
- ✅ **Sistema de autenticación completo con Google OAuth**
- ✅ **AuthContext con React hooks** para gestión global de usuario
- ✅ **Componentes completos**: LoginForm, RegisterForm, PasswordReset, UserProfile
- ✅ **Middleware de autenticación** con @supabase/ssr
- ✅ **Rutas protegidas** automáticas (/profile, /dashboard, /admin)
- ✅ **Políticas RLS ajustadas** - Acceso público a preguntas, autenticación para perfiles
- ✅ **Integración Google Cloud Console** - OAuth configurado y funcional

#### **HITO 1-3 - Sistema Base** (2025-09-26)
- ✅ **Sistema de exámenes por título completamente funcional**
- ✅ **8 títulos constitucionales disponibles** (Título I al VIII)
- ✅ **Mapeo automatizado** entre frontend y Supabase
- ✅ **1000 preguntas integradas** y funcionando
- ✅ **Interfaz actualizada** que muestra títulos disponibles dinámicamente
- ✅ **Navegación fluida y persistencia de datos** completamente implementada

---

*Este documento es la guía maestra para el desarrollo de ConstiMaster, estructurado en acciones concretas y micrometas medibles para un progreso trackeable y eficiente.*