"use client"

import { Crown, Sparkles } from 'lucide-react'
import { useSubscription } from '@/lib/hooks/useSubscription'

export function SubscriptionBadge() {
  const { subscription, isPro, loading } = useSubscription()

  if (loading || !subscription) return null

  if (isPro()) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold shadow-lg">
        <Crown className="w-3 h-3" />
        PRO
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
      FREE
    </div>
  )
}
