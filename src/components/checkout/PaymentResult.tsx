import Link from "next/link";
import { SearchX } from "lucide-react";
import { OrderView } from "@/components/checkout/OrderView";
import { getOrderByToken, syncOrderWithMp } from "@/lib/orders";
import { getSettings } from "@/lib/content";
import { isMpConfigured } from "@/lib/mercadopago";

export async function PaymentResult({
  token,
  via,
}: {
  token?: string;
  via: "success" | "pending" | "failure";
}) {
  const settings = await getSettings();

  if (!token) {
    return <MissingOrder contactEmail={settings["site.contactEmail"]} />;
  }

  let order = await getOrderByToken(token);
  if (!order) {
    return <MissingOrder contactEmail={settings["site.contactEmail"]} />;
  }

  if (order.paymentStatus !== "APPROVED" && isMpConfigured()) {
    await syncOrderWithMp(order.id);
    order = (await getOrderByToken(token)) ?? order;
  }

  return <OrderView order={order} via={via} contactEmail={settings["site.contactEmail"]} />;
}

function MissingOrder({ contactEmail }: { contactEmail: string }) {
  return (
    <div className="container-editorial py-20">
      <div className="mx-auto max-w-lg rounded-[1.5rem] border border-forest/10 bg-white p-8 text-center shadow-soft">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mist text-sage">
          <SearchX size={24} strokeWidth={1.4} />
        </span>
        <h1 className="mt-5 font-display text-2xl text-forest">No encontramos este pedido</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          El enlace puede estar incompleto. Revisa el correo de confirmación o escríbenos a{" "}
          <a href={`mailto:${contactEmail}`} className="underline underline-offset-2">
            {contactEmail}
          </a>
          .
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
