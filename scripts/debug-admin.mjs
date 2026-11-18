import { chromium } from "playwright-core";
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).replace(/^"|"$/g, "")];
    }),
);

const prisma = new PrismaClient();
const order = await prisma.order.findFirst({ where: { customerEmail: { startsWith: "prueba-" } } });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];
page.on("response", (res) => {
  if (res.status() >= 400) failures.push(`${res.status()} ${res.url()}`);
});
await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await page.fill("#email", env.ADMIN_EMAIL);
await page.fill("#password", env.ADMIN_PASSWORD);
await page.getByRole("button", { name: /ingresar al panel/i }).click();
await page.waitForURL("**/admin");

await page.goto(`http://localhost:3000/admin/pedidos/${order.id}`, { waitUntil: "networkidle" });
await page.screenshot({ path: ".tmp/shots/admin-order.png", fullPage: true });
const text = await page.locator("body").innerText();
const paymentIndex = text.indexOf("Pagos de Mercado Pago");
console.log(JSON.stringify({
  failures,
  snippet: text.slice(paymentIndex, paymentIndex + 900),
  hasApproved: /aprobado/i.test(text),
}, null, 1));
await browser.close();
await prisma.$disconnect();
