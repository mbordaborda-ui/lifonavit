import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isProduction } from "@/lib/env";

export const ADMIN_COOKIE = "lfv_admin";
export const SESSION_HOURS = 8;

function secretKey(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET no está configurado o es demasiado corto (mínimo 32 caracteres).",
    );
  }
  return new TextEncoder().encode(secret);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createAdminSession(adminId: string, role: string) {
  const sessionId = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  const headerStore = await headers();

  const token = await new SignJWT({ sid: sessionId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());

  await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(token),
      adminId,
      expiresAt,
      ip: headerStore.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) ?? null,
      userAgent: headerStore.get("user-agent")?.slice(0, 255) ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (token) {
    await prisma.adminSession
      .updateMany({ where: { tokenHash: hashToken(token) }, data: { revokedAt: new Date() } })
      .catch(() => undefined);
  }
  cookieStore.delete(ADMIN_COOKIE);
}

export type AdminSession = {
  admin: { id: string; email: string; name: string; role: string };
  sessionId: string;
};

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;

    const session = await prisma.adminSession.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { admin: true },
    });

    if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) return null;
    if (!session.admin.active) return null;
    if (payload.sid !== undefined && typeof payload.sid === "string") {
      // La sesión de la base de datos es la fuente de verdad.
      if (session.adminId !== payload.sub) return null;
    }

    return {
      admin: {
        id: session.admin.id,
        email: session.admin.email,
        name: session.admin.name,
        role: session.admin.role,
      },
      sessionId: session.id,
    };
  } catch {
    return null;
  }
});

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function requireAdminAction(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("No autorizado. Inicie sesión nuevamente.");
  return session;
}

export async function audit(
  adminId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  detail?: string,
) {
  await prisma.auditLog
    .create({
      data: { adminId, action, entity, entityId, detail: detail?.slice(0, 500) },
    })
    .catch(() => undefined);
}
