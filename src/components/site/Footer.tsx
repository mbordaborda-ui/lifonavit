import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const legalLinks = [
  { label: "Política de privacidad", slug: "privacidad" },
  { label: "Tratamiento de datos personales", slug: "tratamiento-datos" },
  { label: "Términos y condiciones", slug: "terminos" },
  { label: "Cambios y devoluciones", slug: "cambios-devoluciones" },
  { label: "Política de envíos", slug: "envios" },
  { label: "Información del fabricante", slug: "fabricante" },
  { label: "Información sanitaria", slug: "informacion-sanitaria" },
];

export function Footer({ settings }: { settings: Record<string, string> }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-forest-night text-cream">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-sage/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="container-editorial relative py-14 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_0.8fr_1fr]">
          <div>
            <Logo variant="light" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-cream/65">
              Fórmula botánica líquida de 5 ingredientes. Una rutina de bienestar, hidratación y
              autocuidado, elaborada en Colombia.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-cream/70">
              <a
                href={`mailto:${settings["site.contactEmail"]}`}
                className="flex items-center gap-2.5 transition-colors hover:text-cream"
              >
                <Mail size={15} className="text-gold" />
                {settings["site.contactEmail"]}
              </a>
              <a
                href={`tel:${settings["site.contactPhone"].replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 transition-colors hover:text-cream"
              >
                <Phone size={15} className="text-gold" />
                {settings["site.contactPhone"]}
              </a>
              <p className="flex items-center gap-2.5">
                <MapPin size={15} className="text-gold" />
                {settings["site.city"]}
              </p>
            </div>
            <p className="mt-4 text-[11px] text-cream/45">{settings["site.contactHours"]}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              La tienda
            </p>
            <ul className="mt-5 space-y-3 text-sm text-cream/70">
              <li>
                <Link href="/producto" className="transition-colors hover:text-cream">
                  LINFOVIT 60 ml
                </Link>
              </li>
              <li>
                <Link href="/#ingredientes" className="transition-colors hover:text-cream">
                  Los 5 botánicos
                </Link>
              </li>
              <li>
                <Link href="/#como-se-usa" className="transition-colors hover:text-cream">
                  Modo de uso
                </Link>
              </li>
              <li>
                <Link href="/#ofertas" className="transition-colors hover:text-cream">
                  Ofertas y packs
                </Link>
              </li>
              <li>
                <Link href="/#preguntas" className="transition-colors hover:text-cream">
                  Preguntas frecuentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              Información legal
            </p>
            <ul className="mt-5 space-y-2.5 text-[13px] text-cream/65">
              {legalLinks.map((link) => (
                <li key={link.slug}>
                  <Link
                    href={`/politicas/${link.slug}`}
                    className="transition-colors hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-cream/12 bg-cream/5 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-cream/45">
                Pago procesado por
              </p>
              <p className="mt-1 text-sm font-semibold text-cream/85">Mercado Pago Colombia</p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-cream/10 bg-cream/[0.04] p-5">
          <p className="text-[11px] leading-relaxed text-cream/55">
            <strong className="font-semibold text-cream/75">Aviso de bienestar:</strong> LINFOVIT es
            un producto botánico de bienestar y no un medicamento. No está destinado a diagnosticar,
            tratar, curar ni prevenir enfermedades. No exceda la dosis indicada (30 gotas / 1 ml, tres
            veces al día). Consulte a un profesional de la salud antes de usarlo si está embarazada,
            en período de lactancia, toma medicamentos o tiene una condición médica. La hinchazón
            puede tener distintas causas y requiere evaluación profesional cuando persiste.
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-cream/40">
            {settings["site.legalName"]} · {settings["site.nit"]} ·{" "}
            {settings["site.sanitaryRegistry"]} · {settings["site.manufacturer"]}
          </p>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-6 text-[11px] text-cream/45 md:flex-row md:items-center">
          <p>
            © {year} LINFOVIT. Todos los derechos reservados.
          </p>
          <p>
            Hecho en Colombia ·{" "}
            <Link href="/politicas/privacidad" className="hover:text-cream">
              Privacidad
            </Link>{" "}
            ·{" "}
            <Link href="/politicas/terminos" className="hover:text-cream">
              Términos
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
