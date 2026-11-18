import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[1.9rem] leading-tight text-forest">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  return (
    <div
      className={`mb-5 rounded-xl border px-4 py-3 text-[12px] leading-relaxed ${
        error
          ? "border-[#c47a6f]/40 bg-[#fdf1ee] text-[#8f3a2e]"
          : "border-sage/40 bg-[#edf4ec] text-forest"
      }`}
      role={error ? "alert" : "status"}
    >
      {error ?? ok}
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-forest/10 bg-white p-5 shadow-soft ${className}`}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-display text-[1.15rem] text-forest">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-soft">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  href?: string;
}) {
  const content = (
    <div className="h-full rounded-xl border border-forest/10 bg-white p-4 shadow-soft transition hover:border-forest/25">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
          {label}
        </p>
        {icon ? <span className="text-sage">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-[1.7rem] leading-none text-forest">{value}</p>
      {hint ? <p className="mt-1.5 text-[10px] text-ink-soft">{hint}</p> : null}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-[#e7f0e6] text-forest",
    APPROVED: "bg-[#e7f0e6] text-forest",
    SHIPPED: "bg-[#e8eef5] text-[#2f5578]",
    DELIVERED: "bg-[#e7f0e6] text-forest",
    PENDING: "bg-[#fbf2df] text-[#8a6413]",
    IN_PROCESS: "bg-[#fbf2df] text-[#8a6413]",
    FAILED: "bg-[#fbe9e5] text-[#9a3a2c]",
    REJECTED: "bg-[#fbe9e5] text-[#9a3a2c]",
    CANCELLED: "bg-[#f1f1f0] text-[#62665f]",
    REFUNDED: "bg-[#efe9f5] text-[#5f4477]",
    CHARGED_BACK: "bg-[#efe9f5] text-[#5f4477]",
    DRAFT: "bg-[#f1f1f0] text-[#62665f]",
    HIDDEN: "bg-[#f1f1f0] text-[#62665f]",
  };
  const labels: Record<string, string> = {
    PAID: "Pagado",
    APPROVED: "Aprobado",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    PENDING: "Pendiente",
    IN_PROCESS: "En proceso",
    FAILED: "Fallido",
    REJECTED: "Rechazado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
    CHARGED_BACK: "Contracargo",
    DRAFT: "Borrador",
    HIDDEN: "Oculto",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] ${
        styles[status] ?? "bg-mist text-ink-soft"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-forest/20 bg-cream/60 px-5 py-10 text-center">
      <p className="font-display text-lg text-forest">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-ink-soft">{text}</p>
    </div>
  );
}

export const adminDate = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export const adminDateTime = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
