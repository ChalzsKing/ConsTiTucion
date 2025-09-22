import fs from 'fs'
import path from 'path'

function debugQuestionParsing() {
  console.log('🔍 Debugeando el parsing de preguntas...')

  const questionsFile = path.join(process.cwd(), 'recursos', '1600_preguntas_constitucion_espanola.txt')
  const content = fs.readFileSync(questionsFile, 'utf-8')

  console.log(`📊 Tamaño del archivo: ${content.length} caracteres`)
  console.log(`📊 Líneas totales: ${content.split('\n').length}`)

  // Buscar patrones de preguntas
  const questionPattern = /(\d+)\.-/g
  const matches = [...content.matchAll(questionPattern)]

  console.log(`📊 Patrones "X.-" encontrados: ${matches.length}`)

  if (matches.length > 0) {
    console.log('🔍 Primeros 10 números de pregunta encontrados:')
    matches.slice(0, 10).forEach(match => {
      console.log(`  Pregunta ${match[1]}`)
    })

    console.log('🔍 Últimos 10 números de pregunta encontrados:')
    matches.slice(-10).forEach(match => {
      console.log(`  Pregunta ${match[1]}`)
    })
  }

  // Analizar las primeras líneas
  console.log('\n📝 Primeras 20 líneas del archivo:')
  const lines = content.split('\n')
  lines.slice(0, 20).forEach((line, i) => {
    console.log(`${(i+1).toString().padStart(2)}: ${line}`)
  })

  // Buscar el primer bloque de pregunta completo
  console.log('\n🔍 Buscando primer bloque de pregunta completo...')

  const blocks = content.split(/(?=\d+\.-)/g).filter(block => block.trim())

  console.log(`📊 Bloques encontrados: ${blocks.length}`)

  if (blocks.length > 0) {
    console.log('\n📋 Primer bloque:')
    console.log('---START---')
    console.log(blocks[0].substring(0, 500))
    console.log('---END---')

    console.log('\n📋 Segundo bloque:')
    console.log('---START---')
    console.log(blocks[1]?.substring(0, 500) || 'No existe')
    console.log('---END---')
  }

  // Probar el regex de parsing
  console.log('\n🧪 Probando regex en primer bloque...')
  if (blocks.length > 0) {
    const block = blocks[0].trim()

    const numberMatch = block.match(/^(\d+)\.-/)
    console.log('Número encontrado:', numberMatch?.[1])

    const questionMatch = block.match(/^\d+\.- (.+?)(?=\s+a\))/s)
    console.log('Texto de pregunta:', questionMatch?.[1]?.substring(0, 100))

    const optionAMatch = block.match(/a\)\s*(.+?)(?=\s+b\))/s)
    console.log('Opción A:', optionAMatch?.[1])
  }
}

if (require.main === module) {
  debugQuestionParsing()
}

export { debugQuestionParsing }