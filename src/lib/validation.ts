import { z } from "zod";
import { departments } from "@/lib/shipping";

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, "Escribe tu nombre completo.")
    .max(120, "El nombre es demasiado largo."),
  customerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Escribe un correo electrónico válido.")
    .max(160),
  customerPhone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, "").replace(/^57(?=\d{10}$)/, ""))
    .refine((value) => /^\d{7,10}$/.test(value), "Escribe un celular válido (10 dígitos)."),
  department: z
    .string()
    .trim()
    .refine((value) => departments.some((item) => item.name === value), "Selecciona un departamento."),
  city: z.string().trim().min(1, "Selecciona una ciudad.").max(80),
  address: z
    .string()
    .trim()
    .min(6, "Escribe la dirección de entrega.")
    .max(240, "La dirección es demasiado larga."),
  addressExtra: z.string().trim().max(160, "Máximo 160 caracteres.").optional().or(z.literal("")),
  notes: z.string().trim().max(300, "Máximo 300 caracteres.").optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        packId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(10),
      }),
    )
    .min(1, "Tu carrito está vacío.")
    .max(6),
  promoCode: z.string().trim().max(30).optional().or(z.literal("")),
  acceptTerms: z.literal(true, {
    message: "Debes aceptar los términos y la política de datos.",
  }),
  attribution: z
    .object({
      utm_source: z.string().max(120).optional(),
      utm_medium: z.string().max(120).optional(),
      utm_campaign: z.string().max(120).optional(),
      utm_content: z.string().max(120).optional(),
      utm_term: z.string().max(120).optional(),
      fbclid: z.string().max(200).optional(),
      gclid: z.string().max(200).optional(),
      ttclid: z.string().max(200).optional(),
    })
    .optional(),
  landingPath: z.string().max(300).optional(),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export const reviewSchema = z.object({
  orderNumber: z.string().trim().min(4).max(40),
  email: z.string().trim().toLowerCase().email("Correo inválido."),
  rating: z.coerce.number().int().min(1, "Selecciona una calificación.").max(5),
  title: z.string().trim().max(90).optional().or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(20, "Cuéntanos un poco más (mínimo 20 caracteres).")
    .max(1200, "Máximo 1200 caracteres."),
  city: z.string().trim().max(80).optional().or(z.literal("")),
});
