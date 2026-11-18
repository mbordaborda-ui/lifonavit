import colombia from "@/data/colombia.json";
import { prisma } from "@/lib/db";
import { getFreeShippingOver } from "@/lib/content";

export type Department = { name: string; zone: string; cities: string[] };

export const departments: Department[] = colombia.departments;

export function getCitiesFor(department: string): string[] {
  return departments.find((item) => item.name === department)?.cities ?? [];
}

export type ShippingQuote = {
  department: string;
  city: string;
  priceCop: number;
  etaMinDays: number;
  etaMaxDays: number;
  free: boolean;
  freeOverCop: number;
};

export async function getShippingQuote(
  department: string,
  city: string,
  subtotalCop: number,
  settings: Record<string, string>,
): Promise<ShippingQuote | null> {
  if (!department || !city) return null;
  const validDepartment = departments.some((item) => item.name === department);
  if (!validDepartment) return null;

  const rates = await prisma.shippingRate.findMany({
    where: { department, active: true, city: { in: ["*", city] } },
  });
  const exact = rates.find((rate) => rate.city === city);
  const fallback = rates.find((rate) => rate.city === "*");
  const rate = exact ?? fallback;
  if (!rate) return null;

  const freeOverCop = getFreeShippingOver(settings);
  const free = freeOverCop > 0 && subtotalCop >= freeOverCop;

  return {
    department,
    city,
    priceCop: free ? 0 : rate.priceCop,
    etaMinDays: rate.etaMinDays,
    etaMaxDays: rate.etaMaxDays,
    free,
    freeOverCop,
  };
}

/** Lista de tarifas por departamento para el panel administrativo. */
export async function getDepartmentRates() {
  const rates = await prisma.shippingRate.findMany({ where: { city: "*" } });
  return departments.map((dept) => ({
    department: dept.name,
    zone: dept.zone,
    cities: dept.cities.length,
    rate: rates.find((item) => item.department === dept.name) ?? null,
  }));
}
