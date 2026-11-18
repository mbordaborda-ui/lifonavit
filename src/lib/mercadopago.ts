import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getAppUrl, isMercadoPagoConfigured } from "@/lib/env";

// Permite apuntar a un servidor de pruebas local sin cambiar el código.
// En producción debe quedar sin definir para usar la API oficial.
const MP_API = (process.env.MP_API_BASE?.trim() || "https://api.mercadopago.com").replace(
  /\/$/,
  "",
);

if (process.env.MP_API_BASE && process.env.NODE_ENV === "production") {
  console.warn("[mercadopago] MP_API_BASE está definido en producción. Verifica que sea intencional.");
}

export function isMpConfigured(): boolean {
  return isMercadoPagoConfigured();
}

export function isTestCredentials(): boolean {
  return (process.env.MP_ACCESS_TOKEN ?? "").startsWith("TEST-");
}

function accessToken(): string {
  const token = process.env.MP_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("Mercado Pago no está configurado (MP_ACCESS_TOKEN).");
  return token;
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `Error ${response.status} de Mercado Pago`;
    throw new Error(message);
  }

  return body as T;
}

export type MpPreference = {
  id: string;
  init_point: string;
  sandbox_init_point: string;
};

export type MpPayment = {
  id: number;
  status: string;
  status_detail?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  transaction_amount: number;
  external_reference?: string | null;
  date_approved?: string | null;
  metadata?: Record<string, unknown>;
  payer?: { email?: string };
};

export type PreferenceInput = {
  orderId: string;
  orderNumber: string;
  totalCop: number;
  description: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  accessToken: string;
};

export async function createPreference(input: PreferenceInput): Promise<MpPreference> {
  const appUrl = getAppUrl();
  const nameParts = input.customerName.trim().split(/\s+/);
  const name = nameParts.shift() ?? input.customerName;
  const surname = nameParts.join(" ") || undefined;
  const isHttps = appUrl.startsWith("https://");

  const payload = {
    items: [
      {
        id: input.orderId,
        title: `LINFOVIT — Pedido ${input.orderNumber}`,
        description: input.description.slice(0, 250),
        category_id: "wellness",
        quantity: 1,
        currency_id: "COP",
        unit_price: input.totalCop,
      },
    ],
    payer: {
      name,
      surname,
      email: input.customerEmail,
      phone: {
        area_code: "57",
        number: input.customerPhone.replace(/\D/g, ""),
      },
    },
    external_reference: input.orderId,
    statement_descriptor: "LINFOVIT",
    notification_url: `${appUrl}/api/webhooks/mercadopago`,
    back_urls: {
      success: `${appUrl}/pago/exitoso?token=${input.accessToken}`,
      pending: `${appUrl}/pago/pendiente?token=${input.accessToken}`,
      failure: `${appUrl}/pago/rechazado?token=${input.accessToken}`,
    },
    ...(isHttps ? { auto_return: "approved" } : {}),
    metadata: {
      order_id: input.orderId,
      order_number: input.orderNumber,
    },
  };

  return mpFetch<MpPreference>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPayment(paymentId: string | number): Promise<MpPayment> {
  return mpFetch<MpPayment>(`/v1/payments/${paymentId}`);
}

export async function searchPaymentsByReference(
  externalReference: string,
): Promise<MpPayment[]> {
  const query = new URLSearchParams({
    external_reference: externalReference,
    sort: "date_created",
    criteria: "desc",
    limit: "20",
  });
  const result = await mpFetch<{ results?: MpPayment[] }>(`/v1/payments/search?${query}`);
  return result.results ?? [];
}

export function getCheckoutUrl(preference: MpPreference): string {
  return isTestCredentials() ? preference.sandbox_init_point : preference.init_point;
}

/**
 * Verifica la firma del webhook según la documentación de Mercado Pago:
 * manifest = "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 */
export function verifyWebhookSignature({
  signature,
  requestId,
  dataId,
  secret,
}: {
  signature: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
}): boolean {
  if (!signature || !requestId || !dataId) return false;

  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
