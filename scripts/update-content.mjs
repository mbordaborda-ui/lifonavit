import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const settings = {
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
  "content.final.title":
    "Mañana tendrás las mismas responsabilidades. Pero hoy puedes empezar a priorizarte.",
  "content.final.intro":
    "No importa si eres hombre o mujer, si trabajas sentado o de pie. Tu bienestar también merece un lugar en tu rutina. Conoce LINFOVIT y descubre sus cinco ingredientes botánicos.",
  "content.quotes.items": JSON.stringify([
    { text: "¿Cuántas horas de tu día dedicas a todo, menos a ti?" },
    { text: "No normalices dejar tu bienestar siempre para mañana." },
    { text: "Tu cuerpo merece la misma atención que le das a tus responsabilidades." },
    { text: "Empieza a construir hábitos que te hagan sentir bien contigo mismo." },
    { text: "Cinco botánicos que acompañan tu rutina de bienestar." },
    { text: "Haz espacio para ti. Conoce LINFOVIT." },
  ]),
};

for (const [key, value] of Object.entries(settings)) {
  await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
}

const faqSetting = await prisma.setting.findUnique({ where: { key: "content.faq.items" } });
if (faqSetting) {
  try {
    const faq = JSON.parse(faqSetting.value);
    for (const item of faq) {
      if (item.q?.toLowerCase().includes("envío")) {
        item.a =
          "Actualmente el envío es sin costo a toda Colombia. En el checkout confirmas tu departamento y ciudad, y el valor total antes de pagar.";
      }
    }
    await prisma.setting.update({
      where: { key: "content.faq.items" },
      data: { value: JSON.stringify(faq) },
    });
  } catch {
    // Si el JSON existente no es válido, se conserva.
  }
}

console.log("Contenido de la landing actualizado.");
