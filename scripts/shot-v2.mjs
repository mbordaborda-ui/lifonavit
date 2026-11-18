import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = {};

async function shot(name, width, height, fullPage = true) {
  const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 600 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message.slice(0, 200)));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `.reveal{opacity:1!important;transform:none!important;transition:none!important} *{animation-duration:.001s!important}`,
  });
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += Math.round(height * 0.8)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: `.tmp/shots/${name}.png`, fullPage });
  const text = await page.locator("body").innerText();
  results[name] = { errors, height: total, text };
  await page.close();
}

await shot("v2-hero", 1440, 1000, false);
await shot("v2-desktop", 1440, 1000, true);
await shot("v2-mobile", 390, 844, true);

const desktop = results["v2-desktop"].text;
console.log(
  JSON.stringify(
    {
      errors: { desktop: results["v2-desktop"].errors, mobile: results["v2-mobile"].errors },
      includes: {
        eyebrow: desktop.includes("PARA HOMBRES Y MUJERES"),
        heroQuestion: desktop.includes("¿Llevas tanto tiempo dejando tu bienestar"),
        accent: desktop.includes("que ya lo convertiste en costumbre"),
        problem: desktop.includes("¿Pasas más de 8 horas sentado?"),
        desire: desktop.includes("¿Qué estás haciendo por él?"),
        manifesto: desktop.includes("Siempre debes encontrar un momento para tu bienestar"),
        ingredientsTitle: desktop.includes("Una decisión para tu bienestar"),
        quoteBand: desktop.includes("Tu cuerpo merece la misma atención"),
        final: desktop.includes("Pero hoy puedes empezar a priorizarte"),
      },
      heightDesktop: results["v2-desktop"].height,
      heightMobile: results["v2-mobile"].height,
    },
    null,
    1,
  ),
);

await browser.close();
