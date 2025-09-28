'use client'

import { ProtectedRoute } from '@/lib/auth/protected-route'
import { UserProfile } from '@/components/auth/user-profile'

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto py-8">
          <UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  )
}