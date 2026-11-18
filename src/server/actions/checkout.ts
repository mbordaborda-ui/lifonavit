"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/content";
import { getShippingQuote } from "@/lib/shipping";
import { isMpConfigured, createPreference, getCheckoutUrl } from "@/lib/mercadopago";
import { checkoutSchema } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type CheckoutResult =
  | { ok: true; initPoint: string; orderNumber: string }
  | {
      ok: false;
      code?: "MP_NOT_CONFIGURED" | "RATE_LIMITED" | "OUT_OF_STOCK" | "NO_SHIPPING";
      error: string;
      fieldErrors?: Record<string, string>;
    };

function orderNumber(): string {
  const now = new Date();
  const stamp = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `LFV-${stamp}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function resolvePromo(code: string | undefined, subtotal: number) {
  if (!code) return { discountCop: 0, promoCode: null as string | null, error: null as string | null };
  const normalized = code.trim().toUpperCase();
  const promo = await prisma.promoCode.findUnique({ where: { code: normalized } });
  if (!promo || !promo.active) {
    return { discountCop: 0, promoCode: null, error: "El código no es válido o ya expiró." };
  }
  const now = new Date();
  if (promo.startsAt && promo.startsAt > now) {
    return { discountCop: 0, promoCode: null, error: "El código aún no está vigente." };
  }
  if (promo.endsAt && promo.endsAt < now) {
    return { discountCop: 0, promoCode: null, error: "El código ya expiró." };
  }
  if (promo.maxUses !== null && promo.uses >= promo.maxUses) {
    return { discountCop: 0, promoCode: null, error: "El código alcanzó su límite de usos." };
  }
  if (promo.minSubtotalCop && subtotal < promo.minSubtotalCop) {
    return { discountCop: 0, promoCode: null, error: "El subtotal no alcanza el mínimo del código." };
  }

  const raw =
    promo.type === "PERCENT"
      ? Math.round((subtotal * promo.value) / 100)
      : promo.value;

  return {
    discountCop: Math.min(subtotal, Math.max(0, raw)),
    promoCode: promo.code,
    error: null,
  };
}

export async function previewPromo(code: string, subtotalCop: number) {
  if (!code.trim()) return { ok: false as const, error: "Escribe un código." };
  if (!Number.isFinite(subtotalCop) || subtotalCop <= 0) {
    return { ok: false as const, error: "Tu carrito está vacío." };
  }
  const result = await resolvePromo(code, Math.round(subtotalCop));
  if (result.error) return { ok: false as const, error: result.error };
  return {
    ok: true as const,
    code: result.promoCode ?? "",
    discountCop: result.discountCop,
  };
}

export async function createCheckout(raw: unknown): Promise<CheckoutResult> {
  const headerStore = await headers();
  const ip = clientIp(headerStore);
  const limit = rateLimit(`checkout:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.allowed) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      error: "Hicimos varios intentos desde esta conexión. Espera unos minutos e inténtalo de nuevo.",
    };
  }

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "Revisa los datos marcados antes de continuar.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const settings = await getSettings();

  const packIds = [...new Set(data.items.map((item) => item.packId))];
  const packs = await prisma.pack.findMany({
    where: { id: { in: packIds }, active: true },
    include: { product: true },
  });

  if (packs.length !== packIds.length) {
    return { ok: false, error: "Uno de los packs ya no está disponible. Actualiza tu selección." };
  }

  const product = packs[0].product;
  if (!product.active) {
    return { ok: false, code: "OUT_OF_STOCK", error: "El producto no está disponible en este momento." };
  }

  let subtotalCop = 0;
  let totalUnits = 0;

  const lines = data.items.map((item) => {
    const pack = packs.find((candidate) => candidate.id === item.packId);
    if (!pack) throw new Error("Pack no encontrado");
    const lineTotalCop = pack.priceCop * item.quantity;
    subtotalCop += lineTotalCop;
    totalUnits += pack.quantity * item.quantity;
    return {
      packId: pack.id,
      productId: pack.productId,
      packName: pack.name,
      productName: pack.product.name,
      quantity: item.quantity,
      units: pack.quantity * item.quantity,
      unitPriceCop: pack.priceCop,
      lineTotalCop,
    };
  });

  if (subtotalCop <= 0) {
    return { ok: false, error: "Tu carrito está vacío." };
  }

  if (product.stock < totalUnits) {
    return {
      ok: false,
      code: "OUT_OF_STOCK",
      error: `Solo quedan ${product.stock} frascos disponibles. Ajusta tu pedido para continuar.`,
    };
  }

  const quote = await getShippingQuote(
    data.department,
    data.city,
    subtotalCop,
    settings,
  );
  if (!quote) {
    return {
      ok: false,
      code: "NO_SHIPPING",
      error: "No tenemos tarifa de envío para ese destino. Escríbenos para ayudarte.",
      fieldErrors: { city: "Destino sin tarifa de envío disponible." },
    };
  }

  const promo = await resolvePromo(data.promoCode || undefined, subtotalCop);
  if (promo.error) {
    return {
      ok: false,
      error: promo.error,
      fieldErrors: { promoCode: promo.error },
    };
  }

  const totalCop = subtotalCop - promo.discountCop + quote.priceCop;

  if (!isMpConfigured()) {
    return {
      ok: false,
      code: "MP_NOT_CONFIGURED",
      error:
        "El pago en línea aún no está habilitado: faltan las credenciales de Mercado Pago. Tu pedido no fue creado.",
    };
  }

  const accessToken = randomBytes(24).toString("base64url");
  const attribution = data.attribution ?? {};

  let created;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      created = await prisma.order.create({
        data: {
          orderNumber: orderNumber(),
          accessToken,
          status: "PENDING",
          paymentStatus: "PENDING",
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          department: data.department,
          city: data.city,
          address: data.address,
          addressExtra: data.addressExtra || null,
          notes: data.notes || null,
          subtotalCop,
          shippingCop: quote.priceCop,
          discountCop: promo.discountCop,
          totalCop,
          promoCode: promo.promoCode,
          utmSource: attribution.utm_source ?? null,
          utmMedium: attribution.utm_medium ?? null,
          utmCampaign: attribution.utm_campaign ?? null,
          utmContent: attribution.utm_content ?? null,
          utmTerm: attribution.utm_term ?? null,
          fbclid: attribution.fbclid ?? null,
          gclid: attribution.gclid ?? null,
          ttclid: attribution.ttclid ?? null,
          landingPath: data.landingPath ?? null,
          userAgent: headerStore.get("user-agent")?.slice(0, 300) ?? null,
          ip: ip.slice(0, 64),
          items: {
            create: lines,
          },
        },
      });
      break;
    } catch (error) {
      if (attempt === 2) {
        console.error("[checkout] No se pudo crear el pedido:", error);
        return {
          ok: false,
          error: "No pudimos registrar tu pedido. Inténtalo de nuevo en unos segundos.",
        };
      }
    }
  }

  if (!created) {
    return { ok: false, error: "No pudimos registrar tu pedido. Inténtalo de nuevo." };
  }

  try {
    const preference = await createPreference({
      orderId: created.id,
      orderNumber: created.orderNumber,
      totalCop,
      description: lines
        .map((line) => `${line.packName} x${line.quantity}`)
        .concat(quote.priceCop > 0 ? "Envío nacional" : "Envío sin costo")
        .join(" · "),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      accessToken,
    });

    await prisma.order.update({
      where: { id: created.id },
      data: { mpPreferenceId: preference.id },
    });

    return {
      ok: true,
      initPoint: getCheckoutUrl(preference),
      orderNumber: created.orderNumber,
    };
  } catch (error) {
    console.error("[checkout] Error creando preferencia MP:", error);
    await prisma.order.update({
      where: { id: created.id },
      data: {
        status: "FAILED",
        paymentStatus: "PENDING",
        paymentStatusDetail: "No se pudo iniciar el pago en Mercado Pago",
      },
    });
    return {
      ok: false,
      error:
        "No pudimos iniciar el pago con Mercado Pago. No se realizó ningún cobro. Inténtalo de nuevo.",
    };
  }
}


