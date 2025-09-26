const fs = require('fs');
const path = require('path');

// Script para procesar preguntas y respuestas de la Constitución
// usando la API de DeepSeek para estructurar los datos

class QuestionProcessor {
  constructor() {
    this.questionsDir = '../recursos/preguntas';
    this.answersDir = '../recursos/respuestas';
    this.outputFile = '../data/questions.csv';
    this.deepSeekApiKey = process.env.DEEPSEEK_API_KEY;

    if (!this.deepSeekApiKey) {
      console.error('❌ Error: DEEPSEEK_API_KEY no está configurado en las variables de entorno');
      process.exit(1);
    }
  }

  // Leer todos los archivos de preguntas
  readQuestionFiles() {
    const questionFiles = fs.readdirSync(path.resolve(__dirname, this.questionsDir))
      .filter(file => file.startsWith('preguntas_completas_parte'))
      .sort();

    let allQuestions = '';

    questionFiles.forEach(file => {
      const filePath = path.resolve(__dirname, this.questionsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      allQuestions += content + '\n\n';
      console.log(`📖 Leído: ${file}`);
    });

    return allQuestions;
  }

  // Leer todos los archivos de respuestas
  readAnswerFiles() {
    const answerFiles = fs.readdirSync(path.resolve(__dirname, this.answersDir))
      .filter(file => file.startsWith('1600 respuestas constitucion_parte'))
      .sort();

    let allAnswers = '';

    answerFiles.forEach(file => {
      const filePath = path.resolve(__dirname, this.answersDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      allAnswers += content + '\n\n';
      console.log(`📖 Leído: ${file}`);
    });

    return allAnswers;
  }

  // Llamar a la API de DeepSeek para procesar los datos
  async callDeepSeekAPI(prompt) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepSeekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `Eres un experto en procesamiento de datos y Constitución Española.
              Tu tarea es convertir preguntas de exámenes constitucionales a formato CSV.

              Formato CSV requerido:
              id,title_id,question_text,option_a,option_b,option_c,option_d,correct_answer,article_reference,difficulty_level

              Mapeo de títulos:
              - "Título Preliminar" -> "preliminar"
              - "Título I" -> "titulo1"
              - "Título II" -> "titulo2"
              - "Título III" -> "titulo3"
              - etc.

              Reglas:
              1. Extrae SOLO el texto de la pregunta, sin el número
              2. Separa las 4 opciones claramente
              3. Mapea la respuesta correcta (A,B,C,D -> a,b,c,d)
              4. Si menciona un artículo específico, extráelo
              5. Asigna dificultad: easy/medium/hard basándote en complejidad
              6. Usa comillas dobles para campos con comas
              7. Escapa comillas internas con ""

              Responde SOLO con el CSV, sin explicaciones.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('❌ Error llamando a DeepSeek API:', error);
      throw error;
    }
  }

  // Procesar datos en lotes para evitar límites de tokens
  async processInBatches(questions, answers) {
    console.log('🤖 Procesando datos con DeepSeek API...');

    // Dividir en lotes más pequeños para manejar el límite de tokens
    const questionLines = questions.split('\n').filter(line => line.trim());
    const batchSize = 50; // Procesar 50 preguntas por vez
    let allCsvData = [];

    // Encabezado CSV
    const header = 'id,title_id,question_text,option_a,option_b,option_c,option_d,correct_answer,article_reference,difficulty_level';
    allCsvData.push(header);

    for (let i = 0; i < questionLines.length; i += batchSize) {
      const batch = questionLines.slice(i, i + batchSize);
      const batchQuestions = batch.join('\n');

      const prompt = `
      Convierte estas preguntas de la Constitución Española a formato CSV.

      PREGUNTAS:
      ${batchQuestions}

      RESPUESTAS:
      ${answers}

      Procesa cada pregunta y genera UNA LÍNEA CSV por pregunta.
      Asegúrate de que los IDs sean secuenciales comenzando desde ${i + 1}.
      `;

      try {
        console.log(`📊 Procesando lote ${Math.floor(i/batchSize) + 1}...`);
        const csvBatch = await this.callDeepSeekAPI(prompt);

        // Añadir las líneas del lote (sin el header si ya lo tenemos)
        const lines = csvBatch.split('\n').filter(line => line.trim() && !line.startsWith('id,'));
        allCsvData.push(...lines);

        // Pausa entre llamadas para respetar rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error procesando lote ${Math.floor(i/batchSize) + 1}:`, error);
        // Continuar con el siguiente lote
      }
    }

    return allCsvData.join('\n');
  }

  // Crear el directorio de salida si no existe
  ensureOutputDir() {
    const outputDir = path.dirname(path.resolve(__dirname, this.outputFile));
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  }

  // Función principal
  async process() {
    try {
      console.log('🚀 Iniciando procesamiento de preguntas constitucionales...');

      // Leer archivos
      console.log('\n📚 Leyendo archivos de preguntas...');
      const questions = this.readQuestionFiles();

      console.log('\n📝 Leyendo archivos de respuestas...');
      const answers = this.readAnswerFiles();

      // Procesar con DeepSeek
      const csvData = await this.processInBatches(questions, answers);

      // Guardar resultado
      this.ensureOutputDir();
      const outputPath = path.resolve(__dirname, this.outputFile);
      fs.writeFileSync(outputPath, csvData);

      console.log(`\n✅ ¡Proceso completado!`);
      console.log(`📁 Archivo CSV generado: ${outputPath}`);
      console.log(`📊 Líneas procesadas: ${csvData.split('\n').length - 1}`);

    } catch (error) {
      console.error('❌ Error durante el procesamiento:', error);
      process.exit(1);
    }
  }
}

// Ejecutar el script
if (require.main === module) {
  const processor = new QuestionProcessor();
  processor.process();
}

module.exports = QuestionProcessor;