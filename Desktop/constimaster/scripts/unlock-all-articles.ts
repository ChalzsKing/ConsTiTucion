// Script temporal para desbloquear todos los artículos y poder probar Supabase

import fs from 'fs'
import { join } from 'path'

function unlockAllArticles() {
  console.log('🔓 Desbloqueando todos los artículos temporalmente...')

  const constitutionDataPath = join(process.cwd(), 'lib', 'constitution-data.ts')
  let content = fs.readFileSync(constitutionDataPath, 'utf-8')

  // Reemplazar todos los "available: false" por "available: true"
  const updatedContent = content.replace(/available: false/g, 'available: true')

  // Crear backup
  const backupPath = constitutionDataPath + '.backup'
  fs.writeFileSync(backupPath, content)

  // Escribir el archivo actualizado
  fs.writeFileSync(constitutionDataPath, updatedContent)

  console.log('✅ Todos los artículos desbloqueados')
  console.log('📁 Backup guardado en:', backupPath)
  console.log('🔄 Recarga la aplicación para ver los cambios')
}

function restoreArticles() {
  console.log('🔄 Restaurando estado original de artículos...')

  const constitutionDataPath = join(process.cwd(), 'lib', 'constitution-data.ts')
  const backupPath = constitutionDataPath + '.backup'

  if (fs.existsSync(backupPath)) {
    const originalContent = fs.readFileSync(backupPath, 'utf-8')
    fs.writeFileSync(constitutionDataPath, originalContent)
    fs.unlinkSync(backupPath) // Eliminar backup
    console.log('✅ Estado original restaurado')
  } else {
    console.log('❌ No se encontró backup para restaurar')
  }
}

// Ejecutar según argumento
const args = process.argv.slice(2)

if (args.includes('--unlock')) {
  unlockAllArticles()
} else if (args.includes('--restore')) {
  restoreArticles()
} else {
  console.log('Uso:')
  console.log('  npx tsx scripts/unlock-all-articles.ts --unlock    # Desbloquear todos')
  console.log('  npx tsx scripts/unlock-all-articles.ts --restore   # Restaurar original')
}

export { unlockAllArticles, restoreArticles }