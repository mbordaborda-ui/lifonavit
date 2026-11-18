import Image from "next/image";
import {
  Clock3,
  FlaskConical,
  Footprints,
  Heart,
  Leaf,
  MapPin,
  Quote,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IngredientsCarousel } from "@/components/landing/IngredientsCarousel";
import { ProductArch } from "@/components/site/ProductArch";
import { ButtonLink } from "@/components/ui/Button";
import type { BenefitItem, IngredientItem } from "@/lib/content";
import { formatCop } from "@/lib/money";

/** Aplica cursiva editorial a la segunda frase de un titular. */
export function EditorialTitle({
  text,
  light = false,
}: {
  text: string;
  light?: boolean;
}) {
  const index = text.indexOf(". ");
  if (index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index + 1)}{" "}
      <span className={`serif-italic ${light ? "text-gold" : "text-sage"}`}>
        {text.slice(index + 2)}
      </span>
    </>
  );
}

export function TrustStrip({ volumeMl }: { volumeMl: number }) {
  const items = [
    { icon: Truck, title: "Envío gratis", text: "A toda Colombia" },
    { icon: ShieldCheck, title: "Pago seguro", text: "Mercado Pago Colombia" },
    { icon: FlaskConical, title: `${volumeMl} ml`, text: "Gotero dosificador" },
    { icon: MapPin, title: "Elaborado en Colombia", text: "5 botánicos" },
  ];

  return (
    <section aria-label="Información de compra" className="border-y border-forest/10 bg-white/60">
      <div className="container-editorial grid grid-cols-2 gap-x-4 gap-y-6 py-7 md:grid-cols-4 md:py-8">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mist text-forest">
              <item.icon size={17} strokeWidth={1.4} />
            </span>
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-forest">
                {item.title}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-soft">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function IngredientMarquee() {
  const items = ["Diente de león", "Hibisco", "Hinojo", "Jengibre", "Té verde descafeinado"];
  const row = [...items, ...items, ...items, ...items];

  return (
    <div className="marquee overflow-hidden border-b border-forest/10 bg-forest py-4 text-cream">
      <div className="marquee-track items-center gap-8 whitespace-nowrap">
        {row.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-8">
            <span className="font-display text-[13px] uppercase tracking-[0.22em] text-cream/80">
              {item}
            </span>
            <span className="text-gold" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProblemSection({ settings }: { settings: Record<string, string> }) {
  const situations = [
    {
      icon: Clock3,
      title: "¿Pasas más de 8 horas sentado?",
      text: "Frente a un computador, conduciendo o trabajando sin suficientes pausas.",
    },
    {
      icon: Footprints,
      title: "¿Tu trabajo te mantiene de pie durante horas?",
      text: "Atendiendo clientes, caminando o cumpliendo jornadas exigentes.",
    },
    {
      icon: Heart,
      title: "¿Sientes que tu bienestar siempre queda en segundo lugar?",
      text: "Entre el trabajo, la familia y las responsabilidades, encontrar tiempo para ti parece imposible.",
    },
    {
      icon: Leaf,
      title: "¿Has dejado de lado tus hábitos de autocuidado?",
      text: "Sabes que necesitas prestar más atención a tu alimentación, movimiento e hidratación, pero siempre lo pospones.",
    },
  ];

  return (
    <section id="bienestar" className="grain relative overflow-hidden bg-forest py-20 text-cream md:py-28">
      <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-sage/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />

      <div className="container-editorial relative">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow eyebrow-light">Tu rutina, hoy</p>
            <h2 className="display-lg mt-5 max-w-lg text-balance text-cream">
              {settings["content.problem.title"]}
            </h2>
            <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-cream/65">
              {settings["content.problem.intro"]}
            </p>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {situations.map((item, index) => (
              <Reveal key={item.title} delay={index * 80}>
                <div className="group h-full rounded-2xl border border-cream/12 bg-cream/[0.04] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-gold/35 hover:bg-cream/[0.07]">
                  <div className="flex items-start justify-between">
                    <item.icon
                      size={24}
                      strokeWidth={1.15}
                      className="text-gold/80 transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="font-display text-[11px] tracking-[0.2em] text-cream/25">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[1.1rem] leading-snug text-cream">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-cream/55">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="mt-10">
          <p className="max-w-xl border-l-2 border-gold/50 pl-4 text-[12.5px] leading-relaxed text-cream/60">
            {settings["content.problem.closing"]}
          </p>
        </Reveal>

        <Reveal className="mt-10 border-t border-cream/12 pt-6">
          <p className="max-w-3xl text-[11px] leading-relaxed text-cream/40">
            Estas situaciones describen momentos cotidianos, no síntomas ni diagnósticos. Cualquier
            molestia persistente puede tener causas diferentes y debe evaluarse con un profesional
            de la salud.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function DesireSection({ settings }: { settings: Record<string, string> }) {
  return (
    <section className="relative overflow-hidden bg-cream py-20 md:py-28">
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(199,166,106,0.13),transparent_68%)]" />
      <div className="container-editorial relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow">Un momento para ti</p>
          <h2 className="display-lg mt-5 text-balance text-forest">
            <EditorialTitle text={settings["content.desire.title"]} />
          </h2>
          <p className="mt-6 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
            {settings["content.desire.intro"]}
          </p>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">
            {settings["content.desire.body"]}
          </p>
          <ButtonLink href="#ingredientes" variant="outline" size="lg" className="mt-7">
            Descubre LINFOVIT
          </ButtonLink>
        </Reveal>

        <Reveal delay={120}>
          <div className="grain relative overflow-hidden rounded-[2rem] bg-forest p-8 text-cream shadow-lift md:p-11">
            <div className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 text-cream/[0.06]">
              <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M60 160V60" />
                <path d="M60 96c-22-4-34-18-36-42 22 3 35 18 36 42Z" />
                <path d="M60 120c22-4 34-18 36-42-22 3-35 18-36 42Z" />
                <path d="M60 72c-12-8-16-20-12-34 11 6 15 19 12 34Z" />
              </svg>
            </div>
            <Quote size={34} strokeWidth={1.1} className="text-gold/70" />
            <p className="relative mt-6 font-display text-[1.5rem] leading-snug text-cream md:text-[1.8rem]">
              “{settings["content.manifesto.quote"]}”
            </p>
            <div className="mt-8 h-px w-14 bg-gold/60" />
            <p className="mt-4 text-[9.5px] font-semibold uppercase tracking-[0.2em] text-cream/40">
              Nuestra idea de bienestar
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function QuoteBand({ text }: { text: string }) {
  return (
    <section className="border-y border-forest/10 bg-cream-deep/55 py-10 md:py-14">
      <div className="container-editorial text-center">
        <p className="mx-auto max-w-3xl text-balance font-display text-[1.35rem] italic leading-snug text-forest md:text-[1.85rem]">
          “{text}”
        </p>
      </div>
    </section>
  );
}

export function IngredientsSection({
  settings,
  ingredients,
  product,
  lowestPrice,
}: {
  settings: Record<string, string>;
  ingredients: IngredientItem[];
  product: { name: string; imageFront: string; volumeMl: number };
  lowestPrice: number;
}) {
  return (
    <section id="ingredientes" className="relative overflow-hidden bg-cream py-20 md:py-28">
      <div className="pointer-events-none absolute left-1/2 top-24 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(102,134,106,0.1),transparent_70%)]" />
      <div className="container-editorial relative">
        <Reveal>
          <SectionHeading
            eyebrow="La fórmula"
            title={<EditorialTitle text={settings["content.ingredients.title"]} />}
            intro={settings["content.ingredients.intro"]}
            align="center"
          />
        </Reveal>

        <Reveal delay={100} className="relative mx-auto mt-10 w-56 md:mt-12 md:w-64">
          <div className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(circle,rgba(199,166,106,0.22),transparent_68%)] blur-2xl" />
          <div className="relative">
            <ProductArch
              src={product.imageFront}
              alt={product.name}
              sizes="260px"
              className="[&>div:last-child]:rounded-t-[999px]"
              imageClassName="!px-4 !pb-5 !pt-6"
            />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
            <span className="h-1 w-1 rounded-full bg-gold" />
            {product.volumeMl} ml · gotas orales
            <span className="h-1 w-1 rounded-full bg-gold" />
          </div>
          <p className="mt-2 text-center text-[11.5px] text-ink-soft">
            <span className="font-semibold text-forest">Desde {formatCop(lowestPrice)}</span> · Envío
            gratis
          </p>
        </Reveal>

        <IngredientsCarousel ingredients={ingredients} />

        <Reveal className="mt-9 flex flex-col items-center gap-5">
          <ButtonLink href="#ofertas" size="lg" arrow>
            Quiero conocer la fórmula
          </ButtonLink>
          <p className="mx-auto max-w-2xl text-center text-[11px] leading-relaxed text-ink-soft/80">
            Descripciones basadas en la tradición de uso de cada ingrediente. LINFOVIT no declara
            resultados clínicos sobre la fórmula completa.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function BenefitsSection({
  settings,
  benefits,
}: {
  settings: Record<string, string>;
  benefits: BenefitItem[];
}) {
  return (
    <section id="producto" className="border-y border-forest/10 bg-cream-deep/60 py-20 md:py-28">
      <div className="container-editorial">
        <Reveal>
          <SectionHeading
            eyebrow="Por qué LINFOVIT"
            title={settings["content.benefits.title"]}
            align="center"
          />
        </Reveal>

        <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 90}>
              <div className="group relative h-full border-t border-forest/20 pt-6">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[2.6rem] leading-none text-forest/18 transition-colors duration-500 group-hover:text-gold/50">
                    0{index + 1}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-forest/15 text-forest">
                    <Leaf size={14} strokeWidth={1.4} />
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[1.25rem] leading-tight text-forest">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">{benefit.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 rounded-2xl border border-forest/10 bg-white/60 px-5 py-4">
          <p className="text-center text-[11px] leading-relaxed text-ink-soft">
            LINFOVIT es un complemento de bienestar. No es un tratamiento para la obesidad, la
            celulitis, la retención de líquidos ni ninguna enfermedad, y no sustituye una
            alimentación equilibrada ni la actividad física.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function HowToUse({
  product,
  lowestPrice,
}: {
  product: { name: string; imageAngle: string | null; imageFront: string };
  lowestPrice: number;
}) {
  const steps = [
    { title: "Agita el frasco", text: "Antes de cada toma, agita suavemente para integrar la fórmula." },
    { title: "Dosifica 30 gotas", text: "Mide 1 ml con el gotero. Esa es la dosis indicada en el etiquetado." },
    { title: "Toma tres veces al día", text: "Incorpóralo a tu rutina de la mañana, la tarde y la noche." },
  ];

  return (
    <section id="como-se-usa" className="bg-cream py-20 md:py-28">
      <div className="container-editorial">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="mx-auto w-full max-w-sm lg:mx-0">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-mist/70" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white shadow-soft">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={product.imageAngle ?? product.imageFront}
                    alt={`${product.name} — frasco inclinado`}
                    fill
                    sizes="(max-width: 768px) 80vw, 380px"
                    className="object-contain p-6"
                  />
                </div>
              </div>
              <div className="absolute -bottom-5 -right-3 rounded-2xl border border-forest/10 bg-forest px-5 py-3 text-cream shadow-lift">
                <p className="font-display text-2xl leading-none">30 gotas</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-cream/60">
                  1 ml · tres veces al día
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="eyebrow">La rutina</p>
              <h2 className="display-lg mt-5 max-w-xl text-balance text-forest">
                Tres gestos. <span className="serif-italic text-sage">Un momento para ti.</span>
              </h2>
            </Reveal>

            <div className="mt-8 space-y-5">
              {steps.map((step, index) => (
                <Reveal key={step.title} delay={index * 100}>
                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-forest/20 font-display text-sm text-forest">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-[1.15rem] text-forest">{step.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{step.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="mt-8 rounded-2xl border border-forest/12 bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">
                  Uso responsable
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">
                  No exceda la dosis indicada. Consulte a un profesional de la salud antes de usarlo
                  si toma medicamentos, tiene una condición médica, está embarazada o en período de
                  lactancia. Manténgase fuera del alcance de los niños.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160} className="mt-5">
              <ButtonLink href="#ofertas" size="lg" arrow className="w-full sm:w-auto">
                Empieza tu rutina · desde {formatCop(lowestPrice)}
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta({
  settings,
  lowestPrice,
}: {
  settings: Record<string, string>;
  lowestPrice: number;
}) {
  return (
    <section className="grain relative overflow-hidden bg-forest-deep py-16 text-cream md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(199,166,106,0.18),transparent_45%)]" />
      <div className="container-editorial relative grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <Reveal>
          <p className="eyebrow eyebrow-light">Empieza hoy</p>
          <h2 className="display-lg mt-5 max-w-xl text-balance text-cream">
            <EditorialTitle text={settings["content.final.title"]} light />
          </h2>
          <p className="mt-5 max-w-lg text-[0.94rem] leading-relaxed text-cream/60">
            {settings["content.final.intro"]}
          </p>
        </Reveal>
        <Reveal delay={120} className="flex flex-col items-start gap-3 md:items-end">
          <ButtonLink href="#ofertas" variant="gold" size="lg" arrow>
            Conoce LINFOVIT
          </ButtonLink>
          <p className="text-[10.5px] uppercase tracking-[0.14em] text-cream/40">
            Desde {formatCop(lowestPrice)} · Envío gratis · Pago seguro
          </p>
        </Reveal>
      </div>
    </section>
  );
}
