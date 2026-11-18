import Link from "next/link";
import {
  Check,
  Clock3,
  CreditCard,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import type { Order, OrderItem, Payment } from "@prisma/client";
import { formatCop } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { ButtonLink } from "@/components/ui/Button";
import { OrderEffects, RefreshOrderButton } from "@/components/checkout/OrderEffects";

type FullOrder = Order & {
  items: OrderItem[];
  payments: Payment[];
};

const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function OrderView({
  order,
  via,
  contactEmail,
}: {
  order: FullOrder;
  via?: "success" | "pending" | "failure";
  contactEmail: string;
}) {
  const isPaid = order.paymentStatus === "APPROVED";
  const isRejected =
    order.paymentStatus === "REJECTED" ||
    order.paymentStatus === "CANCELLED" ||
    order.status === "FAILED";
  const isPending = !isPaid && !isRejected;
  const totalUnits = order.items.reduce((sum, item) => sum + item.units, 0);

  const title = isPaid
    ? "¡Gracias por tu compra!"
    : isRejected
      ? "El pago no se completó"
      : "Estamos confirmando tu pago";

  const subtitle = isPaid
    ? "Confirmamos tu pago y tu pedido ya está en preparación. Te enviamos el resumen a tu correo."
    : isRejected
      ? "No se realizó ningún cobro. Puedes intentarlo de nuevo con otro medio de pago o escribirnos si necesitas ayuda."
      : "Mercado Pago puede tardar unos minutos en reportar el pago. Esta página se actualiza con el estado real del servidor; no necesitas pagar de nuevo.";

  return (
    <div className="container-editorial py-10 md:py-16">
      {isPaid ? (
        <OrderEffects
          orderNumber={order.orderNumber}
          totalCop={order.totalCop}
          paid={isPaid}
          packIds={order.items.map((item) => item.packId ?? "")}
        />
      ) : null}

      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${
              isPaid
                ? "border-gold/50 bg-forest text-cream"
                : isRejected
                  ? "border-[#c47a6f]/40 bg-[#fdf1ee] text-[#a4372c]"
                  : "border-gold/40 bg-gold/10 text-gold-deep"
            }`}
          >
            {isPaid ? (
              <Check size={28} strokeWidth={1.6} />
            ) : isRejected ? (
              <X size={26} strokeWidth={1.6} />
            ) : (
              <Clock3 size={26} strokeWidth={1.5} />
            )}
          </span>
          <p className="eyebrow mt-5 justify-center">
            {via === "failure" ? "Pago rechazado" : "Pedido " + order.orderNumber}
          </p>
          <h1 className="display-md mt-4 text-forest">{title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-[0.94rem] leading-relaxed text-ink-soft">
            {subtitle}
          </p>
          {isPending ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <RefreshOrderButton token={order.accessToken} />
              <span className="text-[10.5px] text-ink-soft">
                Si ya pagaste, espera un momento y actualiza.
              </span>
            </div>
          ) : null}
          {isRejected ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/#ofertas" size="sm">
                Volver a elegir mi pack
              </ButtonLink>
              <a
                href={`mailto:${contactEmail}?subject=Problema con el pedido ${order.orderNumber}`}
                className="btn btn-outline !px-5 !py-2.5 !text-[11px]"
              >
                Escribir a soporte
              </a>
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[1.35rem] border border-forest/10 bg-white p-5 shadow-soft md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-forest">Resumen del pedido</h2>
              <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-forest">
                {ORDER_STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>

            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[13px] font-medium text-ink">
                      {item.packName}{" "}
                      <span className="font-normal text-ink-soft">× {item.quantity}</span>
                    </p>
                    <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.08em] text-ink-soft">
                      {item.units} frasco{item.units === 1 ? "" : "s"} de 60 ml
                    </p>
                  </div>
                  <p className="text-[13px] text-ink">{formatCop(item.lineTotalCop)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 space-y-2 border-t border-forest/10 pt-4 text-[12.5px]">
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
              <div className="flex items-end justify-between border-t border-forest/10 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-forest">
                  Total
                </span>
                <span className="font-display text-2xl text-forest">
                  {formatCop(order.totalCop)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4 border-t border-forest/10 pt-4 text-[10.5px] text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <CreditCard size={13} className="text-sage" />
                {order.paymentStatus === "APPROVED" ? "Pago aprobado" : "Mercado Pago"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Package size={13} className="text-sage" />
                {totalUnits} frasco{totalUnits === 1 ? "" : "s"}
              </span>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-[1.35rem] border border-forest/10 bg-white p-5 shadow-soft md:p-6">
              <h2 className="font-display text-xl text-forest">Entrega</h2>
              <div className="mt-4 space-y-3 text-[12.5px] leading-relaxed text-ink-soft">
                <p className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-sage" />
                  <span>
                    <span className="block font-medium text-ink">{order.customerName}</span>
                    {order.address}
                    {order.addressExtra ? `, ${order.addressExtra}` : ""}
                    <br />
                    {order.city}, {order.department}
                  </span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail size={15} className="shrink-0 text-sage" />
                  {order.customerEmail}
                </p>
                {order.notes ? (
                  <p className="rounded-lg bg-cream px-3 py-2 text-[11.5px]">
                    <span className="font-semibold text-forest">Nota de entrega: </span>
                    {order.notes}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 border-t border-forest/10 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest">
                  Estado del envío
                </p>
                <div className="mt-3 space-y-2.5 text-[12px] text-ink-soft">
                  <p className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sage/15 text-sage">
                      <Check size={11} />
                    </span>
                    Pedido {isPaid ? "confirmado" : "registrado"}
                  </p>
                  <p className="flex items-center gap-2">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        order.status === "SHIPPED" || order.status === "DELIVERED"
                          ? "bg-sage/15 text-sage"
                          : "bg-mist text-ink-soft/60"
                      }`}
                    >
                      <Truck size={11} />
                    </span>
                    {order.trackingNumber
                      ? `Guía ${order.trackingNumber}`
                      : "Preparación y despacho desde Bogotá"}
                  </p>
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-forest underline underline-offset-2"
                    >
                      Rastrear mi envío
                    </a>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-[1.35rem] border border-forest/10 bg-cream p-5 text-[11.5px] leading-relaxed text-ink-soft">
              <p className="flex items-center gap-2 font-semibold text-forest">
                <ShieldCheck size={14} className="text-sage" /> ¿Necesitas ayuda?
              </p>
              <p className="mt-2">
                Escríbenos a{" "}
                <a href={`mailto:${contactEmail}`} className="text-forest underline underline-offset-2">
                  {contactEmail}
                </a>{" "}
                con tu número de pedido <strong>{order.orderNumber}</strong>. Horario de atención:
                lunes a viernes.
              </p>
              <p className="mt-3 text-[10.5px] text-ink-soft/80">
                Fecha del pedido: {dateFormatter.format(order.createdAt)}
              </p>
            </section>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[10.5px] leading-relaxed text-ink-soft/80">
          LINFOVIT es un producto botánico de bienestar, no un medicamento. No exceda la dosis
          indicada. Si tienes dudas de salud, consulta a un profesional. Los datos de tu compra se
          tratan según nuestra{" "}
          <Link href="/politicas/tratamiento-datos" className="underline underline-offset-2">
            política de tratamiento de datos
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
