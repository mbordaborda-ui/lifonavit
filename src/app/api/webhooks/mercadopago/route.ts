import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/mercadopago";
import { syncOrderByPaymentId } from "@/lib/orders";

export const runtime = "nodejs";

/**
 * Webhook de Mercado Pago. Nunca confía en el cuerpo de la notificación:
 * consulta el pago directamente a la API antes de actualizar el pedido.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  const payload = (body ?? {}) as {
    type?: string;
    topic?: string;
    action?: string;
    data?: { id?: string | number };
  };

  const topic = payload.type ?? payload.topic ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId =
    payload.data?.id ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    null;

  if (topic !== "payment" || !dataId) {
    await prisma.webhookLog
      .create({
        data: {
          source: "mercadopago",
          topic: topic ?? null,
          resourceId: dataId ? String(dataId) : null,
          status: "IGNORED",
          message: "Notificación sin pago asociado.",
        },
      })
      .catch(() => undefined);
    return NextResponse.json({ received: true, ignored: true });
  }

  const secret = process.env.MP_WEBHOOK_SECRET?.trim();
  if (secret) {
    const valid = verifyWebhookSignature({
      signature: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId: String(dataId),
      secret,
    });
    if (!valid) {
      await prisma.webhookLog
        .create({
          data: {
            source: "mercadopago",
            topic: topic,
            resourceId: String(dataId),
            status: "INVALID_SIGNATURE",
            message: "Firma del webhook inválida.",
          },
        })
        .catch(() => undefined);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  try {
    const result = await syncOrderByPaymentId(String(dataId));
    await prisma.webhookLog
      .create({
        data: {
          source: "mercadopago",
          topic: topic,
          resourceId: String(dataId),
          status: result.orderId ? "PROCESSED" : "UNKNOWN_ORDER",
          message: `payment_status=${result.status ?? "?"} order=${result.orderId ?? "-"}`,
        },
      })
      .catch(() => undefined);
    return NextResponse.json({ received: true });
  } catch (error) {
    await prisma.webhookLog
      .create({
        data: {
          source: "mercadopago",
          topic: topic,
          resourceId: String(dataId),
          status: "ERROR",
          message: error instanceof Error ? error.message.slice(0, 300) : "Error desconocido",
        },
      })
      .catch(() => undefined);
    return NextResponse.json({ received: true, error: "retry" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "webhook activo" });
}
