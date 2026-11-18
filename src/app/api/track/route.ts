import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set(["page_view", "ViewContent", "AddToCart", "InitiateCheckout"]);

function clean(value: unknown, max = 160): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function intOrNull(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 && n < 1_000_000_000 ? Math.round(n) : null;
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  const limit = rateLimit(`track:${ip}`, 150, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = (body ?? {}) as Record<string, unknown>;
  const name = clean(payload.name, 40);
  const sessionId = clean(payload.sessionId, 80);

  if (!name || !ALLOWED_EVENTS.has(name) || !sessionId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const attribution = (payload.attribution ?? {}) as Record<string, unknown>;

  await prisma.analyticsEvent
    .create({
      data: {
        name,
        sessionId,
        path: clean(payload.path, 300),
        packId: clean(payload.packId, 60),
        valueCop: intOrNull(payload.valueCop),
        utmSource: clean(attribution.utm_source, 120),
        utmMedium: clean(attribution.utm_medium, 120),
        utmCampaign: clean(attribution.utm_campaign, 120),
        referrer: clean(request.headers.get("referer"), 300),
      },
    })
    .catch(() => undefined);

  return NextResponse.json({ ok: true });
}
