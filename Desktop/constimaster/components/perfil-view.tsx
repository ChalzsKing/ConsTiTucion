"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, Trophy, Settings, Bell, Moon, Sun, Shield, Download, Trash2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockUserStats } from "@/lib/statistics-data"

interface UserProfile {
  name: string
  email: string
  joinDate: string
  studyGoal: number // minutes per day
  notifications: {
    dailyReminder: boolean
    weeklyProgress: boolean
    achievements: boolean
  }
  preferences: {
    darkMode: boolean
    autoAdvance: boolean
    showExplanations: boolean
  }
}

const mockProfile: UserProfile = {
  name: "María González",
  email: "maria.gonzalez@email.com",
  joinDate: "2024-01-15",
  studyGoal: 30,
  notifications: {
    dailyReminder: true,
    weeklyProgress: true,
    achievements: true,
  },
  preferences: {
    darkMode: false,
    autoAdvance: true,
    showExplanations: true,
  },
}

export function PerfilView() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const userStats = mockUserStats

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleNestedChange = (parent: keyof UserProfile, field: string, value: any) => {
    setProfile((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    // Here you would save to backend
    console.log("Saving profile:", profile)
    setHasChanges(false)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setProfile(mockProfile)
    setHasChanges(false)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getAchievementBadges = () => {
    const badges = []
    if (userStats.studyStreak >= 7)
      badges.push({ name: "Constante", icon: "🔥", color: "bg-orange-100 text-orange-800" })
    if (userStats.overallAccuracy >= 80)
      badges.push({ name: "Preciso", icon: "🎯", color: "bg-green-100 text-green-800" })
    if (userStats.examsCompleted >= 5)
      badges.push({ name: "Examinador", icon: "📝", color: "bg-blue-100 text-blue-800" })
    if (userStats.articlesCompleted >= 10)
      badges.push({ name: "Estudioso", icon: "📚", color: "bg-purple-100 text-purple-800" })
    return badges
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu cuenta y personaliza tu experiencia de estudio.</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Settings className="w-4 h-4" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyGoal">Objetivo diario de estudio (minutos)</Label>
                <Input
                  id="studyGoal"
                  type="number"
                  min="5"
                  max="180"
                  value={profile.studyGoal}
                  onChange={(e) => handleInputChange("studyGoal", Number.parseInt(e.target.value) || 30)}
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">
                  Recomendamos entre 15-60 minutos diarios para un progreso constante.
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Miembro desde</p>
                  <p className="text-sm text-muted-foreground">{formatDate(profile.joinDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Recordatorio diario</p>
                  <p className="text-sm text-muted-foreground">Recibe un recordatorio para estudiar cada día</p>
                </div>
                <Switch
                  checked={profile.notifications.dailyReminder}
                  onCheckedChange={(checked) => handleNestedChange("notifications", "dailyReminder", checked)}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Resumen semanal</p>
                  <p className="text-sm text-muted-foreground">Recibe un resumen de tu progreso cada semana</p>
                </div>
                <Switch
                  checked={profile.notifications.weeklyProgress}
                  onCheckedChange={(checked) => handleNestedChange("notifications", "weeklyProgress", checked)}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Logros y medallas</p>
                  <p className="text-sm text-muted-foreground">Notificaciones cuando consigas nuevos logros</p>
                </div>
                <Switch
                  checked={profile.notifications.achievements}
                  onCheckedChange={(checked) => handleNestedChange("notifications", "achievements", checked)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferencias de Estudio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {profile.preferences.darkMode ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Modo oscuro</p>
                    <p className="text-sm text-muted-foreground">Cambia la apariencia de la aplicación</p>
                  </div>
                </div>
                <Switch
                  checked={profile.preferences.darkMode}
                  onCheckedChange={(checked) => handleNestedChange("preferences", "darkMode", checked)}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Avance automático</p>
                  <p className="text-sm text-muted-foreground">
                    Pasar automáticamente al siguiente artículo tras responder
                  </p>
                </div>
                <Switch
                  checked={profile.preferences.autoAdvance}
                  onCheckedChange={(checked) => handleNestedChange("preferences", "autoAdvance", checked)}
                  disabled={!isEditing}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mostrar explicaciones</p>
                  <p className="text-sm text-muted-foreground">Ver explicaciones detalladas tras cada pregunta</p>
                </div>
                <Switch
                  checked={profile.preferences.showExplanations}
                  onCheckedChange={(checked) => handleNestedChange("preferences", "showExplanations", checked)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Resumen de Progreso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{userStats.overallAccuracy}%</div>
                <p className="text-sm text-muted-foreground">Precisión general</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-accent">{userStats.studyStreak}</div>
                  <p className="text-xs text-muted-foreground">Días seguidos</p>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{userStats.articlesCompleted}</div>
                  <p className="text-xs text-muted-foreground">Artículos</p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-bold text-muted-foreground">{userStats.examsCompleted}</div>
                <p className="text-sm text-muted-foreground">Exámenes completados</p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Logros Conseguidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getAchievementBadges().map((badge, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <Badge className={cn("mb-1", badge.color)}>{badge.name}</Badge>
                      <p className="text-xs text-muted-foreground">Logro desbloqueado</p>
                    </div>
                  </div>
                ))}
                {getAchievementBadges().length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    ¡Sigue estudiando para conseguir tus primeros logros!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Gestión de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Download className="w-4 h-4" />
                Exportar Progreso
              </Button>
              <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive bg-transparent">
                <Trash2 className="w-4 h-4" />
                Eliminar Cuenta
              </Button>
              <p className="text-xs text-muted-foreground">
                Puedes exportar tu progreso o eliminar permanentemente tu cuenta y todos los datos asociados.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
