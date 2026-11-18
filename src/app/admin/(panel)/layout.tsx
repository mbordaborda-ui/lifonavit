import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return <AdminShell admin={{ name: session.admin.name, email: session.admin.email }}>{children}</AdminShell>;
}
