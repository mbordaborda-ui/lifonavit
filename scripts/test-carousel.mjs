import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = [];

async function onMobile() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const track = page.locator(".ingredients-track");
  await track.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);

  const initialActive = await page
    .locator(".ingredient-card[data-active='true'] h3")
    .first()
    .textContent();

  const firstCard = page.locator(".ingredient-card").first();
  const fontSize = await firstCard.locator("p").last().evaluate((el) => getComputedStyle(el).fontSize);
  const cardWidth = await firstCard.evaluate((el) => Math.round(el.getBoundingClientRect().width));
  const scrollWidth = await track.evaluate((el) => el.scrollWidth);
  const clientWidth = await track.evaluate((el) => el.clientWidth);

  // Espera el avance automático
  await page.waitForTimeout(5600);
  const autoActive = await page
    .locator(".ingredient-card[data-active='true'] h3")
    .first()
    .textContent();

  // Deslizamiento manual con las flechas
  await page.getByRole("button", { name: /siguiente ingrediente/i }).click();
  await page.waitForTimeout(900);
  const manualActive = await page
    .locator(".ingredient-card[data-active='true'] h3")
    .first()
    .textContent();

  await page.screenshot({ path: ".tmp/shots/carousel-mobile.png", fullPage: false });

  results.push({
    viewport: "mobile",
    initialActive,
    autoActive,
    manualActive,
    fontSize,
    cardWidth,
    scrollWidth,
    clientWidth,
    swipeable: scrollWidth > clientWidth,
    errors,
  });
  await page.close();
}

async function onDesktop() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.locator(".ingredients-track").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const cards = await page.locator(".ingredient-card").count();
  const visible = await page.locator(".ingredients-track").evaluate((el) => {
    const cards = [...el.querySelectorAll(".ingredient-card")];
    return cards.filter((card) => card.getBoundingClientRect().width > 100).length;
  });
  const arrows = await page.getByRole("button", { name: /siguiente ingrediente/i }).count();
  await page.screenshot({ path: ".tmp/shots/carousel-desktop.png", fullPage: false });
  results.push({ viewport: "desktop", cards, visible, arrows });
  await page.close();
}

await onMobile();
await onDesktop();
console.log(JSON.stringify(results, null, 1));
await browser.close();
