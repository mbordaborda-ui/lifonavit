import Link from "next/link";
import {
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  Package,
  Percent,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { getAdminStats } from "@/lib/admin-stats";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  StatCard,
  StatusBadge,
  adminDate,
} from "@/components/admin/AdminUI";
import { formatCop } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats(30);
  const maxSeries = Math.max(...stats.series.map((item) => item.total), 1);
  const totalUnits = stats.topItems.reduce((sum, item) => sum + (item._sum.units ?? 0), 0);

  return (
    <>
      <AdminPageHeader
        title="Resumen de la tienda"
        description="Indicadores de los últimos 30 días, pedidos recientes e inventario."
        action={
          <Link
            href="/admin/estadisticas"
            className="inline-flex items-center gap-1.5 rounded-full border border-forest/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-forest transition hover:bg-white"
          >
            Ver estadísticas <ArrowUpRight size={13} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Ventas totales"
          value={formatCop(stats.totalSalesCop)}
          hint={`${stats.totalPaidOrders} pedidos pagados`}
          icon={<CircleDollarSign size={16} />}
        />
        <StatCard
          label="Ventas 30 días"
          value={formatCop(stats.periodSalesCop)}
          hint={`${stats.periodPaidOrders} pedidos`}
          icon={<TrendingUp size={16} />}
        />
        <StatCard
          label="Pedidos pagados"
          value={String(stats.totalPaidOrders)}
          hint="Histórico verificado"
          icon={<ShoppingCart size={16} />}
        />
        <StatCard
          label="Pendientes"
          value={String(stats.pendingOrders)}
          hint="Sin pago confirmado"
          icon={<Clock3 size={16} />}
          href="/admin/pedidos?estado=PENDING"
        />
        <StatCard
          label="Conversión 30 días"
          value={`${stats.conversion.toFixed(1)}%`}
          hint={`${stats.uniqueSessions} sesiones · pedidos/sesiones`}
          icon={<Percent size={16} />}
        />
        <StatCard
          label="Ticket promedio"
          value={formatCop(stats.aov)}
          hint="Sobre pedidos pagados"
          icon={<CircleDollarSign size={16} />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card
          title="Ventas de los últimos 30 días"
          description="Pedidos con pago aprobado."
          className="lg:col-span-2"
        >
          {stats.periodSalesCop === 0 ? (
            <EmptyState
              title="Aún no hay ventas confirmadas en el periodo"
              text="Cuando Mercado Pago confirme un pago, aparecerá aquí con su valor real. No se muestran cifras simuladas."
            />
          ) : (
            <>
              <div className="flex h-40 items-end gap-1">
                {stats.series.map((point) => (
                  <div key={point.date} className="group relative flex flex-1 flex-col items-center">
                    <div className="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded bg-forest-night px-2 py-1 text-[9px] text-cream group-hover:block">
                      {point.label} · {formatCop(point.total)}
                    </div>
                    <div
                      className="w-full rounded-t bg-sage/70 transition group-hover:bg-forest"
                      style={{
                        height: `${Math.max(2, (point.total / maxSeries) * 140)}px`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-ink-soft">
                <span>{stats.series[0]?.label}</span>
                <span>{stats.series[Math.floor(stats.series.length / 2)]?.label}</span>
                <span>{stats.series[stats.series.length - 1]?.label}</span>
              </div>
            </>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Inventario" description={stats.productName}>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-display text-4xl leading-none text-forest">{stats.stock}</p>
                <p className="mt-1 text-[11px] text-ink-soft">frascos disponibles</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  stats.stock <= 10
                    ? "bg-[#fbe9e5] text-[#9a3a2c]"
                    : stats.stock <= 30
                      ? "bg-[#fbf2df] text-[#8a6413]"
                      : "bg-[#e7f0e6] text-forest"
                }`}
              >
                {stats.stock <= 10 ? "Stock crítico" : stats.stock <= 30 ? "Stock bajo" : "Disponible"}
              </span>
            </div>
            <Link
              href="/admin/productos"
              className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest underline underline-offset-2"
            >
              <Package size={13} /> Gestionar inventario
            </Link>
          </Card>

          <Card title="Envío gratis">
            <p className="font-display text-2xl leading-tight text-forest">
              Todos los pedidos
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
              La tienda aplica envío sin costo a toda Colombia. Puedes cambiarlo en Envíos.
            </p>
            <Link
              href="/admin/envios"
              className="mt-3 inline-flex text-[11px] font-semibold text-forest underline underline-offset-2"
            >
              Configurar envíos
            </Link>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card
          title="Pedidos recientes"
          action={
            <Link
              href="/admin/pedidos"
              className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-sage hover:text-forest"
            >
              Ver todos
            </Link>
          }
        >
          {stats.recentOrders.length === 0 ? (
            <EmptyState
              title="Todavía no hay pedidos"
              text="Los pedidos creados desde el checkout aparecerán aquí, con su estado real de pago."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-forest/10 text-[9.5px] uppercase tracking-[0.1em] text-ink-soft">
                    <th className="pb-2 font-semibold">Pedido</th>
                    <th className="pb-2 font-semibold">Cliente</th>
                    <th className="pb-2 font-semibold">Fecha</th>
                    <th className="pb-2 text-right font-semibold">Total</th>
                    <th className="pb-2 text-right font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-forest/5 last:border-0">
                      <td className="py-2.5">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="font-medium text-forest underline-offset-2 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 text-ink-soft">{order.customerName}</td>
                      <td className="py-2.5 text-ink-soft">{adminDate.format(order.createdAt)}</td>
                      <td className="py-2.5 text-right font-medium text-forest">
                        {formatCop(order.totalCop)}
                      </td>
                      <td className="py-2.5 text-right">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Más vendidos" description={`${totalUnits} frascos en pedidos pagados`}>
            {stats.topItems.length === 0 ? (
              <p className="text-[12px] text-ink-soft">Aún no hay unidades vendidas.</p>
            ) : (
              <ul className="space-y-2.5">
                {stats.topItems.map((item) => (
                  <li key={item.packName} className="flex items-center justify-between text-[12px]">
                    <span className="text-ink">{item.packName}</span>
                    <span className="text-ink-soft">
                      {item._sum.units ?? 0} u. · {formatCop(item._sum.lineTotalCop ?? 0)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Origen del tráfico" description="Sesiones con page_view (30 días)">
            {stats.eventsBySource.length === 0 ? (
              <p className="text-[12px] text-ink-soft">Sin datos de campañas todavía.</p>
            ) : (
              <ul className="space-y-2">
                {stats.eventsBySource.map((source) => (
                  <li key={source.utmSource ?? "directo"} className="flex justify-between text-[12px]">
                    <span className="capitalize text-ink">{source.utmSource ?? "Directo"}</span>
                    <span className="text-ink-soft">{source._count._all}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
