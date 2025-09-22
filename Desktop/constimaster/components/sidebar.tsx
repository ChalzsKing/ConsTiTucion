"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BookOpen, FileText, BarChart3, User, Shield, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getOverallProgress } from "@/lib/constitution-data"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
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
      id: "perfil",
      label: "Mi Perfil",
      icon: User,
      description: "Gestiona tu cuenta",
    },
  ]

  const progress = getOverallProgress()

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

      <Card className="m-4 p-4 bg-card">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progreso General</span>
            <span className="text-sm text-muted-foreground">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div className="bg-accent h-2 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent" />
            <span>{progress.completed} artículos completados</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
