import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
const sheets = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href));
const info = await page.evaluate(() => {
  const card = document.querySelector("#ingredientes article");
  const cs = card ? getComputedStyle(card) : null;
  return {
    cardBg: cs?.backgroundColor,
    heroBg: getComputedStyle(document.querySelector("main section")).backgroundColor,
    btnDisplay: getComputedStyle(document.querySelector(".btn")).display,
    gridRule: [...document.styleSheets].flatMap((s) => {
      try {
        return [...s.cssRules].filter((r) => r.selectorText === ".grid").map((r) => r.cssText);
      } catch {
        return [];
      }
    }),
    rulesCount: [...document.styleSheets].reduce((acc, s) => {
      try { return acc + s.cssRules.length; } catch { return acc; }
    }, 0),
  };
});
console.log(JSON.stringify({ sheets, info }, null, 1));
if (sheets[0]) {
  const css = await page.request.get(sheets[0]).then((r) => r.text());
  console.log("CSS bytes", css.length);
  console.log("has .grid", css.includes(".grid"));
  console.log("has --color-forest", css.includes("--color-forest"));
  console.log(css.slice(0, 500));
}
await browser.close();
