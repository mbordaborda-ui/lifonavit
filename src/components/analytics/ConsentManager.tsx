"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";

const CONSENT_KEY = "lfv_consent_v1";
const CONSENT_EVENT = "lfv:consent-change";

export function getConsent(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_EVENT, callback);
  };
}

function getSnapshot(): string | null {
  return getConsent();
}

function getServerSnapshot(): string | null {
  return null;
}

function loadGa(gaId: string) {
  if (document.getElementById("ga4-script")) return;
  const script = document.createElement("script");
  script.id = "ga4-script";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.id = "ga4-init";
  inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{send_page_view:true});`;
  document.head.appendChild(inline);
}

function loadPixel(pixelId: string) {
  if (document.getElementById("meta-pixel-script")) return;
  const inline = document.createElement("script");
  inline.id = "meta-pixel-script";
  inline.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`;
  document.head.appendChild(inline);
}

export function ConsentManager({
  gaId,
  pixelId,
}: {
  gaId?: string;
  pixelId?: string;
}) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (consent !== "granted") return;
    if (gaId) loadGa(gaId);
    if (pixelId) loadPixel(pixelId);
    window.dispatchEvent(new Event("lfv:consent-granted"));
  }, [consent, gaId, pixelId]);

  function decide(value: "granted" | "denied") {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new Event(CONSENT_EVENT));
  }

  if (consent !== null || (!gaId && !pixelId)) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md">
      <div className="rounded-2xl border border-forest/15 bg-white/95 p-5 shadow-lift backdrop-blur">
        <p className="font-display text-lg text-forest">Tu privacidad, en tus manos</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
          Usamos cookies propias y de terceros para medir el rendimiento de nuestras campañas y
          mejorar la tienda. Puedes aceptar o continuar solo con lo necesario.{" "}
          <Link href="/politicas/privacidad" className="underline underline-offset-2">
            Política de privacidad
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => decide("granted")}
            className="btn btn-primary !px-4 !py-2.5 !text-[11px]"
          >
            Aceptar analítica
          </button>
          <button
            type="button"
            onClick={() => decide("denied")}
            className="btn btn-outline !px-4 !py-2.5 !text-[11px]"
          >
            Solo necesarias
          </button>
        </div>
      </div>
    </div>
  );
}
