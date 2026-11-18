import { getDepartmentRates } from "@/lib/shipping";
import { getSettings } from "@/lib/content";
import { AdminPageHeader, Card, Notice } from "@/components/admin/AdminUI";
import { updateShippingAction } from "@/server/actions/admin";
import { formatCop } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const notice = await searchParams;
  const [rates, settings] = await Promise.all([getDepartmentRates(), getSettings()]);

  return (
    <>
      <AdminPageHeader
        title="Envíos"
        description="Tarifas por departamento, tiempos estimados y umbral de envío sin costo. Se aplican en el checkout y se recalculan en el servidor."
      />
      <Notice ok={notice.ok} error={notice.error} />

      <form action={updateShippingAction}>
        <Card title="Reglas generales">
          <div className="grid gap-3 md:grid-cols-[0.5fr_1.5fr]">
            <div>
              <label className="admin-label" htmlFor="freeShippingOverCop">
                Envío sin costo desde (COP)
              </label>
              <input
                id="freeShippingOverCop"
                name="freeShippingOverCop"
                type="number"
                min={0}
                step={1000}
                defaultValue={settings["site.freeShippingOverCop"]}
                className="admin-input"
              />
              <p className="mt-1 text-[10px] text-ink-soft">
                Usa 0 para desactivar el envío gratuito; usa 1 para envío gratis en todos los
                pedidos. Actualmente:{" "}
                {Number(settings["site.freeShippingOverCop"] || 0) === 1
                  ? "envío gratis para todos los pedidos"
                  : formatCop(Number(settings["site.freeShippingOverCop"] || 0))}
                .
              </p>
            </div>
            <div>
              <label className="admin-label" htmlFor="shippingNote">
                Nota de despacho visible en la tienda
              </label>
              <textarea
                id="shippingNote"
                name="shippingNote"
                defaultValue={settings["site.shippingNote"]}
                className="admin-input min-h-[70px]"
                maxLength={500}
              />
            </div>
          </div>
        </Card>

        <Card title="Tarifas por departamento" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-forest/10 text-[9px] uppercase tracking-[0.1em] text-ink-soft">
                  <th className="pb-2 font-semibold">Departamento</th>
                  <th className="pb-2 font-semibold">Zona</th>
                  <th className="pb-2 font-semibold">Ciudades</th>
                  <th className="pb-2 font-semibold">Tarifa (COP)</th>
                  <th className="pb-2 font-semibold">Días mín.</th>
                  <th className="pb-2 font-semibold">Días máx.</th>
                </tr>
              </thead>
              <tbody>
                {rates.map((item) => (
                  <tr key={item.department} className="border-b border-forest/5 last:border-0">
                    <td className="py-2 pr-3 font-medium text-ink">{item.department}</td>
                    <td className="py-2 pr-3 text-ink-soft">{item.zone}</td>
                    <td className="py-2 pr-3 text-ink-soft">{item.cities}</td>
                    <td className="py-2 pr-3">
                      {item.rate ? (
                        <>
                          <input type="hidden" name={`rate-id-${item.rate.id}`} value={item.rate.id} />
                          <input
                            type="number"
                            min={0}
                            step={100}
                            name={`price-${item.rate.id}`}
                            defaultValue={item.rate.priceCop}
                            className="admin-input !w-28"
                            aria-label={`Tarifa ${item.department}`}
                          />
                        </>
                      ) : (
                        <span className="text-[11px] text-[#9a3a2c]">Sin tarifa</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {item.rate ? (
                        <input
                          type="number"
                          min={1}
                          max={30}
                          name={`etaMin-${item.rate.id}`}
                          defaultValue={item.rate.etaMinDays}
                          className="admin-input !w-16"
                          aria-label={`Días mínimos ${item.department}`}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2">
                      {item.rate ? (
                        <input
                          type="number"
                          min={1}
                          max={40}
                          name={`etaMax-${item.rate.id}`}
                          defaultValue={item.rate.etaMaxDays}
                          className="admin-input !w-16"
                          aria-label={`Días máximos ${item.department}`}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] text-ink-soft">
              Las tarifas se suman al total del pedido y se validan nuevamente al crear la
              preferencia de pago.
            </p>
            <button type="submit" className="btn btn-primary !py-2.5 !text-[10px]">
              Guardar tarifas
            </button>
          </div>
        </Card>
      </form>
    </>
  );
}
