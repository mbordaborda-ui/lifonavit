import { NextResponse, type NextRequest } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  if (!segments?.length) return new NextResponse("Not found", { status: 404 });

  const base = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "./uploads");
  const target = path.resolve(/* turbopackIgnore: true */ base, ...segments);

  // Protección contra path traversal.
  if (!target.startsWith(base + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = path.extname(target).toLowerCase();
  const mime = MIME[ext];
  if (!mime) return new NextResponse("Not found", { status: 404 });

  try {
    const info = await stat(target);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });

    const stream = Readable.toWeb(createReadStream(target)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
