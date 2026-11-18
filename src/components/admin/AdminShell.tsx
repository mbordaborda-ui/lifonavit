"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Box,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Truck,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/server/actions/auth";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/productos", label: "Producto y packs", icon: Package },
  { href: "/admin/envios", label: "Envíos", icon: Truck },
  { href: "/admin/promociones", label: "Promociones", icon: Tags },
  { href: "/admin/contenido", label: "Contenido", icon: Box },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="space-y-0.5" aria-label="Navegación del panel">
      {NAV.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12.5px] transition ${
              active
                ? "bg-cream/10 font-semibold text-cream"
                : "text-cream/55 hover:bg-cream/5 hover:text-cream/85"
            }`}
          >
            <item.icon size={16} strokeWidth={1.6} className={active ? "text-gold" : ""} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f2f4ef]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-forest-night px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo variant="light" />
          <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-cream/30">
            Panel administrativo
          </p>
        </div>
        <div className="mt-8 flex-1 overflow-y-auto">{nav}</div>
        <div className="mt-4 border-t border-cream/10 pt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-cream/45 transition hover:text-cream"
          >
            <ExternalLink size={13} /> Ver tienda
          </Link>
          <div className="mt-2 px-3">
            <p className="truncate text-[11px] font-medium text-cream/80">{admin.name}</p>
            <p className="truncate text-[10px] text-cream/35">{admin.email}</p>
          </div>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-cream/50 transition hover:bg-cream/5 hover:text-cream"
            >
              <LogOut size={13} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-forest/10 bg-[#f2f4ef]/95 px-4 backdrop-blur lg:hidden">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-forest/15 text-forest"
              aria-label="Ver tienda"
            >
              <ExternalLink size={15} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-forest/15 text-forest"
              aria-label="Abrir menú"
            >
              <Menu size={17} />
            </button>
          </div>
        </header>

        <div
          className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}
          aria-hidden={!open}
        >
          <button
            type="button"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className={`absolute inset-0 bg-forest-night/50 transition-opacity ${
              open ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Cerrar menú"
          />
          <aside
            className={`absolute inset-y-0 left-0 flex w-72 flex-col bg-forest-night px-4 py-5 transition-transform duration-300 ${
              open ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <Logo variant="light" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/15 text-cream"
                aria-label="Cerrar menú"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">{nav}</div>
            <form action={logoutAction} className="border-t border-cream/10 pt-3">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] text-cream/60"
              >
                <LogOut size={14} /> Cerrar sesión
              </button>
            </form>
          </aside>
        </div>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
