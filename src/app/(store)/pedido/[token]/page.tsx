import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderView } from "@/components/checkout/OrderView";
import { getOrderByToken, shouldSyncOrder, syncOrderWithMp } from "@/lib/orders";
import { getSettings } from "@/lib/content";
import { isMpConfigured } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tu pedido",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!token || token.length < 20) notFound();

  let order = await getOrderByToken(token);
  if (!order) notFound();

  const settings = await getSettings();

  if (shouldSyncOrder(order) && isMpConfigured()) {
    await syncOrderWithMp(order.id);
    order = (await getOrderByToken(token)) ?? order;
  }

  return <OrderView order={order} contactEmail={settings["site.contactEmail"]} />;
}
