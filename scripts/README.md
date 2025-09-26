# 🤖 Procesador de Preguntas Constitucionales

Script automatizado que usa **DeepSeek API** para convertir las 1600 preguntas de la Constitución Española a formato CSV para Supabase.

## 🚀 Configuración Rápida

### 1. Instalar dependencias
```bash
cd scripts
npm install
```

### 2. Configurar API Key
```bash
# Copiar archivo de ejemplo
copy .env.example .env

# Editar .env y añadir tu clave API de DeepSeek
DEEPSEEK_API_KEY=tu_clave_api_aqui
```

### 3. Probar conexión
```bash
npm run test
```

### 4. Procesar todas las preguntas
```bash
npm run process
```

## 📁 Estructura de Archivos

```
scripts/
├── convert-questions-to-csv.js    # Script principal
├── test-connection.js             # Prueba de conexión
├── package.json                   # Dependencias
├── .env.example                   # Configuración de ejemplo
└── README.md                      # Este archivo

../recursos/
├── preguntas/                     # 6 archivos de preguntas
└── respuestas/                    # 20 archivos de respuestas

../data/
└── questions.csv                  # Archivo generado (CSV para Supabase)
```

## 🎯 Resultado

El script genera un archivo `questions.csv` con esta estructura:

```csv
id,title_id,question_text,option_a,option_b,option_c,option_d,correct_answer,article_reference,difficulty_level
1,preliminar,"La Constitución se fundamenta:","En la unidad de la Nación","En el compromiso de unidad","En la indisoluble unidad","En la pluralidad de pueblos",c,1,medium
```

## 🔑 Obtener API Key de DeepSeek

1. Ve a [DeepSeek Platform](https://platform.deepseek.com)
2. Crea una cuenta
3. Ve a **API Keys**
4. Genera una nueva clave
5. Cópiala al archivo `.env`

## ⚡ Funcionalidades

- ✅ **Procesamiento automático** de 1600+ preguntas
- ✅ **Mapeo inteligente** de títulos constitucionales
- ✅ **Extracción de artículos** referenciados
- ✅ **Asignación de dificultad** automática
- ✅ **Formato CSV optimizado** para Supabase
- ✅ **Procesamiento por lotes** para respetar límites de API
- ✅ **Manejo de errores** robusto

## 🔧 Troubleshooting

### Error: "DEEPSEEK_API_KEY no encontrado"
- Verifica que el archivo `.env` existe
- Confirma que la clave API está correctamente copiada

### Error: "Error de conexión HTTP"
- Verifica tu conexión a internet
- Confirma que la clave API es válida
- Revisa si hay límites de rate en tu cuenta

### Error: "Límite de tokens excedido"
- El script procesa automáticamente por lotes
- Reduce el `batchSize` en el código si es necesario

## 📊 Después del Procesamiento

Una vez generado el CSV:

1. **Revisar** el archivo `../data/questions.csv`
2. **Importar** a Supabase en la tabla `questions`
3. **Verificar** que los `title_id` coinciden con tu estructura
4. **Probar** los exámenes en la aplicación