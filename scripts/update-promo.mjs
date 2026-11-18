import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const packs = [
  {
    slug: "unidad",
    priceCop: 49900,
    compareAtCop: 69900,
    badge: "Oferta fin de año",
    description: "1 frasco de 60 ml. Precio especial de fin de año.",
  },
  {
    slug: "pack-doble",
    priceCop: 84900,
    compareAtCop: 139800,
    badge: "Recomendado",
    description: "2 frascos de 60 ml. Envío sin costo incluido.",
  },
  {
    slug: "pack-triple",
    priceCop: 104900,
    compareAtCop: 209700,
    badge: "Mejor precio por unidad",
    description: "3 frascos de 60 ml. El menor precio por frasco.",
  },
];

async function main() {
  for (const pack of packs) {
    await prisma.pack.updateMany({
      where: { slug: pack.slug },
      data: {
        priceCop: pack.priceCop,
        compareAtCop: pack.compareAtCop,
        badge: pack.badge,
        description: pack.description,
      },
    });
  }

  await prisma.setting.upsert({
    where: { key: "site.announcement" },
    update: {
      value:
        "Oferta de fin de año: $49.900 (antes $69.900) · Hasta agotar unidades · Envío gratis",
    },
    create: {
      key: "site.announcement",
      value:
        "Oferta de fin de año: $49.900 (antes $69.900) · Hasta agotar unidades · Envío gratis",
    },
  });

  console.log("Precios de fin de año aplicados.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
