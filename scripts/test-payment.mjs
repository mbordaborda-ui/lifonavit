import { chromium } from "playwright-core";
import { PrismaClient } from "@prisma/client";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).replace(/^"|"$/g, "")];
    }),
);

const prisma = new PrismaClient();
const base = "http://localhost:3000";
const mock = "http://localhost:4001";
const results = [];
const errors = [];

function assert(condition, message) {
  results.push({ ok: Boolean(condition), message });
  if (!condition) console.error("FAIL:", message);
}

async function webhook(paymentId, requestId = `req-${Date.now()}`) {
  const ts = Date.now().toString();
  const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac("sha256", env.MP_WEBHOOK_SECRET).update(manifest).digest("hex");

  const response = await fetch(`${base}/api/webhooks/mercadopago`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-signature": `ts=${ts},v1=${v1}`,
      "x-request-id": requestId,
    },
    body: JSON.stringify({ type: "payment", data: { id: Number(paymentId) } }),
  });
  return response.status;
}

async function fillCheckout(page, email) {
  await page.fill("#customerName", "Prueba Automática");
  await page.fill("#customerEmail", email);
  await page.fill("#customerPhone", "3001234567");
  await page.selectOption("#department", "Bogotá D.C.");
  await page.waitForTimeout(100);
  await page.selectOption("#city", "Bogotá");
  await page.fill("#address", "Calle 123 # 45-67");
  await page.fill("#addressExtra", "Apto 101");
  await page.check('input[type="checkbox"]');
}

async function startOrder(page, email) {
  await page.goto(`${base}/producto`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /comprar ahora/i }).click();
  await page.waitForURL("**/checkout");
  await page.waitForLoadState("networkidle");
  await fillCheckout(page, email);
  await page.getByRole("button", { name: /pagar ahora/i }).click();
  await page.waitForURL(/localhost:4001\/checkout/, { timeout: 30000 });
  await page.waitForTimeout(800);
  return prisma.order.findFirst({
    where: { customerEmail: email },
    orderBy: { createdAt: "desc" },
    include: { items: true, payments: true },
  });
}

const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text().slice(0, 200));
});

const stockBefore = (await prisma.product.findFirst()).stock;

// ── 1. Pedido aprobado ──────────────────────────────────────
await fetch(`${mock}/__control`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ status: "approved", paymentId: 910001, externalReference: null }),
});
const email1 = `prueba-${Date.now()}@linfovit.co`;
const order1 = await startOrder(page, email1);
assert(order1, "Pedido 1 creado");
assert(order1?.status === "PENDING", `Pedido 1 inicia PENDING (${order1?.status})`);
assert(order1?.paymentStatus === "PENDING", `Pedido 1 pago PENDING (${order1?.paymentStatus})`);
assert(order1?.totalCop === 49900, `Total con envío gratis = 49900 (${order1?.totalCop})`);
assert(order1?.shippingCop === 0, `Envío gratis (${order1?.shippingCop})`);
assert(order1?.items[0]?.units === 1, `1 frasco (${order1?.items[0]?.units})`);

const token1 = order1.accessToken;
const pendingView = await page.goto(`${base}/pedido/${token1}`, { waitUntil: "networkidle" });
const pendingText = await page.locator("body").innerText();
assert(pendingView?.status() === 200, "Página de pedido accesible");
assert(/confirmando tu pago|Gracias por tu compra/i.test(pendingText), "Estado pendiente visible");

const mockState = await fetch(`${mock}/__state`).then((r) => r.json());
assert(mockState.externalReference === order1.id, "Preferencia enviada con external_reference del pedido");
assert(mockState.lastTotal === order1.totalCop, "Monto de preferencia = total del pedido");

const wh1 = await webhook(910001, "req-approved");
assert(wh1 === 200, `Webhook aprobado responde 200 (${wh1})`);
await page.waitForTimeout(800);

const paid1 = await prisma.order.findUnique({
  where: { id: order1.id },
  include: { payments: true, emails: true },
});
assert(paid1?.status === "PAID", `Pedido 1 queda PAID (${paid1?.status})`);
assert(paid1?.paymentStatus === "APPROVED", `Pago 1 APPROVED (${paid1?.paymentStatus})`);
assert(paid1?.payments.length === 1, "Se registra un pago");
assert(paid1?.emails.length >= 1 && paid1.emails[0].status === "SKIPPED", "Correo registrado como SKIPPED sin proveedor");

const stockAfter1 = (await prisma.product.findFirst()).stock;
assert(stockAfter1 === stockBefore - 1, `Stock descontado 1 (${stockBefore}→${stockAfter1})`);

const successPage = await page.goto(`${base}/pedido/${token1}`, { waitUntil: "networkidle" });
const successText = await page.locator("body").innerText();
assert(successPage?.status() === 200, "Página de éxito 200");
assert(/Gracias por tu compra/i.test(successText), "Página muestra compra confirmada");
assert(/Compra verificada/i.test(successText), "Bloque de compra verificada presente");

const purchaseEvents = await prisma.analyticsEvent.count({
  where: { name: "Purchase", orderId: order1.id },
});
assert(purchaseEvents === 1, `Evento Purchase registrado una vez (${purchaseEvents})`);

// Idempotencia
const wh1b = await webhook(910001, "req-duplicate");
assert(wh1b === 200, `Webhook duplicado responde 200 (${wh1b})`);
const stockAfterDup = (await prisma.product.findFirst()).stock;
assert(stockAfterDup === stockAfter1, `Stock no se descuenta dos veces (${stockAfterDup})`);
const purchaseEventsDup = await prisma.analyticsEvent.count({
  where: { name: "Purchase", orderId: order1.id },
});
assert(purchaseEventsDup === 1, "Purchase no se duplica");

// ── 2. Pedido rechazado ─────────────────────────────────────
await fetch(`${mock}/__control`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ status: "pending", paymentId: 910002, externalReference: null }),
});
const email2 = `rechazo-${Date.now()}@linfovit.co`;
const order2 = await startOrder(page, email2);
assert(order2?.status === "PENDING", `Pedido 2 inicia PENDING (${order2?.status})`);

const pending2 = await page.goto(`${base}/pedido/${order2.accessToken}`, { waitUntil: "networkidle" });
const pending2Text = await page.locator("body").innerText();
assert(pending2?.status() === 200, "Pedido 2 página 200");
assert(/confirmando tu pago/i.test(pending2Text), "Pedido 2 muestra pago en confirmación");

const stockBeforeReject = (await prisma.product.findFirst()).stock;
await fetch(`${mock}/__control`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ status: "rejected", paymentId: 910002 }),
});
const wh2 = await webhook(910002, "req-rejected");
assert(wh2 === 200, `Webhook rechazado responde 200 (${wh2})`);

const rejected = await prisma.order.findUnique({ where: { id: order2.id } });
assert(rejected?.paymentStatus === "REJECTED", `Pedido 2 REJECTED (${rejected?.paymentStatus})`);
assert(rejected?.status === "FAILED", `Pedido 2 FAILED (${rejected?.status})`);
const stockAfterReject = (await prisma.product.findFirst()).stock;
assert(stockAfterReject === stockBeforeReject, "Pago rechazado no descuenta stock");

const rejectedPage = await page.goto(`${base}/pedido/${order2.accessToken}`, { waitUntil: "networkidle" });
const rejectedText = await page.locator("body").innerText();
assert(rejectedPage?.status() === 200, "Pedido rechazado página 200");
assert(/no se completó/i.test(rejectedText), "Página muestra pago no completado");

// ── 3. Firma inválida ───────────────────────────────────────
const badSignature = await fetch(`${base}/api/webhooks/mercadopago`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-signature": "ts=1,v1=deadbeef",
    "x-request-id": "req-bad",
  },
  body: JSON.stringify({ type: "payment", data: { id: 910001 } }),
});
assert(badSignature.status === 401, `Webhook con firma inválida rechazado (${badSignature.status})`);

// ── 4. Admin puede ver el pedido ────────────────────────────
await page.goto(`${base}/admin/login`, { waitUntil: "networkidle" });
await page.fill("#email", env.ADMIN_EMAIL);
await page.fill("#password", env.ADMIN_PASSWORD);
await page.getByRole("button", { name: /ingresar al panel/i }).click();
await page.waitForURL("**/admin", { timeout: 15000 });
const adminOrder = await page.goto(`${base}/admin/pedidos/${order1.id}`, { waitUntil: "networkidle" });
const adminText = await page.locator("body").innerText();
assert(adminOrder?.status() === 200, "Detalle admin 200");
assert(adminText.includes(order1.orderNumber), "Admin muestra el número de pedido");
assert(/Aprobado/.test(adminText), "Admin muestra pago aprobado");

const passed = results.filter((r) => r.ok).length;
console.log(JSON.stringify({ passed, total: results.length, results, errors }, null, 1));
await browser.close();
await prisma.$disconnect();
process.exit(passed === results.length ? 0 : 1);
