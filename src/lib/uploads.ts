import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const UPLOAD_FOLDERS = ["products", "reviews", "testimonials", "content"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 4 * 1024 * 1024;

function uploadRoot(): string {
  return path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "./uploads");
}

export async function saveImage(
  file: File,
  folder: UploadFolder,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!file || file.size === 0) return { ok: false, error: "Selecciona una imagen." };
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, error: "Formato no permitido. Usa JPG, PNG, WEBP o AVIF." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "La imagen supera 4 MB. Comprímela e inténtalo de nuevo." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const image = sharp(buffer, { failOn: "none" }).rotate();
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      return { ok: false, error: "El archivo no es una imagen válida." };
    }

    const name = `${Date.now().toString(36)}-${randomBytes(5).toString("hex")}.webp`;
    const directory = path.join(uploadRoot(), folder);
    await mkdir(directory, { recursive: true });

    const output = await image
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();

    await writeFile(path.join(directory, name), output);
    return { ok: true, url: `/api/media/${folder}/${name}` };
  } catch {
    return { ok: false, error: "No pudimos procesar la imagen. Intenta con otro archivo." };
  }
}

export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/api/media/")) return;
  const relative = url.replace("/api/media/", "");
  const target = path.resolve(/* turbopackIgnore: true */ uploadRoot(), relative);
  if (!target.startsWith(uploadRoot() + path.sep)) return;
  await unlink(target).catch(() => undefined);
}
