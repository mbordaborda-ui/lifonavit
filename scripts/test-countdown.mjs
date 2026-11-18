import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 150)));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
const timer = page.locator("[role='timer']").first();
await timer.waitFor({ state: "visible", timeout: 5000 });
const before = (await timer.innerText()).replace(/\n/g, " ");
const label = await timer.getAttribute("aria-label");
await page.waitForTimeout(2200);
const after = (await timer.innerText()).replace(/\n/g, " ");
await page.screenshot({ path: ".tmp/shots/final-countdown-hero.png" });

const top = await page.locator("body").innerText();
await page.locator("#ofertas").scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const offersText = await page.locator("#ofertas").innerText();

console.log(JSON.stringify({
  errors,
  before,
  after,
  changed: before !== after,
  label,
  topDeadline: /termina el 31 de diciembre/i.test(top),
  offersDeadline: /31 de diciembre de 2026/i.test(offersText),
  fakeDailyReset: /24 horas/i.test(top),
}, null, 1));
await browser.close();
