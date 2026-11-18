import Image from "next/image";
import { prisma } from "@/lib/db";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  Notice,
  StatusBadge,
  adminDateTime,
} from "@/components/admin/AdminUI";
import { moderateReviewAction } from "@/server/actions/admin";
import { Stars } from "@/components/ui/Stars";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "PENDING", label: "Pendientes" },
  { value: "APPROVED", label: "Publicadas" },
  { value: "REJECTED", label: "Rechazadas" },
  { value: "ALL", label: "Todas" },
];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; ok?: string; error?: string }>;
}) {
  const { estado, ok, error } = await searchParams;
  const status = estado && estado !== "ALL" ? estado : "PENDING";

  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where: status === "ALL" ? {} : { status },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { product: { select: { name: true } } },
    }),
    prisma.review.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (value: string) =>
    value === "ALL"
      ? counts.reduce((sum, item) => sum + item._count._all, 0)
      : counts.find((item) => item.status === value)?._count._all ?? 0;

  return (
    <>
      <AdminPageHeader
        title="Reseñas"
        description="Solo compradores con pago confirmado pueden enviar reseñas. Modera antes de publicar: no edites la experiencia de la persona."
      />
      <Notice ok={ok} error={error} />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => (
          <a
            key={filter.value}
            href={`/admin/resenas?estado=${filter.value}`}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
              status === filter.value
                ? "bg-forest text-cream"
                : "border border-forest/15 text-ink-soft hover:border-forest/35 hover:text-forest"
            }`}
          >
            {filter.label} ({countFor(filter.value)})
          </a>
        ))}
      </div>

      {reviews.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin reseñas en esta vista"
            text="La tienda muestra un estado vacío honesto hasta que existan compradores verificados que compartan su experiencia."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {review.photoUrl ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={review.photoUrl}
                        alt={review.name}
                        fill
                        sizes="48px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mist font-display text-forest">
                      {review.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <p className="text-[13px] font-semibold text-forest">{review.name}</p>
                    <p className="text-[10.5px] text-ink-soft">
                      {review.city ?? "Sin ciudad"} · {review.email ?? "sin correo"} ·{" "}
                      {adminDateTime.format(review.createdAt)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <Stars value={review.rating} size={12} />
                      <StatusBadge status={review.status} />
                      {review.verifiedPurchase ? (
                        <span className="text-[9.5px] font-semibold uppercase tracking-[0.06em] text-sage">
                          Compra verificada
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <button
                      type="submit"
                      className="rounded-full bg-forest px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-cream"
                    >
                      Publicar
                    </button>
                  </form>
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <button
                      type="submit"
                      className="rounded-full border border-forest/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft"
                    >
                      Rechazar
                    </button>
                  </form>
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={review.id} />
                    <input type="hidden" name="decision" value="delete" />
                    <button
                      type="submit"
                      className="rounded-full border border-[#c47a6f]/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9a3a2c]"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>
              </div>

              {review.title ? (
                <p className="mt-3 font-display text-[1.05rem] text-forest">{review.title}</p>
              ) : null}
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-soft">{review.body}</p>
              {review.adminNote ? (
                <p className="mt-2 rounded bg-cream px-3 py-2 text-[11px] text-ink-soft">
                  Nota interna: {review.adminNote}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
