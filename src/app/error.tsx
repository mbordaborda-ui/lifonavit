"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] Error no controlado:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-cream px-5 py-16">
      <div className="max-w-md text-center">
        <p className="eyebrow justify-center">Algo salió mal</p>
        <h1 className="display-md mt-4 text-forest">No pudimos cargar esta página</h1>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
          El problema es temporal. Intenta de nuevo. Si estabas pagando, tu pedido no se marca como
          pagado hasta que Mercado Pago lo confirme en el servidor.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-primary">
            <RotateCcw size={14} /> Reintentar
          </button>
          <Link href="/" className="btn btn-outline">
            Ir a la tienda
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-5 text-[10px] text-ink-soft/70">Referencia: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
