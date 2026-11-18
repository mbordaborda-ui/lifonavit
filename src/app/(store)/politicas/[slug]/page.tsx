import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { getLegalPage } from "@/lib/legal";
import { getSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) return { title: "Política no encontrada" };
  return {
    title: page.title,
    description: page.intro,
    alternates: { canonical: `/politicas/${page.slug}` },
  };
}

export default async function LegalPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLegalPage(slug);
  if (!page) notFound();

  const settings = await getSettings();

  return (
    <div className="bg-cream py-10 md:py-16">
      <div className="container-editorial grid gap-10 lg:grid-cols-[0.28fr_0.72fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-soft hover:text-forest"
          >
            <ArrowLeft size={12} /> Volver a la tienda
          </Link>
          <p className="eyebrow mt-6">Información legal</p>
          <h1 className="mt-3 font-display text-[1.6rem] leading-tight text-forest">
            {page.title}
          </h1>
          <p className="mt-2 text-[10.5px] uppercase tracking-[0.08em] text-ink-soft">
            Última actualización: {page.updated}
          </p>

          <div className="mt-6 rounded-xl border border-forest/10 bg-white p-4">
            <p className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-forest">
              <Mail size={13} className="text-sage" /> Contacto
            </p>
            <a
              href={`mailto:${settings["site.contactEmail"]}`}
              className="mt-1.5 block break-all text-[11.5px] text-ink-soft underline underline-offset-2"
            >
              {settings["site.contactEmail"]}
            </a>
            <p className="mt-2 text-[10.5px] leading-relaxed text-ink-soft">
              {settings["site.contactHours"]}
            </p>
          </div>
        </aside>

        <article className="max-w-3xl">
          <div className="rounded-[1.4rem] border border-forest/10 bg-white p-6 shadow-soft md:p-9">
            <p className="text-[0.95rem] leading-relaxed text-ink-soft">{page.intro}</p>

            <div className="mt-8 space-y-7">
              {page.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="font-display text-[1.2rem] leading-snug text-forest">
                    {section.title}
                  </h2>
                  <div className="mt-2 space-y-2.5">
                    {section.body.map((paragraph, index) => (
                      <p
                        key={`${section.title}-${index}`}
                        className="text-[12.8px] leading-relaxed text-ink-soft"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {slug === "fabricante" || slug === "informacion-sanitaria" ? (
              <div className="mt-8 rounded-xl border border-gold/40 bg-gold/[0.07] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-deep">
                  Datos por verificar
                </p>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
                  Registro sanitario: {settings["site.sanitaryRegistry"]}. Fabricante:{" "}
                  {settings["site.manufacturer"]}. Esta información se actualizará cuando la
                  documentación esté verificada.
                </p>
              </div>
            ) : null}

            <div className="mt-8 border-t border-forest/10 pt-5 text-[11px] leading-relaxed text-ink-soft">
              <p>
                Este documento es una base operativa de la tienda y debe ser revisado por un asesor
                jurídico antes de su publicación definitiva, de acuerdo con la actividad comercial y
                la normativa aplicable.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
