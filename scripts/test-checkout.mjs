import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push("PAGEERROR: " + err.message));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.getByRole("button", { name: /comprar ahora/i }).first().click();
await page.waitForURL("**/checkout", { timeout: 15000 });
await page.waitForLoadState("networkidle");
await page.screenshot({ path: ".tmp/shots/checkout.png", fullPage: true });

const heading = await page.locator("h1").first().textContent();
const banner = await page.getByText(/pago en línea en habilitación/i).count();
const total = await page.locator("form").getByText(/^\$ /).last().textContent();
console.log(JSON.stringify({ heading, banner, total, errors }, null, 1));

await browser.close();
