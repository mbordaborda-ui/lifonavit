import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = {};

const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
desktop.on("pageerror", (e) => errors.push(e.message));
desktop.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 150)));
await desktop.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await desktop.screenshot({ path: ".tmp/shots/final-promo-hero.png" });
const text = await desktop.locator("body").innerText();
results.desktop = {
  errors,
  offer: /oferta de fin de año/i.test(text),
  normal: text.includes("$ 69.900"),
  promo: text.includes("$ 49.900"),
  urgency: /hasta agotar unidades/i.test(text),
  buyNow: /compra ya/i.test(text),
  noReviews: !/reseñas|testimonios|experiencias/i.test(text),
  announcementColor: await desktop
    .locator("header")
    .first()
    .evaluate((header) => {
      const bar = header.previousElementSibling;
      return bar ? getComputedStyle(bar).backgroundColor : null;
    }),
};
await desktop.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await mobile.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await mobile.screenshot({ path: ".tmp/shots/final-promo-mobile-top.png" });
await mobile.evaluate(() => window.scrollTo(0, 900));
await mobile.waitForTimeout(700);
await mobile.screenshot({ path: ".tmp/shots/final-promo-mobile-bar.png" });
const mobileText = await mobile.locator("body").innerText();
results.mobile = {
  barPrice: mobileText.includes("$ 49.900"),
  barNormal: mobileText.includes("$ 69.900"),
  barUrgency: /hasta agotar unidades/i.test(mobileText),
  barBuy: /compra ya/i.test(mobileText),
};
await mobile.close();

console.log(JSON.stringify(results, null, 1));
await browser.close();
