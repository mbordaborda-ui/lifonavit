import { chromium } from "playwright-core";
import { mkdirSync, readFileSync } from "node:fs";

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
const out = {};

const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 200)));
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.addStyleTag({
  content: `.reveal{opacity:1!important;transform:none!important;transition:none!important} *{animation-duration:.001s!important}`,
});
await page.locator("#ofertas").scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
const offerImages = await page.locator("#ofertas img").evaluateAll((nodes) =>
  nodes.map((img) => img.complete && img.naturalWidth > 0),
);
await page.locator("#ofertas").screenshot({ path: ".tmp/shots/last-offers.png" });
const homeText = await page.locator("body").innerText();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: ".tmp/shots/last-hero.png" });

out.home = {
  errors,
  offerImages,
  reviews: /reseñas|testimonios|experiencias/i.test(homeText),
  heroPrice: homeText.includes("$ 84.900"),
  freeShipping: homeText.includes("ENVÍO GRATIS"),
  offersBeforeBenefits:
    homeText.indexOf("Elige tu rutina LINFOVIT") <
    homeText.indexOf("Una rutina botánica para complementar"),
};

await page.goto("http://localhost:3000/producto", { waitUntil: "networkidle" });
const productText = await page.locator("body").innerText();
out.product = {
  reviews: /reseñas|testimonios|experiencias/i.test(productText),
  cta: /ver packs y precios/i.test(productText),
  shipping: /envío gratis/i.test(productText),
};
await page.close();

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
await mobile.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: ".tmp/shots/last-mobile.png" });
const mobileText = await mobile.locator("body").innerText();
out.mobile = { reviews: /reseñas|testimonios|experiencias/i.test(mobileText) };
await mobile.close();

const admin = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await admin.goto("http://localhost:3000/admin/login", { waitUntil: "networkidle" });
await admin.fill("#email", env.ADMIN_EMAIL);
await admin.fill("#password", env.ADMIN_PASSWORD);
await admin.getByRole("button", { name: /ingresar al panel/i }).click();
await admin.waitForURL("**/admin");
const adminText = await admin.locator("body").innerText();
out.admin = {
  reviewsNav: /reseñas|testimonios/i.test(adminText),
  dashboard: adminText.includes("Resumen de la tienda"),
};
await admin.screenshot({ path: ".tmp/shots/last-admin.png", fullPage: true });
await admin.close();

console.log(JSON.stringify(out, null, 1));
await browser.close();
