import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const out = {};

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.screenshot({ path: ".tmp/shots/promo-hero.png" });

const barColor = await page
  .locator("body > div, header")
  .first()
  .evaluate((el) => {
    const bar = el.previousElementSibling ?? el;
    return getComputedStyle(bar).backgroundColor;
  })
  .catch(() => null);

const homeText = await page.locator("body").innerText();
const heroButton = page.getByRole("button", { name: /compra ya/i }).first();
const heroButtonText = await heroButton.textContent();

await page.locator("#ofertas").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await page.locator("#ofertas").screenshot({ path: ".tmp/shots/promo-offers.png" });
const offerText = await page.locator("#ofertas").innerText();
const offerImages = await page.locator("#ofertas img").evaluateAll((nodes) =>
  nodes.map((img) => img.complete && img.naturalWidth > 0),
);

// Compra directa desde el hero
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(300);
await heroButton.click();
await page.waitForURL("**/checkout", { timeout: 15000 });
await page.waitForLoadState("networkidle");
const checkoutText = await page.locator("body").innerText();
await page.screenshot({ path: ".tmp/shots/promo-checkout.png", fullPage: false });

out.desktop = {
  errors,
  barColor,
  heroButtonText,
  announcement: /oferta de fin de año/i.test(homeText),
  normalPrice: homeText.includes("$ 69.900"),
  promoPrice: homeText.includes("$ 49.900"),
  saving: /ahorra \$ 20\.000/i.test(homeText),
  urgency: /hasta agotar unidades/i.test(homeText),
  offerText: {
    unitBefore: /antes \$ 69\.900/i.test(offerText),
    unitBadge: /oferta fin de año/i.test(offerText),
    discount: /-29%/.test(offerText),
    maxSaving: /104\.800/.test(offerText),
  },
  offerImages,
  checkout: {
    total: checkoutText.includes("$ 49.900"),
    shippingFree: /sin costo/i.test(checkoutText),
    item: /unidad/i.test(checkoutText),
  },
};
await page.close();

const product = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await product.goto("http://localhost:3000/producto", { waitUntil: "networkidle" });
const productText = await product.locator("body").innerText();
const selected = await product
  .locator('[role="radio"][aria-checked="true"]')
  .first()
  .innerText()
  .catch(() => "");
await product.screenshot({ path: ".tmp/shots/promo-product.png", fullPage: false });
out.product = {
  promoBadge: /oferta fin de año/i.test(productText),
  normalPrice: productText.includes("$ 69.900"),
  promoPrice: productText.includes("$ 49.900"),
  selected: selected.replace(/\n/g, " | "),
  saving: /ahorras \$ 20\.000/i.test(productText),
};
await product.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await mobile.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await mobile.evaluate(() => window.scrollTo(0, 900));
await mobile.waitForTimeout(800);
const barText = await mobile.locator("body").innerText();
await mobile.screenshot({ path: ".tmp/shots/promo-mobile-bar.png" });
out.mobile = {
  barPromo: /oferta fin de año/i.test(barText),
  barPrice: barText.includes("$ 49.900"),
  buyLabel: /compra ya/i.test(barText),
};
await mobile.close();

console.log(JSON.stringify(out, null, 1));
await browser.close();
