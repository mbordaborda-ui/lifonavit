"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { trackEvent } from "@/components/analytics/TrackPageView";

export function OrderEffects({
  orderNumber,
  totalCop,
  paid,
  packIds,
}: {
  orderNumber: string;
  totalCop: number;
  paid: boolean;
  packIds: string[];
}) {
  const { clear } = useCart();

  useEffect(() => {
    if (!paid) return;
    clear();
    const key = `lfv_purchase_${orderNumber}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
    } catch {
      /* noop */
    }
    trackEvent({
      name: "Purchase",
      valueCop: totalCop,
      metadata: { eventId: orderNumber, transaction_id: orderNumber, packIds: packIds.join(",") },
    });
  }, [paid, orderNumber, totalCop, packIds, clear]);

  return null;
}

export function RefreshOrderButton({ token }: { token: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await fetch(`/api/orders/${token}/sync`, { method: "POST" });
        } catch {
          /* se refresca igual */
        }
        router.refresh();
      }}
      className="btn btn-outline !px-5 !py-3 !text-[11px]"
    >
      <RefreshCw size={13} /> Actualizar estado
    </button>
  );
}

export function CheckingPayment() {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-ink-soft">
      <Loader2 size={13} className="animate-spin text-sage" /> Consultando el estado del pago…
    </span>
  );
}
