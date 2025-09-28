"use client"

import { PasswordReset } from '@/components/auth/password-reset'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <PasswordReset
        mode="reset"
        onBackToLogin={() => router.push('/')}
      />
    </div>
  )
}