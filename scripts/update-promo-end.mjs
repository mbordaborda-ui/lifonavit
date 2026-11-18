import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const settings = {
  "site.promoEndsAt": "2026-12-31T23:59",
  "site.announcement":
    "Oferta de fin de año: $49.900 (antes $69.900) · Termina el 31 de diciembre · Hasta agotar unidades · Envío gratis",
};

async function main() {
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log("Vigencia de la oferta configurada: 31 de diciembre, 11:59 p. m. (Colombia).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
