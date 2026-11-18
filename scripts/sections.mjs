import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const outDir = ".tmp/shots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });

async function sectionShots(prefix, width, height) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: width < 600,
  });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `.reveal{opacity:1!important;transform:none!important;transition:none!important} *{animation-duration:.001s!important;animation-delay:0s!important}`,
  });
  const total = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += Math.round(height * 0.8)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const sections = await page.$$("main > section");
  let i = 0;
  for (const section of sections) {
    const name = `${prefix}-${String(i).padStart(2, "0")}`;
    await section.screenshot({ path: `${outDir}/${name}.png` });
    i += 1;
  }
  // Hero is main>section 0; header separately
  await page.screenshot({ path: `${outDir}/${prefix}-viewport.png` });
  console.log(prefix, "sections", i, "total", total);
  await page.close();
}

await sectionShots("d", 1440, 1000);
await sectionShots("m", 390, 844);

await browser.close();
