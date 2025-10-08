// 🧹 LIMPIAR DATOS DEL NAVEGADOR - ConstiMaster
// Ejecutar este código en la consola del navegador (F12)

console.log('🧹 Iniciando limpieza completa del navegador...')

// 1. Limpiar todas las claves relacionadas con ConstiMaster
const keysToClean = [
    'constimaster-user-progress',
    'constimaster-user-progress-backup',
    'userProgress',
    'constitutionProgress',
    'articleProgress',
    'examResults',
    'studySession',
    'navigationState'
]

let cleanedKeys = 0
keysToClean.forEach(key => {
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        cleanedKeys++
        console.log(`✅ Eliminado: ${key}`)
    }
})

// 2. Buscar cualquier otra clave que pueda estar relacionada
const allKeys = Object.keys(localStorage)
const constitutionKeys = allKeys.filter(key =>
    key.toLowerCase().includes('constit') ||
    key.toLowerCase().includes('article') ||
    key.toLowerCase().includes('progress')
)

constitutionKeys.forEach(key => {
    if (!keysToClean.includes(key)) {
        console.log(`🔍 Clave adicional encontrada: ${key}`)
        localStorage.removeItem(key)
        cleanedKeys++
    }
})

// 3. Limpiar sessionStorage también
sessionStorage.clear()

console.log(`🎉 Limpieza completada. ${cleanedKeys} claves eliminadas`)
console.log('🔄 Recarga la página para empezar desde cero')

// 4. Verificar que está limpio
setTimeout(() => {
    const remaining = Object.keys(localStorage).filter(key =>
        key.toLowerCase().includes('constit') ||
        key.toLowerCase().includes('article')
    )

    if (remaining.length === 0) {
        console.log('✅ Navegador completamente limpio')
    } else {
        console.log('⚠️ Claves restantes:', remaining)
    }
}, 1000)