import Image from "next/image";
import { prisma } from "@/lib/db";
import {
  AdminPageHeader,
  Card,
  EmptyState,
  Notice,
  StatusBadge,
  adminDate,
} from "@/components/admin/AdminUI";
import {
  deleteTestimonialAction,
  saveTestimonialAction,
} from "@/server/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const notice = await searchParams;
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <AdminPageHeader
        title="Testimonios"
        description="Publica únicamente experiencias reales, voluntarias y autorizadas. Registra la referencia de consentimiento antes de publicar. Las personas colaboradoras se marcan como tales."
      />
      <Notice ok={notice.ok} error={notice.error} />

      <div className="mb-4 rounded-xl border border-gold/40 bg-gold/[0.08] px-4 py-3 text-[11px] leading-relaxed text-ink-soft">
        <strong className="text-forest">Regla editorial:</strong> no inventes testimonios, nombres,
        fotos ni calificaciones. Si una trabajadora de LINFOVIT comparte su experiencia, selecciona
        “Colaboradora LINFOVIT” y conserva su autorización. Si aún no hay testimonios reales, es
        correcto no publicar ninguno.
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="space-y-3">
          {testimonials.length === 0 ? (
            <Card>
              <EmptyState
                title="Aún no hay testimonios"
                text="La tienda no mostrará testimonios hasta que existan experiencias reales autorizadas. Puedes crear el primero cuando tengas el consentimiento."
              />
            </Card>
          ) : (
            testimonials.map((testimonial) => (
              <details key={testimonial.id} className="group rounded-xl border border-forest/10 bg-white shadow-soft">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  {testimonial.photoUrl ? (
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                      <Image
                        src={testimonial.photoUrl}
                        alt={testimonial.name}
                        fill
                        sizes="44px"
                        unoptimized
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist font-display text-sm text-forest">
                      {testimonial.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-forest">
                      {testimonial.name}
                    </p>
                    <p className="text-[10.5px] text-ink-soft">
                      {testimonial.kind === "COLLABORATOR" ? "Colaborador/a" : "Cliente"} ·{" "}
                      {testimonial.rating}/5 ·{" "}
                      {testimonial.experiencedAt
                        ? adminDate.format(testimonial.experiencedAt)
                        : "sin fecha"}
                    </p>
                  </div>
                  <StatusBadge status={testimonial.status} />
                  <span className="text-[10px] text-ink-soft group-open:hidden">Editar</span>
                </summary>

                <div className="border-t border-forest/10 p-4">
                  <form
                    action={saveTestimonialAction}
                    className="space-y-3"
                   
                  >
                    <input type="hidden" name="id" value={testimonial.id} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="admin-label">Nombre</label>
                        <input
                          name="name"
                          defaultValue={testimonial.name}
                          className="admin-input"
                          required
                          maxLength={120}
                        />
                      </div>
                      <div>
                        <label className="admin-label">Tipo</label>
                        <select name="kind" defaultValue={testimonial.kind} className="admin-input">
                          <option value="CUSTOMER">Cliente / comprador</option>
                          <option value="COLLABORATOR">Colaboradora LINFOVIT</option>
                        </select>
                      </div>
                      <div>
                        <label className="admin-label">Cargo o vínculo (colaboradora)</label>
                        <input
                          name="role"
                          defaultValue={testimonial.role ?? ""}
                          className="admin-input"
                          maxLength={120}
                          placeholder="Ej. Asesora de servicio"
                        />
                      </div>
                      <div>
                        <label className="admin-label">Calificación (1-5)</label>
                        <input
                          name="rating"
                          type="number"
                          min={1}
                          max={5}
                          defaultValue={testimonial.rating}
                          className="admin-input"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="admin-label">Testimonio</label>
                        <textarea
                          name="quote"
                          defaultValue={testimonial.quote}
                          className="admin-input min-h-[90px]"
                          required
                          maxLength={1200}
                        />
                      </div>
                      <div>
                        <label className="admin-label">Fecha de la experiencia</label>
                        <input
                          name="experiencedAt"
                          type="date"
                          defaultValue={
                            testimonial.experiencedAt
                              ? testimonial.experiencedAt.toISOString().slice(0, 10)
                              : ""
                          }
                          className="admin-input"
                        />
                      </div>
                      <div>
                        <label className="admin-label">Estado</label>
                        <select name="status" defaultValue={testimonial.status} className="admin-input">
                          <option value="DRAFT">Borrador</option>
                          <option value="PUBLISHED">Publicado</option>
                          <option value="HIDDEN">Oculto</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="admin-label">
                          Referencia de autorización / consentimiento
                        </label>
                        <input
                          name="consentRef"
                          defaultValue={testimonial.consentRef ?? ""}
                          className="admin-input"
                          maxLength={300}
                          placeholder="Ej. correo firmado 2026-05-10, contrato de imagen, etc."
                        />
                        <p className="mt-1 text-[10px] text-ink-soft">
                          Obligatorio para publicar. No incluyas datos sensibles innecesarios.
                        </p>
                      </div>
                      <div>
                        <label className="admin-label">Orden</label>
                        <input
                          name="sortOrder"
                          type="number"
                          min={0}
                          defaultValue={testimonial.sortOrder}
                          className="admin-input"
                        />
                      </div>
                      <div className="flex flex-col justify-end gap-2 pb-1">
                        <label className="flex items-center gap-2 text-[11.5px] text-ink">
                          <input
                            type="checkbox"
                            name="featured"
                            defaultChecked={testimonial.featured}
                            className="h-4 w-4 accent-forest"
                          />
                          Destacar
                        </label>
                        {testimonial.photoUrl ? (
                          <label className="flex items-center gap-2 text-[11.5px] text-ink">
                            <input
                              type="checkbox"
                              name="deletePhoto"
                              className="h-4 w-4 accent-forest"
                            />
                            Quitar foto actual
                          </label>
                        ) : null}
                      </div>
                      <div className="sm:col-span-2">
                        <label className="admin-label">Foto (opcional, con autorización)</label>
                        <input
                          type="file"
                          name="photo"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          className="block w-full text-[10px] text-ink-soft file:mr-2 file:rounded file:border-0 file:bg-forest file:px-3 file:py-1.5 file:text-[10px] file:text-cream"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary !py-2.5 !text-[10px]">
                      Guardar testimonio
                    </button>
                  </form>

                  <form action={deleteTestimonialAction} className="mt-2">
                    <input type="hidden" name="id" value={testimonial.id} />
                    <button
                      type="submit"
                      className="w-full rounded-full border border-[#c47a6f]/40 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#9a3a2c]"
                    >
                      Eliminar testimonio
                    </button>
                  </form>
                </div>
              </details>
            ))
          )}
        </div>

        <Card title="Nuevo testimonio" description="Registra la autorización antes de publicar.">
          <form action={saveTestimonialAction} className="space-y-3">
            <div>
              <label className="admin-label">Nombre</label>
              <input name="name" className="admin-input" required maxLength={120} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Tipo</label>
                <select name="kind" className="admin-input" defaultValue="CUSTOMER">
                  <option value="CUSTOMER">Cliente / comprador</option>
                  <option value="COLLABORATOR">Colaboradora LINFOVIT</option>
                </select>
              </div>
              <div>
                <label className="admin-label">Calificación</label>
                <select name="rating" className="admin-input" defaultValue="5">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} estrellas
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="admin-label">Cargo o vínculo (si es colaboradora)</label>
              <input name="role" className="admin-input" maxLength={120} />
            </div>
            <div>
              <label className="admin-label">Testimonio</label>
              <textarea
                name="quote"
                className="admin-input min-h-[100px]"
                required
                maxLength={1200}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Fecha de la experiencia</label>
                <input name="experiencedAt" type="date" className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Estado</label>
                <select name="status" className="admin-input" defaultValue="DRAFT">
                  <option value="DRAFT">Borrador</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="HIDDEN">Oculto</option>
                </select>
              </div>
            </div>
            <div>
              <label className="admin-label">Referencia de autorización</label>
              <input
                name="consentRef"
                className="admin-input"
                maxLength={300}
                placeholder="Obligatorio para publicar"
              />
            </div>
            <div>
              <label className="admin-label">Foto (opcional)</label>
              <input
                type="file"
                name="photo"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="block w-full text-[10px] text-ink-soft file:mr-2 file:rounded file:border-0 file:bg-forest file:px-3 file:py-1.5 file:text-[10px] file:text-cream"
              />
            </div>
            <label className="flex items-center gap-2 text-[11.5px] text-ink">
              <input type="checkbox" name="featured" className="h-4 w-4 accent-forest" />
              Destacar en la sección
            </label>
            <button type="submit" className="btn btn-primary w-full !py-3 !text-[10.5px]">
              Crear testimonio
            </button>
          </form>
        </Card>
      </div>
    </>
  );
}
