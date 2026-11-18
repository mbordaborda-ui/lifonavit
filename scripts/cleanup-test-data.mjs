import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.count();
  const reviews = await prisma.review.count();
  const events = await prisma.analyticsEvent.count();

  await prisma.review.deleteMany();
  await prisma.emailLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.webhookLog.deleteMany();
  await prisma.auditLog.deleteMany();

  await prisma.product.updateMany({ data: { stock: 120 } });

  console.log(
    `Limpieza completada: ${orders} pedidos, ${reviews} reseñas, ${events} eventos de prueba eliminados.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
