import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const { next } = await searchParams;
  const safeNext = next?.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";

  return (
    <div className="grid min-h-screen bg-cream lg:grid-cols-[1fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-forest-night lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(102,134,106,0.35),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo variant="light" />
          <div>
            <p className="eyebrow eyebrow-light">Panel privado</p>
            <h1 className="display-lg mt-5 max-w-md text-cream">
              Controla tu tienda,
              <br />
              <span className="serif-italic text-gold">sin intermediarios.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-cream/55">
              Pedidos, pagos, inventario, reseñas y contenido de la landing en un solo lugar.
            </p>
          </div>
          <div className="relative mx-auto w-48">
            <Image
              src="/images/producto-frente.png"
              alt="LINFOVIT 60 ml"
              width={269}
              height={582}
              className="h-auto w-full opacity-90 mix-blend-screen"
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-cream/30">
            LINFOVIT · Bienestar botánico
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <Logo />
          </div>
          <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-sage lg:mt-0">
            Administración
          </p>
          <h2 className="mt-2 font-display text-3xl text-forest">Ingresa a tu panel</h2>
          <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
            Usa las credenciales del administrador creadas durante la instalación.
          </p>

          <LoginForm next={safeNext} />

          <Link
            href="/"
            className="mt-6 block text-center text-[11px] text-ink-soft underline underline-offset-2 hover:text-forest"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
