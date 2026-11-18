import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/db";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  StatusBadge,
  adminDateTime,
} from "@/components/admin/AdminUI";
import { formatCop } from "@/lib/money";
import { ORDER_STATUS_LABEL } from "@/lib/orders";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const FILTERS = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendientes" },
  { value: "PAID", label: "Pagados" },
  { value: "SHIPPED", label: "Enviados" },
  { value: "DELIVERED", label: "Entregados" },
  { value: "FAILED", label: "Fallidos" },
  { value: "REFUNDED", label: "Reembolsados" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string; page?: string }>;
}) {
  const { estado, q, page } = await searchParams;
  const currentStatus = estado && estado !== "ALL" ? estado : undefined;
  const search = (q ?? "").trim().slice(0, 80);
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  const where = {
    ...(currentStatus ? { status: currentStatus } : {}),
    ...(search
      ? {
          OR: [
            { orderNumber: { contains: search } },
            { customerName: { contains: search } },
            { customerEmail: { contains: search } },
            { customerPhone: { contains: search } },
          ],
        }
      : {}),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { items: { select: { units: true } } },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hrefFor = (overrides: { estado?: string; page?: number }) => {
    const params = new URLSearchParams();
    const status = overrides.estado ?? (currentStatus ?? "ALL");
    if (status !== "ALL") params.set("estado", status);
    if (search) params.set("q", search);
    if (overrides.page && overrides.page > 1) params.set("page", String(overrides.page));
    const query = params.toString();
    return `/admin/pedidos${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <AdminPageHeader
        title="Pedidos"
        description="Consulta pedidos, estados de pago y datos de entrega. Los pagos se confirman únicamente contra Mercado Pago."
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((filter) => {
              const active =
                filter.value === "ALL" ? !currentStatus : currentStatus === filter.value;
              return (
                <Link
                  key={filter.value}
                  href={hrefFor({ estado: filter.value, page: 1 })}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                    active
                      ? "bg-forest text-cream"
                      : "border border-forest/15 text-ink-soft hover:border-forest/35 hover:text-forest"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>

          <form action="/admin/pedidos" className="flex items-center gap-2">
            {currentStatus ? <input type="hidden" name="estado" value={currentStatus} /> : null}
            <label className="sr-only" htmlFor="q">
              Buscar pedido
            </label>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/60"
              />
              <input
                id="q"
                name="q"
                defaultValue={search}
                placeholder="Pedido, cliente, correo o celular"
                className="admin-input !w-64 !pl-8"
              />
            </div>
            <button type="submit" className="btn btn-outline !px-4 !py-2 !text-[10px]">
              Buscar
            </button>
          </form>
        </div>

        <div className="mt-4">
          {orders.length === 0 ? (
            <EmptyState
              title="No hay pedidos con estos filtros"
              text="Cuando un cliente complete el checkout, el pedido aparecerá aquí. Los pagos pendientes no se marcan como pagados."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-forest/10 text-[9.5px] uppercase tracking-[0.1em] text-ink-soft">
                    <th className="pb-2.5 font-semibold">Pedido</th>
                    <th className="pb-2.5 font-semibold">Fecha</th>
                    <th className="pb-2.5 font-semibold">Cliente</th>
                    <th className="pb-2.5 font-semibold">Destino</th>
                    <th className="pb-2.5 font-semibold">Frascos</th>
                    <th className="pb-2.5 text-right font-semibold">Total</th>
                    <th className="pb-2.5 font-semibold">Pago</th>
                    <th className="pb-2.5 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-forest/5 last:border-0 hover:bg-cream/40">
                      <td className="py-3">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="font-semibold text-forest underline-offset-2 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-ink-soft">{adminDateTime.format(order.createdAt)}</td>
                      <td className="py-3">
                        <p className="text-ink">{order.customerName}</p>
                        <p className="text-[10.5px] text-ink-soft">{order.customerEmail}</p>
                      </td>
                      <td className="py-3 text-ink-soft">
                        {order.city}
                        <br />
                        <span className="text-[10.5px]">{order.department}</span>
                      </td>
                      <td className="py-3 text-ink-soft">
                        {order.items.reduce((sum, item) => sum + item.units, 0)}
                      </td>
                      <td className="py-3 text-right font-medium text-forest">
                        {formatCop(order.totalCop)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-forest/10 pt-3 text-[11px] text-ink-soft">
          <span>
            {total} pedido{total === 1 ? "" : "s"} · página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 ? (
              <Link
                href={hrefFor({ page: currentPage - 1 })}
                className="rounded-full border border-forest/15 px-3 py-1.5 hover:border-forest/40"
              >
                Anterior
              </Link>
            ) : null}
            {currentPage < totalPages ? (
              <Link
                href={hrefFor({ page: currentPage + 1 })}
                className="rounded-full border border-forest/15 px-3 py-1.5 hover:border-forest/40"
              >
                Siguiente
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      <p className="mt-3 text-[10.5px] leading-relaxed text-ink-soft">
        Estados disponibles:{" "}
        {Object.values(ORDER_STATUS_LABEL).join(" · ")}.
      </p>
    </>
  );
}
