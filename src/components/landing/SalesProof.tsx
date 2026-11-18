import { Boxes, TrendingUp, Truck } from "lucide-react";

const numberFormatter = new Intl.NumberFormat("es-CO");

export function SalesProof({
  salesCount,
  period,
  source,
  stock,
}: {
  salesCount: number;
  period: string;
  source: string;
  stock: number;
}) {
  if (salesCount <= 0) return null;

  return (
    <section
      aria-label="Ventas verificadas"
      className="border-b border-forest/10 bg-white"
    >
      <div className="container-editorial flex flex-col items-start justify-between gap-3 py-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-deep">
            <TrendingUp size={18} strokeWidth={1.6} />
          </span>
          <p className="text-[12px] leading-relaxed text-ink-soft">
            <span className="font-display text-[1.85rem] leading-none text-forest">
              {numberFormatter.format(salesCount)}
            </span>{" "}
            <span className="font-semibold text-forest">ventas</span>{" "}
            {period}
            {source ? (
              <span className="ml-2 inline-flex rounded-full bg-gold/25 px-2 py-0.5 align-middle text-[9px] font-bold uppercase tracking-[0.06em] text-gold-deep">
                Fuente: {source}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] font-medium text-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Boxes size={13} className="text-sage" />
            {stock > 0 ? `${stock} frascos disponibles` : "Inventario agotado"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Truck size={13} className="text-sage" />
            Envío gratis
          </span>
        </div>
      </div>
    </section>
  );
}
