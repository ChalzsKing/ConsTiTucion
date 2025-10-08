// 🔍 DEBUG: Verificar estado del hook unificado
// Ejecutar en consola del navegador (F12) cuando estés en la app

console.log('🔍 DEBUGGING UNIFIED PROGRESS...')

// 1. Verificar si hay instancia de useUnifiedProgress
if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    console.log('⚛️ React detectado')
}

// 2. Verificar localStorage limpio
const localKeys = Object.keys(localStorage).filter(key =>
    key.toLowerCase().includes('progress') ||
    key.toLowerCase().includes('constit') ||
    key.toLowerCase().includes('article')
)

if (localKeys.length === 0) {
    console.log('✅ localStorage está limpio')
} else {
    console.log('⚠️ localStorage tiene datos:', localKeys)
    localKeys.forEach(key => {
        console.log(`   ${key}:`, localStorage.getItem(key))
    })
}

// 3. Verificar if Supabase está disponible
if (window.supabase) {
    console.log('✅ Supabase cliente disponible')

    // Verificar datos en Supabase
    window.supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
            console.log('👤 Usuario autenticado:', user.id)

            // Verificar user_progress
            window.supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', user.id)
                .then(({ data, error }) => {
                    if (error) {
                        console.log('❌ Error consultando user_progress:', error)
                    } else {
                        console.log('📊 user_progress registros:', data?.length || 0)
                        if (data && data.length > 0) {
                            console.log('📋 Datos encontrados:', data)
                        }
                    }
                })
        } else {
            console.log('❌ No hay usuario autenticado')
        }
    })
} else {
    console.log('❌ Supabase no está disponible')
}

console.log('✅ Debug completado')