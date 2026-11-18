import type { Metadata } from "next";
import { CheckoutForm, type DepartmentRate } from "@/components/checkout/CheckoutForm";
import { getCatalog } from "@/lib/catalog";
import { getSettings, getFreeShippingOver } from "@/lib/content";
import { departments, getDepartmentRates } from "@/lib/shipping";
import { isMpConfigured } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout seguro",
  description: "Completa tus datos de contacto y entrega para finalizar tu compra.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const [catalog, settings, departmentRates] = await Promise.all([
    getCatalog(),
    getSettings(),
    getDepartmentRates(),
  ]);

  if (!catalog) {
    return (
      <div className="container-editorial py-24 text-center">
        <h1 className="font-display text-3xl text-forest">Tienda en configuración</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Estamos preparando el catálogo. Vuelve en unos minutos.
        </p>
      </div>
    );
  }

  const rates: DepartmentRate[] = departmentRates
    .filter((item) => item.rate)
    .map((item) => ({
      department: item.department,
      priceCop: item.rate!.priceCop,
      etaMinDays: item.rate!.etaMinDays,
      etaMaxDays: item.rate!.etaMaxDays,
    }));

  const citiesByDepartment = Object.fromEntries(
    departments.map((department) => [department.name, department.cities]),
  );

  return (
    <CheckoutForm
      rates={rates}
      citiesByDepartment={citiesByDepartment}
      freeShippingOverCop={getFreeShippingOver(settings)}
      mpConfigured={isMpConfigured()}
      contactEmail={settings["site.contactEmail"]}
    />
  );
}
