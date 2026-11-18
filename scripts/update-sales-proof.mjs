import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const settings = {
  "site.salesCount": "2005",
  "site.salesPeriod": "del 30 de octubre al 5 de noviembre",
  "site.salesSource": "Dropi",
};

async function main() {
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log("Prueba social de ventas configurada.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
