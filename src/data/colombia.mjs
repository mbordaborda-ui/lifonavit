import { readFileSync } from "node:fs";

const data = JSON.parse(
  readFileSync(new URL("../../src/data/colombia.json", import.meta.url), "utf8"),
);

const ZONES = {
  A: { priceCop: 12900, etaMinDays: 1, etaMaxDays: 3 },
  B: { priceCop: 15900, etaMinDays: 2, etaMaxDays: 4 },
  C: { priceCop: 19900, etaMinDays: 3, etaMaxDays: 6 },
};

export const shippingRates = data.departments.map((dept) => ({
  department: dept.name,
  city: "*",
  ...ZONES[dept.zone],
  active: true,
}));
