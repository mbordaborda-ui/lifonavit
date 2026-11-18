"use client";

import { useEffect } from "react";
import { trackEvent } from "@/components/analytics/TrackPageView";

export function ViewContentTracker({
  productId,
  packId,
  valueCop,
  productName,
}: {
  productId: string;
  packId: string;
  valueCop: number;
  productName: string;
}) {
  useEffect(() => {
    const key = `lfv_view_${productId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* noop */
    }
    trackEvent({
      name: "ViewContent",
      packId,
      valueCop,
      metadata: { content_name: productName, content_type: "product" },
    });
  }, [productId, packId, valueCop, productName]);

  return null;
}
