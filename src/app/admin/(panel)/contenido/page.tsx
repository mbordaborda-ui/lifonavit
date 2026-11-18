import { getSettings, getFaq, getBenefits, getIngredients, getQuotes } from "@/lib/content";
import { AdminPageHeader, Card, Notice } from "@/components/admin/AdminUI";
import { updateSettingsAction } from "@/server/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const notice = await searchParams;
  const settings = await getSettings();
  const faq = getFaq(settings);
  const benefits = getBenefits(settings);
  const ingredients = getIngredients(settings);
  const quotes = getQuotes(settings);

  return (
    <>
      <AdminPageHeader
        title="Contenido de la tienda"
        description="Edita los textos de la landing y la información de contacto. Los cambios se publican al guardar."
      />
      <Notice ok={notice.ok} error={notice.error} />

      <form action={updateSettingsAction} className="space-y-4">
        <Card title="Anuncio y contacto">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="admin-label" htmlFor="site.announcement">
                Barra de anuncio
              </label>
              <input
                id="site.announcement"
                name="site.announcement"
                defaultValue={settings["site.announcement"]}
                className="admin-input"
                maxLength={240}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="site.contactEmail">
                Correo de contacto
              </label>
              <input
                id="site.contactEmail"
                name="site.contactEmail"
                type="email"
                defaultValue={settings["site.contactEmail"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="site.contactPhone">
                Teléfono
              </label>
              <input
                id="site.contactPhone"
                name="site.contactPhone"
                defaultValue={settings["site.contactPhone"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="site.contactHours">
                Horario de atención
              </label>
              <input
                id="site.contactHours"
                name="site.contactHours"
                defaultValue={settings["site.contactHours"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="site.city">
                Ciudad / ubicación
              </label>
              <input
                id="site.city"
                name="site.city"
                defaultValue={settings["site.city"]}
                className="admin-input"
              />
            </div>
          </div>
        </Card>

        <Card
          title="Vigencia de la oferta"
          description="La cuenta regresiva del hero se calcula hasta esta fecha y hora de Colombia. Al vencer se oculta y no se reinicia."
        >
          <div className="max-w-xs">
            <label className="admin-label" htmlFor="site.promoEndsAt">
              Fecha y hora de cierre
            </label>
            <input
              id="site.promoEndsAt"
              name="site.promoEndsAt"
              type="datetime-local"
              defaultValue={settings["site.promoEndsAt"]}
              className="admin-input"
            />
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
            Ejemplo: 31/12/2026, 23:59. La tienda asume automáticamente la hora de Colombia
            (UTC−5). El contador es real: no se reinicia cada día.
          </p>
        </Card>

        <Card
          title="Prueba social verificada"
          description="Solo ventas reales. Indica el periodo y la fuente, y conserva el reporte que las respalde."
        >
          <div className="grid gap-3 md:grid-cols-[0.5fr_1.25fr_0.6fr]">
            <div>
              <label className="admin-label" htmlFor="site.salesCount">
                Ventas
              </label>
              <input
                id="site.salesCount"
                name="site.salesCount"
                type="number"
                min={0}
                defaultValue={settings["site.salesCount"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="site.salesPeriod">
                Periodo
              </label>
              <input
                id="site.salesPeriod"
                name="site.salesPeriod"
                defaultValue={settings["site.salesPeriod"]}
                className="admin-input"
                maxLength={120}
                placeholder="del 30 de octubre al 5 de noviembre"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="site.salesSource">
                Fuente
              </label>
              <input
                id="site.salesSource"
                name="site.salesSource"
                defaultValue={settings["site.salesSource"]}
                className="admin-input"
                maxLength={60}
                placeholder="Dropi"
              />
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">
            Si el contador es 0, no se muestra en la tienda. No publiques cifras sin soporte.
            Actualiza el periodo cuando renueves el reporte.
          </p>
        </Card>

        <Card title="Hero">
          <div className="grid gap-3">
            <div>
              <label className="admin-label" htmlFor="content.hero.eyebrow">
                Antetítulo
              </label>
              <input
                id="content.hero.eyebrow"
                name="content.hero.eyebrow"
                defaultValue={settings["content.hero.eyebrow"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.hero.title">
                Titular
              </label>
              <input
                id="content.hero.title"
                name="content.hero.title"
                defaultValue={settings["content.hero.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.hero.accent">
                Frase de cierre del titular (cursiva dorada)
              </label>
              <input
                id="content.hero.accent"
                name="content.hero.accent"
                defaultValue={settings["content.hero.accent"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.hero.subtitle">
                Subtítulo
              </label>
              <textarea
                id="content.hero.subtitle"
                name="content.hero.subtitle"
                defaultValue={settings["content.hero.subtitle"]}
                className="admin-input min-h-[70px]"
                maxLength={500}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.hero.lead">
                Línea de producto
              </label>
              <input
                id="content.hero.lead"
                name="content.hero.lead"
                defaultValue={settings["content.hero.lead"]}
                className="admin-input"
                maxLength={300}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.hero.note">
                Nota educativa del hero
              </label>
              <textarea
                id="content.hero.note"
                name="content.hero.note"
                defaultValue={settings["content.hero.note"]}
                className="admin-input min-h-[60px]"
                maxLength={500}
              />
            </div>
          </div>
        </Card>

        <Card
          title="Sección de deseo y manifiesto"
          description="El bloque que conecta el problema con la fórmula y la idea central de marca."
        >
          <div className="grid gap-3">
            <div>
              <label className="admin-label" htmlFor="content.desire.title">
                Título
              </label>
              <input
                id="content.desire.title"
                name="content.desire.title"
                defaultValue={settings["content.desire.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.desire.intro">
                Primer párrafo
              </label>
              <textarea
                id="content.desire.intro"
                name="content.desire.intro"
                defaultValue={settings["content.desire.intro"]}
                className="admin-input min-h-[70px]"
                maxLength={600}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.desire.body">
                Segundo párrafo
              </label>
              <textarea
                id="content.desire.body"
                name="content.desire.body"
                defaultValue={settings["content.desire.body"]}
                className="admin-input min-h-[90px]"
                maxLength={900}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.manifesto.quote">
                Manifiesto (tarjeta verde)
              </label>
              <textarea
                id="content.manifesto.quote"
                name="content.manifesto.quote"
                defaultValue={settings["content.manifesto.quote"]}
                className="admin-input min-h-[70px]"
                maxLength={400}
              />
            </div>
          </div>
        </Card>

        <Card title="Cierre de la página">
          <div className="grid gap-3">
            <div>
              <label className="admin-label" htmlFor="content.final.title">
                Titular final
              </label>
              <input
                id="content.final.title"
                name="content.final.title"
                defaultValue={settings["content.final.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.final.intro">
                Texto final
              </label>
              <textarea
                id="content.final.intro"
                name="content.final.intro"
                defaultValue={settings["content.final.intro"]}
                className="admin-input min-h-[70px]"
                maxLength={600}
              />
            </div>
          </div>
        </Card>

        <Card title="Secciones">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="admin-label" htmlFor="content.problem.title">
                Título del problema
              </label>
              <input
                id="content.problem.title"
                name="content.problem.title"
                defaultValue={settings["content.problem.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.problem.intro">
                Introducción del problema
              </label>
              <input
                id="content.problem.intro"
                name="content.problem.intro"
                defaultValue={settings["content.problem.intro"]}
                className="admin-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label" htmlFor="content.problem.closing">
                Cierre de la sección de identificación
              </label>
              <textarea
                id="content.problem.closing"
                name="content.problem.closing"
                defaultValue={settings["content.problem.closing"]}
                className="admin-input min-h-[70px]"
                maxLength={400}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.ingredients.title">
                Título de ingredientes
              </label>
              <input
                id="content.ingredients.title"
                name="content.ingredients.title"
                defaultValue={settings["content.ingredients.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.ingredients.intro">
                Introducción de ingredientes
              </label>
              <input
                id="content.ingredients.intro"
                name="content.ingredients.intro"
                defaultValue={settings["content.ingredients.intro"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.benefits.title">
                Título de beneficios
              </label>
              <input
                id="content.benefits.title"
                name="content.benefits.title"
                defaultValue={settings["content.benefits.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.testimonials.title">
                Título de experiencias
              </label>
              <input
                id="content.testimonials.title"
                name="content.testimonials.title"
                defaultValue={settings["content.testimonials.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.offers.title">
                Título de ofertas
              </label>
              <input
                id="content.offers.title"
                name="content.offers.title"
                defaultValue={settings["content.offers.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.offers.subtitle">
                Subtítulo de ofertas
              </label>
              <input
                id="content.offers.subtitle"
                name="content.offers.subtitle"
                defaultValue={settings["content.offers.subtitle"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.faq.title">
                Título de preguntas frecuentes
              </label>
              <input
                id="content.faq.title"
                name="content.faq.title"
                defaultValue={settings["content.faq.title"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.faq.intro">
                Introducción de preguntas
              </label>
              <input
                id="content.faq.intro"
                name="content.faq.intro"
                defaultValue={settings["content.faq.intro"]}
                className="admin-input"
              />
            </div>
          </div>
        </Card>

        <Card
          title="Listas editables (JSON)"
          description="Mantén la estructura. Cualquier cambio inválido se rechaza y no afecta la tienda."
        >
          <div className="space-y-4">
            <div>
              <label className="admin-label" htmlFor="content.faq.items">
                Preguntas frecuentes [{`"q"`}, {`"a"`}]
              </label>
              <textarea
                id="content.faq.items"
                name="content.faq.items"
                defaultValue={JSON.stringify(faq, null, 2)}
                className="admin-input min-h-[260px] font-mono !text-[11px]"
                spellCheck={false}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.benefits.items">
                Beneficios [{`"title"`}, {`"text"`}]
              </label>
              <textarea
                id="content.benefits.items"
                name="content.benefits.items"
                defaultValue={JSON.stringify(benefits, null, 2)}
                className="admin-input min-h-[180px] font-mono !text-[11px]"
                spellCheck={false}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.ingredients.items">
                Ingredientes [{`"name"`}, {`"latin"`}, {`"text"`}]
              </label>
              <textarea
                id="content.ingredients.items"
                name="content.ingredients.items"
                defaultValue={JSON.stringify(ingredients, null, 2)}
                className="admin-input min-h-[220px] font-mono !text-[11px]"
                spellCheck={false}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="content.quotes.items">
                Frases comerciales [{`"text"`}]
              </label>
              <textarea
                id="content.quotes.items"
                name="content.quotes.items"
                defaultValue={JSON.stringify(quotes, null, 2)}
                className="admin-input min-h-[180px] font-mono !text-[11px]"
                spellCheck={false}
              />
              <p className="mt-1 text-[10px] text-ink-soft">
                La tercera frase se usa como banda editorial antes de los packs.
              </p>
            </div>
          </div>
        </Card>

        <Card
          title="Información legal y sanitaria"
          description="Estos datos aparecen en el footer y en las políticas. No inventes registros: publica solo información verificada."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="admin-label" htmlFor="site.nit">
                NIT / identificación legal
              </label>
              <input
                id="site.nit"
                name="site.nit"
                defaultValue={settings["site.nit"]}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="site.sanitaryRegistry">
                Registro sanitario
              </label>
              <input
                id="site.sanitaryRegistry"
                name="site.sanitaryRegistry"
                defaultValue={settings["site.sanitaryRegistry"]}
                className="admin-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label" htmlFor="site.manufacturer">
                Fabricante
              </label>
              <textarea
                id="site.manufacturer"
                name="site.manufacturer"
                defaultValue={settings["site.manufacturer"]}
                className="admin-input min-h-[70px]"
              />
            </div>
          </div>
        </Card>

        <div className="sticky bottom-4 flex justify-end">
          <button type="submit" className="btn btn-primary !px-6 !py-3 !text-[10.5px] shadow-lift">
            Publicar cambios
          </button>
        </div>
      </form>
    </>
  );
}
