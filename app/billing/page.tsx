"use client"

import { BillingDashboard } from '@/components/subscription/BillingDashboard'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function BillingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Facturación y suscripción</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu plan, método de pago y facturación
          </p>
        </div>

        {/* Billing Dashboard */}
        <BillingDashboard />
      </div>
    </div>
  )
}
