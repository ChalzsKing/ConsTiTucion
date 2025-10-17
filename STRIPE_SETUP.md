# 🔧 Configuración de Stripe para ConstiMaster

Esta guía te ayudará a configurar Stripe para el sistema de pagos de ConstiMaster.

---

## 📋 Paso 1: Crear Productos en Stripe

### 1.1 Acceder al Dashboard de Stripe
1. Ve a [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Asegúrate de estar en **Test Mode** (toggle arriba a la derecha)

### 1.2 Crear Producto "ConstiMaster Pro - Mensual"

1. En el menú lateral: **Products** → **Add Product**
2. Configuración:
   ```
   Name: ConstiMaster Pro - Mensual
   Description: Acceso ilimitado a exámenes, estadísticas avanzadas y exportación de datos
   ```

3. En **Pricing**:
   ```
   Price: 4.99 EUR
   Billing period: Monthly
   ```

4. Click **Add pricing** → **Save product**

5. **IMPORTANTE**: Copia el **Price ID** que aparece (formato: `price_xxxxxxxxxxxxx`)
   - Lo necesitarás para el archivo `.env.local`

### 1.3 Crear Producto "ConstiMaster Pro - Anual"

1. Nuevamente: **Products** → **Add Product**
2. Configuración:
   ```
   Name: ConstiMaster Pro - Anual
   Description: Acceso ilimitado anual (2 meses gratis)
   ```

3. En **Pricing**:
   ```
   Price: 49.99 EUR
   Billing period: Yearly
   ```

4. Click **Add pricing** → **Save product**

5. **IMPORTANTE**: Copia el **Price ID** (formato: `price_xxxxxxxxxxxxx`)

---

## 🔑 Paso 2: Obtener API Keys

### 2.1 Obtener Publishable Key
1. En Stripe Dashboard: **Developers** → **API keys**
2. En la sección **Standard keys**, copia:
   ```
   Publishable key: pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 2.2 Obtener Secret Key
1. En la misma página, copia:
   ```
   Secret key: sk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **NUNCA compartas esta clave públicamente**

---

## 🌐 Paso 3: Configurar Webhook

### 3.1 Crear Webhook Endpoint

1. En Stripe Dashboard: **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Configuración:
   ```
   Endpoint URL: https://tu-dominio.vercel.app/api/stripe/webhooks

   (En desarrollo local usa: http://localhost:3000/api/stripe/webhooks)
   ```

4. En **Events to send**, selecciona:
   ```
   ☑ checkout.session.completed
   ☑ customer.subscription.created
   ☑ customer.subscription.updated
   ☑ customer.subscription.deleted
   ☑ invoice.payment_succeeded
   ☑ invoice.payment_failed
   ```

5. Click **Add endpoint**

### 3.2 Obtener Webhook Secret
1. Click en el webhook que acabas de crear
2. En la sección **Signing secret**, click **Reveal**
3. Copia el secret (formato: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxx`)

---

## ⚙️ Paso 4: Configurar Variables de Entorno

### 4.1 Crear/Editar `.env.local`

En la raíz de tu proyecto (`Desktop/constimaster`), crea o edita el archivo `.env.local`:

```bash
# Supabase (ya existentes)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL=price_xxxxxxxxxxxxx
```

### 4.2 Reemplazar los valores

Reemplaza cada `xxxxxxxxxxxxx` con los valores reales que copiaste en los pasos anteriores:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Publishable key de Stripe
- `STRIPE_SECRET_KEY`: Secret key de Stripe
- `STRIPE_WEBHOOK_SECRET`: Signing secret del webhook
- `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`: Price ID del plan mensual
- `NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL`: Price ID del plan anual

---

## 🧪 Paso 5: Configurar Customer Portal (Opcional pero Recomendado)

El Customer Portal permite a los usuarios gestionar su suscripción (cancelar, cambiar plan, actualizar método de pago).

### 5.1 Activar Customer Portal
1. En Stripe Dashboard: **Settings** → **Billing** → **Customer portal**
2. Click **Activate**

### 5.2 Configurar opciones
```
Business information:
  - Company name: ConstiMaster
  - Support email: tu-email@dominio.com

Customer portal:
  ☑ Allow customers to update payment methods
  ☑ Allow customers to update billing information
  ☑ Allow customers to cancel subscriptions
  ☑ Allow customers to switch plans
```

3. Click **Save changes**

---

## 🔥 Paso 6: Configurar Stripe CLI (Para Testing Local)

El Stripe CLI te permite recibir webhooks en localhost durante desarrollo.

### 6.1 Instalar Stripe CLI

**Windows (con Scoop):**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Windows (Alternativa - Descargar ejecutable):**
1. Ve a: https://github.com/stripe/stripe-cli/releases/latest
2. Descarga `stripe_X.X.X_windows_x86_64.zip`
3. Extrae el archivo `stripe.exe` a una carpeta en tu PATH

### 6.2 Login con Stripe CLI
```bash
stripe login
```
Esto abrirá tu navegador para autenticarte.

### 6.3 Escuchar Webhooks en Local
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Esto te dará un **webhook signing secret** temporal (formato: `whsec_xxxxx`).

**Importante**: Cuando estés testeando localmente, usa este secret temporal en `.env.local` en lugar del secret del webhook de producción.

---

## ✅ Paso 7: Verificar Configuración

### 7.1 Checklist de Variables de Entorno

Verifica que tu `.env.local` tenga todas estas variables:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL`

### 7.2 Reiniciar Servidor de Desarrollo

Después de configurar las variables de entorno:

```bash
# Detén el servidor si está corriendo (Ctrl+C)
npm run dev
```

---

## 🧪 Paso 8: Probar con Tarjetas de Prueba

Stripe proporciona tarjetas de prueba para simular pagos:

### Tarjetas de Prueba Exitosas
```
Número: 4242 4242 4242 4242
CVC: Cualquier 3 dígitos
Fecha: Cualquier fecha futura
```

### Tarjeta que Requiere Autenticación 3D Secure
```
Número: 4000 0025 0000 3155
CVC: Cualquier 3 dígitos
Fecha: Cualquier fecha futura
```

### Tarjeta que Falla
```
Número: 4000 0000 0000 0002
CVC: Cualquier 3 dígitos
Fecha: Cualquier fecha futura
```

Más tarjetas de prueba: https://stripe.com/docs/testing

---

## 📝 Resumen de lo que Necesitas

Al final de esta guía, debes tener:

✅ 2 productos creados en Stripe (Mensual y Anual)
✅ 2 Price IDs copiados
✅ Publishable Key copiada
✅ Secret Key copiada
✅ Webhook configurado
✅ Webhook Secret copiado
✅ Archivo `.env.local` configurado
✅ (Opcional) Stripe CLI instalado para testing local
✅ (Opcional) Customer Portal activado

---

## 🚨 Troubleshooting

### Error: "No such price"
- Verifica que los Price IDs en `.env.local` sean correctos
- Asegúrate de estar en Test Mode en Stripe Dashboard

### Error: "Webhook signature verification failed"
- Verifica que el `STRIPE_WEBHOOK_SECRET` sea correcto
- Si estás en local, usa el secret de `stripe listen`

### Webhooks no se reciben en local
- Asegúrate de tener `stripe listen` corriendo
- Verifica que la URL sea correcta: `localhost:3000/api/stripe/webhooks`

### Error: "Invalid API Key"
- Verifica que `STRIPE_SECRET_KEY` empiece con `sk_test_`
- Asegúrate de no tener espacios extra al copiar/pegar

---

## 🔄 Cambiar de Test Mode a Production

Cuando estés listo para producción:

1. En Stripe Dashboard, cambia a **Production Mode**
2. Repite los pasos anteriores para obtener las keys de producción
3. Actualiza `.env.local` (o variables de entorno de Vercel) con las keys de producción
4. Las keys de producción empiezan con `pk_live_` y `sk_live_` en lugar de `pk_test_` y `sk_test_`

⚠️ **IMPORTANTE**: Nunca uses keys de producción en desarrollo local. Mantén Test Mode durante desarrollo.

---

**Próximo paso**: Una vez completada esta configuración, podemos probar el flujo de checkout y webhooks.
