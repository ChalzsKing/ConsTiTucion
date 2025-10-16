# 🏆 Sistema de Gamificación - ConstiMaster

## 📋 Índice
1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Sistema de XP y Niveles](#sistema-de-xp-y-niveles)
4. [Sistema de Badges](#sistema-de-badges)
5. [Componentes UI](#componentes-ui)
6. [Base de Datos](#base-de-datos)
7. [Integración](#integración)
8. [Configuración](#configuración)

---

## 🎮 Introducción

El sistema de gamificación de ConstiMaster transforma el estudio de la Constitución Española en una experiencia motivadora mediante:

- **Sistema de XP y Niveles**: Progresión exponencial desde nivel 1 hasta 100+
- **30+ Badges**: Logros desbloqueables en 5 categorías
- **Notificaciones visuales**: Toasts animados para logros y subidas de nivel
- **Seguimiento de progreso**: Estadísticas detalladas y visualizaciones
- **Integración en Sidebar**: Stats en tiempo real visibles siempre

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
lib/gamification/
├── badges.ts           # Definiciones de badges y criterios
├── xp-system.ts        # Sistema de XP, niveles y cálculos

lib/hooks/
├── useAchievements.ts  # Hook principal para gamificación

components/gamification/
├── badge-card.tsx           # Card individual de badge
├── badge-display.tsx        # Grid de badges con filtros
├── level-progress.tsx       # Barra de progreso de nivel
└── achievement-toast.tsx    # Notificaciones de logros

components/
├── logros-view.tsx     # Vista principal de logros
└── sidebar.tsx         # Integración de stats en sidebar

database/
└── gamification_tables.sql  # Schema SQL para Supabase
```

### Flujo de Datos

```
Usuario completa artículo
    ↓
useUnifiedProgress.markArticleCompleted()
    ↓
useAchievements.checkAllAchievements()
    ↓
Supabase: add_user_xp() + unlock_badge()
    ↓
UI se actualiza automáticamente vía hooks
    ↓
AchievementToastListener muestra notificación
```

---

## ⚡ Sistema de XP y Niveles

### Fórmula de Progresión

El sistema utiliza progresión exponencial para mantener el desafío:

```typescript
XP por nivel = 100 * (1.5 ^ (level - 1))
```

**Ejemplos:**
- Nivel 1 → 2: 100 XP
- Nivel 2 → 3: 150 XP
- Nivel 10 → 11: 3,838 XP
- Nivel 50 → 51: 63,749,374 XP

### Títulos de Nivel

Los usuarios obtienen títulos especiales cada 10 niveles:

| Nivel | Título | Icono | Color |
|-------|--------|-------|-------|
| 1-9 | Novato | 🌱 | Gris |
| 10-19 | Conocedor | 🧠 | Verde |
| 20-29 | Experto | 💡 | Azul |
| 30-39 | Maestro | 🎓 | Morado |
| 40-49 | Autoridad | ⚖️ | Naranja |
| 50-99 | Leyenda | 👑 | Amarillo |
| 100+ | Dios Constitucional | ⚡ | Dorado |

### Fuentes de XP

| Acción | XP Base | Notas |
|--------|---------|-------|
| Completar artículo | 10 XP | Por primera vez |
| Aprobar examen | 50-200 XP | Según porcentaje |
| Desbloquear badge | Variable | Según rareza del badge |
| Racha diaria | 20 XP/día | Por mantener racha activa |
| Respuesta correcta | 5 XP | En exámenes |

### Funciones SQL

#### `calculate_level_from_xp(total_xp INTEGER)`
Calcula el nivel correspondiente a una cantidad de XP.

**Uso:**
```sql
SELECT calculate_level_from_xp(1000);
-- Returns: 6
```

#### `add_user_xp(user_id, xp_amount, reason, reference_id)`
Añade XP a un usuario y actualiza su nivel automáticamente.

**Retorna:**
```typescript
{
  success: boolean
  old_xp: number
  new_xp: number
  old_level: number
  new_level: number
  leveled_up: boolean
  transaction_id: UUID
}
```

**Ejemplo de uso en TypeScript:**
```typescript
const { data, error } = await supabase.rpc('add_user_xp', {
  p_user_id: user.id,
  p_xp_amount: 50,
  p_reason: 'article_completed',
  p_reference_id: 'articulo-1'
})

if (data?.[0]?.leveled_up) {
  // Mostrar notificación de subida de nivel
  showLevelUpToast(data[0].new_level)
}
```

---

## 🏅 Sistema de Badges

### Categorías

1. **📚 Estudio** (study)
   - Relacionados con completar artículos y títulos
   - Ejemplos: "Primer Paso", "Explorador", "Coleccionista"

2. **🏆 Títulos** (titles)
   - Por dominar títulos específicos de la Constitución
   - Ejemplo: "Maestro del Título I"

3. **📝 Exámenes** (exams)
   - Por aprobar exámenes y obtener buenas puntuaciones
   - Ejemplos: "Aprobado", "Nota Alta", "Perfección"

4. **🔥 Rachas** (streaks)
   - Por mantener rachas de estudio consecutivas
   - Ejemplos: "Consistente", "Dedicado", "Imparable"

5. **⭐ Especiales** (special)
   - Logros únicos y desafiantes
   - Ejemplos: "Madrugador", "Nocturno", "Velocista"

### Rareza y Recompensas

| Rareza | Color | XP Reward | Criterio |
|--------|-------|-----------|----------|
| Common | Verde | 25-50 XP | Fácil de conseguir |
| Rare | Azul | 100-200 XP | Requiere esfuerzo |
| Epic | Morado | 300-500 XP | Muy difícil |
| Legendary | Dorado | 1000+ XP | Extremadamente raro |

### Estructura de Badge

```typescript
interface Badge {
  id: string                    // Identificador único
  name: string                  // Nombre del badge
  description: string           // Descripción corta
  icon: string                  // Emoji del badge
  category: BadgeCategory       // study | titles | exams | streaks | special
  criteria: BadgeCriteria       // Criterios de desbloqueo
  xpReward: number             // XP al desbloquear
  rarity: BadgeRarity          // common | rare | epic | legendary
}

interface BadgeCriteria {
  type: 'articles_completed' | 'exam_score' | 'streak' | 'time_of_day' | ...
  value?: number               // Valor objetivo (ej: 10 artículos)
  minScore?: number            // Puntuación mínima (para exámenes)
  days?: number                // Días de racha (para streaks)
}
```

### Ejemplo de Badge

```typescript
{
  id: 'first-step',
  name: 'Primer Paso',
  description: 'Completa tu primer artículo',
  icon: '🎯',
  category: 'study',
  criteria: { type: 'articles_completed', value: 1 },
  xpReward: 50,
  rarity: 'common'
}
```

### Función SQL de Desbloqueo

#### `unlock_badge(user_id, badge_id, xp_reward)`
Desbloquea un badge para un usuario (idempotente).

**Retorna:**
```typescript
{
  success: boolean           // true si se desbloqueó ahora
  already_unlocked: boolean  // true si ya estaba desbloqueado
  badge_id: string
  unlocked_at: timestamp
}
```

**Ejemplo:**
```typescript
const { data } = await supabase.rpc('unlock_badge', {
  p_user_id: user.id,
  p_badge_id: 'first-step',
  p_xp_reward: 50
})

if (data?.[0]?.success) {
  // Badge recién desbloqueado - mostrar notificación
  showBadgeToast(badge)
}
```

---

## 🎨 Componentes UI

### `useAchievements()`

Hook principal que gestiona todo el sistema de gamificación.

**Retorna:**
```typescript
{
  // XP y nivel
  xpData: {
    totalXP: number
    currentLevel: number
    nextLevelXP: number
    currentLevelXP: number
    xpToNextLevel: number
    progressPercentage: number
    levelTitle: string
    levelIcon: string
    levelColor: string
  }

  // Badges
  unlockedBadges: UnlockedBadge[]
  newlyUnlockedBadges: UnlockedBadge[]  // Para toasts
  unlockedCount: number
  totalBadges: number
  completionPercentage: number

  // Funciones
  addXP: (amount, reason, referenceId?) => Promise<void>
  checkAllAchievements: () => Promise<void>
  unlockBadge: (badge) => Promise<void>
  isBadgeUnlocked: (badgeId) => boolean
  getBadgeProgress: (badge) => number
  clearNewBadges: () => void

  // Estado
  loading: boolean
  error: string | null
}
```

**Ejemplo de uso:**
```typescript
function MyComponent() {
  const { xpData, unlockedBadges, addXP, checkAllAchievements } = useAchievements()

  const handleArticleComplete = async () => {
    await addXP(10, 'article_completed', articleId)
    await checkAllAchievements()
  }

  return (
    <div>
      <p>Nivel {xpData.currentLevel}: {xpData.levelTitle}</p>
      <p>{unlockedBadges.length} badges desbloqueados</p>
    </div>
  )
}
```

### `<LevelProgress />`

Componente para mostrar progreso de nivel.

**Props:**
```typescript
interface LevelProgressProps {
  variant?: 'full' | 'compact' | 'minimal'  // Diseño
  showXPDetails?: boolean                   // Mostrar XP numérico
}
```

**Variantes:**
- `full`: Diseño completo con icono grande, título y stats detalladas
- `compact`: Card compacta con barra de progreso
- `minimal`: Solo barra de progreso sin card

**Uso:**
```tsx
<LevelProgress variant="full" showXPDetails />
<LevelProgress variant="compact" />
<LevelProgress variant="minimal" />
```

### `<BadgeDisplay />`

Componente que muestra todos los badges con filtros por categoría.

**Features:**
- Tabs para filtrar por categoría
- Grid responsivo de badges
- Muestra progreso hacia badges bloqueados
- Indicador de completitud

**Uso:**
```tsx
<BadgeDisplay />
```

### `<BadgeCard />`

Card individual de un badge.

**Props:**
```typescript
interface BadgeCardProps {
  badge: Badge
  unlocked: boolean
  progress?: number  // 0-100 para badges bloqueados
  size?: 'sm' | 'md' | 'lg'
}
```

**Estados:**
- **Desbloqueado**: A color, con fecha de desbloqueo
- **Bloqueado**: En escala de grises, con candado
- **Con progreso**: Muestra barra de progreso hacia desbloqueo

**Uso:**
```tsx
<BadgeCard
  badge={badge}
  unlocked={true}
  size="md"
/>
```

### `<AchievementToastListener />`

Componente que escucha nuevos logros y muestra notificaciones.

**Características:**
- Se renderiza globalmente en layout.tsx
- Detecta automáticamente `newlyUnlockedBadges`
- Muestra toasts con animaciones
- Delay escalonado para múltiples badges

**Uso:**
```tsx
// En app/layout.tsx
<ProgressProvider>
  {children}
  <AchievementToastListener />
  <Toaster position="top-center" richColors />
</ProgressProvider>
```

### Funciones de Toast

#### `showLevelUpToast(newLevel, levelTitle, levelIcon)`
Muestra notificación de subida de nivel.

```typescript
showLevelUpToast(10, 'Conocedor', '🧠')
```

#### `showXPGainToast(xpAmount, reason)`
Muestra notificación de XP ganado.

```typescript
showXPGainToast(50, 'Artículo completado')
```

### `<LogrosView />`

Vista principal de logros y gamificación.

**Incluye:**
- Progreso de nivel completo
- 3 tabs: Badges, Estadísticas, Ranking
- Cards de stats (nivel, logros desbloqueados)
- Placeholder para leaderboard

**Uso:**
```tsx
// Enrutado desde page.tsx
case "logros":
  return <LogrosView />
```

---

## 💾 Base de Datos

### Tablas

#### `user_xp`
Almacena XP y nivel de cada usuario.

```sql
CREATE TABLE user_xp (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### `user_achievements`
Badges desbloqueados por usuario.

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT now(),
  xp_earned INTEGER DEFAULT 0,
  UNIQUE(user_id, badge_id)
);
```

#### `xp_history`
Historial de transacciones de XP.

```sql
CREATE TABLE xp_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

#### `leaderboard`
Ranking de usuarios (caché desnormalizada).

```sql
CREATE TABLE leaderboard (
  user_id UUID PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  badges_count INTEGER DEFAULT 0,
  articles_completed INTEGER DEFAULT 0,
  exams_taken INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  updated_at TIMESTAMP
);
```

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

**user_xp y user_achievements:**
```sql
-- Los usuarios solo pueden ver y modificar sus propios datos
CREATE POLICY "Users can view own data"
  ON user_xp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON user_xp FOR UPDATE
  USING (auth.uid() = user_id);
```

**leaderboard:**
```sql
-- Lectura pública, escritura propia
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update own entry"
  ON leaderboard FOR ALL
  USING (auth.uid() = user_id);
```

### Índices

```sql
-- Performance para consultas frecuentes
CREATE INDEX idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX idx_user_xp_ranking ON user_xp(total_xp DESC, current_level DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_xp_history_user_date ON xp_history(user_id, created_at DESC);
```

### Funciones Adicionales

#### `get_user_gamification_stats(user_id)`
Obtiene estadísticas completas de gamificación.

**Retorna:**
```typescript
{
  total_xp: number
  current_level: number
  badges_unlocked: number
  total_xp_earned_today: number
  total_xp_earned_week: number
  level_ups_total: number
}
```

#### `get_leaderboard(limit?)`
Obtiene ranking de usuarios.

**Retorna:**
```typescript
{
  rank: number
  user_id: UUID
  total_xp: number
  current_level: number
  badges_count: number
}[]
```

---

## 🔌 Integración

### Paso 1: Ejecutar SQL en Supabase

```bash
# Acceder a Supabase Dashboard
# SQL Editor → New Query
# Pegar contenido de database/gamification_tables.sql
# Ejecutar
```

### Paso 2: Verificar Tablas

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND (tablename LIKE '%xp%' OR tablename LIKE '%achievement%');
```

### Paso 3: Integrar en Componentes

#### En componentes de estudio:

```typescript
import { useAchievements } from '@/lib/hooks/useAchievements'

function StudyFlow() {
  const { addXP, checkAllAchievements } = useAchievements()

  const handleArticleComplete = async () => {
    // Marcar artículo como completado
    await markArticleCompleted(article.id)

    // Añadir XP
    await addXP(10, 'article_completed', article.id)

    // Verificar badges
    await checkAllAchievements()
  }
}
```

#### En componentes de examen:

```typescript
function ExamFlow() {
  const { addXP, checkAllAchievements } = useAchievements()

  const handleExamComplete = async (score: number) => {
    // Calcular XP según puntuación
    const xpEarned = Math.floor(score * 2)

    await addXP(xpEarned, 'exam_passed', examId)
    await checkAllAchievements()
  }
}
```

### Paso 4: Añadir en Sidebar

Ya integrado en `components/sidebar.tsx`:

```typescript
const { xpData, unlockedCount, totalBadges } = useAchievements()

// Mostrar nivel, XP, badges en card del sidebar
```

---

## ⚙️ Configuración

### Personalizar Badges

Edita `lib/gamification/badges.ts`:

```typescript
export const allBadges: Badge[] = [
  {
    id: 'mi-nuevo-badge',
    name: 'Mi Badge',
    description: 'Descripción del badge',
    icon: '🎯',
    category: 'study',
    criteria: {
      type: 'articles_completed',
      value: 50
    },
    xpReward: 200,
    rarity: 'rare'
  },
  // ... más badges
]
```

### Personalizar Niveles

Edita `lib/gamification/xp-system.ts`:

```typescript
// Cambiar fórmula de XP
export function getXPForLevel(level: number): number {
  // Tu fórmula personalizada
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Añadir/modificar títulos
export const LEVEL_TITLES: Record<number, LevelInfo> = {
  1: { title: 'Novato', icon: '🌱', color: 'text-gray-500' },
  100: { title: 'Tu Título Custom', icon: '⚡', color: 'text-amber-500' },
}
```

### Ajustar Recompensas de XP

```typescript
// En tus componentes
const XP_REWARDS = {
  ARTICLE_COMPLETE: 10,
  EXAM_PASS: 50,
  PERFECT_EXAM: 200,
  DAILY_STREAK: 20
}

await addXP(XP_REWARDS.ARTICLE_COMPLETE, 'article_completed', articleId)
```

---

## 📊 Métricas y Analytics

### Consultas SQL Útiles

#### Top 10 usuarios por XP:
```sql
SELECT * FROM leaderboard
ORDER BY total_xp DESC
LIMIT 10;
```

#### XP ganado hoy:
```sql
SELECT user_id, SUM(xp_amount) as xp_today
FROM xp_history
WHERE created_at >= CURRENT_DATE
GROUP BY user_id;
```

#### Badges más comunes:
```sql
SELECT badge_id, COUNT(*) as unlock_count
FROM user_achievements
GROUP BY badge_id
ORDER BY unlock_count DESC;
```

#### Distribución de niveles:
```sql
SELECT current_level, COUNT(*) as users
FROM user_xp
GROUP BY current_level
ORDER BY current_level;
```

---

## 🐛 Troubleshooting

### "useAchievements must be used within ProgressProvider"

**Causa:** useAchievements depende de ProgressProvider.

**Solución:**
```tsx
// En app/layout.tsx
<ProgressProvider>
  {children}
</ProgressProvider>
```

### Los badges no se desbloquean automáticamente

**Causa:** No se llama a `checkAllAchievements()` después de acciones.

**Solución:**
```typescript
const { checkAllAchievements } = useAchievements()

const handleAction = async () => {
  // Tu lógica
  await checkAllAchievements() // ← Añadir esto
}
```

### RLS: new row violates row-level security policy

**Causa:** Políticas RLS mal configuradas.

**Solución:** Verificar que auth.uid() coincide con user_id:
```sql
SELECT auth.uid(); -- Verificar UUID del usuario actual
```

### Nivel no se actualiza después de ganar XP

**Causa:** Función calculate_level_from_xp puede tener error.

**Solución:** Verificar en Supabase SQL:
```sql
SELECT calculate_level_from_xp(1000);
```

---

## 🚀 Próximas Mejoras

- [ ] Leaderboard en tiempo real con WebSockets
- [ ] Badges de comunidad (competir con amigos)
- [ ] Sistema de misiones diarias
- [ ] Recompensas cosméticas (avatares, temas)
- [ ] Notificaciones push para rachas
- [ ] Exportar estadísticas a PDF
- [ ] Comparación con promedios globales

---

## 📝 Changelog

### v1.0.0 - 2025-01-15
- ✅ Sistema de XP con progresión exponencial
- ✅ 30+ badges en 5 categorías
- ✅ Componentes UI completos
- ✅ Integración en Sidebar
- ✅ Base de datos con RLS
- ✅ Notificaciones con toasts
- ✅ Hook useAchievements completo
- ✅ Vista de Logros

---

## 🤝 Contribuir

Para añadir nuevos badges:

1. Edita `lib/gamification/badges.ts`
2. Añade tu badge al array `allBadges`
3. Define criterios claros
4. Asigna XP y rareza apropiados
5. Prueba con `checkBadgeCriteria()`

---

## 📚 Referencias

- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Sonner Toasts](https://sonner.emilkowal.ski/)
- [Game Design - Progression Systems](https://www.gamedeveloper.com/design/progression-systems-in-games)

---

**🏆 ¡Feliz estudio y que desbloquees todos los badges!**
