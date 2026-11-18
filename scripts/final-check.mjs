import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).replace(/^"|"$/g, "")];
    }),
);

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const results = {};

async function capture(name, path, width, height, opts = {}) {
  const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 600 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
  page.on("pageerror", (e) => errors.push("PAGEERROR " + e.message.slice(0, 200)));
  const response = await page.goto("http://localhost:3000" + path, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `.reveal{opacity:1!important;transform:none!important;transition:none!important} *{animation-duration:.001s!important}`,
  });
  if (opts.scroll) {
    const total = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < total; y += Math.round(height * 0.8)) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: `.tmp/shots/${name}.png`, fullPage: opts.fullPage ?? false });
  results[name] = { status: response?.status(), errors };
  await page.close();
}

await capture("final-home-desktop", "/", 1440, 1000, { scroll: true, fullPage: true });
await capture("final-home-viewport", "/", 1440, 1000);
await capture("final-home-mobile", "/", 390, 844, { scroll: true, fullPage: true });
await capture("final-product", "/producto", 1440, 1000, { scroll: true, fullPage: true });
await capture("final-checkout", "/checkout", 1440, 1000, { fullPage: true });
await capture("final-policies", "/politicas/tratamiento-datos", 1440, 1000);
await capture("final-review", "/resena", 1440, 1000, { fullPage: true });

// Admin
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await page.fill("#email", env.ADMIN_EMAIL);
await page.fill("#password", env.ADMIN_PASSWORD);
await page.getByRole("button", { name: /ingresar al panel/i }).click();
await page.waitForURL("**/admin");
await page.waitForLoadState("networkidle");
await page.screenshot({ path: ".tmp/shots/final-admin.png", fullPage: true });
const adminText = await page.locator("body").innerText();
results.admin = { hasLogin: /Resumen de la tienda/.test(adminText), errors: [] };
await page.close();

const homeText = await (async () => {
  const p = await browser.newPage();
  await p.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  const t = await p.locator("body").innerText();
  await p.close();
  return t;
})();

console.log(
  JSON.stringify(
    {
      results,
      prices: {
        unit: homeText.includes("$ 49.900"),
        double: homeText.includes("$ 84.900"),
        triple: homeText.includes("$ 104.900"),
      },
      freeShipping: /Envío sin costo a toda Colombia/.test(homeText),
      noFakeReviews: homeText.includes("Todavía no hay reseñas publicadas"),
      noFakeRating: !homeText.includes("4.9/5"),
    },
    null,
    1,
  ),
);

await browser.close();
