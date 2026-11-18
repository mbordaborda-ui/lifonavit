"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { trackEvent } from "@/components/analytics/TrackPageView";
import { formatCop } from "@/lib/money";
import type { PackSummary } from "@/lib/catalog";

export function MobileBuyBar({ pack }: { pack: PackSummary }) {
  const { add, count } = useCart();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const soldOut = pack.stock <= 0;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-gold/30 bg-cream/95 px-4 py-3 backdrop-blur-md transition-transform duration-500 md:hidden safe-bottom ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate font-display text-[1.15rem] leading-none text-forest">
              {formatCop(pack.priceCop)}
            </p>
            {pack.compareAtCop ? (
              <p className="text-[10px] text-ink-soft line-through">
                {formatCop(pack.compareAtCop)}
              </p>
            ) : null}
          </div>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-gold-deep">
            Hasta agotar unidades
          </p>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => {
            add(pack.id, 1, { openDrawer: false });
            trackEvent({
              name: "AddToCart",
              packId: pack.id,
              valueCop: pack.priceCop,
              metadata: { source: "mobile_bar" },
            });
            router.push("/checkout");
          }}
          className="btn btn-primary shrink-0 !px-5 !py-3 !text-[11px]"
        >
          <ShoppingBag size={13} />
          {soldOut ? "Agotado" : "Compra ya"}
        </button>
      </div>
      {count > 0 ? (
        <p className="mt-1 text-center text-[9px] text-ink-soft">
          {count} frasco{count === 1 ? "" : "s"} en tu selección
        </p>
      ) : null}
    </div>
  );
}
