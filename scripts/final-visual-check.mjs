import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 150)));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: ".tmp/shots/final-visual-hero.png" });
const top = await page.locator("body").innerText();
const marquee = await page.evaluate(() => {
  const track = document.querySelector(".marquee-track");
  return track ? getComputedStyle(track).animationName : null;
});
const sticker = await page.getByText("Dcto").count();
await page.locator("#ofertas").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await page.locator("#ofertas").screenshot({ path: ".tmp/shots/final-visual-offers.png" });
console.log(JSON.stringify({
  errors,
  marquee,
  sticker,
  offer: /Oferta de fin de año/i.test(top),
  sales: /2\.005/i.test(top),
  source: /Dropi/i.test(top),
  reviews: /reseñas|experiencias/i.test(top),
}, null, 1));
await browser.close();
