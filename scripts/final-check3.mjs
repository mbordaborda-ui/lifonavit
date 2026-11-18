import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const out = {};

async function home(viewport, prefix) {
  const page = await browser.newPage({ viewport, isMobile: viewport.width < 600 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `.reveal{opacity:1!important;transform:none!important;transition:none!important} *{animation-duration:.001s!important}`,
  });
  await page.locator("#ofertas").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const images = await page.locator("#ofertas img").evaluateAll((nodes) =>
    nodes.map((img) => ({ src: img.getAttribute("src"), loaded: img.complete && img.naturalWidth > 0 })),
  );
  await page.locator("#ofertas").screenshot({ path: `.tmp/shots/${prefix}-offers.png` });
  const text = await page.locator("body").innerText();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `.tmp/shots/${prefix}-hero.png` });
  await page.close();
  return { errors, images, text };
}

const desktop = await home({ width: 1440, height: 1000 }, "check-d");
const mobile = await home({ width: 390, height: 844 }, "check-m");

const product = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await product.goto("http://localhost:3000/producto", { waitUntil: "networkidle" });
await product.locator("body").evaluate((el) => el.scrollTo(0, document.body.scrollHeight * 0.55));
await product.waitForTimeout(600);
await product.screenshot({ path: ".tmp/shots/check-product-mid.png", fullPage: false });
const productText = await product.locator("body").innerText();
await product.close();

out.desktop = {
  errors: desktop.errors,
  images: desktop.images,
  reviews: /reseñas|experiencias/i.test(desktop.text),
  freeShipping: desktop.text.includes("ENVÍO GRATIS"),
  offersBeforeBenefits:
    desktop.text.indexOf("Elige tu rutina LINFOVIT") <
    desktop.text.indexOf("Una rutina botánica para complementar"),
};
out.mobile = {
  errors: mobile.errors,
  images: mobile.images,
  reviews: /reseñas|experiencias/i.test(mobile.text),
};
out.product = {
  cta: /ver packs y precios/i.test(productText),
  freeShipping: /envío gratis/i.test(productText),
  reviews: /reseñas|experiencias/i.test(productText),
};

console.log(JSON.stringify(out, null, 1));
await browser.close();
