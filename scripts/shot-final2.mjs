import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });

async function capture(name, width, height, fullPage = false, sections = []) {
  const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 600 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
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
  for (const index of sections) {
    const sectionsHandle = await page.$$("main > section");
    if (sectionsHandle[index]) {
      await sectionsHandle[index].screenshot({ path: `.tmp/shots/${name}-s${index}.png` });
    }
  }
  const text = await page.locator("body").innerText();
  await page.close();
  return { status: response?.status(), errors, total, text };
}

const desktop = await capture("final2-desktop", 1440, 1000, true, [0, 3, 6]);
const mobile = await capture("final2-mobile", 390, 844, true, [0, 4]);

const product = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await product.goto("http://localhost:3000/producto", { waitUntil: "networkidle" });
await product.screenshot({ path: ".tmp/shots/final2-product.png", fullPage: true });
const productText = await product.locator("body").innerText();
await product.close();

console.log(
  JSON.stringify(
    {
      status: desktop.status,
      errors: desktop.errors,
      heightDesktop: desktop.total,
      heightMobile: mobile.total,
      checks: {
        heroPrice: desktop.text.includes("$ 84.900"),
        heroShipping: desktop.text.includes("ENVÍO GRATIS"),
        offersBeforeBenefits:
          desktop.text.indexOf("Elige tu rutina LINFOVIT") <
          desktop.text.indexOf("Una rutina botánica para complementar"),
        reviewsGoneFromHome:
          !/reseñas|experiencias/i.test(desktop.text),
        reviewsGoneFromProduct: !/reseñas|experiencias/i.test(productText),
        productCta: productText.includes("Ver packs y precios"),
        productShippingBadge: productText.includes("Envío gratis"),
      },
    },
    null,
    1,
  ),
);
await browser.close();
