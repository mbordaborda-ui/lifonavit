"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronDown,
  CreditCard,
  Info,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { getAttribution, trackEvent } from "@/components/analytics/TrackPageView";
import { createCheckout, previewPromo } from "@/server/actions/checkout";
import { formatCop, formatCopPerUnit } from "@/lib/money";

export type DepartmentRate = {
  department: string;
  priceCop: number;
  etaMinDays: number;
  etaMaxDays: number;
};

type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  department: string;
  city: string;
  address: string;
  addressExtra: string;
  notes: string;
};

export function CheckoutForm({
  rates,
  citiesByDepartment,
  freeShippingOverCop,
  mpConfigured,
  contactEmail,
}: {
  rates: DepartmentRate[];
  citiesByDepartment: Record<string, string[]>;
  freeShippingOverCop: number;
  mpConfigured: boolean;
  contactEmail: string;
}) {
  const { lines, packs, getPack, subtotalCop, remove, ready, add, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    department: "",
    city: "",
    address: "",
    addressExtra: "",
    notes: "",
  });
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; discountCop: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoPending, setPromoPending] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [summaryOpen, setSummaryOpen] = useState(false);

  const selectedRate = rates.find((rate) => rate.department === form.department);
  const cities = form.department ? citiesByDepartment[form.department] ?? [] : [];
  const freeForAll = freeShippingOverCop > 0 && freeShippingOverCop <= 1;
  const shippingCop = freeForAll
    ? 0
    : !selectedRate
      ? null
      : freeShippingOverCop > 0 && subtotalCop >= freeShippingOverCop
        ? 0
        : selectedRate.priceCop;

  const totalUnits = lines.reduce(
    (sum, line) => sum + (getPack(line.packId)?.quantity ?? 0) * line.quantity,
    0,
  );
  const activePackId = lines.length === 1 ? lines[0]?.packId ?? null : null;
  const unitPack = packs.find((pack) => pack.quantity === 1);
  const promoActive = Boolean(
    unitPack?.compareAtCop && unitPack.compareAtCop > unitPack.priceCop,
  );

  const discountCop = promo?.discountCop ?? 0;
  const totalCop = subtotalCop - discountCop + (shippingCop ?? 0);

  useEffect(() => {
    if (!ready || lines.length === 0) return;
    trackEvent({
      name: "InitiateCheckout",
      valueCop: subtotalCop,
      metadata: { source: "checkout_page", lines: lines.length },
    });
    // Solo al entrar al checkout con carrito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const changePack = (packId: string) => {
    const pack = getPack(packId);
    if (!pack || activePackId === packId) return;
    clear();
    add(packId, 1, { openDrawer: false });
    if (promo) {
      setPromo(null);
      setPromoError("Cambiaste de pack. Vuelve a aplicar tu código.");
    }
    trackEvent({
      name: "AddToCart",
      packId,
      valueCop: pack.priceCop,
      metadata: { source: "checkout_pack_switch", units: pack.quantity },
    });
  };

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => {
      if (key === "department") {
        return { ...current, department: value, city: "" };
      }
      return { ...current, [key]: value };
    });
    setFieldErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError("");
    setPromoPending(true);
    try {
      const result = await previewPromo(promoInput, subtotalCop);
      if (result.ok) {
        setPromo({ code: result.code, discountCop: result.discountCop });
        setPromoInput(result.code);
      } else {
        setPromo(null);
        setPromoError(result.error);
      }
    } finally {
      setPromoPending(false);
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!mpConfigured) return;
    setError("");
    setFieldErrors({});

    if (lines.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    if (!terms) {
      setError("Debes aceptar los términos y la política de tratamiento de datos.");
      return;
    }

    const payload = {
      ...form,
      items: lines.map((line) => ({ packId: line.packId, quantity: line.quantity })),
      promoCode: promo?.code ?? "",
      acceptTerms: true as const,
      attribution: getAttribution(),
      landingPath:
        typeof window !== "undefined"
          ? sessionStorage.getItem("lfv_landing_path") ?? undefined
          : undefined,
    };

    startTransition(async () => {
      const result = await createCheckout(payload);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        if (result.fieldErrors?.department || result.fieldErrors?.city) {
          document
            .getElementById(result.fieldErrors.department ? "department" : "city")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }
      window.location.assign(result.initPoint);
    });
  };

  const summary = (
    <div className="rounded-[1.5rem] border border-forest/10 bg-white p-5 shadow-soft md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-forest">Tu pedido</h2>
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-soft">
          {totalUnits} frasco{totalUnits === 1 ? "" : "s"}
        </span>
      </div>

      {packs.length > 1 ? (
        <div className="mt-4 border-t border-forest/10 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-forest">
              Elige tu pack
            </p>
            <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-sage">
              Envío gratis
            </span>
          </div>
          <div className="mt-2 space-y-1.5">
            {packs.map((pack) => {
              const active = activePackId === pack.id;
              const packSaving =
                pack.compareAtCop && pack.compareAtCop > pack.priceCop
                  ? pack.compareAtCop - pack.priceCop
                  : 0;
              return (
                <button
                  key={pack.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changePack(pack.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-2.5 py-2 text-left transition ${
                    active
                      ? "border-forest bg-forest/[0.04] ring-1 ring-forest/10"
                      : "border-forest/12 bg-white hover:border-forest/35"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                        active
                          ? "border-forest bg-forest text-cream"
                          : "border-forest/30"
                      }`}
                    >
                      {active ? <Check size={8} /> : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[12px] font-medium text-forest">
                        {pack.name}
                      </span>
                      <span className="block text-[9px] text-ink-soft">
                        {pack.quantity} frasco{pack.quantity === 1 ? "" : "s"} ·{" "}
                        {formatCopPerUnit(pack.priceCop, pack.quantity)} / frasco
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    {pack.compareAtCop ? (
                      <span className="block text-[8.5px] text-ink-soft/70 line-through">
                        {formatCop(pack.compareAtCop)}
                      </span>
                    ) : null}
                    <span className="block font-display text-[1.05rem] leading-tight text-forest">
                      {formatCop(pack.priceCop)}
                    </span>
                    {packSaving > 0 ? (
                      <span className="block text-[8px] font-semibold text-sage">
                        Ahorras {formatCop(packSaving)}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[8.5px] leading-relaxed text-ink-soft">
            Al cambiar de presentación se reemplaza la selección actual.
          </p>
        </div>
      ) : null}

      <ul className="mt-4 space-y-3">
        {lines.map((line) => {
          const pack = getPack(line.packId);
          if (!pack) return null;
          return (
            <li key={line.packId} className="flex gap-3">
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-forest/5 bg-white">
                <Image
                  src={pack.image}
                  alt={pack.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1 mix-blend-multiply"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-[0.98rem] leading-tight text-forest">
                      {pack.name}
                    </p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-ink-soft">
                      {pack.quantity} frasco{pack.quantity === 1 ? "" : "s"} · 60 ml
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-[13px] font-semibold text-forest">
                    {formatCop(pack.priceCop * line.quantity)}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => remove(line.packId)}
                    className="text-[10px] text-ink-soft underline underline-offset-2 hover:text-forest"
                  >
                    Quitar
                  </button>
                  <div className="text-right">
                    {line.quantity > 1 ? (
                      <p className="text-[9px] text-ink-soft">Cantidad: {line.quantity}</p>
                    ) : null}
                    {pack.quantity > 1 ? (
                      <p className="text-[10px] text-ink-soft">
                        {formatCopPerUnit(pack.priceCop, pack.quantity)} / frasco
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-forest/10 pt-4">
        <button
          type="button"
          onClick={() => setSummaryOpen((value) => !value)}
          className="flex w-full items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-forest"
          aria-expanded={summaryOpen}
        >
          ¿Tienes un código de descuento?
          <ChevronDown
            size={14}
            className={`transition-transform ${summaryOpen ? "rotate-180" : ""}`}
          />
        </button>
        {summaryOpen ? (
          <div className="mt-3">
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                className="field !py-2.5 !text-[12px] uppercase tracking-[0.06em]"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoPending || !promoInput.trim()}
                className="btn btn-outline !px-4 !py-2.5 !text-[10px]"
              >
                {promoPending ? <Loader2 size={12} className="animate-spin" /> : "Aplicar"}
              </button>
            </div>
            {promo ? (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-sage">
                <Check size={12} /> Código {promo.code} aplicado
              </p>
            ) : null}
            {promoError ? (
              <p className="mt-2 text-[11px] text-[#a4372c]">{promoError}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-2 border-t border-forest/10 pt-4 text-[12.5px]">
        <div className="flex justify-between text-ink-soft">
          <span>Subtotal</span>
          <span>{formatCop(subtotalCop)}</span>
        </div>
        {discountCop > 0 ? (
          <div className="flex justify-between text-sage">
            <span>Descuento</span>
            <span>- {formatCop(discountCop)}</span>
          </div>
        ) : null}
        <div className="flex justify-between text-ink-soft">
          <span>Envío</span>
          <span className="text-right">
            {shippingCop === null
              ? "Elige tu ciudad"
              : shippingCop === 0
                ? "Sin costo"
                : formatCop(shippingCop)}
          </span>
        </div>
        {selectedRate ? (
          <p className="text-right text-[10px] text-ink-soft">
            Llega en {selectedRate.etaMinDays} a {selectedRate.etaMaxDays} días hábiles
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-forest/10 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-forest">
          Total
        </span>
        <span className="font-display text-[1.75rem] leading-none text-forest">
          {formatCop(totalCop)}
        </span>
      </div>

      {freeShippingOverCop > 0 && subtotalCop < freeShippingOverCop ? (
        <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-[10.5px] leading-relaxed text-forest">
          Agrega {formatCop(freeShippingOverCop - subtotalCop)} más para obtener envío sin costo.
        </p>
      ) : null}

      <div className="mt-4 space-y-2 border-t border-forest/10 pt-4 text-[10.5px] text-ink-soft">
        <p className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-sage" /> Pago protegido por Mercado Pago
        </p>
        <p className="flex items-center gap-2">
          <Lock size={13} className="text-sage" /> No almacenamos datos de tarjetas
        </p>
        <p className="flex items-center gap-2">
          <Truck size={13} className="text-sage" /> Despacho desde Bogotá
        </p>
      </div>
    </div>
  );

  if (ready && lines.length === 0) {
    return (
      <div className="container-editorial py-16 md:py-24">
        <div className="mx-auto max-w-lg rounded-[1.5rem] border border-forest/10 bg-white p-8 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mist text-sage">
            <Truck size={24} strokeWidth={1.3} />
          </span>
          <h1 className="mt-5 font-display text-2xl text-forest">Tu carrito está vacío</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Elige el pack que mejor se adapte a tu rutina. Podrás revisar y cambiar tu selección
            antes de pagar.
          </p>
          <Link href="/#ofertas" className="btn btn-primary mt-6">
            Ver los packs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-editorial py-8 md:py-14">
      <Link
        href="/#ofertas"
        className="mb-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft transition hover:text-forest"
      >
        <ArrowLeft size={13} /> Volver a la tienda
      </Link>

      <div className="mb-8">
        <p className="eyebrow">Checkout seguro</p>
        <h1 className="display-md mt-4 text-forest">Completa tu pedido</h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-soft">
          Solo faltan tus datos de contacto y entrega. El pago se procesa en el entorno seguro de
          Mercado Pago.
        </p>
        {promoActive && unitPack?.compareAtCop ? (
          <div className="mt-3 inline-flex flex-wrap items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.06em] text-gold-deep">
            <Sparkles size={12} />
            Oferta fin de año: {formatCop(unitPack.priceCop)} antes{" "}
            {formatCop(unitPack.compareAtCop)} · hasta agotar unidades
          </div>
        ) : null}
      </div>

      {!mpConfigured ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold/50 bg-gold/10 p-4">
          <Info size={17} className="mt-0.5 shrink-0 text-gold-deep" />
          <div>
            <p className="text-[12px] font-semibold text-forest">
              Pago en línea en habilitación
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">
              Estamos terminando la integración con Mercado Pago, por lo que todavía no es posible
              completar el pago desde la tienda. Tu pedido no será creado ni cobrado. Si necesitas
              ayuda, escríbenos a{" "}
              <a href={`mailto:${contactEmail}`} className="underline underline-offset-2">
                {contactEmail}
              </a>
              .
            </p>
          </div>
        </div>
      ) : null}

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="order-2 space-y-5 lg:order-1">
          <section className="rounded-[1.35rem] border border-forest/10 bg-white p-5 shadow-soft md:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-display text-[12px] text-cream">
                1
              </span>
              <h2 className="font-display text-xl text-forest">Tus datos</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="customerName">
                  Nombre completo
                </label>
                <input
                  id="customerName"
                  name="name"
                  className="field"
                  autoComplete="name"
                  value={form.customerName}
                  onChange={(event) => update("customerName", event.target.value)}
                  required
                  minLength={3}
                  maxLength={120}
                  aria-invalid={Boolean(fieldErrors.customerName)}
                />
                {fieldErrors.customerName ? (
                  <p className="field-error">{fieldErrors.customerName}</p>
                ) : null}
              </div>
              <div>
                <label className="field-label" htmlFor="customerEmail">
                  Correo electrónico
                </label>
                <input
                  id="customerEmail"
                  name="email"
                  type="email"
                  inputMode="email"
                  className="field"
                  autoComplete="email"
                  value={form.customerEmail}
                  onChange={(event) => update("customerEmail", event.target.value)}
                  required
                  aria-invalid={Boolean(fieldErrors.customerEmail)}
                />
                {fieldErrors.customerEmail ? (
                  <p className="field-error">{fieldErrors.customerEmail}</p>
                ) : null}
              </div>
              <div>
                <label className="field-label" htmlFor="customerPhone">
                  Celular
                </label>
                <input
                  id="customerPhone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  className="field"
                  autoComplete="tel-national"
                  placeholder="300 123 4567"
                  value={form.customerPhone}
                  onChange={(event) => update("customerPhone", event.target.value)}
                  required
                  aria-invalid={Boolean(fieldErrors.customerPhone)}
                />
                {fieldErrors.customerPhone ? (
                  <p className="field-error">{fieldErrors.customerPhone}</p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-forest/10 bg-white p-5 shadow-soft md:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-display text-[12px] text-cream">
                2
              </span>
              <h2 className="font-display text-xl text-forest">Entrega</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="department">
                  Departamento
                </label>
                <select
                  id="department"
                  className="field"
                  value={form.department}
                  onChange={(event) => update("department", event.target.value)}
                  required
                  aria-invalid={Boolean(fieldErrors.department)}
                >
                  <option value="">Selecciona</option>
                  {rates.map((rate) => (
                    <option key={rate.department} value={rate.department}>
                      {rate.department}
                    </option>
                  ))}
                </select>
                {fieldErrors.department ? (
                  <p className="field-error">{fieldErrors.department}</p>
                ) : null}
              </div>
              <div>
                <label className="field-label" htmlFor="city">
                  Ciudad
                </label>
                <select
                  id="city"
                  className="field"
                  value={form.city}
                  onChange={(event) => update("city", event.target.value)}
                  required
                  disabled={!form.department}
                  aria-invalid={Boolean(fieldErrors.city)}
                >
                  <option value="">{form.department ? "Selecciona" : "Primero el departamento"}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {fieldErrors.city ? <p className="field-error">{fieldErrors.city}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="address">
                  Dirección
                </label>
                <input
                  id="address"
                  className="field"
                  autoComplete="street-address"
                  placeholder="Calle 00 # 00-00"
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                  required
                  minLength={6}
                  maxLength={240}
                  aria-invalid={Boolean(fieldErrors.address)}
                />
                {fieldErrors.address ? <p className="field-error">{fieldErrors.address}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="addressExtra">
                  Apartamento, torre, indicaciones <span className="font-normal normal-case text-ink-soft">(opcional)</span>
                </label>
                <input
                  id="addressExtra"
                  className="field"
                  value={form.addressExtra}
                  onChange={(event) => update("addressExtra", event.target.value)}
                  maxLength={160}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label" htmlFor="notes">
                  Información adicional de entrega <span className="font-normal normal-case text-ink-soft">(opcional)</span>
                </label>
                <textarea
                  id="notes"
                  className="field min-h-[80px] resize-y"
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  maxLength={300}
                  placeholder="Horarios de entrega, referencias del lugar, etc."
                />
                {fieldErrors.notes ? <p className="field-error">{fieldErrors.notes}</p> : null}
              </div>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-mist px-3 py-2.5">
              <Info size={13} className="mt-0.5 shrink-0 text-sage" />
              <p className="text-[10.5px] leading-relaxed text-ink-soft">
                Envío gratis a toda Colombia. Despachamos desde Bogotá en 1 a 2 días hábiles.
              </p>
            </div>
          </section>

          <section className="rounded-[1.35rem] border border-forest/10 bg-white p-5 shadow-soft md:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest font-display text-[12px] text-cream">
                3
              </span>
              <h2 className="font-display text-xl text-forest">Pago</h2>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-forest/15 bg-cream p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-forest">
                <CreditCard size={17} strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-forest">Mercado Pago</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">
                  Tarjetas de crédito y débito, PSE y los medios habilitados por Mercado Pago. Al
                  continuar serás redirigido a su entorno seguro.
                </p>
              </div>
              <span className="ml-auto rounded-full bg-forest/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-forest">
                Seguro
              </span>
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={terms}
                onChange={(event) => setTerms(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-forest/30 accent-forest"
                required
              />
              <span className="text-[11px] leading-relaxed text-ink-soft">
                Acepto los{" "}
                <Link href="/politicas/terminos" className="text-forest underline underline-offset-2" target="_blank">
                  términos y condiciones
                </Link>{" "}
                y autorizo el{" "}
                <Link
                  href="/politicas/tratamiento-datos"
                  className="text-forest underline underline-offset-2"
                  target="_blank"
                >
                  tratamiento de mis datos personales
                </Link>
                .
              </span>
            </label>

            {error ? (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-[#c47a6f]/40 bg-[#fdf1ee] px-3.5 py-3 text-[12px] leading-relaxed text-[#8f3a2e]"
              >
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={pending || !mpConfigured || !ready}
              className="btn btn-primary mt-5 w-full !py-[1.1rem]"
            >
              {pending ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Preparando el pago…
                </>
              ) : (
                <>
                  <Lock size={14} /> Pagar ahora · {formatCop(totalCop)}
                </>
              )}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-ink-soft">
              <BadgeCheck size={12} className="text-sage" />
              Pago verificado en el servidor antes de confirmar tu pedido
            </p>
          </section>
        </div>

        <div className="order-1 lg:order-2 lg:sticky lg:top-24">{summary}</div>
      </form>
    </div>
  );
}
