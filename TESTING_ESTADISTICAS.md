# 🧪 RUTA DE TESTING COMPLETA - SISTEMA DE ESTADÍSTICAS

## 📋 Objetivo
Verificar que todas las funcionalidades del sistema de estadísticas (HITO 5) funcionan correctamente y los datos persisten en Supabase.

---

## **FASE 1: PREPARACIÓN INICIAL** ⚙️

### **1.1 Acceder a la aplicación**
- Abre **http://localhost:3001**
- Verifica que carga correctamente

### **1.2 Autenticación (SI NO ESTÁS LOGUEADO)**
1. Ir a la pestaña **"Perfil"** en el sidebar
2. Hacer login con Google OAuth o crear cuenta
3. Verificar que aparece tu nombre/email en el perfil

---

## **FASE 2: GENERAR DATOS DE PRUEBA** 📝

### **2.1 Estudiar Artículos (para generar progreso)**
1. Ir a **"Artículos"** en el sidebar
2. Expandir **"Título Preliminar"**
3. Hacer clic en **"Artículo 1"**
4. Esperar **al menos 10 segundos** en el artículo
5. Presionar **Espacio** o hacer clic en "Marcar como completado"
6. Usar flechas **→** para ir al **Artículo 2**
7. Repetir el proceso con **Artículos 2, 3, 4, 5**

**✅ Verificar:**
- Los artículos se marcan en verde en la lista
- Aparece el ícono de check ✓

### **2.2 Hacer Exámenes (para generar historial)**
1. Ir a **"Artículos"** → **"Título I"**
2. Hacer clic en **"Hacer Examen de este Título"**
3. Responder **10 preguntas** (no importa si son correctas o incorrectas)
4. Completar el examen
5. Ver la pantalla de resultados
6. Hacer clic en **"Volver"**
7. **REPETIR**: Hacer 2-3 exámenes más de diferentes títulos

**✅ Verificar:**
- Se muestra la puntuación correctamente
- Puedes revisar respuestas correctas/incorrectas

---

## **FASE 3: VERIFICAR ESTADÍSTICAS** 📊

### **3.1 Acceder al Dashboard de Estadísticas**
1. Ir a **"Estadísticas"** en el sidebar
2. Deberías ver un dashboard con **5 pestañas**:
   - 📊 **Resumen**
   - 📈 **Gráficos**
   - 📚 **Progreso**
   - 📝 **Exámenes**
   - 🔥 **Actividad**

### **3.2 Verificar Pestaña "Resumen"**
**✅ Comprobar que aparecen:**
- **Artículos estudiados**: Debe mostrar **5** (los que estudiaste)
- **Tiempo de estudio**: Debe mostrar tiempo > 0 minutos
- **Exámenes realizados**: Debe mostrar el número de exámenes que hiciste (2-3)
- **Promedio de puntuación**: Debe mostrar un porcentaje

**❌ Si no aparecen datos:**
- Abrir **Consola del navegador** (F12)
- Buscar errores en rojo
- Verificar si hay problemas de conexión con Supabase

### **3.3 Verificar Pestaña "Gráficos"**
**✅ Comprobar:**
- **Gráfico de actividad diaria**: Debe mostrar una barra para hoy
- **Gráfico de rendimiento**: Debe mostrar tus exámenes
- **Gráfico de progreso temporal**: Debe mostrar tu evolución

**❌ Si los gráficos no se ven:**
- Verificar si hay mensajes de "No hay datos disponibles"
- Revisar consola del navegador

### **3.4 Verificar Pestaña "Progreso"**
**✅ Comprobar:**
- **Lista de títulos constitucionales**
- **Progreso por título**: Título Preliminar debe mostrar **5/9 artículos (55%)**
- **Barras de progreso** visuales
- **Botón "Ver Artículos"** para cada título

### **3.5 Verificar Pestaña "Exámenes"**
**✅ Comprobar:**
- **Tabla con historial de exámenes**
- Cada examen debe mostrar:
  - Fecha/hora
  - Tipo (Título I, Título II, etc.)
  - Puntuación (ej: 7/10 - 70%)
  - Botón "Ver detalles"
- **Filtros**: General, Por Título, Por Artículo

### **3.6 Verificar Pestaña "Actividad"**
**✅ Comprobar:**
- **Calendario/lista de actividad diaria**
- Debe aparecer actividad de **hoy**:
  - Artículos estudiados: 5
  - Exámenes realizados: 2-3
  - Tiempo de estudio

---

## **FASE 4: VERIFICAR PERSISTENCIA EN SUPABASE** 🗄️

### **4.1 Verificar datos en consola del navegador**
1. Abrir **DevTools** (F12)
2. Ir a la pestaña **Console**
3. Ejecutar estos comandos:

```javascript
// Verificar progreso de artículos
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Consultar progreso
await supabase.from('user_progress').select('*')

// Consultar estadísticas
await supabase.from('user_statistics').select('*')

// Consultar historial de exámenes
await supabase.from('exam_history').select('*')
```

**✅ Verificar:**
- Los datos aparecen en los resultados
- El número de registros coincide con lo que hiciste

### **4.2 Comprobar en Supabase Dashboard**
1. Ir a **https://app.supabase.com**
2. Seleccionar tu proyecto ConstiMaster
3. Ir a **Table Editor** en el menú lateral
4. Verificar tablas:
   - **`user_progress`**: Debe tener 5 registros (artículos 1-5)
   - **`user_statistics`**: Debe tener 1 registro con tus stats
   - **`exam_history`**: Debe tener 2-3 registros de exámenes
   - **`daily_activity`**: Debe tener 1 registro para hoy

**✅ Verificar:**
- Los datos están correctamente guardados
- Los valores numéricos son correctos

---

## **FASE 5: VERIFICAR ACTUALIZACIÓN EN TIEMPO REAL** 🔄

### **5.1 Estudiar un artículo nuevo**
1. Ir a **"Artículos"**
2. Estudiar **Artículo 6**
3. Marcar como completado
4. **SIN RECARGAR LA PÁGINA**, ir a **"Estadísticas"**

**✅ Verificar:**
- El contador de "Artículos estudiados" aumenta a **6**
- El progreso del Título Preliminar cambia a **6/9 (67%)**

**❌ Si NO se actualiza:**
- Este es el **problema conocido** que mencionaste
- Necesitas recargar la página (F5) para ver los cambios

### **5.2 Hacer un examen nuevo**
1. Hacer otro examen de cualquier título
2. Completarlo
3. **SIN RECARGAR**, ir a **"Estadísticas" → "Exámenes"**

**✅ Verificar:**
- El nuevo examen aparece en la lista
- El contador de "Exámenes realizados" aumenta

---

## **FASE 6: VERIFICAR EXPORT DE DATOS** 💾

### **6.1 Exportar estadísticas a CSV**
1. En **"Estadísticas"**, buscar el botón **"Exportar Datos"**
2. Seleccionar formato **CSV**
3. Descargar el archivo
4. Abrir el CSV en Excel/Google Sheets

**✅ Verificar:**
- El archivo contiene tus datos
- Las columnas son: fecha, artículos estudiados, exámenes, puntuación

### **6.2 Exportar estadísticas a PDF** (si está implementado)
1. Seleccionar formato **PDF**
2. Descargar
3. Abrir el PDF

**✅ Verificar:**
- Formato legible
- Datos correctos

---

## 📝 **CHECKLIST FINAL - RESULTADO ESPERADO**

### **✅ FUNCIONALIDADES QUE DEBEN FUNCIONAR:**
- [ ] Login/autenticación correcta
- [ ] Marcar artículos como completados
- [ ] Timer de estudio funciona (cuenta tiempo)
- [ ] Exámenes se guardan en historial
- [ ] Dashboard de estadísticas carga datos
- [ ] Los 5 tabs de estadísticas muestran información
- [ ] Gráficos se renderizan correctamente
- [ ] Progreso por títulos es correcto
- [ ] Historial de exámenes completo
- [ ] Datos persisten en Supabase
- [ ] Export de datos funciona

### **⚠️ PROBLEMAS CONOCIDOS (posibles):**
- [ ] **No se actualiza en tiempo real** → Requiere recarga manual (F5)
- [ ] **Contadores desincronizados** → Si esto pasa, es un bug crítico
- [ ] **Gráficos no cargan** → Puede ser problema de Chart.js
- [ ] **Error 404 al exportar** → Función de export no implementada

---

## 🚨 **SI ENCUENTRAS ERRORES:**

1. **Abrir DevTools (F12)**
2. **Ir a Console**
3. **Capturar cualquier error en rojo**
4. **Compartir el error exacto** con:
   - Mensaje de error completo
   - Stack trace
   - En qué paso del testing ocurrió

---

## 📊 **RESULTADOS DEL TESTING**

### **Fecha de prueba:** _____________

### **Funcionalidades probadas:**
| Funcionalidad | ✅/❌ | Notas |
|---------------|-------|-------|
| Autenticación | | |
| Estudiar artículos | | |
| Marcar como completado | | |
| Hacer exámenes | | |
| Ver resultados exámenes | | |
| Dashboard estadísticas | | |
| Tab Resumen | | |
| Tab Gráficos | | |
| Tab Progreso | | |
| Tab Exámenes | | |
| Tab Actividad | | |
| Persistencia Supabase | | |
| Actualización tiempo real | | |
| Export CSV | | |
| Export PDF | | |

### **Errores encontrados:**
```
[Pegar aquí los errores de consola]
```

### **Observaciones adicionales:**
```
[Cualquier otro comportamiento extraño o sugerencia]
```

---

**Última actualización:** 2025-10-01
**Estado:** Listo para testing
**Servidor de desarrollo:** http://localhost:3001
