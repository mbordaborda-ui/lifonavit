import type { FaqItem } from "@/lib/content";
import { getAppUrl } from "@/lib/env";

export function organizationJsonLd(settings: Record<string, string>) {
  const appUrl = getAppUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LINFOVIT",
    url: appUrl,
    logo: `${appUrl}/icon.svg`,
    email: settings["site.contactEmail"],
    telephone: settings["site.contactPhone"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bogotá",
      addressCountry: "CO",
    },
  };
}

export function productJsonLd({
  name,
  description,
  image,
  slug,
  sku,
  lowPrice,
  highPrice,
  inStock,
  ratingValue,
  reviewCount,
}: {
  name: string;
  description: string;
  image: string;
  slug: string;
  sku: string;
  lowPrice: number;
  highPrice: number;
  inStock: boolean;
  ratingValue?: number;
  reviewCount?: number;
}) {
  const appUrl = getAppUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: `${appUrl}${image}`,
    sku,
    brand: { "@type": "Brand", name: "LINFOVIT" },
    category: "Suplemento botánico de bienestar",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "COP",
      lowPrice,
      highPrice,
      offerCount: 3,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${appUrl}/producto`,
      seller: { "@type": "Organization", name: "LINFOVIT" },
    },
    ...(reviewCount && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: ratingValue?.toFixed(1),
            reviewCount,
          },
        }
      : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Contenido neto", value: "60 ml" },
      { "@type": "PropertyValue", name: "Presentación", value: "Gotas orales con gotero" },
    ],
    url: `${appUrl}/producto`,
    ...(slug ? {} : {}),
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
