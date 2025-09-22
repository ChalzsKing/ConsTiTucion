# 🚀 Migración de Preguntas a Supabase - Fase 2

Este documento explica cómo migrar las 1600+ preguntas de la Constitución Española desde archivos locales a Supabase.

## 📋 **Archivos Preparados**

### **Parsers y Sistema:**
- ✅ `/lib/migration/parse-questions.ts` - Parser para preguntas, respuestas y mapeo
- ✅ `/lib/migration/migrate-to-supabase.ts` - Sistema de migración completo
- ✅ `/lib/supabase-exam-system.ts` - Nuevo sistema de exámenes con Supabase
- ✅ `/scripts/migrate-questions.ts` - Script ejecutable de migración

### **Datos Fuente:**
- ✅ `/recursos/1600_preguntas_constitucion_espanola.txt` - 1600+ preguntas
- ✅ `/recursos/1600 respuestas constitucion.txt` - Respuestas 1-990
- ✅ `/recursos/1600 respuestas constitucion (2).txt` - Respuestas 990-1641
- ✅ `/recursos/constitucion_completo.csv` - Mapeo artículo → preguntas

## 🔧 **Configuración Previa**

### **1. Variables de Entorno**

Crear archivo `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### **2. Instalar Dependencias**

```bash
npm install @supabase/supabase-js
npm install -D tsx  # Para ejecutar TypeScript directamente
```

## 🗄️ **Estructura de Base de Datos**

### **Tabla: `questions`**
```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  original_number INTEGER UNIQUE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer INTEGER NOT NULL, -- 0=A, 1=B, 2=C, 3=D
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Tabla: `question_articles`**
```sql
CREATE TABLE question_articles (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id),
  original_question_number INTEGER NOT NULL,
  title_id TEXT NOT NULL, -- 'titulo1', 'titulo2', etc.
  article_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 **Ejecutar Migración**

### **Opción 1: Script Automático**

```bash
npx tsx scripts/migrate-questions.ts
```

### **Opción 2: Paso a Paso**

```typescript
import { migrateQuestionsToSupabase } from './lib/migration/migrate-to-supabase'

// Leer archivos
const questionsText = readFileSync('recursos/1600_preguntas_constitucion_espanola.txt', 'utf-8')
const answersText = readFileSync('recursos/1600 respuestas constitucion.txt', 'utf-8')
const mappingCSV = readFileSync('recursos/constitucion_completo.csv', 'utf-8')

// Ejecutar migración
const result = await migrateQuestionsToSupabase(questionsText, answersText, mappingCSV)
```

## 📊 **Datos Esperados**

### **Resumen de Migración:**
- **~1600 preguntas** parseadas del archivo .txt
- **1641 respuestas** confirmadas (preguntas 1-1641)
  - Archivo 1: respuestas 1-990
  - Archivo 2: respuestas 990-1641
- **600+ mapeos** artículo → preguntas del CSV
- **11 títulos** constitucionales cubiertos

### **Distribución por Títulos:**
```
Preliminar (1-9): ~50 preguntas
Título I (10-55): ~400 preguntas
Título II (56-65): ~30 preguntas
Título III (66-96): ~200 preguntas
...y así sucesivamente
```

## 🎯 **Nuevo Sistema de Exámenes**

### **Funciones Disponibles:**

```typescript
// Examen por artículo específico
const questions = await ExamGenerator.byArticle(27, 10) // Art. 27, 10 preguntas

// Examen por título constitucional
const questions = await ExamGenerator.byTitle('titulo1', 20) // Título I, 20 preguntas

// Examen general mixto
const questions = await ExamGenerator.general(25) // 25 preguntas aleatorias

// Examen por múltiples artículos
const questions = await ExamGenerator.multiArticle([1, 2, 3], 5) // 5 preguntas c/u

// Examen por sección temática
const questions = await ExamGenerator.bySection('derechos') // Derechos fundamentales
```

### **Cálculo de Resultados:**

```typescript
const results = calculateExamResult(answeredQuestions)
// Retorna: score, percentage, correctAnswers, incorrectAnswers, byTitle
```

## 🔄 **Integración con App Existente**

### **1. Actualizar ExamenesView:**

```typescript
// Reemplazar en /components/examenes-view.tsx
import { ExamGenerator } from '@/lib/supabase-exam-system'

// En lugar de generateTitleExam local
const questions = await ExamGenerator.byTitle(titleId, 20)
```

### **2. Mantener Compatibilidad:**

El nuevo sistema mantiene la misma interfaz que el anterior:

```typescript
interface ExamQuestion {
  id: number
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: number
  userAnswer?: number
  isCorrect?: boolean
}
```

## ⚡ **Ventajas del Nuevo Sistema**

- ✅ **1600+ preguntas reales** de oposiciones
- ✅ **Consultas rápidas** por artículo/título
- ✅ **Exámenes personalizados** por temática
- ✅ **Estadísticas avanzadas** por título
- ✅ **Búsqueda de texto** en preguntas
- ✅ **Escalabilidad** para futuras preguntas
- ✅ **Backup automático** en la nube

## 🚨 **Troubleshooting**

### **Error de Conexión:**
- Verificar variables de entorno
- Comprobar URL y keys de Supabase

### **Error de Parsing:**
- Verificar formato de archivos fuente
- Revisar codificación UTF-8

### **Preguntas Faltantes:**
- El sistema maneja preguntas incompletas
- Solo migra preguntas con todas las opciones

## 📈 **Próximos Pasos Post-Migración**

1. **Completar respuestas 991-1600** (las preguntas que quedan)
2. **Agregar explicaciones** a las preguntas
3. **Implementar categorías** de dificultad
4. **Crear dashboard** de administración
5. **Agregar analytics** de rendimiento

---

**¡La migración está lista para ejecutarse!** 🎉

Una vez completada, tendrás un sistema de exámenes profesional con 1600+ preguntas reales de la Constitución Española.