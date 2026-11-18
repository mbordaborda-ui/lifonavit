import { prisma } from "@/lib/db";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  Notice,
  adminDate,
} from "@/components/admin/AdminUI";
import {
  createPromoAction,
  deletePromoAction,
  togglePromoAction,
} from "@/server/actions/admin";
import { formatCop } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const notice = await searchParams;
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminPageHeader
        title="Promociones"
        description="Códigos de descuento reales, con vigencia y límite de usos. Los descuentos se validan en el servidor al crear el pedido."
      />
      <Notice ok={notice.ok} error={notice.error} />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card title="Códigos creados">
          {promos.length === 0 ? (
            <EmptyState
              title="Sin códigos de descuento"
              text="Crea un código solo cuando exista una promoción real. No se muestran descuentos inventados en la tienda."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[12px]">
                <thead>
                  <tr className="border-b border-forest/10 text-[9px] uppercase tracking-[0.1em] text-ink-soft">
                    <th className="pb-2">Código</th>
                    <th className="pb-2">Descuento</th>
                    <th className="pb-2">Mínimo</th>
                    <th className="pb-2">Usos</th>
                    <th className="pb-2">Vigencia</th>
                    <th className="pb-2">Estado</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {promos.map((promo) => (
                    <tr key={promo.id} className="border-b border-forest/5 last:border-0">
                      <td className="py-2.5 font-mono text-[11px] font-semibold text-forest">
                        {promo.code}
                      </td>
                      <td className="py-2.5 text-ink">
                        {promo.type === "PERCENT"
                          ? `${promo.value}%`
                          : formatCop(promo.value)}
                      </td>
                      <td className="py-2.5 text-ink-soft">
                        {promo.minSubtotalCop ? formatCop(promo.minSubtotalCop) : "—"}
                      </td>
                      <td className="py-2.5 text-ink-soft">
                        {promo.uses}
                        {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                      </td>
                      <td className="py-2.5 text-[10.5px] text-ink-soft">
                        {promo.startsAt ? adminDate.format(promo.startsAt) : "—"} →{" "}
                        {promo.endsAt ? adminDate.format(promo.endsAt) : "—"}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase ${
                            promo.active
                              ? "bg-[#e7f0e6] text-forest"
                              : "bg-[#f1f1f0] text-[#62665f]"
                          }`}
                        >
                          {promo.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex justify-end gap-1.5">
                          <form action={togglePromoAction}>
                            <input type="hidden" name="id" value={promo.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-forest/15 px-2.5 py-1 text-[9px] font-semibold uppercase text-ink-soft hover:border-forest/35"
                            >
                              {promo.active ? "Pausar" : "Activar"}
                            </button>
                          </form>
                          <form action={deletePromoAction}>
                            <input type="hidden" name="id" value={promo.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-[#c47a6f]/40 px-2.5 py-1 text-[9px] font-semibold uppercase text-[#9a3a2c]"
                            >
                              Borrar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Crear código">
          <form action={createPromoAction} className="space-y-3">
            <div>
              <label className="admin-label" htmlFor="code">
                Código
              </label>
              <input
                id="code"
                name="code"
                className="admin-input uppercase tracking-[0.08em]"
                required
                minLength={3}
                maxLength={30}
                placeholder="BIENVENIDA10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label" htmlFor="type">
                  Tipo
                </label>
                <select id="type" name="type" className="admin-input" defaultValue="PERCENT">
                  <option value="PERCENT">Porcentaje (%)</option>
                  <option value="FIXED">Valor fijo (COP)</option>
                </select>
              </div>
              <div>
                <label className="admin-label" htmlFor="value">
                  Valor
                </label>
                <input
                  id="value"
                  name="value"
                  type="number"
                  min={1}
                  step={1}
                  required
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="minSubtotalCop">
                  Compra mínima (0 = sin mínimo)
                </label>
                <input
                  id="minSubtotalCop"
                  name="minSubtotalCop"
                  type="number"
                  min={0}
                  step={1000}
                  defaultValue={0}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="maxUses">
                  Usos máximos (0 = ilimitado)
                </label>
                <input
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="startsAt">
                  Inicio
                </label>
                <input id="startsAt" name="startsAt" type="date" className="admin-input" />
              </div>
              <div>
                <label className="admin-label" htmlFor="endsAt">
                  Fin
                </label>
                <input id="endsAt" name="endsAt" type="date" className="admin-input" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-[11.5px] text-ink">
              <input
                type="checkbox"
                name="active"
                defaultChecked
                className="h-4 w-4 accent-forest"
              />
              Activo al crearlo
            </label>
            <button type="submit" className="btn btn-primary w-full !py-3 !text-[10.5px]">
              Crear código
            </button>
            <p className="text-[10px] leading-relaxed text-ink-soft">
              El código se aplica sobre el subtotal, antes del envío. Los usos se incrementan solo
              cuando el pago es aprobado.
            </p>
          </form>
        </Card>
      </div>
    </>
  );
}
