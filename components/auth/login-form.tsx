"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, LogIn, Chrome } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface LoginFormProps {
  onToggleToSignup?: () => void
  onForgotPassword?: () => void
  redirectTo?: string
}

export function LoginForm({ onToggleToSignup, onForgotPassword, redirectTo = '/' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signIn, signInWithProvider } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    if (!email) {
      setError('El email es requerido')
      return false
    }
    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido')
      return false
    }
    if (!password) {
      setError('La contraseña es requerida')
      return false
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const { error } = await signIn(email, password)

      if (error) {
        switch (error.message) {
          case 'Invalid login credentials':
            setError('Email o contraseña incorrectos')
            break
          case 'Email not confirmed':
            setError('Por favor verifica tu email antes de iniciar sesión')
            break
          default:
            setError(error.message || 'Error al iniciar sesión')
        }
      } else {
        console.log('✅ Login exitoso')
        router.push(redirectTo)
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signInWithProvider('google')
      if (error) {
        setError('Error al iniciar sesión con Google')
      }
    } catch (err) {
      setError('Error inesperado con Google Sign In')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa a tu cuenta de ConstiMaster
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Iniciando sesión...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </div>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continúa con
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Chrome className="w-4 h-4 mr-2" />
          Google
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        {onForgotPassword && (
          <Button
            variant="link"
            className="text-sm"
            onClick={onForgotPassword}
            disabled={isLoading}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        )}

        {onToggleToSignup && (
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              ¿No tienes cuenta?{' '}
            </span>
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={onToggleToSignup}
              disabled={isLoading}
            >
              Regístrate aquí
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}