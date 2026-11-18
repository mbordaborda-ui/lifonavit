import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 150)));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.locator("section[aria-label='Ventas verificadas']").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.screenshot({ path: ".tmp/shots/final-sales-band.png" });
const text = await page.locator("body").innerText();
console.log(JSON.stringify({
  errors,
  sales: /2\.005/i.test(text),
  source: /Dropi/i.test(text),
  stock: /120 frascos/i.test(text),
  offer: /Oferta de fin de año/i.test(text),
  reviews: /reseñas|experiencias/i.test(text),
}, null, 1));
await browser.close();
