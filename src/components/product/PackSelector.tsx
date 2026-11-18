"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { trackEvent } from "@/components/analytics/TrackPageView";
import { formatCop, formatCopPerUnit, percentOff } from "@/lib/money";
import type { PackSummary } from "@/lib/catalog";

export function PackSelector({ packs }: { packs: PackSummary[] }) {
  const initial = packs.find((pack) => pack.quantity === 1) ?? packs[0];
  const [selectedId, setSelectedId] = useState(initial?.id ?? "");
  const [dismissed, setDismissed] = useState(false);
  const { add } = useCart();
  const router = useRouter();

  const selected = packs.find((pack) => pack.id === selectedId) ?? packs[0];
  if (!selected) return null;

  const saving = selected.compareAtCop ? selected.compareAtCop - selected.priceCop : 0;
  const discount = percentOff(selected.priceCop, selected.compareAtCop);

  const register = () =>
    trackEvent({
      name: "AddToCart",
      packId: selected.id,
      valueCop: selected.priceCop,
      metadata: { pack: selected.slug, units: selected.quantity, source: "product_page" },
    });

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Elige tu presentación
        </p>
        <span className="text-[10px] text-sage">{selected.stock} frascos disponibles</span>
      </div>

      <div className="mt-2.5 space-y-2" role="radiogroup" aria-label="Presentaciones disponibles">
        {packs.map((pack) => {
          const active = pack.id === selected.id;
          const packSaving = pack.compareAtCop ? pack.compareAtCop - pack.priceCop : 0;
          return (
            <button
              key={pack.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setSelectedId(pack.id);
                setDismissed(false);
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition ${
                active
                  ? "border-forest bg-forest/[0.04] shadow-[inset_0_0_0_1px_rgba(36,76,58,0.15)]"
                  : "border-forest/15 bg-white hover:border-forest/35"
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    active ? "border-forest bg-forest text-cream" : "border-forest/30"
                  }`}
                >
                  {active ? <Check size={9} /> : null}
                </span>
                <span>
                  <span className="block text-[13px] font-medium text-forest">{pack.name}</span>
                  <span className="block text-[10.5px] text-ink-soft">
                    {pack.quantity} frasco{pack.quantity === 1 ? "" : "s"} ·{" "}
                    {formatCopPerUnit(pack.priceCop, pack.quantity)} / frasco
                  </span>
                </span>
              </span>
              <span className="text-right">
                {pack.compareAtCop ? (
                  <span className="block text-[9.5px] text-ink-soft/70 line-through">
                    {formatCop(pack.compareAtCop)}
                  </span>
                ) : null}
                <span className="block font-display text-[1.05rem] text-forest">
                  {formatCop(pack.priceCop)}
                </span>
                {packSaving > 0 ? (
                  <span className="block text-[9.5px] font-semibold text-sage">
                    Ahorras {formatCop(packSaving)}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {saving > 0 && !dismissed ? (
        <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-sage">
          <Check size={12} />{" "}
          {selected.quantity === 1
            ? `Ahorras ${formatCop(saving)} frente al precio normal${discount ? ` (${discount}%)` : ""}.`
            : `Ahorro real frente a comprar los frascos por unidad${
                discount ? ` (${discount}%)` : ""
              }.`}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={selected.stock <= 0}
          onClick={() => {
            add(selected.id, 1, { openDrawer: false });
            register();
            router.push("/checkout");
          }}
          className="btn btn-primary w-full !py-[1.05rem]"
        >
          Comprar ahora · {formatCop(selected.priceCop)}
        </button>
        <button
          type="button"
          disabled={selected.stock <= 0}
          onClick={() => {
            add(selected.id, 1, { openDrawer: true });
            register();
            setDismissed(true);
          }}
          className="btn btn-outline w-full !py-[0.9rem] !text-[11px]"
        >
          <ShoppingBag size={14} /> Añadir al carrito
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-ink-soft">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-sage" /> Pago con Mercado Pago
        </span>
        <span className="flex items-center gap-1.5">
          <Truck size={12} className="text-sage" /> Envío a toda Colombia
        </span>
      </div>

      {selected.stock <= 0 ? (
        <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#fdf1ee] px-3 py-2 text-[11px] text-[#8f3a2e]">
          <Loader2 size={12} /> Sin inventario disponible. Escríbenos para avisarte.
        </p>
      ) : null}
    </div>
  );
}
