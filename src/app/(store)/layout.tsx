import { Suspense } from "react";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TrackPageView } from "@/components/analytics/TrackPageView";
import { getCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);

  return (
    <CartProvider packs={catalog?.packs ?? []}>
      <Header announcement={settings["site.announcement"]} />
      <main id="contenido">{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
      <Suspense fallback={null}>
        <TrackPageView />
      </Suspense>
    </CartProvider>
  );
}
