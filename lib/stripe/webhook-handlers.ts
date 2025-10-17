import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Handler para checkout.session.completed
 * Se ejecuta cuando el usuario completa el pago inicial
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const userId = session.metadata?.supabase_user_id

    if (!userId) {
      console.error('No supabase_user_id in session metadata')
      return
    }

    // Obtener detalles de la suscripción de Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia'
    })

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id

    // Determinar tipo de plan basado en el price ID
    let planType: 'pro' | 'annual' = 'pro'
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL) {
      planType = 'annual'
    }

    // Actualizar suscripción en Supabase
    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: priceId,
        plan_type: planType,
        status: 'active',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    // Registrar pago en historial
    const amount = session.amount_total ? session.amount_total / 100 : 0
    await supabase.from('payment_history').insert({
      user_id: userId,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_invoice_id: subscription.latest_invoice as string,
      amount,
      currency: session.currency?.toUpperCase() || 'EUR',
      plan_type: planType,
      payment_status: 'succeeded',
      paid_at: new Date().toISOString()
    })

    console.log(`✅ Checkout completed for user ${userId} - Plan: ${planType}`)
  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error)
  }
}

/**
 * Handler para customer.subscription.updated
 * Se ejecuta cuando se actualiza una suscripción (cambio de plan, cancelación, etc.)
 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  try {
    const userId = subscription.metadata?.supabase_user_id

    if (!userId) {
      console.error('No supabase_user_id in subscription metadata')
      return
    }

    const priceId = subscription.items.data[0].price.id

    // Determinar tipo de plan
    let planType: 'free' | 'pro' | 'annual' = 'pro'
    if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL) {
      planType = 'annual'
    }

    // Mapear status de Stripe a nuestro status
    let status: 'active' | 'canceled' | 'expired' | 'past_due' = 'active'
    if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
      status = 'canceled'
    } else if (subscription.status === 'past_due') {
      status = 'past_due'
    } else if (subscription.status === 'unpaid') {
      status = 'expired'
    }

    // Actualizar en Supabase
    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripe_price_id: priceId,
        plan_type: planType,
        status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    console.log(`✅ Subscription updated for user ${userId} - Status: ${status}`)
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
  }
}

/**
 * Handler para customer.subscription.deleted
 * Se ejecuta cuando se cancela/elimina una suscripción
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  try {
    const userId = subscription.metadata?.supabase_user_id

    if (!userId) {
      console.error('No supabase_user_id in subscription metadata')
      return
    }

    // Revertir a plan FREE
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan_type: 'free',
        status: 'expired',
        stripe_subscription_id: null,
        stripe_price_id: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating subscription to free:', error)
      return
    }

    console.log(`✅ Subscription deleted for user ${userId} - Reverted to FREE`)
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
  }
}

/**
 * Handler para invoice.payment_succeeded
 * Se ejecuta cuando un pago recurrente es exitoso
 */
export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice
) {
  try {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    if (!subscriptionId) {
      // Es un pago único, no una suscripción
      return
    }

    // Obtener userId desde la suscripción
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id, plan_type')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!sub) {
      console.error('Subscription not found for invoice')
      return
    }

    // Registrar pago en historial
    const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0
    await supabase.from('payment_history').insert({
      user_id: sub.user_id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      stripe_invoice_id: invoice.id,
      amount,
      currency: invoice.currency?.toUpperCase() || 'EUR',
      plan_type: sub.plan_type,
      payment_status: 'succeeded',
      invoice_url: invoice.hosted_invoice_url,
      receipt_url: invoice.invoice_pdf,
      paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString()
    })

    console.log(`✅ Payment succeeded for user ${sub.user_id} - Amount: ${amount} ${invoice.currency}`)
  } catch (error) {
    console.error('Error in handleInvoicePaymentSucceeded:', error)
  }
}

/**
 * Handler para invoice.payment_failed
 * Se ejecuta cuando un pago recurrente falla
 */
export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
) {
  try {
    const subscriptionId = invoice.subscription as string

    if (!subscriptionId) {
      return
    }

    // Obtener userId desde la suscripción
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id, plan_type')
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!sub) {
      console.error('Subscription not found for failed invoice')
      return
    }

    // Actualizar status de suscripción a past_due
    await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', sub.user_id)

    // Registrar intento de pago fallido
    const amount = invoice.amount_due ? invoice.amount_due / 100 : 0
    await supabase.from('payment_history').insert({
      user_id: sub.user_id,
      stripe_invoice_id: invoice.id,
      amount,
      currency: invoice.currency?.toUpperCase() || 'EUR',
      plan_type: sub.plan_type,
      payment_status: 'failed',
      invoice_url: invoice.hosted_invoice_url
    })

    console.log(`⚠️ Payment failed for user ${sub.user_id}`)

    // TODO: Enviar email de notificación al usuario
  } catch (error) {
    console.error('Error in handleInvoicePaymentFailed:', error)
  }
}
