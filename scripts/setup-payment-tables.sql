-- Script para crear las tablas de sistema de pagos
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del plan
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'annual')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'past_due', 'trialing')) DEFAULT 'active',

  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Periodos
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_ends_at TIMESTAMP,

  -- Control de cancelación
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,

  -- Metadatos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id)
);

-- 2. Tabla de límites de uso
CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Periodo de uso
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Límites de exámenes
  general_exams_taken INTEGER DEFAULT 0,
  general_exams_limit INTEGER DEFAULT 5,

  -- Exámenes por título (JSON)
  title_exams_count JSONB DEFAULT '{}',
  title_exams_limit INTEGER DEFAULT 1,

  -- Reset automático cada mes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, period_start)
);

-- 3. Tabla de historial de pagos
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del pago
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',

  -- Detalles del plan
  plan_type TEXT NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('succeeded', 'pending', 'failed', 'refunded')),

  -- URLs útiles
  invoice_url TEXT,
  receipt_url TEXT,

  -- Metadatos
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_period ON usage_limits(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);

-- 5. Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Policies para subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;
CREATE POLICY "Users can insert their own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies para usage_limits
DROP POLICY IF EXISTS "Users can view their own usage limits" ON usage_limits;
CREATE POLICY "Users can view their own usage limits" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage limits" ON usage_limits;
CREATE POLICY "Users can insert their own usage limits" ON usage_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage limits" ON usage_limits;
CREATE POLICY "Users can update their own usage limits" ON usage_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para payment_history
DROP POLICY IF EXISTS "Users can view their own payment history" ON payment_history;
CREATE POLICY "Users can view their own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Tablas de sistema de pagos creadas correctamente';
  RAISE NOTICE '✅ Índices creados';
  RAISE NOTICE '✅ Políticas RLS configuradas';
END $$;
