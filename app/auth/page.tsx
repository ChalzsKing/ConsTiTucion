'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/login-form'
import { RegisterForm } from '@/components/auth/register-form'
import { PasswordReset } from '@/components/auth/password-reset'

type AuthMode = 'login' | 'register' | 'reset'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {mode === 'login' && (
          <LoginForm
            onToggleToSignup={() => setMode('register')}
            onForgotPassword={() => setMode('reset')}
            redirectTo="/"
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            onToggleToLogin={() => setMode('login')}
            redirectTo="/"
          />
        )}

        {mode === 'reset' && (
          <PasswordReset
            mode="request"
            onBackToLogin={() => setMode('login')}
          />
        )}
      </div>
    </div>
  )
}