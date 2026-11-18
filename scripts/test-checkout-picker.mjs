import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 150)));

await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /compra ya/i }).first().click();
await page.waitForURL("**/checkout", { timeout: 15000 });
await page.waitForLoadState("networkidle");
await page.waitForTimeout(600);

const picker = page.locator("text=Elige tu pack").first();
const pickerVisible = await picker.isVisible().catch(() => false);
const initialText = await page.locator("body").innerText();
await page.screenshot({ path: ".tmp/shots/checkout-picker-initial.png", fullPage: false });

const packButtons = page.locator('button[aria-pressed]');
const count = await packButtons.count();
const labels = [];
for (let i = 0; i < count; i += 1) labels.push((await packButtons.nth(i).innerText()).replace(/\n/g, " | "));

// Cambiar a pack doble
await page.getByRole("button", { name: /pack doble/i }).first().click();
await page.waitForTimeout(800);
const doubleText = await page.locator("body").innerText();
const selectedDouble = await page
  .locator('button[aria-pressed="true"]')
  .first()
  .innerText()
  .catch(() => "");

// Cambiar a pack triple
await page.getByRole("button", { name: /pack triple/i }).first().click();
await page.waitForTimeout(800);
const tripleText = await page.locator("body").innerText();
const selectedTriple = await page
  .locator('button[aria-pressed="true"]')
  .first()
  .innerText()
  .catch(() => "");

await page.screenshot({ path: ".tmp/shots/checkout-picker-triple.png", fullPage: false });

console.log(JSON.stringify({
  errors,
  pickerVisible,
  packOptions: labels,
  initial: {
    unitPrice: initialText.includes("$ 49.900"),
    normalPrice: initialText.includes("$ 69.900"),
    shippingFree: /Sin costo/i.test(initialText),
    headerCount: /1 frasco\b/i.test(initialText),
    offerBadge: /Oferta fin de año/i.test(initialText),
  },
  double: {
    total: /Total[\s\S]{0,80}\$ 84\.900/i.test(doubleText),
    price: doubleText.includes("$ 84.900"),
    headerCount: /2 frascos/i.test(doubleText),
    selected: selectedDouble.replace(/\n/g, " | "),
  },
  triple: {
    total: /Total[\s\S]{0,80}\$ 104\.900/i.test(tripleText),
    price: tripleText.includes("$ 104.900"),
    headerCount: /3 frascos/i.test(tripleText),
    selected: selectedTriple.replace(/\n/g, " | "),
  },
}, null, 1));
await browser.close();
