import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 150)));

await page.goto("http://localhost:3000/producto", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /añadir al carrito/i }).click();
await page.waitForTimeout(800);
const drawerText = await page.locator('[role="dialog"]').innerText();
await page.screenshot({ path: ".tmp/shots/cart-upsell-unit.png", fullPage: false });

await page.getByRole("button", { name: /cambiar al pack doble/i }).click();
await page.waitForTimeout(900);
const doubleText = await page.locator('[role="dialog"]').innerText();
await page.screenshot({ path: ".tmp/shots/cart-upsell-double.png", fullPage: false });

await page.getByRole("button", { name: /cambiar al pack triple/i }).click();
await page.waitForTimeout(900);
const tripleText = await page.locator('[role="dialog"]').innerText();

console.log(JSON.stringify({
  errors,
  unit: {
    upsell: /Mejora y ahorra/i.test(drawerText),
    doubleOffer: /Pack doble/i.test(drawerText),
    saving: /Ahorras \$ 14\.900/i.test(drawerText),
    freeShipping: /Envío gratis/i.test(drawerText),
  },
  double: {
    header: /2 frascos/i.test(doubleText),
    price: doubleText.includes("$ 84.900"),
    tripleUpsell: /Cambiar al pack triple/i.test(doubleText),
    saving: /Ahorras \$ 29\.900/i.test(doubleText),
  },
  triple: {
    header: /3 frascos/i.test(tripleText),
    price: tripleText.includes("$ 104.900"),
    noUpsell: !/Cambiar al pack/i.test(tripleText),
  },
}, null, 1));
await browser.close();
