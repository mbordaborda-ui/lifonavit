"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "gclid",
  "ttclid",
] as const;

export const ATTRIBUTION_KEY = "lfv_attribution";
const SESSION_KEY = "lfv_session_id";

export type Attribution = Record<string, string>;

export function getAttribution(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

type TrackPayload = {
  name: string;
  packId?: string;
  valueCop?: number;
  metadata?: Record<string, string | number>;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Envía el evento a GA4 y Meta Pixel (navegador) y a la analítica
 * propia del servidor para calcular conversión sin depender de cookies.
 * Purchase se envía con eventID para deduplicar con la Conversion API.
 */
export function trackEvent({ name, packId, valueCop, metadata }: TrackPayload) {
  if (typeof window === "undefined") return;

  // Sin consentimiento explícito no se envía analítica.
  const consent = localStorage.getItem("lfv_consent_v1");
  if (consent !== "granted") return;

  const attribution = getAttribution();
  const sessionId = getSessionId();

  const gaParams = {
    ...(packId ? { item_id: packId, item_name: "LINFOVIT 60 ml" } : {}),
    ...(valueCop ? { value: valueCop, currency: "COP" } : {}),
    ...attribution,
    ...metadata,
  };

  window.gtag?.("event", name, gaParams);

  const fbMap: Record<string, string> = {
    ViewContent: "ViewContent",
    AddToCart: "AddToCart",
    InitiateCheckout: "InitiateCheckout",
    Purchase: "Purchase",
    Lead: "Lead",
  };

  if (fbMap[name]) {
    window.fbq?.(
      "track",
      fbMap[name],
      {
        ...(valueCop ? { value: valueCop, currency: "COP" } : {}),
        content_name: "LINFOVIT Drenaje Linfático",
        content_type: "product",
        ...(packId ? { content_ids: [packId] } : {}),
      },
      metadata?.eventId ? { eventID: String(metadata.eventId) } : undefined,
    );
  }

  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      sessionId,
      path: window.location.pathname,
      packId,
      valueCop,
      attribution,
    }),
    keepalive: true,
  }).catch(() => undefined);
}

export function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const incoming: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = searchParams.get(key);
      if (value) incoming[key] = value.slice(0, 120);
    }

    if (Object.keys(incoming).length > 0) {
      try {
        const existing = getAttribution();
        // Atribución de primer toque para no perder la campaña original.
        sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify({ ...incoming, ...existing }));
      } catch {
        /* almacenamiento no disponible */
      }
    }

    trackEvent({ name: "page_view" });
  }, [pathname, searchParams]);

  useEffect(() => {
    const handler = () => trackEvent({ name: "page_view" });
    window.addEventListener("lfv:consent-granted", handler);
    return () => window.removeEventListener("lfv:consent-granted", handler);
  }, []);

  return null;
}
