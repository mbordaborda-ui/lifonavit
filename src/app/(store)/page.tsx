import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import {
  BenefitsSection,
  DesireSection,
  FinalCta,
  HowToUse,
  IngredientMarquee,
  IngredientsSection,
  ProblemSection,
  QuoteBand,
  TrustStrip,
} from "@/components/landing/Sections";
import { OffersSection } from "@/components/landing/OffersSection";
import { SalesProof } from "@/components/landing/SalesProof";
import { FaqSection } from "@/components/landing/FaqSection";
import { MobileBuyBar } from "@/components/landing/MobileBuyBar";
import { ViewContentTracker } from "@/components/landing/ViewContentTracker";
import { getCatalog } from "@/lib/catalog";
import { getBenefits, getFaq, getIngredients, getQuotes, getSettings } from "@/lib/content";
import { faqJsonLd, organizationJsonLd, productJsonLd } from "@/lib/seo";
import { getAppUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = "Fórmula botánica de 5 ingredientes · 60 ml";
  return {
    title,
    description: settings["content.hero.subtitle"],
    alternates: { canonical: "/" },
    openGraph: {
      title: `LINFOVIT | ${title}`,
      description: settings["content.hero.subtitle"],
      url: getAppUrl(),
      images: ["/images/producto-frente.png"],
    },
  };
}

export default async function HomePage() {
  const catalog = await getCatalog();
  const settings = await getSettings();

  if (!catalog) {
    return (
      <div className="container-editorial py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-forest/15 bg-white p-8 text-center">
          <h1 className="font-display text-3xl text-forest">Catálogo no configurado</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Ejecuta <code className="rounded bg-mist px-1.5 py-0.5">npm run db:push</code> y luego{" "}
            <code className="rounded bg-mist px-1.5 py-0.5">npm run db:seed</code> para crear el
            producto, los packs y las tarifas de envío.
          </p>
        </div>
      </div>
    );
  }

  const faq = getFaq(settings);
  const benefits = getBenefits(settings);
  const ingredients = getIngredients(settings);
  const quotes = getQuotes(settings);
  const quoteBand = quotes[2]?.text ?? quotes[0]?.text ?? "";
  const salesCount = Math.max(
    0,
    Number.parseInt(settings["site.salesCount"] ?? "0", 10) || 0,
  );

  const prices = catalog.packs.map((pack) => pack.priceCop);
  const lowPrice = prices.length ? Math.min(...prices) : 0;
  const highPrice = prices.length ? Math.max(...prices) : 0;
  const recommended =
    catalog.packs.find((pack) => pack.quantity === 2) ?? catalog.packs[0];
  const mainOffer = catalog.packs.find((pack) => pack.quantity === 1) ?? recommended;

  const productLd = productJsonLd({
    name: catalog.product.name,
    description: catalog.product.description,
    image: catalog.product.imageFront,
    slug: catalog.product.slug,
    sku: catalog.product.sku,
    lowPrice,
    highPrice,
    inStock: catalog.product.stock > 0,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faq)) }}
      />

      <ViewContentTracker
        productId={catalog.product.id}
        packId={recommended.id}
        valueCop={recommended.priceCop}
        productName={catalog.product.name}
      />

      <Hero product={catalog.product} packs={catalog.packs} settings={settings} />
      <TrustStrip volumeMl={catalog.product.volumeMl} />
      <SalesProof
        salesCount={salesCount}
        period={settings["site.salesPeriod"] ?? ""}
        source={settings["site.salesSource"] ?? ""}
        stock={catalog.product.stock}
      />
      <IngredientMarquee />
      <ProblemSection settings={settings} />
      <DesireSection settings={settings} />
      <IngredientsSection
        settings={settings}
        ingredients={ingredients}
        product={catalog.product}
        lowestPrice={lowPrice}
      />
      <OffersSection packs={catalog.packs} settings={settings} />
      <BenefitsSection settings={settings} benefits={benefits} />
      <HowToUse product={catalog.product} lowestPrice={lowPrice} />
      {quoteBand ? <QuoteBand text={quoteBand} /> : null}
      <FaqSection items={faq} settings={settings} />
      <FinalCta settings={settings} lowestPrice={lowPrice} />
      <div className="h-[72px] md:hidden" aria-hidden="true" />
      {mainOffer ? <MobileBuyBar pack={mainOffer} /> : null}
    </>
  );
}
