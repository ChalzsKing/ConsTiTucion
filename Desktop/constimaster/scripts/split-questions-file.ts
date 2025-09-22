import fs from 'fs'
import { join } from 'path'

async function splitQuestionsFile() {
  console.log('📂 Dividiendo archivo de 1600 preguntas en partes más pequeñas...')

  const questionsFile = join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
  const content = fs.readFileSync(questionsFile, 'utf-8')

  console.log(`📄 Archivo original: ${Math.round(content.length / 1024)} KB`)

  // Dividir por bloques de preguntas (buscar patrones como "1.-", "2.-", etc.)
  const questionBlocks = content.split(/(?=\d+\.\-)/g).filter(block => block.trim())

  console.log(`🔢 Encontrados ${questionBlocks.length} bloques de preguntas`)

  // Dividir en 4 partes aproximadamente iguales
  const questionsPerPart = Math.ceil(questionBlocks.length / 4)

  for (let part = 0; part < 4; part++) {
    const startIndex = part * questionsPerPart
    const endIndex = Math.min(startIndex + questionsPerPart, questionBlocks.length)

    const partBlocks = questionBlocks.slice(startIndex, endIndex)
    const partContent = partBlocks.join('')

    const outputFile = join(process.cwd(), 'recursos', `preguntas_parte_${part + 1}.txt`)
    fs.writeFileSync(outputFile, partContent, 'utf-8')

    console.log(`✅ Parte ${part + 1}: ${partBlocks.length} preguntas (${Math.round(partContent.length / 1024)} KB)`)
    console.log(`   Rango aproximado: pregunta ${startIndex + 1} - ${endIndex}`)
    console.log(`   Archivo: preguntas_parte_${part + 1}.txt`)
  }

  // También crear un archivo de muestra pequeño para testing
  const sampleBlocks = questionBlocks.slice(0, 10)
  const sampleContent = sampleBlocks.join('')
  const sampleFile = join(process.cwd(), 'recursos', 'preguntas_muestra.txt')
  fs.writeFileSync(sampleFile, sampleContent, 'utf-8')

  console.log(`\n🧪 Archivo de muestra creado: preguntas_muestra.txt (10 preguntas)`)
  console.log(`\n🎉 ¡División completada! Ahora puedes procesar los archivos parte por parte.`)
}

if (require.main === module) {
  splitQuestionsFile()
}

export { splitQuestionsFile }