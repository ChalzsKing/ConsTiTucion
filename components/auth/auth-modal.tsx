"use client"

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { LoginForm } from './login-form'
import { RegisterForm } from './register-form'
import { PasswordReset } from './password-reset'

type AuthMode = 'login' | 'register' | 'forgot-password'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: AuthMode
  redirectTo?: string
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', redirectTo }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const handleSuccess = () => {
    onClose()
  }

  const renderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <LoginForm
            onToggleToSignup={() => setMode('register')}
            onForgotPassword={() => setMode('forgot-password')}
            redirectTo={redirectTo}
          />
        )
      case 'register':
        return (
          <RegisterForm
            onToggleToLogin={() => setMode('login')}
            redirectTo={redirectTo}
          />
        )
      case 'forgot-password':
        return (
          <PasswordReset
            onBackToLogin={() => setMode('login')}
            mode="request"
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}