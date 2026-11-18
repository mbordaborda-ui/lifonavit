import { cache } from "react";
import { prisma } from "@/lib/db";

/** Valores por defecto: se usan si la base de datos aún no tiene la clave. */
export const DEFAULT_SETTINGS: Record<string, string> = {
  "site.brandName": "LINFOVIT",
  "site.legalName": "LINFOVIT",
  "site.contactEmail": "hola@linfovit.co",
  "site.contactPhone": "+57 300 000 0000",
  "site.contactHours": "Lunes a viernes, 8:00 a. m. – 5:00 p. m.",
  "site.city": "Bogotá, Colombia",
  "site.manufacturer": "Información del fabricante pendiente de verificación documental.",
  "site.sanitaryRegistry": "Registro sanitario pendiente de verificación documental.",
  "site.nit": "NIT pendiente de verificación documental.",
  "site.freeShippingOverCop": "1",
  "site.shippingNote":
    "Envío sin costo a toda Colombia. Despachamos desde Bogotá en 1 a 2 días hábiles.",
  "site.announcement":
    "Oferta de fin de año: $49.900 (antes $69.900) · Termina el 31 de diciembre · Hasta agotar unidades · Envío gratis",
  "site.promoEndsAt": "2026-12-31T23:59",
  "site.salesCount": "2005",
  "site.salesPeriod": "del 30 de octubre al 5 de noviembre",
  "site.salesSource": "Dropi",
  "site.privacyEmail": "datos@linfovit.co",
  "content.hero.eyebrow": "Bienestar botánico · Para hombres y mujeres",
  "content.hero.title": "¿Llevas tanto tiempo dejando tu bienestar para después?",
  "content.hero.accent": "que ya lo convertiste en costumbre.",
  "content.hero.subtitle":
    "Trabajo, responsabilidades, largas jornadas y poco tiempo para ti. Es momento de hacer espacio para nuevos hábitos de autocuidado.",
  "content.hero.lead":
    "Conoce LINFOVIT. 5 ingredientes botánicos en una fórmula líquida de 60 ml.",
  "content.hero.note":
    "LINFOVIT es un producto botánico de bienestar, no un medicamento. No sustituye el diagnóstico ni el tratamiento de un profesional de la salud.",
  "content.problem.title": "Tu día termina. Pero ¿realmente te has dedicado tiempo?",
  "content.problem.intro": "Piensa en cómo es tu rutina:",
  "content.problem.closing":
    "No esperes a que cuidarte se convierta en una obligación. Tu bienestar merece un espacio en tu día, independientemente de tu edad, trabajo o estilo de vida.",
  "content.desire.title": "Tu cuerpo te acompaña todos los días. ¿Qué estás haciendo por él?",
  "content.desire.intro":
    "No importa si trabajas sentado, pasas horas de pie, conduces durante largos trayectos o tienes una agenda llena de responsabilidades. Tu bienestar también necesita atención.",
  "content.desire.body":
    "No se trata de buscar resultados milagrosos. Se trata de construir hábitos, escuchar tu cuerpo y dedicarte pequeños momentos de autocuidado. LINFOVIT quiere acompañarte en ese propósito, con una fórmula líquida de cinco ingredientes botánicos que puedes incorporar a tu rutina siguiendo las indicaciones de su etiquetado.",
  "content.manifesto.quote":
    "No importa cuánto tiempo dediques a tus responsabilidades. Siempre debes encontrar un momento para tu bienestar.",
  "content.ingredients.title": "Cinco ingredientes botánicos. Una decisión para tu bienestar.",
  "content.ingredients.intro":
    "Conoce una fórmula que reúne cinco ingredientes vegetales en una presentación práctica: 60 ml de fórmula líquida con gotero dosificador. Menos complicaciones. Más intención en tus hábitos de autocuidado.",
  "content.benefits.title": "Una rutina botánica para complementar tu bienestar.",
  "content.testimonials.title": "Experiencias reales. Personas reales.",
  "content.offers.title": "Elige tu rutina LINFOVIT.",
  "content.offers.subtitle":
    "Tres formas de empezar. Elige la que mejor se adapte a tu ritmo y recibe tu frasco en casa.",
  "content.final.title":
    "Mañana tendrás las mismas responsabilidades. Pero hoy puedes empezar a priorizarte.",
  "content.final.intro":
    "No importa si eres hombre o mujer, si trabajas sentado o de pie. Tu bienestar también merece un lugar en tu rutina. Conoce LINFOVIT y descubre sus cinco ingredientes botánicos.",
  "content.faq.title": "Preguntas frecuentes",
  "content.faq.intro":
    "Resolvemos las dudas más comunes antes de que incorpores LINFOVIT a tu rutina.",
};

export type FaqItem = { q: string; a: string };
export type BenefitItem = { title: string; text: string };
export type IngredientItem = { name: string; latin: string; text: string };
export type QuoteItem = { text: string };

export const DEFAULT_QUOTES: QuoteItem[] = [
  { text: "¿Cuántas horas de tu día dedicas a todo, menos a ti?" },
  { text: "No normalices dejar tu bienestar siempre para mañana." },
  { text: "Tu cuerpo merece la misma atención que le das a tus responsabilidades." },
  { text: "Empieza a construir hábitos que te hagan sentir bien contigo mismo." },
  { text: "Cinco botánicos que acompañan tu rutina de bienestar." },
  { text: "Haz espacio para ti. Conoce LINFOVIT." },
];

export const DEFAULT_FAQ: FaqItem[] = [
  {
    q: "¿Qué es LINFOVIT?",
    a: "LINFOVIT es un producto botánico líquido de 60 ml con gotero, elaborado con diente de león, hibisco, hinojo, jengibre y té verde descafeinado. Es un complemento de bienestar y no un medicamento ni un tratamiento médico.",
  },
  {
    q: "¿Qué ingredientes contiene?",
    a: "Diente de león, hibisco, hinojo, jengibre y té verde descafeinado, en una fórmula líquida lista para usar con gotero.",
  },
  {
    q: "¿Cuántos mililitros contiene?",
    a: "Cada frasco contiene 60 ml de fórmula líquida con gotero dosificador.",
  },
  {
    q: "¿Cómo se utiliza?",
    a: "La dosis indicada en el etiquetado aprobado es de 30 gotas (1 ml), tres veces al día. No exceda la dosis indicada. Agite antes de usar.",
  },
  {
    q: "¿Cuánto cuesta el envío?",
    a: "Actualmente el envío es sin costo a toda Colombia. En el checkout confirmas tu departamento y ciudad, y el valor total antes de pagar.",
  },
  {
    q: "¿Cuáles son los medios de pago?",
    a: "El pago se procesa con Mercado Pago Colombia: tarjetas de crédito y débito, PSE y los demás medios habilitados por Mercado Pago. No almacenamos datos de tarjetas.",
  },
  {
    q: "¿Cómo puedo rastrear mi pedido?",
    a: "Cuando tu pedido sea despachado recibirás el número de guía por correo electrónico. También puedes consultar el estado en la página de tu pedido usando el enlace que enviamos al confirmar la compra.",
  },
  {
    q: "¿Cuáles son las recomendaciones de seguridad?",
    a: "Este producto es un complemento de bienestar, no un medicamento. No exceda la dosis indicada. Manténgase fuera del alcance de los niños. Conservarse en lugar fresco y seco, protegido de la luz. No lo utilice si presenta alergia a alguno de sus ingredientes. Si presenta síntomas que persisten o empeoran, consulte a un profesional de la salud.",
  },
  {
    q: "¿Puedo utilizarlo si tomo medicamentos?",
    a: "Consulte con su médico o profesional de la salud antes de usarlo si toma medicamentos, tiene una enfermedad crónica o está en tratamiento. Algunos ingredientes botánicos pueden interactuar con medicamentos.",
  },
  {
    q: "¿Qué debo hacer si estoy embarazada o lactando?",
    a: "No utilice este producto durante el embarazo o la lactancia sin la autorización previa de su médico o profesional de la salud.",
  },
];

export const DEFAULT_BENEFITS: BenefitItem[] = [
  {
    title: "Cinco ingredientes botánicos",
    text: "Una fórmula con diente de león, hibisco, hinojo, jengibre y té verde descafeinado.",
  },
  {
    title: "Líquida y con gotero",
    text: "Presentación de 60 ml con dosificador para una medida precisa, sin cápsulas ni preparaciones.",
  },
  {
    title: "Fácil de incorporar",
    text: "Tres tomas al día dentro de tu rutina. 30 gotas (1 ml) por toma, sin exceder la dosis indicada.",
  },
  {
    title: "Elaborado en Colombia",
    text: "Producción local con selección de materias primas botánicas y control de calidad por lote.",
  },
];

export const DEFAULT_INGREDIENTS: IngredientItem[] = [
  {
    name: "Diente de león",
    latin: "Taraxacum officinale",
    text: "Planta tradicionalmente asociada al manejo de líquidos.",
  },
  {
    name: "Hibisco",
    latin: "Hibiscus sabdariffa",
    text: "Fuente vegetal de polifenoles y antocianinas.",
  },
  {
    name: "Hinojo",
    latin: "Foeniculum vulgare",
    text: "Ingrediente botánico con tradición de uso digestivo.",
  },
  {
    name: "Jengibre",
    latin: "Zingiber officinale",
    text: "Ingrediente ampliamente utilizado en tradiciones de bienestar digestivo.",
  },
  {
    name: "Té verde descafeinado",
    latin: "Camellia sinensis",
    text: "Contiene catequinas y otros compuestos vegetales.",
  },
];

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await prisma.setting.findMany();
    const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
    return { ...DEFAULT_SETTINGS, ...stored };
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export function getSetting(settings: Record<string, string>, key: string, fallback = ""): string {
  return settings[key] ?? DEFAULT_SETTINGS[key] ?? fallback;
}

function parseList<T>(raw: string | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return fallback;
    return parsed as T[];
  } catch {
    return fallback;
  }
}

export function getFaq(settings: Record<string, string>): FaqItem[] {
  return parseList(settings["content.faq.items"], DEFAULT_FAQ);
}

export function getBenefits(settings: Record<string, string>): BenefitItem[] {
  return parseList(settings["content.benefits.items"], DEFAULT_BENEFITS);
}

export function getIngredients(settings: Record<string, string>): IngredientItem[] {
  return parseList(settings["content.ingredients.items"], DEFAULT_INGREDIENTS);
}

export function getQuotes(settings: Record<string, string>): QuoteItem[] {
  return parseList(settings["content.quotes.items"], DEFAULT_QUOTES);
}

export function getFreeShippingOver(settings: Record<string, string>): number {
  const value = Number.parseInt(settings["site.freeShippingOverCop"] ?? "0", 10);
  return Number.isFinite(value) ? value : 0;
}
