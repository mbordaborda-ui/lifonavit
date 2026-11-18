import Image from "next/image";
import { prisma } from "@/lib/db";
import {
  AdminPageHeader,
  Card,
  Notice,
  adminDate,
} from "@/components/admin/AdminUI";
import {
  createPackAction,
  togglePackAction,
  updatePackAction,
  updateProductAction,
} from "@/server/actions/admin";
import { formatCop, formatCopPerUnit } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const notice = await searchParams;

  const product = await prisma.product.findFirst({
    orderBy: { createdAt: "asc" },
    include: { packs: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product) {
    return (
      <>
        <AdminPageHeader title="Producto y packs" />
        <Card>
          <p className="text-[13px] text-ink-soft">
            No hay producto configurado. Ejecuta{" "}
            <code className="rounded bg-mist px-1.5 py-0.5">npm run db:seed</code> para crear el
            producto base.
          </p>
        </Card>
      </>
    );
  }

  const images: { label: string; field: string; src: string | null; alt: string }[] = [
    { label: "Frente", field: "imageFront", src: product.imageFront, alt: "Frasco de frente" },
    { label: "Reverso", field: "imageBack", src: product.imageBack, alt: "Etiqueta trasera" },
    { label: "Ángulo", field: "imageAngle", src: product.imageAngle, alt: "Frasco en ángulo" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Producto y packs"
        description="Fotografías, precios, inventario y presentaciones. Los cambios se reflejan en la tienda al guardar."
      />
      <Notice ok={notice.ok} error={notice.error} />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card title="Ficha del producto">
          <form action={updateProductAction} className="space-y-4">
            <input type="hidden" name="id" value={product.id} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="admin-label" htmlFor="name">
                  Nombre
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={product.name}
                  className="admin-input"
                  required
                  maxLength={160}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label" htmlFor="tagline">
                  Línea descriptiva
                </label>
                <input
                  id="tagline"
                  name="tagline"
                  defaultValue={product.tagline}
                  className="admin-input"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="sku">
                  SKU
                </label>
                <input
                  id="sku"
                  name="sku"
                  defaultValue={product.sku}
                  className="admin-input"
                  maxLength={60}
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="volumeMl">
                  Contenido (ml)
                </label>
                <input
                  id="volumeMl"
                  name="volumeMl"
                  type="number"
                  min={1}
                  max={1000}
                  defaultValue={product.volumeMl}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label" htmlFor="stock">
                  Inventario (frascos)
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min={0}
                  defaultValue={product.stock}
                  className="admin-input"
                />
                <p className="mt-1 text-[10px] text-ink-soft">
                  Se descuenta automáticamente al confirmarse un pago.
                </p>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={product.active}
                    className="h-4 w-4 accent-forest"
                  />
                  Producto visible en la tienda
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="admin-label" htmlFor="description">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={product.description}
                  className="admin-input min-h-[100px]"
                  maxLength={3000}
                />
              </div>
            </div>

            <div>
              <p className="admin-label">Fotografías</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {images.map((image) => (
                  <div key={image.field} className="rounded-lg border border-forest/10 bg-cream p-2.5">
                    <div className="relative mx-auto h-32 w-24 overflow-hidden rounded bg-white">
                      {image.src ? (
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="96px"
                          unoptimized
                          className="object-contain"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-[10px] text-ink-soft">
                          Sin imagen
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-forest">{image.label}</p>
                    <input
                      type="file"
                      name={image.field}
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="mt-1 block w-full text-[10px] text-ink-soft file:mr-1 file:rounded file:border-0 file:bg-forest file:px-2 file:py-1 file:text-[9px] file:text-cream"
                    />
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-ink-soft">
                JPG, PNG, WEBP o AVIF · máx. 4 MB. Las imágenes se convierten a WEBP y se sirven de
                forma optimizada.
              </p>
            </div>

            <button type="submit" className="btn btn-primary !py-3 !text-[10.5px]">
              Guardar producto
            </button>
          </form>
        </Card>

        <div className="space-y-4">
          {product.packs.map((pack) => {
            const saving = pack.compareAtCop ? pack.compareAtCop - pack.priceCop : 0;
            return (
              <Card
                key={pack.id}
                title={pack.name}
                description={`${pack.quantity} frascos · actualizado ${adminDate.format(pack.updatedAt)}`}
                action={
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase ${
                      pack.active ? "bg-[#e7f0e6] text-forest" : "bg-[#f1f1f0] text-[#62665f]"
                    }`}
                  >
                    {pack.active ? "Activo" : "Inactivo"}
                  </span>
                }
              >
                <form action={updatePackAction} className="space-y-3">
                  <input type="hidden" name="id" value={pack.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="admin-label">Nombre</label>
                      <input
                        name="name"
                        defaultValue={pack.name}
                        className="admin-input"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label className="admin-label">Frascos</label>
                      <input
                        name="quantity"
                        type="number"
                        min={1}
                        max={12}
                        defaultValue={pack.quantity}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Orden</label>
                      <input
                        name="sortOrder"
                        type="number"
                        min={0}
                        defaultValue={pack.sortOrder}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Precio (COP)</label>
                      <input
                        name="priceCop"
                        type="number"
                        min={1}
                        step={100}
                        defaultValue={pack.priceCop}
                        className="admin-input"
                      />
                    </div>
                    <div>
                      <label className="admin-label">Precio referencia</label>
                      <input
                        name="compareAtCop"
                        type="number"
                        min={0}
                        step={100}
                        defaultValue={pack.compareAtCop ?? 0}
                        className="admin-input"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="admin-label">Etiqueta (opcional)</label>
                      <input
                        name="badge"
                        defaultValue={pack.badge ?? ""}
                        className="admin-input"
                        maxLength={80}
                        placeholder="Recomendado"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="admin-label">Descripción corta</label>
                      <input
                        name="description"
                        defaultValue={pack.description ?? ""}
                        className="admin-input"
                        maxLength={300}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-[11.5px] text-ink">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={pack.active}
                        className="h-4 w-4 accent-forest"
                      />
                      Disponible
                    </label>
                    <p className="text-[10px] text-ink-soft">
                      {formatCopPerUnit(pack.priceCop, pack.quantity)} / frasco
                      {saving > 0 ? ` · ahorro ${formatCop(saving)}` : ""}
                    </p>
                  </div>
                  <button type="submit" className="btn btn-primary w-full !py-2.5 !text-[10px]">
                    Guardar pack
                  </button>
                </form>

                <form action={togglePackAction} className="mt-2">
                  <input type="hidden" name="id" value={pack.id} />
                  <button
                    type="submit"
                    className="w-full rounded-full border border-forest/15 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft hover:border-forest/35 hover:text-forest"
                  >
                    {pack.active ? "Desactivar de la tienda" : "Activar en la tienda"}
                  </button>
                </form>
              </Card>
            );
          })}
        </div>
      </div>

      <Card title="Crear nuevo pack" className="mt-4">
        <form action={createPackAction} className="grid gap-3 md:grid-cols-[1.4fr_0.7fr_0.8fr_0.8fr_auto] md:items-end">
          <input type="hidden" name="productId" value={product.id} />
          <div>
            <label className="admin-label" htmlFor="pack-name">
              Nombre
            </label>
            <input id="pack-name" name="name" className="admin-input" required maxLength={100} />
          </div>
          <div>
            <label className="admin-label" htmlFor="pack-quantity">
              Frascos
            </label>
            <input
              id="pack-quantity"
              name="quantity"
              type="number"
              min={1}
              max={12}
              defaultValue={1}
              className="admin-input"
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="pack-price">
              Precio (COP)
            </label>
            <input
              id="pack-price"
              name="priceCop"
              type="number"
              min={1}
              step={100}
              className="admin-input"
              required
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="pack-slug">
              Slug (opcional)
            </label>
            <input id="pack-slug" name="slug" className="admin-input" maxLength={60} />
          </div>
          <button type="submit" className="btn btn-outline !px-4 !py-2.5 !text-[10px]">
            Crear
          </button>
        </form>
      </Card>
    </>
  );
}
