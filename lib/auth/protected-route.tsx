'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function ProtectedRoute({
  children,
  redirectTo = '/auth',
  requireAuth = true
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Usuario no autenticado pero se requiere autenticación
        console.log('⚠️ Acceso denegado: usuario no autenticado')
        router.push(redirectTo)
      } else if (!requireAuth && user) {
        // Usuario autenticado pero la ruta es solo para no autenticados (ej: login)
        console.log('ℹ️ Usuario ya autenticado, redirigiendo a home')
        router.push('/')
      }
    }
  }, [user, loading, requireAuth, router, redirectTo])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h2 className="text-xl font-semibold">Verificando autenticación...</h2>
          <p className="text-muted-foreground">Por favor espera un momento.</p>
        </div>
      </div>
    )
  }

  // Verificar si se debe mostrar el contenido
  const shouldShowContent = requireAuth ? user : true

  if (!shouldShowContent) {
    return null // No mostrar nada mientras se hace la redirección
  }

  return <>{children}</>
}

// Hook personalizado para verificar autenticación en componentes
export function useRequireAuth(redirectTo: string = '/auth') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}

// Hook para verificar que el usuario NO esté autenticado (para páginas como login/register)
export function useRequireNoAuth(redirectTo: string = '/') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}