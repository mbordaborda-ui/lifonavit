import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });

async function shot(name, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 600 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `.reveal{opacity:1!important;transform:none!important;transition:none!important} *{animation-duration:.001s!important}`,
  });
  const sections = await page.$$("main > section");
  for (const index of [5, 6, 10]) {
    if (sections[index]) {
      await sections[index].screenshot({ path: `.tmp/shots/${name}-${index}.png` });
    }
  }
  await page.close();
}

await shot("offer-check", 1440, 1000);
await browser.close();
