-- 💰 HITO 8: Sistema de Monetización - Tablas de Supabase
-- Creado: 2025-10-16
-- Propósito: Sistema completo de suscripciones y pagos con Stripe

-- ================================
-- 1. TABLA: subscriptions
-- ================================
-- Información de suscripción del usuario
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del plan
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'annual')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'past_due', 'trialing')),

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

  -- Un usuario solo puede tener una suscripción
  UNIQUE(user_id)
);

-- ================================
-- 2. TABLA: usage_limits
-- ================================
-- Control de límites de uso para usuarios FREE
CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Periodo de uso (mensual)
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Límites de exámenes generales
  general_exams_taken INTEGER DEFAULT 0,
  general_exams_limit INTEGER DEFAULT 5,

  -- Exámenes por título (JSON)
  -- Formato: {"titulo1": 1, "titulo2": 0, "titulo3": 1, ...}
  title_exams_count JSONB DEFAULT '{}',
  title_exams_limit INTEGER DEFAULT 1, -- Máximo 1 examen por título

  -- Metadatos
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Un registro por usuario por periodo
  UNIQUE(user_id, period_start)
);

-- ================================
-- 3. TABLA: payment_history
-- ================================
-- Historial de pagos y facturas
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del pago
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',

  -- Detalles del plan
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pro', 'annual')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('succeeded', 'pending', 'failed', 'refunded')),

  -- URLs útiles
  invoice_url TEXT,
  receipt_url TEXT,

  -- Metadatos
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- 4. ÍNDICES PARA RENDIMIENTO
-- ================================

-- Índices en subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Índices en usage_limits
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_period ON usage_limits(user_id, period_start);

-- Índices en payment_history
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(payment_status);

-- ================================
-- 5. POLÍTICAS RLS (Row Level Security)
-- ================================

-- Habilitar RLS en todas las tablas
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas para subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON subscriptions;
CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscription" ON subscriptions;
CREATE POLICY "Users can insert their own subscription" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON subscriptions;
CREATE POLICY "Users can update their own subscription" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para usage_limits
DROP POLICY IF EXISTS "Users can view their own usage limits" ON usage_limits;
CREATE POLICY "Users can view their own usage limits" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage limits" ON usage_limits;
CREATE POLICY "Users can insert their own usage limits" ON usage_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage limits" ON usage_limits;
CREATE POLICY "Users can update their own usage limits" ON usage_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para payment_history
DROP POLICY IF EXISTS "Users can view their own payment history" ON payment_history;
CREATE POLICY "Users can view their own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own payment history" ON payment_history;
CREATE POLICY "Users can insert their own payment history" ON payment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================
-- 6. FUNCIONES HELPER
-- ================================

-- Función para crear suscripción FREE por defecto
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear suscripción FREE al registrarse
  INSERT INTO subscriptions (user_id, plan_type, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  -- Crear registro de límites del mes actual
  INSERT INTO usage_limits (
    user_id,
    period_start,
    period_end,
    general_exams_taken,
    general_exams_limit,
    title_exams_count,
    title_exams_limit
  )
  VALUES (
    NEW.id,
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day',
    0,
    5,
    '{}',
    1
  )
  ON CONFLICT (user_id, period_start) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear suscripción automáticamente
DROP TRIGGER IF EXISTS trigger_create_default_subscription ON auth.users;
CREATE TRIGGER trigger_create_default_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Función para resetear límites mensuales
CREATE OR REPLACE FUNCTION reset_monthly_limits()
RETURNS void AS $$
BEGIN
  -- Crear nuevos registros de límites para el mes actual
  -- Solo para usuarios con plan FREE
  INSERT INTO usage_limits (
    user_id,
    period_start,
    period_end,
    general_exams_taken,
    general_exams_limit,
    title_exams_count,
    title_exams_limit
  )
  SELECT
    s.user_id,
    DATE_TRUNC('month', NOW()),
    DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day',
    0,
    5,
    '{}',
    1
  FROM subscriptions s
  WHERE s.plan_type = 'free'
    AND s.status = 'active'
  ON CONFLICT (user_id, period_start) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es PRO
CREATE OR REPLACE FUNCTION is_pro_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
BEGIN
  SELECT plan_type, status, current_period_end
  INTO subscription_record
  FROM subscriptions
  WHERE user_id = user_uuid;

  -- Usuario es PRO si tiene plan pro/annual activo y no expirado
  IF subscription_record IS NULL THEN
    RETURN FALSE;
  END IF;

  IF subscription_record.plan_type IN ('pro', 'annual')
     AND subscription_record.status = 'active'
     AND (subscription_record.current_period_end IS NULL OR subscription_record.current_period_end > NOW())
  THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener límites actuales del usuario
CREATE OR REPLACE FUNCTION get_user_limits(user_uuid UUID)
RETURNS TABLE (
  can_take_general_exam BOOLEAN,
  general_exams_remaining INTEGER,
  can_take_title_exam BOOLEAN,
  title_exams_count JSONB,
  is_pro BOOLEAN
) AS $$
DECLARE
  limits_record RECORD;
  sub_record RECORD;
BEGIN
  -- Verificar si es usuario PRO
  SELECT * INTO sub_record
  FROM subscriptions
  WHERE user_id = user_uuid;

  -- Si es PRO, retornar límites ilimitados
  IF sub_record.plan_type IN ('pro', 'annual') AND sub_record.status = 'active' THEN
    RETURN QUERY SELECT TRUE, 999999, TRUE, '{}'::JSONB, TRUE;
    RETURN;
  END IF;

  -- Obtener límites actuales del mes
  SELECT * INTO limits_record
  FROM usage_limits
  WHERE user_id = user_uuid
    AND period_start = DATE_TRUNC('month', NOW());

  -- Si no existe registro, crear uno
  IF limits_record IS NULL THEN
    INSERT INTO usage_limits (user_id, period_start, period_end)
    VALUES (
      user_uuid,
      DATE_TRUNC('month', NOW()),
      DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day'
    )
    RETURNING * INTO limits_record;
  END IF;

  -- Retornar límites
  RETURN QUERY SELECT
    (limits_record.general_exams_taken < limits_record.general_exams_limit),
    (limits_record.general_exams_limit - limits_record.general_exams_taken),
    TRUE, -- Siempre TRUE, se verifica por título específico
    limits_record.title_exams_count,
    FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================
-- 7. INICIALIZACIÓN
-- ================================

-- Crear suscripciones FREE para usuarios existentes
INSERT INTO subscriptions (user_id, plan_type, status)
SELECT id, 'free', 'active'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Crear límites del mes actual para usuarios existentes
INSERT INTO usage_limits (
  user_id,
  period_start,
  period_end,
  general_exams_taken,
  general_exams_limit,
  title_exams_count,
  title_exams_limit
)
SELECT
  id,
  DATE_TRUNC('month', NOW()),
  DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day',
  0,
  5,
  '{}',
  1
FROM auth.users
ON CONFLICT (user_id, period_start) DO NOTHING;

-- ================================
-- RESUMEN DE TABLAS CREADAS:
-- ================================
-- ✅ subscriptions: Información de plan y Stripe del usuario
-- ✅ usage_limits: Control de límites mensuales para FREE
-- ✅ payment_history: Historial de pagos y facturas
-- ✅ Índices optimizados para consultas rápidas
-- ✅ Políticas RLS para seguridad
-- ✅ Funciones helper para automatización
-- ✅ Trigger para crear suscripción FREE automáticamente
-- ✅ Función para resetear límites mensuales
-- ✅ Función para verificar si usuario es PRO
-- ✅ Función para obtener límites actuales

-- ================================
-- INSTRUCCIONES DE USO:
-- ================================
-- 1. Ejecutar este script completo en el SQL Editor de Supabase
-- 2. Verificar que las tablas se crearon correctamente
-- 3. Probar las funciones:
--    SELECT * FROM get_user_limits('user-uuid-aqui');
--    SELECT is_pro_user('user-uuid-aqui');
-- 4. Los límites se resetearán automáticamente cada mes (llamar reset_monthly_limits())
