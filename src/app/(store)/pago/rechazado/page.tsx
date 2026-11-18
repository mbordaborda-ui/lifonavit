import type { Metadata } from "next";
import { PaymentResult } from "@/components/checkout/PaymentResult";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pago rechazado",
  robots: { index: false, follow: false },
};

export default async function FailurePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <PaymentResult token={token} via="failure" />;
}
