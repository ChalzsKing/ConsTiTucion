# 💰 HITO 8: Sistema de Monetización y Pagos con Stripe

**Fecha de creación**: 2025-10-16
**Estado**: 📋 PLANIFICADO
**Prioridad**: ALTA

---

## 🎯 Objetivo del Hito

Implementar un sistema completo de monetización freemium con Stripe que permita:
- Suscripciones mensuales y anuales
- Restricción inteligente de contenido por plan
- Gestión de facturación y pagos
- Experiencia de usuario fluida para upgrade/downgrade

---

## 📊 Modelo de Negocio

### **Plan FREE** 🆓
**Precio**: Gratis
**Límites**:
- ✅ Acceso completo a contenido constitucional (169 artículos)
- ✅ Sistema de estudio con navegación ilimitada
- ⚠️ **5 exámenes generales por mes**
- ⚠️ **1 examen por título** (máximo 8 exámenes de título/mes)
- ❌ Sin estadísticas avanzadas
- ❌ Sin exportación de datos (CSV/PDF)
- ❌ Sin gamificación completa

### **Plan PRO** 💎
**Precio**: €4.99/mes
**Beneficios**:
- ✅ **Exámenes completamente ilimitados**
- ✅ Estadísticas detalladas y gráficos avanzados
- ✅ Exportación de datos (CSV/PDF)
- ✅ Historial completo de exámenes
- ✅ Gamificación completa (badges, logros, rankings)
- ✅ Soporte prioritario

### **Plan ANNUAL** 🏆
**Precio**: €49.99/año (ahorro de €10 - 2 meses gratis)
**Beneficios**: Todos los del Plan PRO + descuento

---

## 🗄️ Modelo de Datos (Supabase)

### 1. Tabla: `subscriptions`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Información del plan
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'annual')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'past_due', 'trialing')),

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
```

### 2. Tabla: `usage_limits`
```sql
CREATE TABLE usage_limits (
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
  -- Ejemplo: {"titulo1": 1, "titulo2": 0, ...}

  -- Reset automático cada mes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, period_start)
);
```

### 3. Tabla: `payment_history`
```sql
CREATE TABLE payment_history (
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
```

### 4. Índices y RLS

```sql
-- Índices
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_usage_limits_user_period ON usage_limits(user_id, period_start);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage limits" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);
```

---

## 🔧 Integración con Stripe

### Configuración Inicial

1. **Crear cuenta Stripe** (https://stripe.com)
2. **Obtener API Keys**:
   - Publishable Key: `pk_test_...` (frontend)
   - Secret Key: `sk_test_...` (backend)
3. **Instalar SDK**: `npm install stripe @stripe/stripe-js`

### Productos en Stripe

```javascript
// Crear productos programáticamente o desde Dashboard
const products = [
  {
    name: 'ConstiMaster Pro - Mensual',
    price: 499, // €4.99 en centavos
    currency: 'eur',
    interval: 'month'
  },
  {
    name: 'ConstiMaster Pro - Anual',
    price: 4999, // €49.99 en centavos
    currency: 'eur',
    interval: 'year'
  }
]
```

### Webhooks de Stripe

**URL del webhook**: `https://tudominio.com/api/stripe/webhooks`

**Eventos a escuchar**:
- `checkout.session.completed` → Usuario completa pago inicial
- `customer.subscription.created` → Nueva suscripción creada
- `customer.subscription.updated` → Cambio en suscripción (upgrade/downgrade)
- `customer.subscription.deleted` → Suscripción cancelada
- `invoice.payment_succeeded` → Pago recurrente exitoso
- `invoice.payment_failed` → Pago recurrente falló

---

## 🛠️ API Routes (Next.js App Router)

### 1. `app/api/stripe/create-checkout-session/route.ts`
```typescript
// Crear sesión de Stripe Checkout
// Recibe: { priceId, userId }
// Retorna: { sessionId, url }
```

### 2. `app/api/stripe/create-portal-session/route.ts`
```typescript
// Crear sesión de Stripe Customer Portal
// Permite al usuario gestionar su suscripción
// Recibe: { customerId }
// Retorna: { url }
```

### 3. `app/api/stripe/webhooks/route.ts`
```typescript
// Endpoint para webhooks de Stripe
// Valida firma del webhook
// Procesa eventos y actualiza BD
```

---

## 🎨 Componentes UI/UX

### Páginas Nuevas

#### `/app/pricing/page.tsx`
**Descripción**: Landing de precios con comparativa de planes
**Componentes**:
- `PricingTable` - Cards de planes
- `FeatureComparison` - Tabla comparativa
- `FAQ` - Preguntas frecuentes

#### `/app/checkout/success/page.tsx`
**Descripción**: Confirmación post-pago
**Contenido**:
- Mensaje de éxito
- Resumen de suscripción
- Botón "Ir a Dashboard"

#### `/app/checkout/cancel/page.tsx`
**Descripción**: Pago cancelado por usuario
**Contenido**:
- Mensaje amigable
- Botón "Volver a Pricing"

#### `/app/billing/page.tsx`
**Descripción**: Gestión de suscripción y facturación
**Componentes**:
- `BillingDashboard` - Info de plan actual
- `PaymentMethodCard` - Método de pago
- `InvoiceHistory` - Histórico de facturas

### Componentes Reutilizables

#### `components/subscription/PricingTable.tsx`
```typescript
// Cards con planes FREE, PRO, ANNUAL
// Botón "Upgrade" redirige a Stripe Checkout
// Botón "Current Plan" si ya está en ese plan
```

#### `components/subscription/PaywallModal.tsx`
```typescript
// Modal que aparece al alcanzar límite
// Props: isOpen, onClose, limitType ('general' | 'title')
// Muestra beneficios de Pro + botón Upgrade
```

#### `components/subscription/SubscriptionBadge.tsx`
```typescript
// Badge pequeño "FREE" o "PRO"
// Se muestra en header/sidebar
```

#### `components/subscription/UsageMeter.tsx`
```typescript
// Barra de progreso de límites
// Ejemplo: "3 / 5 exámenes este mes"
// Color verde → amarillo → rojo según uso
```

#### `components/subscription/BillingDashboard.tsx`
```typescript
// Panel completo de gestión de suscripción
// Info de plan, próximo pago, botón "Gestionar"
```

---

## 🔐 Lógica de Restricción de Contenido

### Hook: `lib/hooks/useSubscription.ts`

```typescript
export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [usageLimits, setUsageLimits] = useState(null)

  // Funciones:
  // - checkCanTakeExam(examType: 'general' | 'title', titleId?: string)
  // - incrementExamCount(examType, titleId?)
  // - hasFeatureAccess(feature: string)
  // - isPro() → boolean
  // - isFree() → boolean
}
```

### Middleware: `lib/subscription/usage-middleware.ts`

```typescript
// Verificar antes de iniciar examen
export async function checkUsageLimits(
  userId: string,
  examType: 'general' | 'title',
  titleId?: string
): Promise<{ allowed: boolean, reason?: string }> {

  // 1. Obtener suscripción del usuario
  // 2. Si es PRO → return { allowed: true }
  // 3. Si es FREE → verificar límites
  // 4. Return { allowed: false, reason: 'Límite alcanzado' }
}
```

### Integración en Exámenes

```typescript
// components/exam-flow.tsx
const startExam = async () => {
  const { allowed, reason } = await checkUsageLimits(user.id, examType, titleId)

  if (!allowed) {
    setShowPaywall(true)
    setPaywallReason(reason)
    return
  }

  // Iniciar examen normalmente...
}
```

---

## 📋 Flujos de Usuario

### Flujo 1: Usuario Free alcanza límite

```mermaid
Usuario inicia examen
  ↓
checkUsageLimits() → Límite alcanzado
  ↓
Aparece PaywallModal
  ↓
Usuario click "Upgrade to Pro"
  ↓
Redirige a /pricing
  ↓
Usuario selecciona plan (mensual/anual)
  ↓
Click "Suscribirse" → Stripe Checkout
  ↓
Completa pago en Stripe
  ↓
Webhook recibe checkout.session.completed
  ↓
Actualiza BD: subscription status = 'active'
  ↓
Usuario redirigido a /checkout/success
  ↓
Acceso inmediato a exámenes ilimitados
```

### Flujo 2: Usuario Pro cancela suscripción

```mermaid
Usuario va a /billing
  ↓
Click "Gestionar Suscripción"
  ↓
Redirige a Stripe Customer Portal
  ↓
Usuario click "Cancelar suscripción"
  ↓
Confirma cancelación (activa hasta fin de periodo)
  ↓
Webhook recibe customer.subscription.updated
  ↓
Actualiza BD: cancel_at_period_end = true
  ↓
Usuario sigue teniendo acceso Pro hasta current_period_end
  ↓
Al llegar a current_period_end → Webhook subscription.deleted
  ↓
Actualiza BD: plan_type = 'free', status = 'expired'
  ↓
Usuario vuelve a límites FREE
```

### Flujo 3: Upgrade de Mensual a Anual

```mermaid
Usuario Pro (mensual) va a /billing
  ↓
Ve opción "Ahorrar con plan anual"
  ↓
Click "Cambiar a anual" → Stripe Checkout
  ↓
Stripe calcula proration (reembolsa días no usados)
  ↓
Usuario completa pago
  ↓
Webhook recibe customer.subscription.updated
  ↓
Actualiza BD: plan_type = 'annual', stripe_price_id actualizado
  ↓
Usuario tiene Pro anual con nuevo periodo
```

---

## 🛡️ Seguridad y Validación

### 1. Verificación de Firma de Webhooks
```typescript
// Validar que el webhook viene de Stripe
const sig = req.headers['stripe-signature']
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
```

### 2. Políticas RLS en Supabase
- Solo el usuario puede ver su propia suscripción
- Solo Supabase Service Role puede actualizar subscriptions (webhooks)

### 3. Rate Limiting
```typescript
// Limitar llamadas a API de pagos
// Máximo 10 intentos de checkout por hora
```

### 4. Validación Server-Side
```typescript
// NUNCA confiar en cliente para verificar límites
// Siempre validar en backend antes de servir examen
```

### 5. Logs de Auditoría
```typescript
// Registrar todos los cambios de suscripción
// Registrar intentos de acceso a features premium sin permisos
```

---

## 📝 Orden de Implementación (8 Tareas)

### **Fase 1: Base de Datos** (Tareas 8.1-8.2)

#### ✅ Tarea 8.1: Crear schema de Supabase
- [ ] Ejecutar SQL para crear tablas `subscriptions`, `usage_limits`, `payment_history`
- [ ] Configurar índices y constraints
- [ ] Configurar políticas RLS
- [ ] Crear funciones helper para reset mensual de límites

**Archivos**:
- `database/subscription_tables.sql`

#### ✅ Tarea 8.2: Implementar hook useSubscription
- [ ] Crear `lib/hooks/useSubscription.ts`
- [ ] Funciones: `checkCanTakeExam()`, `incrementExamCount()`, `hasFeatureAccess()`
- [ ] Integrar con Supabase para leer/actualizar límites
- [ ] Agregar caché local para reducir queries

**Archivos**:
- `lib/hooks/useSubscription.ts`
- `lib/subscription/usage-middleware.ts`

---

### **Fase 2: Stripe Backend** (Tareas 8.3-8.4)

#### ✅ Tarea 8.3: Configurar Stripe + crear productos
- [ ] Crear cuenta Stripe (Test mode)
- [ ] Obtener API keys (publishable + secret)
- [ ] Crear 2 productos: Pro Mensual (€4.99) y Pro Anual (€49.99)
- [ ] Configurar URL de webhook en Stripe Dashboard
- [ ] Instalar `stripe` y `@stripe/stripe-js`

**Variables de entorno** (`.env.local`):
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_...
```

#### ✅ Tarea 8.4: Implementar API Routes
- [ ] `app/api/stripe/create-checkout-session/route.ts`
- [ ] `app/api/stripe/create-portal-session/route.ts`
- [ ] `app/api/stripe/webhooks/route.ts`
- [ ] Funciones helper: `handleCheckoutCompleted()`, `handleSubscriptionUpdated()`, etc.

**Archivos**:
- `app/api/stripe/create-checkout-session/route.ts`
- `app/api/stripe/create-portal-session/route.ts`
- `app/api/stripe/webhooks/route.ts`
- `lib/stripe/webhook-handlers.ts`

---

### **Fase 3: UI/UX** (Tareas 8.5-8.7)

#### ✅ Tarea 8.5: Crear página /pricing y componentes paywall
- [ ] Crear `app/pricing/page.tsx`
- [ ] Componente `PricingTable` con 3 cards (FREE, PRO, ANNUAL)
- [ ] Componente `PaywallModal` (modal de upgrade al alcanzar límite)
- [ ] Componente `SubscriptionBadge` para header
- [ ] Integrar botones "Upgrade" con Stripe Checkout

**Archivos**:
- `app/pricing/page.tsx`
- `components/subscription/PricingTable.tsx`
- `components/subscription/PaywallModal.tsx`
- `components/subscription/SubscriptionBadge.tsx`

#### ✅ Tarea 8.6: Dashboard de billing
- [ ] Crear `app/billing/page.tsx`
- [ ] Componente `BillingDashboard` (info de plan actual)
- [ ] Componente `InvoiceHistory` (histórico de pagos)
- [ ] Botón "Gestionar suscripción" → Stripe Customer Portal
- [ ] Mostrar próxima fecha de renovación

**Archivos**:
- `app/billing/page.tsx`
- `components/subscription/BillingDashboard.tsx`
- `components/subscription/InvoiceHistory.tsx`

#### ✅ Tarea 8.7: Integrar checks de límites en exámenes
- [ ] Modificar `components/exam-flow.tsx` para verificar límites
- [ ] Agregar `UsageMeter` en sidebar (mostrar "3/5 exámenes")
- [ ] Bloquear botones "Hacer Examen" si límite alcanzado
- [ ] Mostrar `PaywallModal` al intentar exceder límite
- [ ] Actualizar contadores tras completar examen

**Archivos**:
- `components/exam-flow.tsx`
- `components/examenes-view.tsx`
- `components/subscription/UsageMeter.tsx`
- `components/sidebar.tsx` (agregar UsageMeter)

---

### **Fase 4: Testing y Refinamiento** (Tarea 8.8)

#### ✅ Tarea 8.8: Testing completo y refinamiento
- [ ] **Test 1: Flujo de pago completo**
  - Usar tarjeta de prueba Stripe (4242 4242 4242 4242)
  - Verificar que webhook actualiza BD correctamente
  - Confirmar que usuario obtiene acceso Pro inmediato

- [ ] **Test 2: Verificación de límites FREE**
  - Crear usuario FREE
  - Realizar 5 exámenes generales
  - Intentar 6º examen → Debe aparecer paywall
  - Realizar 1 examen por cada título
  - Intentar 2º examen del mismo título → Debe bloquear

- [ ] **Test 3: Cancelación de suscripción**
  - Usuario Pro cancela suscripción
  - Verificar que sigue teniendo acceso hasta fin de periodo
  - Simular fin de periodo → Verificar que vuelve a FREE

- [ ] **Test 4: Webhooks con Stripe CLI**
  - Instalar Stripe CLI
  - Ejecutar `stripe listen --forward-to localhost:3000/api/stripe/webhooks`
  - Simular eventos: `stripe trigger checkout.session.completed`
  - Verificar logs y actualizaciones en BD

- [ ] **Test 5: Manejo de errores**
  - Simular pago fallido
  - Webhook con firma inválida
  - Usuario sin suscripción intenta acceder a feature Pro

- [ ] **Refinamiento UX**
  - Mejorar mensajes de error
  - Añadir loading states en botones de pago
  - Pulir diseño de PricingTable
  - Agregar tooltips explicativos

**Checklist de Testing**:
- [ ] Usuario FREE puede usar 5 exámenes generales/mes
- [ ] Usuario FREE puede usar 1 examen por título
- [ ] Paywall aparece correctamente al alcanzar límite
- [ ] Proceso de pago Stripe funciona sin errores
- [ ] Webhooks actualizan BD en tiempo real
- [ ] Usuario Pro tiene exámenes ilimitados
- [ ] Cancelación funciona y mantiene acceso hasta fin de periodo
- [ ] Facturas se generan y están accesibles
- [ ] Customer Portal permite gestionar suscripción
- [ ] Upgrade de mensual a anual funciona correctamente

---

## 📈 Métricas de Éxito

### Técnicas
- [ ] Usuario puede suscribirse sin errores técnicos
- [ ] Tiempo de carga página `/pricing` < 2 segundos
- [ ] Webhooks procesan en < 5 segundos
- [ ] 0 errores de validación de límites (consistencia BD)

### Negocio
- [ ] Tasa de conversión FREE → PRO > 3%
- [ ] Tasa de cancelación < 10% mensual
- [ ] MRR (Monthly Recurring Revenue) > €500 en 3 meses
- [ ] LTV (Lifetime Value) > €30 por usuario Pro

### UX
- [ ] Paywall no se siente agresivo (feedback usuarios)
- [ ] Proceso de pago se completa en < 3 minutos
- [ ] < 5% de usuarios abandonan en Stripe Checkout

---

## 🚀 Proyección de Ingresos

### Escenario Conservador
- **100 usuarios activos** → 5% conversión = 5 usuarios Pro
- **Ingreso mensual**: 5 × €4.99 = **€24.95/mes**
- **Ingreso anual**: €299.40

### Escenario Moderado
- **500 usuarios activos** → 5% conversión = 25 usuarios Pro
- **Ingreso mensual**: 25 × €4.99 = **€124.75/mes**
- **Ingreso anual**: €1,497

### Escenario Optimista
- **2000 usuarios activos** → 7% conversión = 140 usuarios Pro
- **Ingreso mensual**: 140 × €4.99 = **€698.60/mes**
- **Ingreso anual**: €8,383.20

### Costos vs Ingresos (500 usuarios)
| Concepto | Costo Mensual |
|----------|--------------|
| Vercel Pro | €20 |
| Supabase Pro | €25 |
| Stripe fees (3%) | ~€4 |
| **Total costos** | **€49** |
| **Ingresos (500 users)** | **€125** |
| **Ganancia neta** | **€76/mes** |

---

## 📚 Recursos y Documentación

### Documentación Oficial
- [Stripe Docs](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

### Ejemplos de Código
- [Next.js + Stripe Example](https://github.com/vercel/next.js/tree/canary/examples/with-stripe)
- [Supabase Subscriptions Example](https://github.com/supabase/supabase/tree/master/examples/subscriptions)

### Testing
- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

## ✅ Criterios de Aceptación del HITO

- [x] ✅ Schema de BD creado y funcionando
- [ ] ✅ Productos creados en Stripe
- [ ] ✅ Webhooks configurados y procesando eventos
- [ ] ✅ Hook `useSubscription` implementado
- [ ] ✅ Página `/pricing` atractiva y funcional
- [ ] ✅ Página `/billing` permite gestionar suscripción
- [ ] ✅ Límites FREE se aplican correctamente
- [ ] ✅ Usuario Pro tiene acceso ilimitado
- [ ] ✅ Paywall aparece al alcanzar límites
- [ ] ✅ Proceso de pago completo funcional
- [ ] ✅ Cancelación funciona correctamente
- [ ] ✅ Testing completo aprobado

---

**Última actualización**: 2025-10-16
**Estado actual**: 📋 PLANIFICACIÓN COMPLETA - Listo para implementación
**Próximo paso**: Ejecutar Tarea 8.1 (Crear schema de Supabase)
