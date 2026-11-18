import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

mkdirSync(".tmp/shots", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });

async function capture(prefix, width, height, indexes) {
  const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 600 });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.addStyleTag({
    content: `.reveal{opacity:1!important;transform:none!important;transition:none!important} *{animation-duration:.001s!important}`,
  });
  const sections = await page.$$("main > section");
  for (const index of indexes) {
    if (sections[index]) {
      await sections[index].screenshot({ path: `.tmp/shots/${prefix}-${index}.png` });
    }
  }
  console.log(prefix, "sections", sections.length);
  await page.close();
}

await capture("v2-d", 1440, 1000, [2, 3, 4, 8, 11]);
await capture("v2-m", 390, 844, [0, 2, 3, 7, 9, 11]);
await browser.close();
