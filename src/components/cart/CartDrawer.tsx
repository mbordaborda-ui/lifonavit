"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShieldCheck, Sparkles, Truck, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatCop, formatCopPerUnit } from "@/lib/money";
import { trackEvent } from "@/components/analytics/TrackPageView";

export function CartDrawer() {
  const {
    lines,
    packs,
    drawerOpen,
    setDrawerOpen,
    getPack,
    setQuantity,
    remove,
    subtotalCop,
    count,
    add,
    clear,
  } = useCart();

  const singleLine = lines.length === 1 ? lines[0] : null;
  const currentPack = singleLine ? getPack(singleLine.packId) : null;
  const upsellPack = currentPack
    ? currentPack.quantity === 1
      ? packs.find((pack) => pack.quantity === 2)
      : currentPack.quantity === 2
        ? packs.find((pack) => pack.quantity === 3)
        : undefined
    : undefined;
  const unitPack = packs.find((pack) => pack.quantity === 1);
  const upsellSaving =
    currentPack && upsellPack
      ? currentPack.quantity === 1
        ? currentPack.priceCop * 2 - upsellPack.priceCop
        : currentPack.priceCop + (unitPack?.priceCop ?? 0) - upsellPack.priceCop
      : 0;
  const showUpsell = Boolean(
    upsellPack && currentPack && singleLine?.quantity === 1 && upsellSaving > 0,
  );

  const switchToUpsell = () => {
    if (!upsellPack) return;
    clear();
    add(upsellPack.id, 1, { openDrawer: false });
    trackEvent({
      name: "AddToCart",
      packId: upsellPack.id,
      valueCop: upsellPack.priceCop,
      metadata: { source: "cart_upsell", units: upsellPack.quantity },
    });
  };

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [drawerOpen, setDrawerOpen]);

  return (
    <div
      className={`fixed inset-0 z-[80] ${drawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
    >
      <button
        type="button"
        aria-label="Cerrar carrito"
        tabIndex={drawerOpen ? 0 : -1}
        onClick={() => setDrawerOpen(false)}
        className={`absolute inset-0 bg-forest-night/45 backdrop-blur-[2px] transition-opacity duration-500 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Tu selección"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-lift transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-forest/12 px-5 py-4">
          <div>
            <p className="eyebrow !text-[0.6rem]">Tu selección</p>
            <p className="mt-1 font-display text-xl text-forest">
              {count > 0 ? `${count} frasco${count === 1 ? "" : "s"}` : "Carrito vacío"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 text-forest transition hover:bg-forest hover:text-cream"
            aria-label="Cerrar"
          >
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mist text-sage">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 0 1 6 0"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <p className="mt-5 font-display text-xl text-forest">Aún no has elegido tu rutina</p>
              <p className="mt-2 max-w-[16rem] text-sm text-ink-soft">
                Selecciona un pack para comenzar. Puedes cambiarlo antes de pagar.
              </p>
              <Link
                href="/#ofertas"
                onClick={() => setDrawerOpen(false)}
                className="btn btn-primary mt-6"
              >
                Ver packs
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => {
                const pack = getPack(line.packId);
                if (!pack) return null;
                return (
                  <li key={line.packId} className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-forest/5 bg-white">
                      <Image
                        src={pack.image}
                        alt={pack.name}
                        fill
                        sizes="80px"
                        className="object-contain p-1 mix-blend-multiply"
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display text-[1.02rem] leading-tight text-forest">
                            {pack.name}
                          </p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft">
                            {pack.quantity} frasco{pack.quantity === 1 ? "" : "s"} · 60 ml
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.packId)}
                          className="text-[11px] text-ink-soft underline underline-offset-2 hover:text-forest"
                        >
                          Quitar
                        </button>
                      </div>
                      <div className="mt-auto flex items-end justify-between pt-2">
                        <div className="flex items-center gap-1 rounded-full border border-forest/15 p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (line.quantity === 1) {
                                remove(line.packId);
                              } else {
                                setQuantity(line.packId, line.quantity - 1);
                              }
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-forest hover:bg-mist"
                            aria-label={`Quitar uno de ${pack.name}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(line.packId, line.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-forest hover:bg-mist"
                            aria-label={`Agregar uno de ${pack.name}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-forest">
                            {formatCop(pack.priceCop * line.quantity)}
                          </p>
                          {pack.quantity > 1 ? (
                            <p className="text-[10px] text-ink-soft">
                              {formatCopPerUnit(pack.priceCop, pack.quantity)} / frasco
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {showUpsell && upsellPack ? (
            <div className="mt-4 rounded-2xl border border-gold/50 bg-gold/[0.09] p-4">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-gold-deep">
                <Sparkles size={12} /> Mejora y ahorra
              </p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div>
                  <p className="font-display text-[1.08rem] leading-tight text-forest">
                    {upsellPack.name}
                  </p>
                  <p className="text-[10px] text-ink-soft">
                    {upsellPack.quantity} frascos · envío gratis
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-[1.15rem] leading-none text-forest">
                    {formatCop(upsellPack.priceCop)}
                  </p>
                  {upsellPack.compareAtCop ? (
                    <p className="mt-0.5 text-[9px] text-ink-soft/70 line-through">
                      {formatCop(upsellPack.compareAtCop)}
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mt-1.5 text-[10px] font-semibold text-sage">
                Ahorras {formatCop(upsellSaving)} frente a tu selección actual.
              </p>
              <button
                type="button"
                onClick={switchToUpsell}
                className="mt-2.5 w-full rounded-full bg-forest px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-cream transition hover:bg-forest-deep"
              >
                Cambiar al {upsellPack.name.toLowerCase()}
              </button>
            </div>
          ) : null}
        </div>

        {lines.length > 0 ? (
          <footer className="border-t border-forest/12 bg-white/60 px-5 pb-5 pt-4 safe-bottom">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">Subtotal</span>
              <span className="font-display text-2xl text-forest">{formatCop(subtotalCop)}</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-soft">
              Envío gratis a toda Colombia · Pago seguro con Mercado Pago.
            </p>
            <Link
              href="/checkout"
              onClick={() => {
                setDrawerOpen(false);
                trackEvent({
                  name: "InitiateCheckout",
                  valueCop: subtotalCop,
                  metadata: { source: "cart_drawer" },
                });
              }}
              className="btn btn-primary mt-4 w-full"
            >
              Ir al checkout
              <span className="btn-arrow" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2.5 6h7M6.5 3l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
            <div className="mt-3 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.1em] text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-sage" /> Pago seguro
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck size={13} className="text-sage" /> Envío nacional
              </span>
            </div>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
