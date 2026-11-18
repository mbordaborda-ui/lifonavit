import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 150)));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.locator("section[aria-label='Ventas verificadas']").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.screenshot({ path: ".tmp/shots/sales-proof.png", fullPage: false });
const text = await page.locator("body").innerText();
const bandText = await page
  .locator("section[aria-label='Ventas verificadas']")
  .innerText()
  .catch(() => "");
console.log(JSON.stringify({
  errors,
  band: bandText.replace(/\n/g, " | "),
  hasSales: text.includes("2.005"),
  hasPeriod: /30 de octubre al 5 de noviembre/i.test(text),
  hasSource: /Fuente: Dropi/i.test(text),
  hasStock: /120 frascos disponibles/i.test(text),
  hasFakeCountdown: /24 horas|finaliza en/i.test(text),
  hasReviews: /reseñas|experiencias/i.test(text),
}, null, 1));
await browser.close();
