import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import { getAppUrl } from "@/lib/env";
import { ConsentManager } from "@/components/analytics/ConsentManager";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "LINFOVIT | Fórmula botánica líquida de 5 ingredientes",
    template: "%s · LINFOVIT",
  },
  description:
    "LINFOVIT es una fórmula botánica líquida de 60 ml con diente de león, hibisco, hinojo, jengibre y té verde descafeinado. Una rutina de bienestar y autocuidado. Envíos a toda Colombia.",
  keywords: [
    "LINFOVIT",
    "drenaje linfático natural",
    "fórmula botánica",
    "diente de león",
    "hibisco",
    "hinojo",
    "jengibre",
    "té verde descafeinado",
    "bienestar Colombia",
  ],
  authors: [{ name: "LINFOVIT" }],
  creator: "LINFOVIT",
  publisher: "LINFOVIT",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: "LINFOVIT",
    title: "LINFOVIT | 5 botánicos. Una fórmula líquida.",
    description:
      "Una fórmula botánica de 5 ingredientes para complementar tu rutina de bienestar, hidratación y autocuidado. Frasco de 60 ml con gotero.",
    images: [
      {
        url: "/images/producto-frente.png",
        width: 720,
        height: 1000,
        alt: "Frasco LINFOVIT Drenaje Linfático de 60 ml con gotero",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LINFOVIT | 5 botánicos. Una fórmula líquida.",
    description:
      "Fórmula botánica líquida de 60 ml con 5 ingredientes. Una rutina de bienestar y autocuidado.",
    images: ["/images/producto-frente.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "bienestar",
};

export const viewport: Viewport = {
  themeColor: "#244C3A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-CO"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink antialiased">
        {children}
        <ConsentManager gaId={gaId} pixelId={pixelId} />
      </body>
    </html>
  );
}
