"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  audit,
  createAdminSession,
  destroyAdminSession,
  hashPassword,
  requireAdminAction,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type LoginState = { error?: string };

const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.7YQ2xq5v6yQ3E7t8uV9wX0yZ1a2b3c4";

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  const headerStore = await headers();
  const ip = clientIp(headerStore);
  const limit = rateLimit(`login:${ip}:${email}`, 6, 15 * 60 * 1000);
  if (!limit.allowed) {
    return {
      error: `Demasiados intentos. Espera ${Math.ceil(limit.retryAfterSeconds / 60)} minutos.`,
    };
  }

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const valid = admin
    ? await verifyPassword(password, admin.passwordHash)
    : await verifyPassword(password, DUMMY_HASH).catch(() => false);

  if (!admin || !valid || !admin.active) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createAdminSession(admin.id, admin.role);
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  await audit(admin.id, "LOGIN", "AdminUser", admin.id);

  const safeNext = next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin";
  redirect(safeNext);
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireAdminAction();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < 12) {
    redirect("/admin/configuracion?error=La+contraseña+debe+tener+al+menos+12+caracteres");
  }
  if (next !== confirm) {
    redirect("/admin/configuracion?error=Las+contraseñas+no+coinciden");
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.admin.id } });
  if (!admin || !(await verifyPassword(current, admin.passwordHash))) {
    redirect("/admin/configuracion?error=La+contraseña+actual+no+es+correcta");
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(next) },
  });
  await prisma.adminSession.updateMany({
    where: { adminId: admin.id, id: { not: session.sessionId } },
    data: { revokedAt: new Date() },
  });
  await audit(admin.id, "CHANGE_PASSWORD", "AdminUser", admin.id);

  redirect("/admin/configuracion?ok=Contraseña+actualizada");
}
