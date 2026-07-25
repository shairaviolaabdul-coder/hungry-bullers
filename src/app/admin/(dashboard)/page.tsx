import { requireAdminPage } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { AdminOrder, AdminStats } from "@/lib/admin/types";

const PAGE_SIZE = 50;

export default async function AdminDashboardPage() {
  // Cheap due to React cache() — already checked in the layout, but the
  // Next.js auth guide recommends checking again close to the data fetch.
  await requireAdminPage();

  const supabase = await createClient();

  const [ordersResult, statsResult] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1),
    supabase.rpc("get_admin_stats"),
  ]);

  if (ordersResult.error) {
    return (
      <p className="border-l-2 border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        Failed to load orders: {ordersResult.error.message}
      </p>
    );
  }

  return (
    <AdminDashboard
      initialOrders={(ordersResult.data ?? []) as AdminOrder[]}
      totalCount={ordersResult.count ?? 0}
      initialStats={statsResult.data as AdminStats | null}
    />
  );
}
