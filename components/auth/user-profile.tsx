"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Calendar, Shield, LogOut, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { PasswordReset } from './password-reset'

export function UserProfile() {
  const { user, updateProfile, signOut, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Estados del formulario
  const [profileData, setProfileData] = useState({
    full_name: '',
    display_name: '',
    avatar_url: ''
  })

  // Cargar datos del perfil cuando el usuario cambie
  useEffect(() => {
    if (user?.user_metadata) {
      setProfileData({
        full_name: user.user_metadata.full_name || user.user_metadata.name || '',
        display_name: user.user_metadata.display_name || user.user_metadata.name || '',
        avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || ''
      })
    }
  }, [user])

  const handleInputChange = (field: keyof typeof profileData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleSaveProfile = async () => {
    setError(null)
    setSuccess(null)

    if (!profileData.full_name.trim()) {
      setError('El nombre es requerido')
      return
    }

    setIsUpdating(true)
    try {
      const { error } = await updateProfile(profileData)

      if (error) {
        setError(error.message || 'Error al actualizar el perfil')
      } else {
        setSuccess('Perfil actualizado exitosamente')
        setIsEditing(false)
        console.log('✅ Perfil actualizado')
      }
    } catch (err) {
      setError('Error inesperado al actualizar el perfil')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    // Restaurar datos originales
    if (user?.user_metadata) {
      setProfileData({
        full_name: user.user_metadata.full_name || user.user_metadata.name || '',
        display_name: user.user_metadata.display_name || user.user_metadata.name || '',
        avatar_url: user.user_metadata.avatar_url || user.user_metadata.picture || ''
      })
    }
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No hay usuario autenticado</p>
      </div>
    )
  }

  if (showPasswordReset) {
    return (
      <div className="max-w-md mx-auto">
        <PasswordReset
          mode="reset"
          onBackToLogin={() => setShowPasswordReset(false)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Información del Perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Mi Perfil</CardTitle>
              <CardDescription>
                Gestiona tu información personal y preferencias de cuenta
              </CardDescription>
            </div>
            <Button
              variant={isEditing ? "ghost" : "outline"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isUpdating}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {(error || success) && (
            <Alert variant={error ? "destructive" : "default"}>
              <AlertDescription>{error || success}</AlertDescription>
            </Alert>
          )}

          {/* Avatar y nombre principal */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profileData.avatar_url} />
              <AvatarFallback className="text-lg">
                {getInitials(profileData.full_name || user.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">
                {profileData.display_name || profileData.full_name || 'Usuario'}
              </h3>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>

          <Separator />

          {/* Formulario de edición */}
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange('full_name')}
                  disabled={!isEditing || isUpdating}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Nombre a mostrar</Label>
                <Input
                  id="display_name"
                  value={profileData.display_name}
                  onChange={handleInputChange('display_name')}
                  disabled={!isEditing || isUpdating}
                  placeholder="Cómo quieres que te llamen"
                />
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL del Avatar (opcional)</Label>
                <Input
                  id="avatar_url"
                  value={profileData.avatar_url}
                  onChange={handleInputChange('avatar_url')}
                  disabled={isUpdating}
                  placeholder="https://ejemplo.com/mi-avatar.jpg"
                />
              </div>
            )}
          </div>

          {/* Información de la cuenta */}
          <Separator />
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Información de la Cuenta
            </h4>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cuenta creada:</span>
                <span>{formatDate(user.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último acceso:</span>
                <span>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Nunca'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verificado:</span>
                <span className={user.email_confirmed_at ? "text-green-600" : "text-amber-600"}>
                  {user.email_confirmed_at ? 'Sí' : 'Pendiente'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>

        {isEditing && (
          <CardFooter className="flex gap-2">
            <Button
              onClick={handleSaveProfile}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Acciones de Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>
            Gestiona la seguridad de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPasswordReset(true)}
          >
            <Shield className="w-4 h-4 mr-2" />
            Cambiar Contraseña
          </Button>
        </CardContent>
      </Card>

      {/* Cerrar Sesión */}
      <Card>
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
            disabled={loading}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}