import Link from "next/link";
import { prisma } from "@/lib/db";
import { getAdminStats } from "@/lib/admin-stats";
import { AdminPageHeader, Card, EmptyState, StatCard } from "@/components/admin/AdminUI";
import { formatCop } from "@/lib/money";

export const dynamic = "force-dynamic";

const RANGES = [
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
];

export default async function AdminStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias } = await searchParams;
  const days = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const stats = await getAdminStats(days);
  const maxSeries = Math.max(...stats.series.map((item) => item.total), 1);

  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const totalOrders = statusCounts.reduce((sum, item) => sum + item._count._all, 0);
  const paidCount = statusCounts.find((item) => item.status === "PAID")?._count._all ?? 0;

  return (
    <>
      <AdminPageHeader
        title="Estadísticas"
        description="Datos reales de pedidos y sesiones. La conversión se calcula como pedidos pagados sobre sesiones únicas con page_view."
        action={
          <div className="flex gap-1.5">
            {RANGES.map((range) => (
              <Link
                key={range.days}
                href={`/admin/estadisticas?dias=${range.days}`}
                className={`rounded-full px-3 py-1.5 text-[11px] font-medium ${
                  days === range.days
                    ? "bg-forest text-cream"
                    : "border border-forest/15 text-ink-soft hover:border-forest/35"
                }`}
              >
                {range.label}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={`Ventas ${days} días`} value={formatCop(stats.periodSalesCop)} />
        <StatCard label="Pedidos pagados" value={String(stats.periodPaidOrders)} />
        <StatCard
          label="Conversión"
          value={`${stats.conversion.toFixed(1)}%`}
          hint={`${stats.uniqueSessions} sesiones únicas`}
        />
        <StatCard label="Ticket promedio" value={formatCop(stats.aov)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Card title={`Ventas por día · ${days} días`}>
          {stats.periodSalesCop === 0 ? (
            <EmptyState
              title="Sin ventas confirmadas"
              text="Los datos se llenan automáticamente cuando Mercado Pago aprueba un pago. No se generan cifras de ejemplo."
            />
          ) : (
            <>
              <div className="flex h-48 items-end gap-1">
                {stats.series.map((point) => (
                  <div key={point.date} className="group relative flex flex-1 flex-col items-center">
                    <div className="pointer-events-none absolute -top-7 z-10 hidden whitespace-nowrap rounded bg-forest-night px-2 py-1 text-[9px] text-cream group-hover:block">
                      {point.label} · {formatCop(point.total)} · {point.orders} pedido(s)
                    </div>
                    <div
                      className="w-full rounded-t bg-forest/70 transition group-hover:bg-forest"
                      style={{ height: `${Math.max(2, (point.total / maxSeries) * 170)}px` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-ink-soft">
                <span>{stats.series[0]?.label}</span>
                <span>{stats.series[stats.series.length - 1]?.label}</span>
              </div>
            </>
          )}
        </Card>

        <Card title="Pedidos por estado">
          {totalOrders === 0 ? (
            <p className="text-[12px] text-ink-soft">Sin pedidos registrados.</p>
          ) : (
            <ul className="space-y-2 text-[12px]">
              {statusCounts
                .sort((a, b) => b._count._all - a._count._all)
                .map((item) => (
                  <li key={item.status} className="flex items-center justify-between">
                    <span className="text-ink">{item.status}</span>
                    <span className="text-ink-soft">
                      {item._count._all} ·{" "}
                      {((item._count._all / totalOrders) * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
            </ul>
          )}
          <div className="mt-4 border-t border-forest/10 pt-3 text-[10.5px] leading-relaxed text-ink-soft">
            Pedidos pagados sobre el total registrado:{" "}
            <strong className="text-forest">
              {totalOrders > 0 ? ((paidCount / totalOrders) * 100).toFixed(1) : "0"}%
            </strong>
            . Los pedidos abandonados no se cuentan como ventas.
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card title="Presentaciones más vendidas">
          {stats.topItems.length === 0 ? (
            <p className="text-[12px] text-ink-soft">Sin ventas pagadas todavía.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topItems.map((item) => {
                const max = Math.max(...stats.topItems.map((entry) => entry._sum.units ?? 0), 1);
                return (
                  <li key={item.packName}>
                    <div className="flex justify-between text-[12px]">
                      <span className="text-ink">{item.packName}</span>
                      <span className="text-ink-soft">
                        {item._sum.units ?? 0} u. · {formatCop(item._sum.lineTotalCop ?? 0)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist">
                      <div
                        className="h-full rounded-full bg-sage"
                        style={{ width: `${((item._sum.units ?? 0) / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Fuentes de tráfico" description={`Sesiones únicas · ${days} días`}>
          {stats.eventsBySource.length === 0 ? (
            <p className="text-[12px] text-ink-soft">
              Aún no hay eventos de tráfico. Se registran solo con consentimiento de analítica.
            </p>
          ) : (
            <ul className="space-y-2.5 text-[12px]">
              {stats.eventsBySource.map((source) => (
                <li key={source.utmSource ?? "directo"} className="flex justify-between">
                  <span className="text-ink capitalize">{source.utmSource ?? "Directo"}</span>
                  <span className="text-ink-soft">{source._count._all} sesiones</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
