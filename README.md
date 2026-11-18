# LINFOVIT — tienda botánica

Tienda online completa para **LINFOVIT Drenaje Linfático** (frasco de 60 ml con gotero), construida con Next.js 16, TypeScript, Tailwind CSS 4 y Prisma.

Incluye landing editorial, ficha de producto, carrito, checkout con Mercado Pago, webhook verificado, correos transaccionales y un panel administrativo protegido.

---

## 1. Requisitos

- Node.js 20.9 o superior (probado con Node 24).
- npm 10+.
- Credenciales de Mercado Pago Colombia para cobrar (no incluidas).
- Opcional: Resend para correos; GA4 / Meta Pixel y Conversion API para analítica.

## 2. Instalación local

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

La tienda queda en `http://localhost:3000` y el panel en `http://localhost:3000/admin`.

### Credenciales del administrador

Se crean con `ADMIN_EMAIL` y `ADMIN_PASSWORD` del archivo `.env` al ejecutar el seed. **Cambia la contraseña** desde `Panel → Configuración` antes de publicar. El seed no crea reseñas ni testimonios: deben ser reales y autorizados.

### Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` / `npm start` | Build y servidor de producción. |
| `npm run lint` | ESLint (React Compiler + Next). |
| `npm run db:push` | Sincroniza el esquema Prisma. |
| `npm run db:seed` | Crea admin, producto, packs, envíos y textos base. |
| `npm run db:studio` | Prisma Studio. |
| `npm run db:reset` | Reinicia la base y vuelve a sembrar (destructivo). |

## 3. Variables de entorno

Copia `.env.example` como `.env` y completa:

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | SQLite en desarrollo; PostgreSQL en producción. |
| `APP_URL` / `NEXT_PUBLIC_APP_URL` | URL pública (https en producción). |
| `ADMIN_SESSION_SECRET` | Firma de sesión; mínimo 32 caracteres. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Administrador inicial del seed. |
| `MP_ACCESS_TOKEN` | Access token de Mercado Pago (prueba o producción). |
| `MP_PUBLIC_KEY` / `NEXT_PUBLIC_MP_PUBLIC_KEY` | Llave pública de Mercado Pago. |
| `MP_WEBHOOK_SECRET` | Secreto de firma del webhook. |
| `RESEND_API_KEY` / `EMAIL_FROM` | Correo transaccional. |
| `ORDER_NOTIFICATION_EMAIL` | Copia de pedidos pagados al negocio (opcional). |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4. |
| `NEXT_PUBLIC_META_PIXEL_ID` / `META_CAPI_TOKEN` | Meta Pixel y Conversion API. |
| `UPLOAD_DIR` | Carpeta de imágenes subidas (por defecto `./uploads`). |
| `MP_API_BASE` | **Solo pruebas**: apunta a la API simulada local. No usar en producción. |

## 4. Mercado Pago

### Configuración

1. Crea una aplicación en [Mercado Pago Developers](https://www.mercadopago.com.co/developers).
2. Copia el **access token** y la **public key** (primero de prueba).
3. Configura el webhook en `https://TU_DOMINIO/api/webhooks/mercadopago` para el evento **payment**.
4. Copia el **secreto del webhook** en `MP_WEBHOOK_SECRET`.
5. En producción usa credenciales de producción y `APP_URL` con HTTPS. `auto_return` solo se envía si la URL es HTTPS.

### Flujo implementado

1. El checkout valida precios, stock, envío y promoción **en el servidor**.
2. Crea el pedido en estado `PENDING` (nunca pagado).
3. Crea la preferencia de Checkout Pro con el total exacto y `external_reference = order.id`.
4. El comprador paga en Mercado Pago.
5. El webhook verifica la firma `x-signature`, consulta el pago real a la API y solo entonces marca el pedido como `PAID`, descuenta stock y envía el correo.
6. Es idempotente: un webhook repetido no duplica pagos, stock ni eventos.
7. Si el webhook no llega (por ejemplo en local), las páginas de resultado y el enlace del pedido sincronizan el estado contra la API.
8. Un pago rechazado deja el pedido `FAILED`/`REJECTED` sin descontar stock.

### Probar en local

Mercado Pago no puede llamar a `localhost`. Para probar el webhook real:

```bash
# Ejemplo con cloudflared o ngrok
cloudflared tunnel --url http://localhost:3000
```

Actualiza `APP_URL` con la URL HTTPS del túnel y el webhook en el panel de Mercado Pago. Las páginas de resultado igualmente sincronizan el pago sin webhook.

### Prueba automatizada sin credenciales

El repositorio incluye una API simulada de Mercado Pago para validar toda la lógica:

```bash
node scripts/mock-mp.mjs
```

En otra terminal, configura temporalmente en `.env`:

```env
MP_ACCESS_TOKEN="TEST-mock-token"
MP_PUBLIC_KEY="TEST-mock-key"
MP_WEBHOOK_SECRET="test-webhook-secret"
NEXT_PUBLIC_MP_PUBLIC_KEY="TEST-mock-key"
MP_API_BASE="http://localhost:4001"
```

Reinicia el servidor y ejecuta:

```bash
node scripts/test-payment.mjs   # 36 comprobaciones de pago, stock, webhook e idempotencia
```

Resultado esperado: **36/36**. Al terminar, retira `MP_API_BASE` y deja las credenciales reales.

> La simulación valida el código, **no sustituye** la prueba con las tarjetas de prueba oficiales de Mercado Pago. Esa prueba queda pendiente hasta cargar credenciales reales.

### Tarjetas de prueba

Usa las tarjetas y usuarios de prueba oficiales de Mercado Pago Colombia. No uses tarjetas reales durante el desarrollo.

## 5. Panel administrativo

Rutas principales:

- `/admin` — indicadores, ventas, pedidos recientes, stock y envío gratis.
- `/admin/pedidos` — búsqueda, filtros, detalle, guía, notas internas, reenvío de correo.
- `/admin/productos` — fotos, textos, inventario, precios y packs.
- `/admin/envios` — tarifas por departamento, tiempos y envío gratis.
- `/admin/contenido` — textos de la landing, contacto e información legal.
- `/admin/promociones` — códigos de descuento con vigencia y usos.
- `/admin/estadisticas` — ventas, conversión, ticket, más vendidos y tráfico.
- `/admin/configuracion` — estado de integraciones y cambio de contraseña.

Todas las acciones verifican la sesión en el servidor. El proxy protege `/admin/*`; además, cada layout y acción valida la sesión en base de datos.

## 6. Cumplimiento y confianza

- La tienda **no muestra reseñas ni testimonios** en esta versión. El módulo público de reseñas está desactivado y `/resena` redirige al inicio.
- No se siembran reseñas, nombres ni calificaciones de ejemplo. Tampoco se muestran cifras de clientes satisfechos ni descuentos ficticios.
- Si en el futuro se reactiva el módulo, solo debe permitir reseñas de compradores con pago confirmado, con consentimiento y moderación previa.
- La información sanitaria y del fabricante está como **pendiente de verificación documental** y es editable en el panel. Debe completarse antes de publicar afirmaciones específicas.

Los textos legales y sanitarios son una base operativa y deben revisarse con un asesor jurídico antes de su publicación definitiva.

## 7. Analítica

- GA4 y Meta Pixel se cargan **solo tras consentimiento** (banner de cookies).
- Eventos: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`.
- `Purchase` se envía al navegador con `eventID = número de pedido` y al servidor por Meta Conversion API con el mismo identificador para deduplicar.
- El evento `Purchase` del servidor se registra únicamente cuando el pago está aprobado.
- La conversión del panel se calcula con sesiones únicas y pedidos pagados; es una aproximación analítica, no una verdad absoluta.
- UTMs, `fbclid`, `gclid` y `ttclid` se guardan en el pedido.

## 8. Producción

1. Cambia `DATABASE_URL` a PostgreSQL y ajusta `provider` en `prisma/schema.prisma`.
2. Ejecuta `npx prisma db push` (o migraciones) y el seed.
3. Configura HTTPS, `APP_URL`, credenciales de producción y webhook.
4. Configura Resend y verifica el dominio de envío.
5. Sirve `UPLOAD_DIR` en almacenamiento persistente (VPS o volumen). Para serverless, sustituye `saveImage` por S3/Cloudinary.
6. Sustituye el limitador en memoria por Redis si habrá varias réplicas.
7. Revisa los textos legales con un abogado y completa los datos sanitarios.
8. Prueba el flujo completo con credenciales de prueba y luego una compra mínima real.

## 9. Estructura

```
src/app/(store)      landing, producto, checkout, pedido, pagos, políticas
src/app/admin        login y panel protegido
src/app/api          webhook MP, sync de pedidos, tracking, media
src/components       UI, landing, carrito, checkout, admin
src/lib              datos, auth, Mercado Pago, pedidos, correo, SEO, envíos
src/server/actions   checkout, admin, auth
prisma               esquema y seed
scripts              mock de Mercado Pago y pruebas E2E
```

## 10. Aviso

LINFOVIT se presenta como producto botánico de bienestar, **no como medicamento**. La tienda evita promesas de pérdida de peso, eliminación de celulitis, reducción de medidas o tratamientos médicos. La dosis publicada corresponde al etiquetado: **30 gotas (1 ml), tres veces al día**.
