import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { shippingRates } from "../src/data/colombia.mjs";

const prisma = new PrismaClient();

const SETTINGS = {
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

const FAQ = [
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

const BENEFITS = [
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

const INGREDIENTS = [
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

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("Defina ADMIN_EMAIL y ADMIN_PASSWORD en .env antes de sembrar.");
  }
  if (adminPassword.length < 10) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 10 caracteres.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { name: process.env.ADMIN_NAME || "Administrador LINFOVIT", passwordHash },
    create: {
      email: adminEmail,
      name: process.env.ADMIN_NAME || "Administrador LINFOVIT",
      passwordHash,
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "drenaje-linfatico-linfovit" },
    update: {},
    create: {
      slug: "drenaje-linfatico-linfovit",
      name: "LINFOVIT Drenaje Linfático",
      tagline: "Fórmula botánica líquida · 60 ml",
      description:
        "Fórmula líquida de 5 ingredientes botánicos: diente de león, hibisco, hinojo, jengibre y té verde descafeinado. Presentación de 60 ml con gotero dosificador.",
      volumeMl: 60,
      sku: "LFV-60ML-001",
      stock: 120,
      imageFront: "/images/producto-frente.png",
      imageBack: "/images/producto-atras.png",
      imageAngle: "/images/producto-angulo.png",
    },
  });

  const packs = [
    {
      slug: "unidad",
      name: "Unidad",
      quantity: 1,
      priceCop: 49900,
      compareAtCop: 69900,
      badge: "Oferta fin de año",
      description: "1 frasco de 60 ml. Precio especial de fin de año.",
      sortOrder: 1,
      image: "/images/producto-frente.png",
    },
    {
      slug: "pack-doble",
      name: "Pack doble",
      quantity: 2,
      priceCop: 84900,
      compareAtCop: 139800,
      badge: "Recomendado",
      description: "2 frascos de 60 ml. Envío sin costo incluido.",
      sortOrder: 2,
      image: "/images/producto-angulo.png",
    },
    {
      slug: "pack-triple",
      name: "Pack triple",
      quantity: 3,
      priceCop: 104900,
      compareAtCop: 209700,
      badge: "Mejor precio por unidad",
      description: "3 frascos de 60 ml. El menor precio por frasco.",
      sortOrder: 3,
      image: "/images/producto-atras.png",
    },
  ];

  for (const pack of packs) {
    await prisma.pack.upsert({
      where: { slug: pack.slug },
      update: {},
      create: {
        productId: product.id,
        slug: pack.slug,
        name: pack.name,
        quantity: pack.quantity,
        priceCop: pack.priceCop,
        compareAtCop: pack.compareAtCop,
        badge: pack.badge,
        description: pack.description,
        sortOrder: pack.sortOrder,
      },
    });
  }

  for (const rate of shippingRates) {
    await prisma.shippingRate.upsert({
      where: { department_city: { department: rate.department, city: rate.city } },
      update: {},
      create: rate,
    });
  }

  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  await prisma.setting.upsert({
    where: { key: "content.faq.items" },
    update: {},
    create: { key: "content.faq.items", value: JSON.stringify(FAQ) },
  });
  await prisma.setting.upsert({
    where: { key: "content.benefits.items" },
    update: {},
    create: { key: "content.benefits.items", value: JSON.stringify(BENEFITS) },
  });
  await prisma.setting.upsert({
    where: { key: "content.ingredients.items" },
    update: {},
    create: { key: "content.ingredients.items", value: JSON.stringify(INGREDIENTS) },
  });
  await prisma.setting.upsert({
    where: { key: "content.quotes.items" },
    update: {},
    create: {
      key: "content.quotes.items",
      value: JSON.stringify([
        { text: "¿Cuántas horas de tu día dedicas a todo, menos a ti?" },
        { text: "No normalices dejar tu bienestar siempre para mañana." },
        { text: "Tu cuerpo merece la misma atención que le das a tus responsabilidades." },
        { text: "Empieza a construir hábitos que te hagan sentir bien contigo mismo." },
        { text: "Cinco botánicos que acompañan tu rutina de bienestar." },
        { text: "Haz espacio para ti. Conoce LINFOVIT." },
      ]),
    },
  });

  // No se siembran reseñas ni testimonios: deben ser reales y autorizados.
  console.log("Seed completado.");
  console.log(`Admin: ${adminEmail}`);
  console.log("Producto y packs creados. Reseñas y testimonios vacíos (por diseño).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
