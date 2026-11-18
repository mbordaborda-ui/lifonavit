"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { audit, requireAdminAction } from "@/lib/auth";
import { saveImage, deleteImage } from "@/lib/uploads";
import { sendOrderConfirmation } from "@/lib/email";

function text(formData: FormData, key: string, max = 5000): string {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function integer(formData: FormData, key: string, fallback = 0): number {
  const value = Number.parseInt(String(formData.get(key) ?? ""), 10);
  return Number.isFinite(value) ? value : fallback;
}

function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function back(path: string, kind: "ok" | "error", message: string): never {
  redirect(`${path}?${kind}=${encodeURIComponent(message)}`);
}

function refreshStore() {
  revalidatePath("/");
  revalidatePath("/producto");
  revalidatePath("/checkout");
}

export async function updateProductAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  if (!id) back("/admin/productos", "error", "Producto no encontrado.");

  const name = text(formData, "name", 160);
  const tagline = text(formData, "tagline", 200);
  const description = text(formData, "description", 3000);
  const sku = text(formData, "sku", 60);
  const stock = integer(formData, "stock", 0);
  const volumeMl = integer(formData, "volumeMl", 60);
  const active = checked(formData, "active");

  if (name.length < 3) back("/admin/productos", "error", "El nombre es obligatorio.");
  if (stock < 0) back("/admin/productos", "error", "El inventario no puede ser negativo.");

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) back("/admin/productos", "error", "Producto no encontrado.");

  let imageFront = product.imageFront;
  let imageBack = product.imageBack;
  let imageAngle = product.imageAngle;

  const front = formData.get("imageFront");
  if (front instanceof File && front.size > 0) {
    const saved = await saveImage(front, "products");
    if (!saved.ok) back("/admin/productos", "error", saved.error);
    imageFront = saved.url;
  }
  const backImage = formData.get("imageBack");
  if (backImage instanceof File && backImage.size > 0) {
    const saved = await saveImage(backImage, "products");
    if (!saved.ok) back("/admin/productos", "error", saved.error);
    imageBack = saved.url;
  }
  const angle = formData.get("imageAngle");
  if (angle instanceof File && angle.size > 0) {
    const saved = await saveImage(angle, "products");
    if (!saved.ok) back("/admin/productos", "error", saved.error);
    imageAngle = saved.url;
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      tagline,
      description,
      sku,
      stock,
      volumeMl,
      active,
      imageFront,
      imageBack,
      imageAngle,
    },
  });

  await audit(session.admin.id, "UPDATE", "Product", id, name);
  refreshStore();
  revalidatePath("/admin/productos");
  back("/admin/productos", "ok", "Producto actualizado.");
}

export async function updatePackAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  const name = text(formData, "name", 100);
  const quantity = integer(formData, "quantity", 1);
  const priceCop = integer(formData, "priceCop", 0);
  const compareAtCop = integer(formData, "compareAtCop", 0);
  const badge = text(formData, "badge", 80);
  const description = text(formData, "description", 300);
  const sortOrder = integer(formData, "sortOrder", 0);
  const active = checked(formData, "active");

  if (!id) back("/admin/productos", "error", "Pack no encontrado.");
  if (priceCop <= 0) back("/admin/productos", "error", "El precio debe ser mayor que cero.");
  if (quantity < 1 || quantity > 12) {
    back("/admin/productos", "error", "La cantidad de frascos debe estar entre 1 y 12.");
  }
  if (compareAtCop > 0 && compareAtCop <= priceCop) {
    back("/admin/productos", "error", "El precio de referencia debe ser mayor al precio de venta.");
  }
  if (!name) back("/admin/productos", "error", "El nombre del pack es obligatorio.");

  await prisma.pack.update({
    where: { id },
    data: {
      name,
      quantity,
      priceCop,
      compareAtCop: compareAtCop > 0 ? compareAtCop : null,
      badge: badge || null,
      description: description || null,
      sortOrder,
      active,
    },
  });

  await audit(session.admin.id, "UPDATE", "Pack", id, `${name} $${priceCop}`);
  refreshStore();
  revalidatePath("/admin/productos");
  back("/admin/productos", "ok", "Pack actualizado.");
}

export async function createPackAction(formData: FormData) {
  const session = await requireAdminAction();
  const productId = text(formData, "productId", 60);
  const name = text(formData, "name", 100);
  const slugInput = text(formData, "slug", 60);
  const quantity = integer(formData, "quantity", 1);
  const priceCop = integer(formData, "priceCop", 0);

  if (!productId || !name) back("/admin/productos", "error", "Completa nombre y producto.");
  if (priceCop <= 0) back("/admin/productos", "error", "El precio debe ser mayor que cero.");

  const baseSlug =
    slugInput
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `pack-${Date.now().toString(36)}`;

  let slug = baseSlug;
  let suffix = 0;
  while (await prisma.pack.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const pack = await prisma.pack.create({
    data: {
      productId,
      name,
      slug,
      quantity: Math.min(12, Math.max(1, quantity)),
      priceCop,
      sortOrder: 10,
      active: true,
    },
  });

  await audit(session.admin.id, "CREATE", "Pack", pack.id, name);
  refreshStore();
  revalidatePath("/admin/productos");
  back("/admin/productos", "ok", "Pack creado.");
}

export async function togglePackAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  const pack = await prisma.pack.findUnique({ where: { id } });
  if (!pack) back("/admin/productos", "error", "Pack no encontrado.");
  await prisma.pack.update({ where: { id }, data: { active: !pack.active } });
  await audit(session.admin.id, "TOGGLE_ACTIVE", "Pack", id, String(!pack.active));
  refreshStore();
  revalidatePath("/admin/productos");
  back("/admin/productos", "ok", "Disponibilidad actualizada.");
}

export async function updateShippingAction(formData: FormData) {
  const session = await requireAdminAction();

  await prisma.setting.upsert({
    where: { key: "site.freeShippingOverCop" },
    update: { value: String(Math.max(0, integer(formData, "freeShippingOverCop", 0))) },
    create: {
      key: "site.freeShippingOverCop",
      value: String(Math.max(0, integer(formData, "freeShippingOverCop", 0))),
    },
  });
  await prisma.setting.upsert({
    where: { key: "site.shippingNote" },
    update: { value: text(formData, "shippingNote", 500) },
    create: { key: "site.shippingNote", value: text(formData, "shippingNote", 500) },
  });

  const updates: Promise<unknown>[] = [];
  for (const [key, rawValue] of formData.entries()) {
    if (!key.startsWith("price-")) continue;
    const id = key.slice("price-".length);
    const priceCop = Number.parseInt(String(rawValue), 10);
    if (!Number.isFinite(priceCop) || priceCop < 0) continue;
    const etaMin = Math.max(1, integer(formData, `etaMin-${id}`, 2));
    const etaMax = Math.max(etaMin, integer(formData, `etaMax-${id}`, 5));
    updates.push(
      prisma.shippingRate.update({
        where: { id },
        data: { priceCop, etaMinDays: etaMin, etaMaxDays: etaMax },
      }),
    );
  }
  await Promise.all(updates);

  await audit(session.admin.id, "UPDATE", "ShippingRate", "all");
  refreshStore();
  revalidatePath("/admin/envios");
  back("/admin/envios", "ok", "Tarifas de envío actualizadas.");
}

const ALLOWED_SETTINGS = new Set([
  "site.announcement",
  "site.promoEndsAt",
  "site.salesCount",
  "site.salesPeriod",
  "site.salesSource",
  "site.contactEmail",
  "site.contactPhone",
  "site.contactHours",
  "site.city",
  "site.manufacturer",
  "site.sanitaryRegistry",
  "site.nit",
  "content.hero.eyebrow",
  "content.hero.title",
  "content.hero.accent",
  "content.hero.subtitle",
  "content.hero.lead",
  "content.hero.note",
  "content.problem.title",
  "content.problem.intro",
  "content.problem.closing",
  "content.desire.title",
  "content.desire.intro",
  "content.desire.body",
  "content.manifesto.quote",
  "content.ingredients.title",
  "content.ingredients.intro",
  "content.benefits.title",
  "content.testimonials.title",
  "content.offers.title",
  "content.offers.subtitle",
  "content.final.title",
  "content.final.intro",
  "content.faq.title",
  "content.faq.intro",
  "content.faq.items",
  "content.benefits.items",
  "content.ingredients.items",
  "content.quotes.items",
]);

function validateJsonList(raw: string, key: string): string | null {
  if (!raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return `${key}: debe ser una lista con al menos un elemento.`;
    for (const item of parsed) {
      if (!item || typeof item !== "object") return `${key}: cada elemento debe ser un objeto.`;
      if (key === "content.faq.items" && (!item.q || !item.a)) {
        return `${key}: cada pregunta requiere "q" y "a".`;
      }
      if (key === "content.benefits.items" && (!item.title || !item.text)) {
        return `${key}: cada beneficio requiere "title" y "text".`;
      }
      if (key === "content.ingredients.items" && (!item.name || !item.text)) {
        return `${key}: cada ingrediente requiere "name" y "text".`;
      }
      if (key === "content.quotes.items" && !item.text) {
        return `${key}: cada frase requiere "text".`;
      }
    }
    return null;
  } catch {
    return `${key}: el JSON no es válido.`;
  }
}

export async function updateSettingsAction(formData: FormData) {
  const session = await requireAdminAction();
  const changed: string[] = [];

  for (const key of ALLOWED_SETTINGS) {
    if (!formData.has(key)) continue;
    const value = String(formData.get(key) ?? "").trim().slice(0, 12000);
    if (key.endsWith(".items")) {
      const error = validateJsonList(value, key);
      if (error) back("/admin/contenido", "error", error);
    }
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    changed.push(key);
  }

  await audit(session.admin.id, "UPDATE", "Setting", "content", changed.join(", ").slice(0, 400));
  refreshStore();
  revalidatePath("/admin/contenido");
  back("/admin/contenido", "ok", "Contenido actualizado en la tienda.");
}

export async function moderateReviewAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  const decision = text(formData, "decision", 20);
  if (!id) back("/admin/resenas", "error", "Reseña no encontrada.");

  if (decision === "delete") {
    await prisma.review.delete({ where: { id } });
    await audit(session.admin.id, "DELETE", "Review", id);
    refreshStore();
    revalidatePath("/admin/resenas");
    back("/admin/resenas", "ok", "Reseña eliminada.");
  }

  const status =
    decision === "approve" ? "APPROVED" : decision === "reject" ? "REJECTED" : null;
  if (!status) back("/admin/resenas", "error", "Acción no válida.");

  await prisma.review.update({
    where: { id },
    data: {
      status,
      publishedAt: status === "APPROVED" ? new Date() : null,
      adminNote: text(formData, "adminNote", 500) || null,
    },
  });
  await audit(session.admin.id, status, "Review", id);
  refreshStore();
  revalidatePath("/admin/resenas");
  back("/admin/resenas", "ok", "Reseña moderada.");
}

export async function saveTestimonialAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  const name = text(formData, "name", 120);
  const kind = text(formData, "kind", 20) === "COLLABORATOR" ? "COLLABORATOR" : "CUSTOMER";
  const role = text(formData, "role", 120);
  const quote = text(formData, "quote", 1200);
  const rating = Math.min(5, Math.max(1, integer(formData, "rating", 5)));
  const status = text(formData, "status", 20);
  const consentRef = text(formData, "consentRef", 300);
  const experiencedAtRaw = text(formData, "experiencedAt", 30);
  const featured = checked(formData, "featured");
  const sortOrder = integer(formData, "sortOrder", 0);
  const deletePhoto = checked(formData, "deletePhoto");

  if (!name || quote.length < 10) {
    back("/admin/testimonios", "error", "Nombre y testimonio son obligatorios.");
  }
  if (!["DRAFT", "PUBLISHED", "HIDDEN"].includes(status)) {
    back("/admin/testimonios", "error", "Estado no válido.");
  }
  if (status === "PUBLISHED" && !consentRef) {
    back(
      "/admin/testimonios",
      "error",
      "Para publicar un testimonio debes registrar la referencia de autorización (consentimiento).",
    );
  }

  const existing = id ? await prisma.testimonial.findUnique({ where: { id } }) : null;
  let photoUrl = existing?.photoUrl ?? null;

  if (deletePhoto) {
    await deleteImage(photoUrl);
    photoUrl = null;
  }

  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file, "testimonials");
    if (!saved.ok) back("/admin/testimonios", "error", saved.error);
    await deleteImage(photoUrl);
    photoUrl = saved.url;
  }

  const data = {
    name,
    kind,
    role: role || null,
    quote,
    rating,
    status,
    consentRef: consentRef || null,
    experiencedAt: experiencedAtRaw ? new Date(`${experiencedAtRaw}T12:00:00`) : null,
    featured,
    sortOrder,
    photoUrl,
  };

  if (existing) {
    await prisma.testimonial.update({ where: { id: existing.id }, data });
    await audit(session.admin.id, "UPDATE", "Testimonial", existing.id, name);
  } else {
    const created = await prisma.testimonial.create({ data });
    await audit(session.admin.id, "CREATE", "Testimonial", created.id, name);
  }

  refreshStore();
  revalidatePath("/admin/testimonios");
  back("/admin/testimonios", "ok", "Testimonio guardado.");
}

export async function deleteTestimonialAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  if (!id) back("/admin/testimonios", "error", "Testimonio no encontrado.");
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  await prisma.testimonial.delete({ where: { id } });
  await deleteImage(existing?.photoUrl);
  await audit(session.admin.id, "DELETE", "Testimonial", id);
  refreshStore();
  revalidatePath("/admin/testimonios");
  back("/admin/testimonios", "ok", "Testimonio eliminado.");
}

export async function updateOrderAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  const status = text(formData, "status", 20);
  const trackingNumber = text(formData, "trackingNumber", 120);
  const trackingUrl = text(formData, "trackingUrl", 500);
  const adminNotes = text(formData, "adminNotes", 2000);

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) back("/admin/pedidos", "error", "Pedido no encontrado.");

  const allowed = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!allowed.includes(status)) {
    back(`/admin/pedidos/${id}`, "error", "Estado no permitido.");
  }
  if (status === "SHIPPED" && order.paymentStatus !== "APPROVED") {
    back(`/admin/pedidos/${id}`, "error", "No despaches un pedido sin pago aprobado.");
  }
  if (status === "CANCELLED" && order.paymentStatus === "APPROVED") {
    back(
      `/admin/pedidos/${id}`,
      "error",
      "Un pedido pagado debe reembolsarse desde Mercado Pago antes de cancelarse.",
    );
  }
  if (status === "PENDING" && order.paymentStatus === "APPROVED") {
    back(`/admin/pedidos/${id}`, "error", "No se puede volver a pendiente un pedido pagado.");
  }

  await prisma.order.update({
    where: { id },
    data: {
      status,
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
      adminNotes: adminNotes || null,
      shippedAt: status === "SHIPPED" ? (order.shippedAt ?? new Date()) : order.shippedAt,
      deliveredAt: status === "DELIVERED" ? (order.deliveredAt ?? new Date()) : order.deliveredAt,
    },
  });

  await audit(session.admin.id, "UPDATE_STATUS", "Order", id, `${order.status}→${status}`);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  back(`/admin/pedidos/${id}`, "ok", "Pedido actualizado.");
}

export async function resendConfirmationAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) back("/admin/pedidos", "error", "Pedido no encontrado.");
  if (order.paymentStatus !== "APPROVED") {
    back(`/admin/pedidos/${id}`, "error", "Solo se envía confirmación de pedidos pagados.");
  }
  await sendOrderConfirmation(id);
  await audit(session.admin.id, "RESEND_EMAIL", "Order", id);
  revalidatePath(`/admin/pedidos/${id}`);
  back(`/admin/pedidos/${id}`, "ok", "Correo de confirmación procesado.");
}

export async function createPromoAction(formData: FormData) {
  const session = await requireAdminAction();
  const code = text(formData, "code", 30).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const type = text(formData, "type", 10) === "FIXED" ? "FIXED" : "PERCENT";
  const value = integer(formData, "value", 0);
  const minSubtotalCop = integer(formData, "minSubtotalCop", 0);
  const maxUses = integer(formData, "maxUses", 0);
  const startsAt = text(formData, "startsAt", 30);
  const endsAt = text(formData, "endsAt", 30);

  if (code.length < 3) back("/admin/promociones", "error", "El código debe tener al menos 3 caracteres.");
  if (value <= 0) back("/admin/promociones", "error", "El valor del descuento debe ser mayor a cero.");
  if (type === "PERCENT" && value > 80) {
    back("/admin/promociones", "error", "El porcentaje no puede superar 80%.");
  }

  const exists = await prisma.promoCode.findUnique({ where: { code } });
  if (exists) back("/admin/promociones", "error", "Ese código ya existe.");

  const promo = await prisma.promoCode.create({
    data: {
      code,
      type,
      value,
      minSubtotalCop: minSubtotalCop > 0 ? minSubtotalCop : null,
      maxUses: maxUses > 0 ? maxUses : null,
      startsAt: startsAt ? new Date(`${startsAt}T00:00:00`) : null,
      endsAt: endsAt ? new Date(`${endsAt}T23:59:59`) : null,
      active: checked(formData, "active"),
    },
  });

  await audit(session.admin.id, "CREATE", "PromoCode", promo.id, code);
  revalidatePath("/admin/promociones");
  back("/admin/promociones", "ok", "Código de descuento creado.");
}

export async function togglePromoAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) back("/admin/promociones", "error", "Código no encontrado.");
  await prisma.promoCode.update({ where: { id }, data: { active: !promo.active } });
  await audit(session.admin.id, "TOGGLE_ACTIVE", "PromoCode", id, String(!promo.active));
  revalidatePath("/admin/promociones");
  back("/admin/promociones", "ok", "Estado del código actualizado.");
}

export async function deletePromoAction(formData: FormData) {
  const session = await requireAdminAction();
  const id = text(formData, "id", 60);
  await prisma.promoCode.delete({ where: { id } }).catch(() => undefined);
  await audit(session.admin.id, "DELETE", "PromoCode", id);
  revalidatePath("/admin/promociones");
  back("/admin/promociones", "ok", "Código eliminado.");
}
