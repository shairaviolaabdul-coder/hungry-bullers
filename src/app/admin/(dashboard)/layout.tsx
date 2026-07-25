import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/supabase/admin-guard";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdminPage();

  return <AdminShell adminEmail={session.email}>{children}</AdminShell>;
}
