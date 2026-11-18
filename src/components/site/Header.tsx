"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/components/cart/CartProvider";

const NAV = [
  { label: "El producto", href: "/#producto" },
  { label: "Ingredientes", href: "/#ingredientes" },
  { label: "Ofertas", href: "/#ofertas" },
  { label: "Cómo se usa", href: "/#como-se-usa" },
  { label: "Preguntas", href: "/#preguntas" },
];

export function Header({ announcement }: { announcement: string }) {
  const { count, setDrawerOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <div className="marquee relative z-50 overflow-hidden bg-gold py-2 text-forest-night">
        <span className="sr-only">{announcement}</span>
        <div className="marquee-track" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((copy) => (
            <span
              key={copy}
              className="flex items-center gap-5 whitespace-nowrap pr-5 text-[9.5px] font-bold uppercase tracking-[0.12em] md:text-[10.5px] md:tracking-[0.16em]"
            >
              {announcement}
              <span className="text-forest-night/45">✦</span>
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "border-b border-forest/10 bg-cream/92 shadow-[0_10px_30px_-24px_rgba(22,48,36,.6)] backdrop-blur-md"
            : "border-b border-transparent bg-cream"
        }`}
      >
        <div className="container-editorial flex h-[70px] items-center justify-between gap-4 md:h-[82px]">
          <Logo />

          <nav aria-label="Navegación principal" className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline text-[12.5px] font-medium tracking-[0.04em] text-ink/75 transition-colors hover:text-forest"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/#ofertas"
              className="btn btn-gold hidden !px-5 !py-3 md:inline-flex"
            >
              Comprar
            </Link>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 text-forest transition hover:border-forest/40 hover:bg-white"
              aria-label={`Abrir carrito${count > 0 ? `, ${count} frascos` : ""}`}
            >
              <ShoppingBag size={17} strokeWidth={1.5} />
              {count > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-forest-night">
                  {count}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 text-forest transition hover:border-forest/40 lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              <Menu size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[85] lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
          className={`absolute inset-0 bg-forest-night/50 backdrop-blur-[2px] transition-opacity duration-400 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-cream p-6 shadow-lift transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-forest/15 text-forest"
              aria-label="Cerrar menú"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <nav className="mt-10 flex flex-col gap-1" aria-label="Navegación móvil">
            {NAV.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="group flex items-center justify-between border-b border-forest/10 py-4"
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <span className="font-display text-2xl text-forest">{item.label}</span>
                <span className="text-gold transition-transform group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <Link
              href="/#ofertas"
              onClick={() => setMenuOpen(false)}
              className="btn btn-primary w-full"
            >
              Elegir mi rutina
            </Link>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-ink-soft">
              Producto de bienestar. No es un medicamento.
              <br />
              Envíos a toda Colombia.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
