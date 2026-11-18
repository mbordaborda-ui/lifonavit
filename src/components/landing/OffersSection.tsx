import Image from "next/image";
import { Check, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BuyNowButton } from "@/components/landing/BuyNowButton";
import { formatCop, formatCopPerUnit, percentOff } from "@/lib/money";
import { formatPromoEnd } from "@/lib/promo";
import type { PackSummary } from "@/lib/catalog";

const ctaLabels: Record<number, string> = {
  1: "Comprar ahora",
  2: "Elegir pack doble",
  3: "Elegir pack triple",
};

export function OffersSection({
  packs,
  settings,
}: {
  packs: PackSummary[];
  settings: Record<string, string>;
}) {
  const maxSaving = packs.reduce(
    (max, pack) =>
      pack.compareAtCop && pack.compareAtCop > pack.priceCop
        ? Math.max(max, pack.compareAtCop - pack.priceCop)
        : max,
    0,
  );
  const unitPack = packs.find((pack) => pack.quantity === 1) ?? packs[0];
  const promoEndLabel = formatPromoEnd(settings["site.promoEndsAt"]);

  return (
    <section id="ofertas" className="relative overflow-hidden bg-cream pb-20 pt-20 md:pb-28 md:pt-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cream-deep/50 to-transparent" />
      <div className="container-editorial relative">
        <Reveal>
          <SectionHeading
            eyebrow="Tu rutina"
            title={
              <>
                Elige tu <span className="serif-italic text-sage">rutina LINFOVIT.</span>
              </>
            }
            intro={settings["content.offers.subtitle"]}
            align="center"
          />
        </Reveal>

        <Reveal
          delay={80}
          className="mt-7 flex flex-wrap items-center justify-center gap-2"
        >
          {unitPack ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-forest-night">
              <Sparkles size={12} /> Oferta fin de año: {formatCop(unitPack.priceCop)} antes{" "}
              {unitPack.compareAtCop ? formatCop(unitPack.compareAtCop) : ""}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-forest px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-cream">
            Hasta agotar unidades
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-forest">
            <Truck size={12} className="text-sage" /> Envío gratis
          </span>
          {maxSaving > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/15 bg-white px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-forest">
              <ShieldCheck size={12} className="text-sage" /> Ahorra hasta {formatCop(maxSaving)}
            </span>
          ) : null}
        </Reveal>

        <div className="mt-8 grid items-stretch gap-5 md:grid-cols-3 md:gap-4 lg:gap-6">
          {packs.map((pack, index) => {
            const highlighted = pack.quantity === 2;
            const isPromo = pack.quantity === 1;
            const saving = pack.compareAtCop ? pack.compareAtCop - pack.priceCop : 0;
            const discount = percentOff(pack.priceCop, pack.compareAtCop);
            const cta = ctaLabels[pack.quantity] ?? "Elegir este pack";

            return (
              <Reveal key={pack.id} delay={index * 100} className="h-full">
                <article
                  className={`relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border p-6 transition-all duration-500 hover:-translate-y-1.5 md:p-7 ${
                    highlighted
                      ? "border-gold/60 bg-forest text-cream shadow-[0_40px_80px_-30px_rgba(22,48,36,0.8)] ring-1 ring-gold/25 lg:-translate-y-2"
                      : `border-forest/12 bg-white text-ink shadow-soft hover:border-gold/40 hover:shadow-lift ${
                          isPromo ? "border-gold/60 ring-1 ring-gold/20" : ""
                        }`
                  }`}
                >
                  {highlighted ? (
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(199,166,106,0.22),transparent_55%)]" />
                  ) : null}

                  {pack.badge ? (
                    <span
                      className={`absolute right-5 top-5 rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.13em] ${
                        highlighted || isPromo
                          ? "bg-gold text-forest-night"
                          : "bg-mist text-forest"
                      }`}
                    >
                      {pack.badge}
                    </span>
                  ) : null}

                  <div className="relative">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${
                        highlighted ? "text-cream/50" : "text-sage"
                      }`}
                    >
                      Plan {index + 1}
                    </p>
                    <h3
                      className={`mt-1.5 font-display text-[1.9rem] leading-none ${
                        highlighted ? "text-cream" : "text-forest"
                      }`}
                    >
                      {pack.name}
                    </h3>
                    <p
                      className={`mt-2 text-[12px] ${
                        highlighted ? "text-cream/60" : "text-ink-soft"
                      }`}
                    >
                      {pack.description}
                    </p>

                    <div className="relative mx-auto mt-5 h-48 w-full max-w-[230px] overflow-hidden rounded-2xl border border-forest/5 bg-white shadow-[0_18px_30px_-24px_rgba(22,48,36,0.45)] md:h-60">
                      <Image
                        src={pack.image}
                        alt={`${pack.name} — ${pack.quantity} frasco${pack.quantity === 1 ? "" : "s"} LINFOVIT`}
                        fill
                        sizes="230px"
                        className="object-contain p-2 mix-blend-multiply"
                      />
                    </div>

                    <div
                      className={`mt-4 flex items-end justify-between border-t pt-5 ${
                        highlighted ? "border-cream/15" : "border-forest/10"
                      }`}
                    >
                      <div>
                        <p
                          className={`font-display text-[2rem] leading-none ${
                            highlighted ? "text-cream" : "text-forest"
                          }`}
                        >
                          {formatCop(pack.priceCop)}
                        </p>
                        {pack.compareAtCop ? (
                          <p
                            className={`mt-0.5 text-[10.5px] line-through ${
                              highlighted ? "text-cream/45" : "text-ink-soft/70"
                            }`}
                          >
                            Antes {formatCop(pack.compareAtCop)}
                          </p>
                        ) : null}
                        <p
                          className={`mt-1 text-[11px] ${
                            highlighted ? "text-cream/55" : "text-ink-soft"
                          }`}
                        >
                          {pack.quantity} frasco{pack.quantity === 1 ? "" : "s"} ·{" "}
                          {formatCopPerUnit(pack.priceCop, pack.quantity)} / frasco
                        </p>
                      </div>
                      {saving > 0 ? (
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              highlighted || isPromo
                                ? "bg-gold/25 text-gold-deep"
                                : "bg-mist text-forest"
                            }`}
                          >
                            {discount ? `-${discount}%` : "Ahorro"}
                          </span>
                          <p
                            className={`mt-1.5 text-[10.5px] ${
                              highlighted ? "text-cream/55" : "text-ink-soft"
                            }`}
                          >
                            Ahorras {formatCop(saving)}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <ul
                    className={`relative mt-5 space-y-2 text-[12px] ${
                      highlighted ? "text-cream/70" : "text-ink-soft"
                    }`}
                  >
                    <li className="flex items-start gap-2">
                      <Check size={13} className="mt-0.5 shrink-0 text-gold" />
                      {pack.quantity} frasco{pack.quantity === 1 ? "" : "s"} de 60 ml con gotero
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="mt-0.5 shrink-0 text-gold" />
                      Fórmula de 5 ingredientes botánicos
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={13} className="mt-0.5 shrink-0 text-gold" />
                      Envío sin costo a toda Colombia
                    </li>
                  </ul>

                  <div className="relative mt-6 pt-1">
                    <BuyNowButton
                      pack={pack}
                      label={cta}
                      variant={highlighted ? "gold" : "primary"}
                      className={highlighted ? "!py-[1.1rem]" : ""}
                    />
                    <p
                      className={`mt-3 text-center text-[10px] ${
                        highlighted ? "text-cream/40" : "text-ink-soft/80"
                      }`}
                    >
                      Pago único · sin suscripción
                    </p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-8 flex flex-col items-center justify-center gap-3 text-center md:flex-row md:gap-6">
          <p className="flex items-center gap-2 text-[11px] text-ink-soft">
            <ShieldCheck size={14} className="text-sage" />
            Pago protegido con Mercado Pago
          </p>
          <span className="hidden h-3 w-px bg-forest/15 md:block" />
          <p className="flex items-center gap-2 text-[11px] text-ink-soft">
            <Sparkles size={14} className="text-gold-deep" />
            {Number(settings["site.freeShippingOverCop"] || 0) > 0 &&
            Number(settings["site.freeShippingOverCop"] || 0) <= 1
              ? "Envío sin costo a toda Colombia"
              : `Envío sin costo en compras superiores a ${formatCop(
                  Number(settings["site.freeShippingOverCop"] || 0),
                )}`}
          </p>
        </Reveal>

        <Reveal className="mt-4">
          <p className="mx-auto max-w-2xl text-center text-[10.5px] leading-relaxed text-ink-soft/70">
            {promoEndLabel
              ? `Oferta válida hasta el ${promoEndLabel} o hasta agotar existencias. `
              : unitPack && unitPack.stock > 0
                ? `Oferta válida hasta agotar las ${unitPack.stock} unidades disponibles. `
                : ""}
            Envío sin costo a toda Colombia. Los precios y la disponibilidad pueden actualizarse.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
