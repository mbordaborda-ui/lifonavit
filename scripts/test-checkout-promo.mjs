import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /compra ya/i }).first().click();
await page.waitForURL("**/checkout", { timeout: 15000 });
await page.waitForLoadState("networkidle");
await page.selectOption("#department", "Bogotá D.C.");
await page.waitForTimeout(150);
await page.selectOption("#city", "Bogotá");
await page.waitForTimeout(600);

const summary = await page.locator("form").innerText();
const totalLine = summary
  .split("\n")
  .filter((line) => line.includes("49.900") || line.toLowerCase().includes("sin costo") || line.toLowerCase().includes("total"));

const button = page.getByRole("button", { name: /pagar ahora/i });
const disabled = await button.isDisabled();
await page.screenshot({ path: ".tmp/shots/promo-checkout-mobile.png", fullPage: false });

console.log(JSON.stringify({
  url: page.url(),
  disabled,
  hasFreeShipping: /sin costo/i.test(summary),
  hasTotal49900: summary.includes("$ 49.900"),
  totalLine,
}, null, 1));
await browser.close();
