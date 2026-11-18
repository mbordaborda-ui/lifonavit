"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { trackEvent } from "@/components/analytics/TrackPageView";
import type { PackSummary } from "@/lib/catalog";

export function BuyNowButton({
  pack,
  label,
  variant = "primary",
  className = "",
  fullWidth = true,
}: {
  pack: PackSummary;
  label: string;
  variant?: "primary" | "gold" | "light";
  className?: string;
  fullWidth?: boolean;
}) {
  const { add } = useCart();
  const router = useRouter();
  const soldOut = pack.stock <= 0;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => {
        add(pack.id, 1, { openDrawer: false });
        trackEvent({
          name: "AddToCart",
          packId: pack.id,
          valueCop: pack.priceCop,
          metadata: { pack: pack.slug, units: pack.quantity },
        });
        router.push("/checkout");
      }}
      className={`btn btn-${variant} ${fullWidth ? "w-full" : "w-full sm:w-auto"} ${className}`}
    >
      {soldOut ? "Agotado por ahora" : label}
      {!soldOut ? (
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
      ) : null}
    </button>
  );
}
