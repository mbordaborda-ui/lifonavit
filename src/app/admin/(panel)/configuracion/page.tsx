import { CheckCircle2, XCircle } from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { AdminPageHeader, Card, Notice } from "@/components/admin/AdminUI";
import { changePasswordAction } from "@/server/actions/auth";
import { getAppUrl, isEmailConfigured, isMercadoPagoConfigured } from "@/lib/env";
import { isTestCredentials } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

function Status({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-forest/5 py-2 text-[12px] last:border-0">
      <span className="text-ink">{label}</span>
      <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold ${ok ? "text-forest" : "text-[#9a3a2c]"}`}>
        {ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
        {ok ? "Configurado" : "Pendiente"}
      </span>
    </li>
  );
}

export default async function AdminConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const notice = await searchParams;
  const session = await getAdminSession();
  const appUrl = getAppUrl();
  const dbUrl = process.env.DATABASE_URL ?? "";
  const dbProvider = dbUrl.startsWith("postgres") ? "PostgreSQL" : dbUrl.startsWith("file:") ? "SQLite" : "Desconocido";

  return (
    <>
      <AdminPageHeader
        title="Configuración"
        description="Estado de integraciones y seguridad de la cuenta administradora."
      />
      <Notice ok={notice.ok} error={notice.error} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Integraciones" description="Las credenciales se leen solo desde variables de entorno del servidor.">
          <ul>
            <Status ok={isMercadoPagoConfigured()} label="Mercado Pago (MP_ACCESS_TOKEN)" />
            <Status
              ok={isMercadoPagoConfigured() && isTestCredentials()}
              label={`Modo de credenciales: ${isMercadoPagoConfigured() ? (isTestCredentials() ? "PRUEBAS" : "PRODUCCIÓN") : "sin configurar"}`}
            />
            <Status ok={Boolean(process.env.MP_WEBHOOK_SECRET?.trim())} label="Firma de webhook (MP_WEBHOOK_SECRET)" />
            <Status ok={isEmailConfigured()} label="Correo transaccional (Resend)" />
            <Status ok={Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim())} label="Google Analytics 4" />
            <Status ok={Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim())} label="Meta Pixel" />
            <Status ok={Boolean(process.env.META_CAPI_TOKEN?.trim())} label="Meta Conversion API" />
          </ul>

          <div className="mt-4 space-y-2 rounded-lg bg-cream p-3 text-[10.5px] leading-relaxed text-ink-soft">
            <p>
              <strong className="text-forest">URL del webhook:</strong>{" "}
              <span className="break-all font-mono">{appUrl}/api/webhooks/mercadopago</span>
            </p>
            <p>
              <strong className="text-forest">Base de datos:</strong> {dbProvider}
            </p>
            <p>
              <strong className="text-forest">URL pública:</strong>{" "}
              <span className="break-all">{appUrl}</span>
            </p>
            <p>
              En desarrollo local, Mercado Pago no puede alcanzar <code>localhost</code>. Expón el
              servidor con un túnel HTTPS y actualiza <code>APP_URL</code> para probar el webhook.
              Mientras tanto, las páginas de resultado sincronizan el pago directamente contra la
              API.
            </p>
          </div>
        </Card>

        <Card title="Cuenta administradora">
          <dl className="mb-4 space-y-1.5 text-[12px]">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Nombre</dt>
              <dd className="text-ink">{session?.admin.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Correo</dt>
              <dd className="text-ink">{session?.admin.email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-soft">Rol</dt>
              <dd className="text-ink">{session?.admin.role}</dd>
            </div>
          </dl>

          <form action={changePasswordAction} className="space-y-3 border-t border-forest/10 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-forest">
              Cambiar contraseña
            </p>
            <div>
              <label className="admin-label" htmlFor="currentPassword">
                Contraseña actual
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                className="admin-input"
                required
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="admin-label" htmlFor="newPassword">
                  Nueva contraseña
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className="admin-input"
                  required
                  minLength={12}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="confirmPassword">
                  Confirmar
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="admin-input"
                  required
                  minLength={12}
                />
              </div>
            </div>
            <p className="text-[10px] text-ink-soft">
              Mínimo 12 caracteres. Al cambiarla se cierran las demás sesiones activas.
            </p>
            <button type="submit" className="btn btn-primary !py-2.5 !text-[10px]">
              Actualizar contraseña
            </button>
          </form>
        </Card>
      </div>

      <Card title="Checklist para salir a producción" className="mt-4">
        <ol className="list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed text-ink-soft">
          <li>Configurar credenciales de producción de Mercado Pago y el secreto del webhook.</li>
          <li>Publicar la tienda con HTTPS y actualizar APP_URL / NEXT_PUBLIC_APP_URL.</li>
          <li>Usar PostgreSQL gestionado y ejecutar migraciones de Prisma.</li>
          <li>Configurar Resend (o el proveedor de correo) y verificar el dominio de envío.</li>
          <li>Activar GA4, Meta Pixel y Conversion API; validar eventos con el consentimiento.</li>
          <li>Confirmar registro sanitario, fabricante y textos legales antes de publicar.</li>
          <li>Probar el flujo completo con las tarjetas de prueba de Mercado Pago.</li>
        </ol>
      </Card>
    </>
  );
}
