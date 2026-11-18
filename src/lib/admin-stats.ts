import "server-only";
import { prisma } from "@/lib/db";

export type AdminStats = Awaited<ReturnType<typeof getAdminStats>>;

export async function getAdminStats(periodDays = 30) {
  const since = new Date();
  since.setDate(since.getDate() - periodDays);
  since.setHours(0, 0, 0, 0);

  const [
    paidAll,
    paidPeriod,
    pendingOrders,
    sessions,
    recentOrders,
    topItems,
    eventsBySource,
    product,
    paidOrdersForSeries,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { paymentStatus: "APPROVED" },
      _sum: { totalCop: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: "APPROVED", paidAt: { gte: since } },
      _sum: { totalCop: true },
      _count: { _all: true },
    }),
    prisma.order.count({ where: { status: "PENDING", paymentStatus: { not: "APPROVED" } } }),
    prisma.analyticsEvent.findMany({
      where: { name: "page_view", createdAt: { gte: since } },
      select: { sessionId: true },
      distinct: ["sessionId"],
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalCop: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.orderItem.groupBy({
      by: ["packName"],
      where: { order: { paymentStatus: "APPROVED" } },
      _sum: { units: true, lineTotalCop: true },
      orderBy: { _sum: { units: "desc" } },
      take: 5,
    }),
    prisma.analyticsEvent.groupBy({
      by: ["utmSource"],
      where: { name: "page_view", createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { utmSource: "desc" } },
      take: 6,
    }),
    prisma.product.findFirst({ select: { stock: true, name: true } }),
    prisma.order.findMany({
      where: { paymentStatus: "APPROVED", paidAt: { gte: since } },
      select: { paidAt: true, totalCop: true },
    }),
  ]);

  const uniqueSessions = sessions.length;
  const paidCountPeriod = paidPeriod._count._all;
  const salesPeriod = paidPeriod._sum.totalCop ?? 0;
  const conversion =
    uniqueSessions > 0 ? Math.min(100, (paidCountPeriod / uniqueSessions) * 100) : 0;
  const aov = paidAll._count._all > 0 ? (paidAll._sum.totalCop ?? 0) / paidAll._count._all : 0;

  const series: { date: string; label: string; total: number; orders: number }[] = [];
  for (let i = periodDays - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const key = date.toISOString().slice(0, 10);
    series.push({
      date: key,
      label: `${date.getDate()}/${date.getMonth() + 1}`,
      total: 0,
      orders: 0,
    });
  }
  for (const order of paidOrdersForSeries) {
    if (!order.paidAt) continue;
    const key = order.paidAt.toISOString().slice(0, 10);
    const bucket = series.find((item) => item.date === key);
    if (bucket) {
      bucket.total += order.totalCop;
      bucket.orders += 1;
    }
  }

  return {
    periodDays,
    totalSalesCop: paidAll._sum.totalCop ?? 0,
    totalPaidOrders: paidAll._count._all,
    periodSalesCop: salesPeriod,
    periodPaidOrders: paidCountPeriod,
    pendingOrders,
    conversion,
    uniqueSessions,
    aov,
    recentOrders,
    topItems,
    eventsBySource,
    stock: product?.stock ?? 0,
    productName: product?.name ?? "Producto",
    series,
  };
}
