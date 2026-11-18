import { chromium } from "playwright-core";
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

const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text().slice(0, 300));
});
page.on("pageerror", (err) => errors.push("PAGEERROR " + err.message.slice(0, 300)));

const results = [];

async function visit(path, label) {
  const response = await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  const status = response?.status();
  const title = await page.title();
  results.push({ label, path, status, title, errors: errors.splice(0) });
}

await visit("/", "home");
await visit("/producto", "producto");
await visit("/checkout", "checkout-empty");
await visit("/resena", "resena");
await visit("/politicas/privacidad", "privacidad");
await visit("/politicas/envios", "envios");
await visit("/admin", "admin-redirect");

const loginUrl = page.url();
await page.fill("#email", env.ADMIN_EMAIL);
await page.fill("#password", env.ADMIN_PASSWORD);
await page.getByRole("button", { name: /ingresar al panel/i }).click();
await page.waitForURL("**/admin", { timeout: 15000 });
results.push({ label: "login", status: 200, url: page.url(), errors: errors.splice(0) });

const adminPages = [
  ["/admin", "dashboard"],
  ["/admin/pedidos", "pedidos"],
  ["/admin/productos", "productos"],
  ["/admin/envios", "envios-admin"],
  ["/admin/resenas", "resenas-admin"],
  ["/admin/testimonios", "testimonios"],
  ["/admin/contenido", "contenido"],
  ["/admin/promociones", "promociones"],
  ["/admin/estadisticas", "estadisticas"],
  ["/admin/configuracion", "configuracion"],
];

for (const [path, label] of adminPages) {
  await visit(path, label);
}

console.log(JSON.stringify({ loginUrl, results }, null, 1));
await browser.close();
