import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { formatCop } from "@/lib/money";
import { getAppUrl, isEmailConfigured } from "@/lib/env";

type OrderForEmail = {
  id: string;
  orderNumber: string;
  accessToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  department: string;
  city: string;
  address: string;
  addressExtra: string | null;
  notes: string | null;
  subtotalCop: number;
  shippingCop: number;
  discountCop: number;
  totalCop: number;
  items: { packName: string; quantity: number; units: number; lineTotalCop: number }[];
};

function esc(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] ?? char;
  });
}

function buildHtml(order: OrderForEmail): string {
  const orderUrl = `${getAppUrl()}/pedido/${order.accessToken}`;
  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e9e6dc;font-size:14px;color:#252b26;">
            ${esc(item.packName)} <span style="color:#6b726a;">· ${item.units} frasco(s)</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #e9e6dc;font-size:14px;color:#252b26;">
            ${formatCop(item.lineTotalCop)}
          </td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#f8f6ef;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#244c3a;border-radius:18px 18px 0 0;padding:26px 28px;">
      <p style="margin:0;color:#c7a66a;font-size:11px;letter-spacing:3px;text-transform:uppercase;">LINFOVIT</p>
      <h1 style="margin:8px 0 0;color:#f8f6ef;font-size:25px;font-weight:normal;">Recibimos tu pago</h1>
      <p style="margin:6px 0 0;color:rgba(248,246,239,.7);font-size:13px;">Pedido ${esc(order.orderNumber)}</p>
    </div>
    <div style="background:#ffffff;padding:28px;border-radius:0 0 18px 18px;">
      <p style="margin:0 0 16px;font-size:14px;color:#252b26;">Hola ${esc(order.customerName)},</p>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#5c625a;">
        Confirmamos el pago de tu pedido. Estamos preparando tu LINFOVIT para despacharlo
        desde Bogotá. Te enviaremos la guía de transporte cuando salga de bodega.
      </p>
      <table style="width:100%;border-collapse:collapse;">${rows}
        <tr>
          <td style="padding:8px 0 0;font-size:13px;color:#5c625a;">Subtotal</td>
          <td align="right" style="padding:8px 0 0;font-size:13px;color:#5c625a;">${formatCop(order.subtotalCop)}</td>
        </tr>
        ${
          order.discountCop > 0
            ? `<tr><td style="padding:4px 0;font-size:13px;color:#5c625a;">Descuento</td><td align="right" style="padding:4px 0;font-size:13px;color:#5c625a;">- ${formatCop(order.discountCop)}</td></tr>`
            : ""
        }
        <tr>
          <td style="padding:4px 0;font-size:13px;color:#5c625a;">Envío</td>
          <td align="right" style="padding:4px 0;font-size:13px;color:#5c625a;">${order.shippingCop === 0 ? "Sin costo" : formatCop(order.shippingCop)}</td>
        </tr>
        <tr>
          <td style="padding:12px 0 0;font-size:15px;font-weight:bold;color:#244c3a;">Total pagado</td>
          <td align="right" style="padding:12px 0 0;font-size:15px;font-weight:bold;color:#244c3a;">${formatCop(order.totalCop)}</td>
        </tr>
      </table>

      <div style="margin-top:22px;padding:16px;background:#f8f6ef;border-radius:12px;">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#66866a;">Entrega</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#252b26;">
          ${esc(order.address)}${order.addressExtra ? `, ${esc(order.addressExtra)}` : ""}<br/>
          ${esc(order.city)}, ${esc(order.department)}<br/>
          Tel. ${esc(order.customerPhone)}
        </p>
        ${order.notes ? `<p style="margin:8px 0 0;font-size:12px;color:#5c625a;">Nota: ${esc(order.notes)}</p>` : ""}
      </div>

      <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#5c625a;">
        Puedes consultar el estado de tu pedido en cualquier momento:
      </p>
      <p style="margin:10px 0 0;">
        <a href="${orderUrl}" style="display:inline-block;background:#244c3a;color:#f8f6ef;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
          Ver mi pedido
        </a>
      </p>

      <p style="margin:24px 0 0;font-size:11px;line-height:1.6;color:#8a9089;">
        LINFOVIT es un producto botánico de bienestar, no un medicamento. No exceda la dosis
        indicada (30 gotas / 1 ml, tres veces al día). Ante cualquier duda de salud, consulte a un
        profesional. Si no reconoces esta compra, escríbenos de inmediato.
      </p>
    </div>
    <p style="margin:16px 0 0;text-align:center;font-size:10px;color:#9aa097;">
      © LINFOVIT · Colombia
    </p>
  </div>
</body>
</html>`;
}

async function sendViaResend({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!apiKey || !from) return { error: "RESEND_API_KEY o EMAIL_FROM sin configurar." };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return { error: body?.message ? String(body.message).slice(0, 300) : `HTTP ${response.status}` };
    }
    return { id: body?.id ? String(body.id) : undefined };
  } catch (error) {
    return { error: error instanceof Error ? error.message.slice(0, 300) : "Error de red" };
  }
}

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const subject = `Pedido ${order.orderNumber} confirmado — LINFOVIT`;
  const html = buildHtml(order);
  const configured = isEmailConfigured();

  const result = configured
    ? await sendViaResend({ to: order.customerEmail, subject, html })
    : { error: "Correo transaccional no configurado (modo desarrollo)." };

  await prisma.emailLog.create({
    data: {
      orderId: order.id,
      to: order.customerEmail,
      subject,
      kind: "ORDER_CONFIRMATION",
      provider: "resend",
      providerId: result.id,
      status: configured && !result.error ? "SENT" : configured ? "FAILED" : "SKIPPED",
      error: result.error,
    },
  });

  if (result.error && configured) {
    console.error("[email] No se pudo enviar la confirmación:", result.error);
  }

  if (!result.error && configured) {
    await prisma.order.update({
      where: { id: order.id },
      data: { confirmationSentAt: new Date() },
    });
  }

  const adminEmail = process.env.ORDER_NOTIFICATION_EMAIL?.trim();
  if (adminEmail && configured) {
    const adminResult = await sendViaResend({
      to: adminEmail,
      subject: `Nuevo pedido pagado ${order.orderNumber}`,
      html: buildHtml(order),
    });
    await prisma.emailLog.create({
      data: {
        orderId: order.id,
        to: adminEmail,
        subject: `Nuevo pedido pagado ${order.orderNumber}`,
        kind: "ADMIN_NOTIFICATION",
        provider: "resend",
        providerId: adminResult.id,
        status: adminResult.error ? "FAILED" : "SENT",
        error: adminResult.error,
      },
    });
  }
}

export function hashForCapi(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}
