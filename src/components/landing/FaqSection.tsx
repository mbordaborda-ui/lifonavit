import { Mail, ShieldAlert } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import type { FaqItem } from "@/lib/content";

export function FaqSection({
  items,
  settings,
}: {
  items: FaqItem[];
  settings: Record<string, string>;
}) {
  return (
    <section id="preguntas" className="bg-cream py-20 md:py-28">
      <div className="container-editorial grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow">Antes de comprar</p>
            <h2 className="display-lg mt-5 text-forest">{settings["content.faq.title"]}</h2>
            <p className="mt-4 max-w-sm text-[0.94rem] leading-relaxed text-ink-soft">
              {settings["content.faq.intro"]}
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-8 space-y-3">
            <div className="rounded-2xl border border-forest/12 bg-white p-5">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest">
                <Mail size={14} className="text-sage" />
                ¿Otra duda?
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                Escríbenos a{" "}
                <a
                  href={`mailto:${settings["site.contactEmail"]}`}
                  className="font-medium text-forest underline underline-offset-2"
                >
                  {settings["site.contactEmail"]}
                </a>{" "}
                y te responderemos en horario hábil.
              </p>
            </div>

            <div className="rounded-2xl border border-gold/40 bg-gold/[0.07] p-5">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-deep">
                <ShieldAlert size={14} />
                Embarazo, lactancia y medicamentos
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">
                Consulta con tu médico antes de usar LINFOVIT si estás embarazada, en período de
                lactancia, tomas medicamentos o tienes una condición médica diagnosticada. No
                suspendas ni cambies un tratamiento por este producto.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80}>
          <Accordion items={items} />
          <p className="mt-5 text-[10.5px] leading-relaxed text-ink-soft/80">
            La información de esta sección es educativa y no sustituye la consulta con un
            profesional de la salud. La dosis indicada corresponde al etiquetado aprobado: 30 gotas
            (1 ml), tres veces al día.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
