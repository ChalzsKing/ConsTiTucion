# 🎮 HITO 6: Sistema de Gamificación - ConstiMaster

## 🎯 Objetivo
Implementar un sistema completo de gamificación que motive al usuario a estudiar más y mejore la retención mediante mecánicas de juego.

---

## 📋 Tareas del Hito (8 acciones)

### **Tarea 6.1: Definir Sistema de Badges** 🏆
**Objetivo**: Crear catálogo completo de logros y badges desbloqueables

**Badges Propuestos** (25 logros):

#### **🎓 Logros de Estudio**
1. **Primer Paso** - Completar tu primer artículo
2. **Estudiante Dedicado** - Completar 10 artículos
3. **Conocedor Avanzado** - Completar 50 artículos
4. **Maestro Constitucional** - Completar todos los 169 artículos
5. **Madrugador** - Estudiar antes de las 8:00 AM
6. **Búho Nocturno** - Estudiar después de las 11:00 PM
7. **Fin de Semana Productivo** - Estudiar un sábado o domingo

#### **📚 Logros por Títulos**
8. **Preliminar Completo** - Completar Título Preliminar
9. **Defensor de Derechos** - Completar Título I (Derechos Fundamentales)
10. **Realista** - Completar Título II (La Corona)
11. **Legislador** - Completar Título III (Cortes Generales)
12. **Gobernante** - Completar Título IV (Gobierno)
13. **Controlador** - Completar Título V (Relaciones Gobierno-Cortes)
14. **Juez** - Completar Título VI (Poder Judicial)
15. **Economista** - Completar Título VII (Economía)
16. **Autonomista** - Completar Título VIII (Organización Territorial)

#### **✅ Logros de Exámenes**
17. **Primer Examen** - Completar tu primer examen
18. **Aprobado** - Conseguir 50% o más en un examen
19. **Notable** - Conseguir 70% o más en un examen
20. **Sobresaliente** - Conseguir 90% o más en un examen
21. **Matrícula de Honor** - Conseguir 100% en un examen
22. **Perseverante** - Completar 10 exámenes
23. **Experto Examinado** - Completar 50 exámenes

#### **🔥 Logros de Rachas**
24. **Racha de 3** - Estudiar 3 días consecutivos
25. **Racha de 7** - Estudiar 7 días consecutivos
26. **Racha de 30** - Estudiar 30 días consecutivos

**Implementación**:
```typescript
// lib/achievements/badges.ts
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'study' | 'titles' | 'exams' | 'streaks'
  criteria: {
    type: 'articles_completed' | 'title_completed' | 'exam_score' | 'streak_days'
    value: number
    titleId?: string
  }
  xpReward: number
}
```

---

### **Tarea 6.2: Hook `useAchievements`** 🪝
**Objetivo**: Detectar automáticamente cuando el usuario desbloquea un logro

**Funcionalidades**:
- Detectar logros desbloqueados en cada acción
- Guardar logros en Supabase (`user_achievements`)
- Retornar logros recién conseguidos para mostrar notificación

**Tabla Supabase**:
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
```

**Hook**:
```typescript
// lib/hooks/useAchievements.ts
export function useAchievements() {
  const { user } = useAuth()
  const { overall, examHistory, getStudyStreak } = useProgress()

  const checkAchievements = async () => {
    // Lógica para detectar nuevos logros
    const newBadges = []

    // Ejemplo: Badge de 10 artículos
    if (overall.completedArticles === 10) {
      newBadges.push('estudiante-dedicado')
    }

    return newBadges
  }

  return {
    unlockedBadges,
    checkAchievements,
    totalXP,
    level
  }
}
```

---

### **Tarea 6.3: Componente `BadgeDisplay`** 🎨
**Objetivo**: UI atractiva para mostrar badges conseguidos y por conseguir

**Ubicación**: `components/gamification/badge-display.tsx`

**Características**:
- Grid de badges con iconos llamativos
- Badges desbloqueados en color
- Badges bloqueados en gris con candado
- Tooltip con descripción y progreso
- Filtros por categoría

**Ejemplo UI**:
```tsx
<div className="grid grid-cols-4 gap-4">
  {badges.map(badge => (
    <BadgeCard
      key={badge.id}
      badge={badge}
      unlocked={unlockedBadges.includes(badge.id)}
      progress={getBadgeProgress(badge)}
    />
  ))}
</div>
```

---

### **Tarea 6.4: Sistema de XP y Puntos** ⭐
**Objetivo**: Recompensar acciones del usuario con puntos de experiencia

**Recompensas XP**:
| Acción | XP |
|--------|-----|
| Completar artículo | +10 XP |
| Completar título | +100 XP |
| Aprobar examen (50-69%) | +20 XP |
| Aprobar examen (70-89%) | +50 XP |
| Aprobar examen (90-99%) | +100 XP |
| Examen perfecto (100%) | +200 XP |
| Racha diaria | +5 XP |
| Desbloquear badge | Variable (50-500 XP) |

**Tabla Supabase**:
```sql
CREATE TABLE user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

### **Tarea 6.5: Racha de Días Consecutivos** 🔥
**Objetivo**: Tracking de días consecutivos estudiando

**Funcionalidad**:
- Detectar si el usuario estudió hoy
- Calcular racha actual
- Mostrar racha en Sidebar
- Enviar notificación si la racha está en riesgo

**Ya implementado parcialmente**:
- `getStudyStreak()` en `useUnifiedProgress`
- Tabla `daily_activity` en Supabase

**Mejoras pendientes**:
- Mostrar racha visualmente con emoji 🔥
- Notificación "¡No pierdas tu racha de X días!"
- Badge especial por rachas largas

---

### **Tarea 6.6: Sistema de Niveles** 📊
**Objetivo**: Progresión de usuario basada en XP acumulado

**Niveles**:
| Nivel | XP Requerido | Título |
|-------|--------------|--------|
| 1 | 0 | Novato |
| 2 | 100 | Aprendiz |
| 3 | 300 | Estudiante |
| 4 | 600 | Aplicado |
| 5 | 1000 | Conocedor |
| 10 | 5000 | Experto |
| 20 | 20000 | Maestro |
| 30 | 50000 | Gran Maestro |
| 50 | 150000 | Leyenda |

**Fórmula XP por nivel**:
```typescript
function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}
```

**UI**:
- Barra de progreso de nivel en Sidebar
- Título de nivel junto al nombre de usuario
- Animación al subir de nivel

---

### **Tarea 6.7: Notificaciones de Logros** 🎉
**Objetivo**: Toast/modal al desbloquear un badge

**Librería**: `sonner` (ya incluida en shadcn/ui)

**Implementación**:
```tsx
import { toast } from 'sonner'

// Al desbloquear badge
toast.success(
  <div>
    <h3>¡Nuevo Logro Desbloqueado!</h3>
    <p>🏆 {badge.name}</p>
    <p className="text-sm">+{badge.xpReward} XP</p>
  </div>,
  { duration: 5000 }
)
```

**Características**:
- Animación de aparición
- Icono del badge
- XP ganado
- Sonido (opcional)

---

### **Tarea 6.8: Leaderboard Básico** 🏅
**Objetivo**: Top 10 usuarios con más XP

**Tabla Supabase**:
```sql
CREATE TABLE leaderboard (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT NOT NULL,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Componente**: `components/gamification/leaderboard.tsx`

**Features**:
- Top 10 usuarios
- Posición del usuario actual
- Actualización diaria
- Filtros: Semanal, Mensual, Global

---

## 🗂️ Estructura de Archivos

```
lib/
├── gamification/
│   ├── badges.ts           # Definición de todos los badges
│   ├── xp-system.ts        # Cálculo de XP y niveles
│   └── achievements.ts     # Lógica de detección
├── hooks/
│   ├── useAchievements.ts  # Hook principal
│   └── useXP.ts            # Hook de XP
components/
├── gamification/
│   ├── badge-display.tsx   # Grid de badges
│   ├── badge-card.tsx      # Card individual
│   ├── level-progress.tsx  # Barra de nivel
│   ├── streak-display.tsx  # Display de racha
│   ├── leaderboard.tsx     # Tabla de ranking
│   └── achievement-toast.tsx # Notificación
database/
└── gamification_tables.sql # Schema Supabase
```

---

## 🎨 Diseño UX

### **Sidebar**
```
┌─────────────────┐
│ ConstiMaster    │
│ Nivel 5 🌟      │
│ ━━━━━━━░░░ 60% │
│ 600/1000 XP     │
│                 │
│ 🔥 7 días       │
│ 🏆 12 badges    │
└─────────────────┘
```

### **Vista de Logros** (Nueva sección)
- Tab "Logros" en Estadísticas
- Grid de badges
- Progreso por categoría
- Badges destacados

---

## 📊 Métricas de Éxito

- ✅ 25+ badges implementados
- ✅ Sistema de XP funcional
- ✅ Racha visible en Sidebar
- ✅ Notificaciones funcionando
- ✅ Leaderboard actualizado diariamente
- ✅ Incremento engagement +30%

---

## 🚀 Plan de Implementación

### **Fase 1** (Tareas 6.1-6.2):
1. Definir todos los badges
2. Crear tablas en Supabase
3. Implementar hook `useAchievements`

### **Fase 2** (Tareas 6.3-6.4):
1. Componente `BadgeDisplay`
2. Sistema de XP completo
3. Integrar XP en acciones

### **Fase 3** (Tareas 6.5-6.6):
1. Racha de días
2. Sistema de niveles
3. UI en Sidebar

### **Fase 4** (Tareas 6.7-6.8):
1. Notificaciones toast
2. Leaderboard
3. Testing y ajustes

**Tiempo estimado**: 2-3 sesiones de desarrollo

---

**Creado**: 2025-10-15
**Estado**: ⏳ Pendiente de inicio
**Prioridad**: MEDIA
**Impacto**: ALTO (engagement + retención)
