import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Check, Info, Leaf, ShieldCheck } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PackSelector } from "@/components/product/PackSelector";
import { BotanicalArt } from "@/components/ui/BotanicalArt";
import { ViewContentTracker } from "@/components/landing/ViewContentTracker";
import { ButtonLink } from "@/components/ui/Button";
import { getCatalog } from "@/lib/catalog";
import { getIngredients, getSettings } from "@/lib/content";
import { productJsonLd } from "@/lib/seo";
import { formatCop } from "@/lib/money";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const catalog = await getCatalog();
  if (!catalog) return { title: "Producto" };
  return {
    title: `${catalog.product.name} · ${catalog.product.volumeMl} ml`,
    description: catalog.product.description,
    alternates: { canonical: "/producto" },
    openGraph: {
      title: `${catalog.product.name} | LINFOVIT`,
      description: catalog.product.description,
      url: `${getAppUrl()}/producto`,
      images: [catalog.product.imageFront],
    },
  };
}

export default async function ProductPage() {
  const catalog = await getCatalog();
  const settings = await getSettings();
  if (!catalog) {
    return (
      <div className="container-editorial py-24 text-center">
        <h1 className="font-display text-3xl text-forest">Producto no disponible</h1>
        <Link href="/" className="btn btn-primary mt-6">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const { product, packs } = catalog;
  const ingredients = getIngredients(settings);
  const recommended = packs.find((pack) => pack.quantity === 2) ?? packs[0];

  const gallery = [
    { src: product.imageFront, label: "Frasco de frente" },
    product.imageAngle ? { src: product.imageAngle, label: "Frasco en ángulo" } : null,
    product.imageBack ? { src: product.imageBack, label: "Información de la etiqueta" } : null,
  ].filter((image): image is { src: string; label: string } => Boolean(image));

  const productLd = productJsonLd({
    name: product.name,
    description: product.description,
    image: product.imageFront,
    slug: product.slug,
    sku: product.sku,
    lowPrice: Math.min(...packs.map((pack) => pack.priceCop)),
    highPrice: Math.max(...packs.map((pack) => pack.priceCop)),
    inStock: product.stock > 0,
  });

  return (
    <div className="bg-cream pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <ViewContentTracker
        productId={product.id}
        packId={recommended.id}
        valueCop={recommended.priceCop}
        productName={product.name}
      />

      <div className="container-editorial pt-6">
        <nav aria-label="Migas de pan" className="text-[10.5px] uppercase tracking-[0.12em] text-ink-soft">
          <Link href="/" className="hover:text-forest">
            Inicio
          </Link>
          <span className="mx-2 text-gold">/</span>
          <span className="text-forest">Producto</span>
        </nav>
      </div>

      <section className="container-editorial mt-6 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <ProductGallery images={gallery} name={product.name} />

        <div>
          <p className="eyebrow">Fórmula botánica · {product.volumeMl} ml</p>
          <h1 className="display-md mt-4 text-forest">{product.name}</h1>
          <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-sage">
            {product.tagline}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-forest-night">
              Oferta fin de año
            </span>
            <span className="rounded-full bg-gold/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-gold-deep">
              Envío gratis
            </span>
            <span className="rounded-full bg-forest/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-forest">
              5 ingredientes botánicos
            </span>
            <span className="rounded-full bg-forest/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-forest">
              Pago seguro
            </span>
          </div>

          <p className="mt-4 text-[0.94rem] leading-relaxed text-ink-soft">{product.description}</p>

          <PackSelector packs={packs} />

          <div className="mt-5 rounded-xl border border-gold/35 bg-gold/[0.07] p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-deep">
              <Info size={13} /> Modo de uso
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
              30 gotas (1 ml), tres veces al día. No exceda la dosis indicada. Agita antes de usar.
              Consulta a un profesional de la salud si tomas medicamentos, tienes una condición
              médica, estás embarazada o en período de lactancia.
            </p>
          </div>

          <ul className="mt-5 grid gap-2 text-[11.5px] text-ink-soft sm:grid-cols-2">
            {[
              "5 ingredientes botánicos",
              "Presentación líquida con gotero",
              "Elaborado en Colombia",
              "Producto de bienestar, no medicamento",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check size={13} className="shrink-0 text-sage" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-editorial mt-16 border-t border-forest/10 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">La fórmula</p>
            <h2 className="display-md mt-3 text-forest">
              Cinco ingredientes botánicos.{" "}
              <span className="serif-italic text-sage">Una decisión para tu bienestar.</span>
            </h2>
          </div>
          <Link
            href="/#ingredientes"
            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-forest underline underline-offset-4"
          >
            Conocer los ingredientes
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.name}
              className="rounded-xl border border-forest/10 bg-white p-4 text-center shadow-soft"
            >
              <div className="mx-auto h-20 w-16 text-sage">
                <BotanicalArt name={ingredient.name} />
              </div>
              <p className="mt-2 font-display text-[0.98rem] leading-tight text-forest">
                {ingredient.name}
              </p>
              <p className="serif-italic text-[10px] text-sage">{ingredient.latin}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-editorial mt-14">
        <div className="grain relative overflow-hidden rounded-[1.5rem] bg-forest p-7 text-cream shadow-lift md:flex md:items-center md:justify-between md:gap-8 md:p-9">
          <div className="relative">
            <p className="eyebrow eyebrow-light">Tu rutina</p>
            <h2 className="display-md mt-3 text-cream">
              Elige tu pack y recíbelo{" "}
              <span className="serif-italic text-gold">con envío gratis.</span>
            </h2>
            <p className="mt-2 max-w-lg text-[12.5px] leading-relaxed text-cream/65">
              Cinco botánicos en una fórmula líquida de 60 ml. Pago seguro con Mercado Pago y
              entrega a toda Colombia.
            </p>
          </div>
          <ButtonLink href="/#ofertas" variant="gold" size="lg" arrow className="relative mt-5 md:mt-0">
            Ver packs y precios
          </ButtonLink>
        </div>
      </section>

      <section className="container-editorial mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Leaf,
            title: "Ingredientes botánicos",
            text: "Diente de león, hibisco, hinojo, jengibre y té verde descafeinado.",
          },
          {
            icon: ShieldCheck,
            title: "Compra protegida",
            text: "Pago procesado por Mercado Pago. No almacenamos datos de tarjetas.",
          },
          {
            icon: BadgeCheck,
            title: "Información clara",
            text: "Precios en COP, costo de envío visible antes de pagar y sin suscripciones.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-forest/10 bg-white p-5">
            <item.icon size={18} className="text-sage" />
            <p className="mt-3 font-display text-[1.05rem] text-forest">{item.title}</p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">{item.text}</p>
          </div>
        ))}
      </section>

      <p className="container-editorial mt-8 text-center text-[10.5px] leading-relaxed text-ink-soft">
        Desde {formatCop(Math.min(...packs.map((pack) => pack.priceCop)))} · Envío gratis a toda
        Colombia · LINFOVIT es un producto de bienestar, no un medicamento.
      </p>
    </div>
  );
}
