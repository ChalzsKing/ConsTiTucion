"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

interface PasswordResetProps {
  onBackToLogin?: () => void
  mode?: 'request' | 'reset' // request = solicitar reset, reset = cambiar password
}

export function PasswordReset({ onBackToLogin, mode = 'request' }: PasswordResetProps) {
  // Estados para modo 'request'
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Estados para modo 'reset'
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const { resetPassword, updatePassword } = useAuth()

  const validateEmail = () => {
    if (!email) {
      setError('El email es requerido')
      return false
    }
    if (!email.includes('@')) {
      setError('Por favor ingresa un email válido')
      return false
    }
    return true
  }

  const validatePasswordReset = () => {
    if (!newPassword) {
      setError('La nueva contraseña es requerida')
      return false
    }
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    // Validar que tenga al menos una letra y un número
    const hasLetter = /[a-zA-Z]/.test(newPassword)
    const hasNumber = /\d/.test(newPassword)
    if (!hasLetter || !hasNumber) {
      setError('La contraseña debe contener al menos una letra y un número')
      return false
    }

    return true
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateEmail()) return

    setIsLoading(true)
    try {
      const { error } = await resetPassword(email)

      if (error) {
        switch (error.message) {
          case 'Invalid email':
            setError('Email inválido')
            break
          default:
            setError(error.message || 'Error al enviar el email de recuperación')
        }
      } else {
        setSuccess(true)
        console.log('✅ Email de recuperación enviado')
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validatePasswordReset()) return

    setIsLoading(true)
    try {
      const { error } = await updatePassword(newPassword)

      if (error) {
        setError(error.message || 'Error al actualizar la contraseña')
      } else {
        setResetSuccess(true)
        console.log('✅ Contraseña actualizada exitosamente')
      }
    } catch (err) {
      setError('Error inesperado. Por favor intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  // Pantalla de éxito para solicitud de reset
  if (mode === 'request' && success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-800">Email Enviado</CardTitle>
          <CardDescription>
            Te hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Revisa tu bandeja de entrada</strong> y haz clic en el enlace para restablecer tu contraseña.
              El enlace expirará en 1 hora.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            ¿No encuentras el email? Revisa tu carpeta de spam.
          </p>
        </CardContent>
        <CardFooter>
          {onBackToLogin && (
            <Button
              variant="outline"
              className="w-full"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Login
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  // Pantalla de éxito para cambio de contraseña
  if (mode === 'reset' && resetSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">¡Contraseña Actualizada!</CardTitle>
          <CardDescription>
            Tu contraseña ha sido cambiada exitosamente
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Ya puedes usar tu nueva contraseña para iniciar sesión.
          </p>
        </CardContent>
        <CardFooter>
          {onBackToLogin && (
            <Button
              className="w-full"
              onClick={onBackToLogin}
            >
              Ir al Login
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  // Formulario para solicitar reset de contraseña
  if (mode === 'request') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Recuperar Contraseña</CardTitle>
          <CardDescription>
            Ingresa tu email para recibir instrucciones de recuperación
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleRequestReset} className="space-y-4">
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando email...
                </div>
              ) : (
                'Enviar Email de Recuperación'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          {onBackToLogin && (
            <Button
              variant="link"
              className="w-full"
              onClick={onBackToLogin}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Login
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  // Formulario para cambiar contraseña
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Nueva Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu nueva contraseña
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
            <p className="text-xs text-muted-foreground">
              Mínimo 6 caracteres con al menos una letra y un número
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                Actualizando...
              </div>
            ) : (
              'Actualizar Contraseña'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}