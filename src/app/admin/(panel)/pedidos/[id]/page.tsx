import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, RotateCw } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  AdminPageHeader,
  Card,
  Notice,
  StatusBadge,
  adminDateTime,
} from "@/components/admin/AdminUI";
import { updateOrderAction, resendConfirmationAction } from "@/server/actions/admin";
import { formatCop } from "@/lib/money";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const [{ id }, notice] = await Promise.all([params, searchParams]);

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      emails: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });

  if (!order) notFound();

  const orderUrl = `${getAppUrl()}/pedido/${order.accessToken}`;

  return (
    <>
      <Link
        href="/admin/pedidos"
        className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft hover:text-forest"
      >
        <ArrowLeft size={13} /> Volver a pedidos
      </Link>

      <AdminPageHeader
        title={`Pedido ${order.orderNumber}`}
        description={`Creado el ${adminDateTime.format(order.createdAt)} · ${order.items.reduce((sum, item) => sum + item.units, 0)} frascos`}
        action={
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.status} />
          </div>
        }
      />

      <Notice ok={notice.ok} error={notice.error} />

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <Card title="Productos">
            <ul className="divide-y divide-forest/10">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2.5 text-[12.5px]">
                  <div>
                    <p className="font-medium text-ink">
                      {item.packName} <span className="font-normal text-ink-soft">× {item.quantity}</span>
                    </p>
                    <p className="text-[10.5px] text-ink-soft">
                      {item.units} frascos · {formatCop(item.unitPriceCop)} por pack
                    </p>
                  </div>
                  <span className="text-forest">{formatCop(item.lineTotalCop)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1.5 border-t border-forest/10 pt-3 text-[12px]">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>{formatCop(order.subtotalCop)}</span>
              </div>
              {order.discountCop > 0 ? (
                <div className="flex justify-between text-sage">
                  <span>Descuento {order.promoCode ? `(${order.promoCode})` : ""}</span>
                  <span>- {formatCop(order.discountCop)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-ink-soft">
                <span>Envío</span>
                <span>{order.shippingCop === 0 ? "Sin costo" : formatCop(order.shippingCop)}</span>
              </div>
              <div className="flex justify-between border-t border-forest/10 pt-2 font-semibold text-forest">
                <span>Total</span>
                <span>{formatCop(order.totalCop)}</span>
              </div>
            </div>
          </Card>

          <Card title="Cliente y entrega">
            <dl className="grid gap-3 text-[12.5px] sm:grid-cols-2">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Nombre</dt>
                <dd className="mt-0.5 text-ink">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Correo</dt>
                <dd className="mt-0.5 break-all text-ink">{order.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Celular</dt>
                <dd className="mt-0.5 text-ink">{order.customerPhone}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Ciudad</dt>
                <dd className="mt-0.5 text-ink">
                  {order.city}, {order.department}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">Dirección</dt>
                <dd className="mt-0.5 text-ink">
                  {order.address}
                  {order.addressExtra ? `, ${order.addressExtra}` : ""}
                </dd>
              </div>
              {order.notes ? (
                <div className="sm:col-span-2">
                  <dt className="text-[10px] uppercase tracking-[0.1em] text-ink-soft">
                    Información adicional
                  </dt>
                  <dd className="mt-0.5 text-ink">{order.notes}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card title="Pagos de Mercado Pago" description="Solo se muestran estados reportados por la API.">
            {order.payments.length === 0 ? (
              <p className="text-[12px] text-ink-soft">
                Sin pagos registrados todavía. El pedido no se marca como pagado hasta que Mercado
                Pago confirme la transacción.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-[11.5px]">
                  <thead>
                    <tr className="border-b border-forest/10 text-[9px] uppercase tracking-[0.1em] text-ink-soft">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">Estado</th>
                      <th className="pb-2">Medio</th>
                      <th className="pb-2">Monto</th>
                      <th className="pb-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-forest/5 last:border-0">
                        <td className="py-2 font-mono text-[10.5px]">{payment.mpPaymentId}</td>
                        <td className="py-2">
                          <StatusBadge status={payment.status.toUpperCase()} />
                        </td>
                        <td className="py-2 text-ink-soft">{payment.method ?? "—"}</td>
                        <td className="py-2">{formatCop(payment.amountCop)}</td>
                        <td className="py-2 text-ink-soft">{adminDateTime.format(payment.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <dl className="mt-3 grid gap-1.5 border-t border-forest/10 pt-3 text-[10.5px] text-ink-soft">
              <div className="flex justify-between gap-3">
                <dt>Preferencia</dt>
                <dd className="font-mono">{order.mpPreferenceId ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Pago</dt>
                <dd className="font-mono">{order.mpPaymentId ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Detalle MP</dt>
                <dd>{order.paymentStatusDetail ?? "—"}</dd>
              </div>
              {order.paidAt ? (
                <div className="flex justify-between gap-3">
                  <dt>Pagado</dt>
                  <dd>{adminDateTime.format(order.paidAt)}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card title="Correos del pedido">
            {order.emails.length === 0 ? (
              <p className="text-[12px] text-ink-soft">
                Sin correos registrados. La confirmación se envía automáticamente cuando el pago es
                aprobado y el proveedor está configurado.
              </p>
            ) : (
              <ul className="space-y-2">
                {order.emails.map((email) => (
                  <li
                    key={email.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-forest/5 pb-2 text-[11.5px] last:border-0"
                  >
                    <div>
                      <p className="text-ink">{email.subject}</p>
                      <p className="text-[10px] text-ink-soft">
                        {email.to} · {adminDateTime.format(email.createdAt)}
                      </p>
                      {email.error ? (
                        <p className="text-[10px] text-[#9a3a2c]">{email.error}</p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-mist px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
                      {email.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {order.paymentStatus === "APPROVED" ? (
              <form action={resendConfirmationAction} className="mt-3">
                <input type="hidden" name="id" value={order.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-forest hover:bg-cream"
                >
                  <Mail size={12} /> Reenviar confirmación
                </button>
              </form>
            ) : null}
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Gestión del pedido">
            <form action={updateOrderAction} className="space-y-3">
              <input type="hidden" name="id" value={order.id} />
              <div>
                <label className="admin-label" htmlFor="status">
                  Estado operativo
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={order.status}
                  className="admin-input"
                >
                  <option value="PENDING">Pendiente de pago</option>
                  <option value="PAID">Pagado / en preparación</option>
                  <option value="SHIPPED">Enviado</option>
                  <option value="DELIVERED">Entregado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="admin-label" htmlFor="trackingNumber">
                  Número de guía
                </label>
                <input
                  id="trackingNumber"
                  name="trackingNumber"
                  defaultValue={order.trackingNumber ?? ""}
                  className="admin-input"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="trackingUrl">
                  URL de rastreo
                </label>
                <input
                  id="trackingUrl"
                  name="trackingUrl"
                  type="url"
                  defaultValue={order.trackingUrl ?? ""}
                  className="admin-input"
                  placeholder="https://"
                  maxLength={500}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="adminNotes">
                  Notas internas
                </label>
                <textarea
                  id="adminNotes"
                  name="adminNotes"
                  defaultValue={order.adminNotes ?? ""}
                  className="admin-input min-h-[90px]"
                  maxLength={2000}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full !py-3 !text-[10.5px]">
                Guardar cambios
              </button>
            </form>
            <p className="mt-3 text-[10px] leading-relaxed text-ink-soft">
              El pago no se modifica manualmente. Si necesitas un reembolso, gestiónalo en Mercado
              Pago; el estado se actualizará con el webhook.
            </p>
          </Card>

          <Card title="Enlace del cliente">
            <p className="break-all text-[10.5px] text-ink-soft">{orderUrl}</p>
            <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
              Este enlace permite consultar el estado sin exponer datos de otros pedidos. No lo
              publiques.
            </p>
          </Card>

          <Card title="Atribución">
            <dl className="space-y-1.5 text-[11px] text-ink-soft">
              <div className="flex justify-between gap-3">
                <dt>Origen</dt>
                <dd className="text-right text-ink">{order.utmSource ?? "Directo"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Medio</dt>
                <dd className="text-right text-ink">{order.utmMedium ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Campaña</dt>
                <dd className="text-right text-ink">{order.utmCampaign ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Landing</dt>
                <dd className="max-w-[60%] truncate text-right text-ink">
                  {order.landingPath ?? "—"}
                </dd>
              </div>
            </dl>
          </Card>

          {order.review ? (
            <Card title="Reseña del comprador">
              <p className="text-[12px] text-forest">
                {order.review.rating} / 5 · {order.review.status}
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
                {order.review.body}
              </p>
              <Link
                href="/admin/resenas"
                className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-forest underline underline-offset-2"
              >
                <RotateCw size={11} /> Ir a moderación
              </Link>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
