import { chromium } from "playwright-core";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

const info = await page.evaluate(() => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName,
      cls: (el.className || "").toString().slice(0, 80),
      w: Math.round(r.width),
      h: Math.round(r.height),
      display: cs.display,
      aspect: cs.aspectRatio,
      maxW: cs.maxWidth,
      gridCols: cs.gridTemplateColumns,
      position: cs.position,
    };
  };
  const hero = document.querySelector("main section");
  const heroGrid = hero?.querySelector(":scope > div > div");
  const right = heroGrid?.children[1];
  const arch = right?.querySelector("div.relative.overflow-hidden");
  const img = right?.querySelector("img");
  const ing = document.querySelector("#ingredientes");
  const wrap = ing?.querySelector("div.no-scrollbar");
  const card = ing?.querySelector("article");
  const art = card?.querySelector("svg");
  return {
    hero: box(hero),
    heroGrid: box(heroGrid),
    right: box(right),
    arch: box(arch),
    img: box(img),
    ing: box(ing),
    wrap: box(wrap),
    card: box(card),
    art: box(art),
    children: right ? [...right.children].map(box) : [],
    wrapChildren: wrap ? [...wrap.children].map(box) : [],
  };
});

console.log(JSON.stringify(info, null, 1));
await browser.close();
