import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <div className="container-editorial py-6">
        <Logo />
      </div>
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="max-w-md text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-white text-sage">
            <Leaf size={26} strokeWidth={1.3} />
          </span>
          <p className="eyebrow mt-6 justify-center">Error 404</p>
          <h1 className="display-md mt-4 text-forest">Esta página no existe</h1>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
            Puede que el enlace haya cambiado o que el contenido ya no esté disponible. Tu rutina
            sigue a un clic de distancia.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <Link href="/" className="btn btn-primary">
              <ArrowLeft size={14} /> Volver a la tienda
            </Link>
            <Link href="/producto" className="btn btn-outline">
              Ver el producto
            </Link>
          </div>
        </div>
      </main>
      <p className="pb-8 text-center text-[10px] text-ink-soft">
        LINFOVIT · Producto botánico de bienestar
      </p>
    </div>
  );
}
