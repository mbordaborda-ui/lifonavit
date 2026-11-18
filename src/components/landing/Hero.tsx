import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Info, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { BuyNowButton } from "@/components/landing/BuyNowButton";
import { Countdown } from "@/components/landing/Countdown";
import { formatCop } from "@/lib/money";
import { formatPromoEnd, normalizePromoEnd } from "@/lib/promo";
import type { PackSummary } from "@/lib/catalog";

export function Hero({
  product,
  packs,
  settings,
}: {
  product: { name: string; imageFront: string; volumeMl: number };
  packs: PackSummary[];
  settings: Record<string, string>;
}) {
  const recommended = packs.find((pack) => pack.quantity === 2) ?? packs[0];
  const unitPack = packs.find((pack) => pack.quantity === 1) ?? packs[0];
  const saving =
    recommended?.compareAtCop && recommended.compareAtCop > recommended.priceCop
      ? recommended.compareAtCop - recommended.priceCop
      : 0;
  const unitSaving =
    unitPack?.compareAtCop && unitPack.compareAtCop > unitPack.priceCop
      ? unitPack.compareAtCop - unitPack.priceCop
      : 0;
  const unitDiscount =
    unitPack?.compareAtCop && unitPack.compareAtCop > unitPack.priceCop
      ? Math.round(((unitPack.compareAtCop - unitPack.priceCop) / unitPack.compareAtCop) * 100)
      : 0;
  const promoEndsAt = normalizePromoEnd(settings["site.promoEndsAt"]);
  const promoEndLabel = formatPromoEnd(settings["site.promoEndsAt"]);

  return (
    <section className="relative overflow-hidden bg-cream pb-14 pt-8 md:pb-24 md:pt-12">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(102,134,106,0.16),transparent_66%)]" />
      <div className="pointer-events-none absolute -left-52 top-1/3 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(199,166,106,0.14),transparent_66%)]" />

      <div className="container-editorial relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 animate-in">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-forest-night shadow-soft">
                <Sparkles size={11} /> Oferta fin de año
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
                Hasta agotar unidades
              </span>
            </div>
            <p className="eyebrow mt-4 animate-in">{settings["content.hero.eyebrow"]}</p>

            <h1
              className="mt-6 max-w-xl text-balance font-display text-forest animate-in"
              style={{
                fontSize: "clamp(1.95rem, 3.85vw, 3.4rem)",
                lineHeight: 1.01,
                letterSpacing: "-0.03em",
                animationDelay: "80ms",
              }}
            >
              {settings["content.hero.title"]}
            </h1>

            <p
              className="mt-3 max-w-lg font-display text-[1.35rem] italic leading-snug text-gold-deep animate-in md:text-[1.65rem]"
              style={{ animationDelay: "130ms" }}
            >
              {settings["content.hero.accent"]}
            </p>

            <p
              className="mt-6 max-w-xl text-[0.97rem] leading-relaxed text-ink-soft animate-in md:text-[1.02rem]"
              style={{ animationDelay: "190ms" }}
            >
              {settings["content.hero.subtitle"]}
            </p>

            <p
              className="mt-3 max-w-xl text-[0.95rem] font-medium leading-relaxed text-forest animate-in"
              style={{ animationDelay: "230ms" }}
            >
              {settings["content.hero.lead"]}
            </p>

            {unitPack ? (
              <div
                className="mt-5 animate-in"
                style={{ animationDelay: "270ms" }}
              >
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span className="font-display text-[2.35rem] leading-none text-forest">
                    {formatCop(unitPack.priceCop)}
                  </span>
                  {unitPack.compareAtCop ? (
                    <span className="pb-1 text-[14px] text-ink-soft line-through">
                      {formatCop(unitPack.compareAtCop)}
                    </span>
                  ) : null}
                  {unitSaving > 0 ? (
                    <span className="mb-0.5 rounded-full bg-gold px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.04em] text-forest-night">
                      Ahorra {formatCop(unitSaving)}
                    </span>
                  ) : null}
                  {unitDiscount > 0 ? (
                    <span className="mb-0.5 rounded-full bg-forest px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.04em] text-cream">
                      -{unitDiscount}%
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-sage">
                  Precio especial de fin de año · hasta agotar unidades · envío gratis
                </p>
              </div>
            ) : null}

            {promoEndsAt && promoEndLabel ? (
              <Countdown endsAt={promoEndsAt} label={promoEndLabel} />
            ) : null}

            <div
              className="mt-6 flex flex-col gap-3 animate-in sm:flex-row sm:items-center"
              style={{ animationDelay: "310ms" }}
            >
              {unitPack ? (
                <BuyNowButton
                  pack={unitPack}
                  label={`Compra ya · ${formatCop(unitPack.priceCop)}`}
                  fullWidth={false}
                  className="btn-attention !px-6 !py-[1.05rem]"
                />
              ) : null}
              <ButtonLink href="#ofertas" variant="outline" size="lg">
                Ver todos los packs
              </ButtonLink>
            </div>

            <div
              className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-sage animate-in"
              style={{ animationDelay: "340ms" }}
            >
              <span>5 ingredientes</span>
              <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
              <span>{product.volumeMl} ml</span>
              <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
              <span>Gotero dosificador</span>
              <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
              <Link href="#ingredientes" className="link-underline text-forest">
                Ver ingredientes
              </Link>
            </div>

            <div
              className="mt-5 flex max-w-lg items-start gap-3 border-l-2 border-gold/60 pl-4 animate-in"
              style={{ animationDelay: "380ms" }}
            >
              <Info size={15} className="mt-0.5 shrink-0 text-gold-deep" aria-hidden="true" />
              <p className="text-[11.5px] leading-relaxed text-ink-soft">
                {settings["content.hero.note"]}
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px] lg:max-w-[520px]">
            <div className="pointer-events-none absolute -left-12 top-10 hidden h-40 w-40 text-sage/45 md:block">
              <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M60 160V60" />
                <path d="M60 96c-22-4-34-18-36-42 22 3 35 18 36 42Z" />
                <path d="M60 120c22-4 34-18 36-42-22 3-35 18-36 42Z" />
                <path d="M60 72c-12-8-16-20-12-34 11 6 15 19 12 34Z" />
              </svg>
            </div>

            <div className="pointer-events-none absolute -right-8 bottom-16 hidden h-28 w-28 text-gold/50 md:block">
              <svg viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M50 116V44" />
                <circle cx="50" cy="34" r="18" />
                <path d="M50 16v36M32 34h36M37 21l26 26M63 21 37 47" opacity="0.6" />
              </svg>
            </div>

            <div className="pointer-events-none absolute -inset-8 rounded-[50%] bg-[radial-gradient(circle,rgba(199,166,106,0.26),transparent_66%)] blur-2xl" />
            <div className="pointer-events-none absolute inset-x-3 top-5 bottom-3 rounded-t-[999px] rounded-b-[2.5rem] border border-gold/25" />

            <div className="relative overflow-hidden rounded-t-[999px] rounded-b-[2.2rem] border border-white bg-white shadow-[0_50px_100px_-60px_rgba(22,48,36,0.7)]">
              <div className="absolute inset-x-10 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
              <div className="relative aspect-[4/5]">
                <Image
                  src={product.imageFront}
                  alt={`${product.name} — frasco de ${product.volumeMl} ml con gotero`}
                  fill
                  priority
                  loading="eager"
                  sizes="(max-width: 768px) 86vw, 520px"
                  className="animate-[float_9s_ease-in-out_infinite] object-contain px-7 pb-8 pt-9 mix-blend-multiply motion-reduce:animate-none"
                />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-cream/25 to-transparent" />
              <div className="absolute bottom-8 left-5 z-20 hidden h-16 w-16 -rotate-12 flex-col items-center justify-center rounded-full bg-gold text-forest-night shadow-lift sm:flex">
                <span className="text-[8px] font-bold uppercase tracking-[0.1em]">Dcto</span>
                <span className="font-display text-xl leading-none">−{unitDiscount}%</span>
              </div>
            </div>

            <div className="absolute -right-2 top-8 z-20 rotate-3 rounded-full bg-gold px-3.5 py-1.5 shadow-lift md:-right-4 md:top-14">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-forest-night">
                Envío gratis
              </p>
            </div>

            {recommended ? (
              <div className="relative z-20 mx-auto mt-4 hidden w-full max-w-[320px] rounded-2xl border border-forest/10 bg-white/95 p-4 shadow-lift backdrop-blur sm:block">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-sage">
                    Pack doble · 2 frascos
                  </p>
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.06em] text-gold-deep">
                    Ahorra
                  </span>
                </div>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <p className="font-display text-[1.65rem] leading-none text-forest">
                    {formatCop(recommended.priceCop)}
                  </p>
                  {recommended.compareAtCop ? (
                    <p className="text-[10px] text-ink-soft line-through">
                      {formatCop(recommended.compareAtCop)}
                    </p>
                  ) : null}
                </div>
                <p className="mt-1 text-[9.5px] text-ink-soft">
                  {saving > 0 ? `Ahorras ${formatCop(saving)} · ` : ""}Envío gratis incluido
                </p>
                <Link
                  href="#ofertas"
                  className="mt-2.5 flex items-center justify-between rounded-full bg-forest px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-cream transition hover:bg-forest-deep"
                >
                  Elegir pack
                  <ArrowRight size={12} />
                </Link>
              </div>
            ) : null}

            <div className="absolute -left-2 top-6 md:-left-8">
              <div className="relative h-24 w-24 md:h-28 md:w-28">
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full animate-[spin_36s_linear_infinite] text-forest"
                  aria-hidden="true"
                >
                  <defs>
                    <path
                      id="badge-path"
                      d="M50,50 m-35,0 a35,35 0 1,1 70,0 a35,35 0 1,1 -70,0"
                    />
                  </defs>
                  <circle cx="50" cy="50" r="49" fill="#F8F6EF" stroke="rgba(36,76,58,.18)" />
                  <text
                    fill="currentColor"
                    fontSize="7.4"
                    fontWeight="600"
                    letterSpacing="2.3"
                    fontFamily="var(--font-manrope), sans-serif"
                  >
                    <textPath href="#badge-path">
                      5 BOTÁNICOS · UNA FÓRMULA ·
                    </textPath>
                  </text>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="26" height="30" viewBox="0 0 32 36" fill="none" aria-hidden="true">
                    <path d="M16 33V14" stroke="#244C3A" strokeWidth="1.3" />
                    <path
                      d="M16 23c-6 0-9.5-3.3-9.5-9.5C12.5 13.5 16 16.8 16 23Z"
                      fill="#244C3A"
                    />
                    <path d="M16 28c5.5 0 8.7-2.9 8.7-8.7C19.2 19.3 16 22.2 16 28Z" fill="#C7A66A" />
                  </svg>
                </div>
              </div>
            </div>




          </div>
        </div>

        <div className="mt-12 flex items-center justify-between gap-6 border-t border-forest/10 pt-5 md:mt-16">
          <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-ink-soft">
            Envío a toda Colombia · Pago seguro con Mercado Pago
          </p>
          <a
            href="#producto"
            className="group hidden items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-forest sm:flex"
          >
            Descubre la fórmula
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-forest/20 transition-transform group-hover:translate-y-1">
              <ArrowDown size={13} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
