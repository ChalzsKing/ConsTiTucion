"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, FileText, BarChart3, User, Shield, CheckCircle2, Trophy, Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProgress } from "@/lib/hooks/useUnifiedProgressContext"
import { useAchievements } from "@/lib/hooks/useAchievements"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { overall, loading, getStudyStreak } = useProgress()
  const { xpData, unlockedCount, totalBadges } = useAchievements()
  const [isHydrated, setIsHydrated] = useState(false)

  const currentStreak = getStudyStreak()

  const menuItems = [
    {
      id: "articulos",
      label: "Artículos",
      icon: BookOpen,
      description: "Estudia la Constitución",
    },
    {
      id: "examenes",
      label: "Exámenes",
      icon: FileText,
      description: "Pon a prueba tus conocimientos",
    },
    {
      id: "estadisticas",
      label: "Estadísticas",
      icon: BarChart3,
      description: "Tu progreso y evolución",
    },
    {
      id: "logros",
      label: "Logros",
      icon: Trophy,
      description: "Tus badges y logros",
    },
    {
      id: "perfil",
      label: "Mi Perfil",
      icon: User,
      description: "Gestiona tu cuenta",
    },
  ]

  // Hidratación del componente
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <div className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo and Title */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">ConstiMaster</h1>
            <p className="text-sm text-muted-foreground">Domina la Constitución</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12 text-left",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              onClick={() => onSectionChange(item.id)}
            >
              <Icon className="w-5 h-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">{item.label}</span>
                <span className="text-xs opacity-75">{item.description}</span>
              </div>
            </Button>
          )
        })}
      </nav>

      {/* Progreso General */}
      <Card className="m-4 p-4 bg-card space-y-4">
        {/* Nivel y XP */}
        {xpData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{xpData.levelIcon}</span>
                <div>
                  <p className="text-sm font-bold">Nivel {xpData.currentLevel}</p>
                  <p className={cn("text-xs", xpData.levelColor)}>{xpData.levelTitle}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{xpData.progressPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${xpData.progressPercentage}%` }}></div>
            </div>
          </div>
        )}

        {/* Separador */}
        <div className="border-t" />

        {/* Progreso de artículos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progreso</span>
            <span className="text-sm text-muted-foreground">{overall.completionPercentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div className="bg-accent h-1.5 rounded-full" style={{ width: `${overall.completionPercentage}%` }}></div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-accent" />
            <span>{overall.completedArticles} de {overall.totalArticles}</span>
          </div>
        </div>

        {/* Stats compactas */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <div className="flex flex-col">
              <span className="text-xs font-bold">{currentStreak}</span>
              <span className="text-[10px] text-muted-foreground">días</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <div className="flex flex-col">
              <span className="text-xs font-bold">{unlockedCount}/{totalBadges}</span>
              <span className="text-[10px] text-muted-foreground">logros</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
