import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const base = process.env.BASE_URL || "http://localhost:3000";
const outDir = ".tmp/shots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });

async function shoot(name, url, width, height, fullPage = true) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: width < 600,
  });
  await page.goto(base + url, { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `
      .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
      * { animation-duration: 0.001s !important; animation-delay: 0s !important; }
    `,
  });
  const height_ = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height_; y += Math.round(height * 0.8)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage });
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  console.log(name, "height=", height_);
  await page.close();
}

await shoot("home-desktop", "/", 1440, 1000);
await shoot("home-mobile", "/", 390, 844);

await browser.close();
