import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { syncOrderWithMp } from "@/lib/orders";
import { isMpConfigured } from "@/lib/mercadopago";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const ip = clientIp(request.headers);
  const limit = rateLimit(`sync:${ip}`, 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (!token || token.length < 20) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const order = await prisma.order.findUnique({
    where: { accessToken: token },
    select: { id: true, paymentStatus: true },
  });

  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (order.paymentStatus === "APPROVED" || !isMpConfigured()) {
    return NextResponse.json({ status: order.paymentStatus });
  }

  const updated = await syncOrderWithMp(order.id);
  return NextResponse.json({
    status: updated?.paymentStatus ?? order.paymentStatus,
  });
}
