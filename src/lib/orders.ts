import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { getPayment, isMpConfigured, searchPaymentsByReference, type MpPayment } from "@/lib/mercadopago";
import { sendOrderConfirmation } from "@/lib/email";

export function mapPaymentStatus(status: string): {
  paymentStatus: string;
  orderStatus: string;
} {
  switch (status) {
    case "approved":
      return { paymentStatus: "APPROVED", orderStatus: "PAID" };
    case "pending":
    case "authorized":
      return { paymentStatus: "PENDING", orderStatus: "PENDING" };
    case "in_process":
      return { paymentStatus: "IN_PROCESS", orderStatus: "PENDING" };
    case "rejected":
      return { paymentStatus: "REJECTED", orderStatus: "FAILED" };
    case "cancelled":
      return { paymentStatus: "CANCELLED", orderStatus: "CANCELLED" };
    case "refunded":
      return { paymentStatus: "REFUNDED", orderStatus: "REFUNDED" };
    case "charged_back":
      return { paymentStatus: "CHARGED_BACK", orderStatus: "REFUNDED" };
    default:
      return { paymentStatus: "PENDING", orderStatus: "PENDING" };
  }
}

export type ApplyResult = {
  orderId: string | null;
  transitionedToPaid: boolean;
  status: string | null;
};

/**
 * Aplica el estado real de un pago de Mercado Pago al pedido.
 * Idempotente: el stock y la confirmación solo se procesan en la primera
 * transición a PAID. Nunca marca un pedido como pagado sin pago aprobado.
 */
export async function applyMpPayment(payment: MpPayment): Promise<ApplyResult> {
  const mpPaymentId = String(payment.id);
  const externalReference = payment.external_reference;
  if (!externalReference) {
    return { orderId: null, transitionedToPaid: false, status: payment.status };
  }

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: externalReference },
      include: { items: true },
    });
    if (!order) return { orderId: null, transitionedToPaid: false, status: payment.status };

    const amount = Math.round(Number(payment.transaction_amount));
    if (amount !== order.totalCop) {
      await tx.webhookLog.create({
        data: {
          source: "mercadopago",
          topic: "payment",
          resourceId: mpPaymentId,
          status: "AMOUNT_MISMATCH",
          message: `Pedido ${order.orderNumber}: pago ${amount} vs total ${order.totalCop}`,
        },
      });
      return { orderId: order.id, transitionedToPaid: false, status: payment.status };
    }

    const mapped = mapPaymentStatus(payment.status);

    const existing = await tx.payment.findUnique({ where: { mpPaymentId } });
    if (!existing) {
      await tx.payment.create({
        data: {
          orderId: order.id,
          mpPaymentId,
          status: payment.status,
          statusDetail: payment.status_detail ?? null,
          method: payment.payment_method_id ?? payment.payment_type_id ?? null,
          amountCop: amount,
          approvedAt: payment.status === "approved" ? new Date() : null,
        },
      });
    } else {
      await tx.payment.update({
        where: { mpPaymentId },
        data: {
          status: payment.status,
          statusDetail: payment.status_detail ?? null,
          method: payment.payment_method_id ?? payment.payment_type_id ?? null,
          approvedAt: payment.status === "approved" ? (existing.approvedAt ?? new Date()) : existing.approvedAt,
        },
      });
    }

    let transitionedToPaid = false;

    if (payment.status === "approved") {
      // Solo la primera confirmación descuenta inventario.
      const claimed = await tx.order.updateMany({
        where: { id: order.id, status: { notIn: ["PAID", "REFUNDED"] } },
        data: {
          status: "PAID",
          paymentStatus: "APPROVED",
          paymentStatusDetail: payment.status_detail ?? null,
          mpPaymentId,
          paidAt: order.paidAt ?? new Date(),
        },
      });

      if (claimed.count === 1) {
        transitionedToPaid = true;
        for (const item of order.items) {
          if (!item.productId) continue;
          await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.units } },
            data: { stock: { decrement: item.units } },
          });
        }
        if (order.promoCode) {
          await tx.promoCode.updateMany({
            where: { code: order.promoCode },
            data: { uses: { increment: 1 } },
          });
        }
      }
    } else if (order.status !== "PAID" && order.status !== "REFUNDED") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: mapped.orderStatus,
          paymentStatus: mapped.paymentStatus,
          paymentStatusDetail: payment.status_detail ?? null,
          mpPaymentId,
        },
      });
    } else if (payment.status === "refunded" || payment.status === "charged_back") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          paymentStatus: mapped.paymentStatus,
          paymentStatusDetail: payment.status_detail ?? null,
        },
      });
    }

    return { orderId: order.id, transitionedToPaid, status: payment.status };
  });

  if (result.transitionedToPaid && result.orderId) {
    await sendOrderConfirmation(result.orderId).catch((error) =>
      console.error("[email] confirmación:", error),
    );
    await sendPurchaseToMeta(result.orderId).catch(() => undefined);
    await recordServerPurchase(result.orderId).catch(() => undefined);
  }

  return result;
}

/**
 * Consulta Mercado Pago por el pago del pedido y sincroniza el estado.
 * Sirve como respaldo del webhook (por ejemplo en desarrollo local).
 */
export async function syncOrderWithMp(orderId: string) {
  if (!isMpConfigured()) return null;
  try {
    const payments = await searchPaymentsByReference(orderId);
    if (payments.length === 0) return null;
    const approved = payments.find((payment) => payment.status === "approved");
    const chosen = approved ?? payments[0];
    await applyMpPayment(chosen);
    return prisma.order.findUnique({ where: { id: orderId } });
  } catch (error) {
    console.error("[mercadopago] No se pudo sincronizar:", error);
    return null;
  }
}

export async function syncOrderByPaymentId(paymentId: string) {
  const payment = await getPayment(paymentId);
  return applyMpPayment(payment);
}

async function recordServerPurchase(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  await prisma.analyticsEvent.create({
    data: {
      name: "Purchase",
      sessionId: "server",
      path: "/pago/exitoso",
      orderId: order.id,
      valueCop: order.totalCop,
      utmSource: order.utmSource,
      utmMedium: order.utmMedium,
      utmCampaign: order.utmCampaign,
    },
  });
}

async function sendPurchaseToMeta(orderId: string) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
  const token = process.env.META_CAPI_TOKEN?.trim();
  if (!pixelId || !token) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const hash = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
  const phone = order.customerPhone.replace(/\D/g, "");

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: order.orderNumber,
        action_source: "website",
        event_source_url: `${process.env.APP_URL ?? ""}/pago/exitoso`,
        user_data: {
          em: [hash(order.customerEmail)],
          ph: [hash(phone.startsWith("57") ? `+${phone}` : `+57${phone}`)],
          external_id: [hash(order.id)],
          country: [hash("co")],
        },
        custom_data: {
          currency: "COP",
          value: order.totalCop,
          order_id: order.orderNumber,
          content_type: "product",
          contents: order.items.map((item) => ({
            id: item.packId ?? item.productId ?? "linfovit",
            quantity: item.units,
            item_price: Math.round(item.lineTotalCop / Math.max(1, item.units)),
          })),
        },
      },
    ],
  };

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    console.error("[meta-capi] Error al enviar Purchase:", response.status, order.orderNumber);
  }
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente de pago",
  PAID: "Pagado",
  FAILED: "Pago rechazado",
  CANCELLED: "Cancelado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  REFUNDED: "Reembolsado",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  IN_PROCESS: "En proceso",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
  CHARGED_BACK: "Contracargo",
};

export function shouldSyncOrder(order: {
  updatedAt: Date;
  paymentStatus: string;
}): boolean {
  return (
    order.paymentStatus !== "APPROVED" &&
    Date.now() - order.updatedAt.getTime() > 15_000
  );
}

export async function getOrderByToken(token: string) {
  return prisma.order.findUnique({
    where: { accessToken: token },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "desc" } },
      review: true,
    },
  });
}
