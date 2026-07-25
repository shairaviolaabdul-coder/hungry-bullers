"use client";

import { useMemo, useState } from "react";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type AdminOrder,
  type AdminStats,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/admin/types";
import { SIZES, type Size } from "@/lib/mock-data";
import { formatPHP } from "@/lib/format";
import { OrderCard } from "@/components/admin/OrderCard";
import { downloadCsv, ordersToCsv } from "@/lib/admin/csv";
import { createClient } from "@/lib/supabase/client";

type Filter<T extends string> = T | "all";

const EMPTY_STATS: AdminStats = {
  total_orders: 0,
  pending_payments: 0,
  verified_revenue: 0,
  total_shirts: 0,
  size_totals: {},
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-charcoal p-4">
      <p className="text-[11px] tracking-widest text-white/40 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold text-lime">{value}</p>
    </div>
  );
}

export function AdminDashboard({
  initialOrders,
  totalCount,
  initialStats,
}: {
  initialOrders: AdminOrder[];
  totalCount: number;
  initialStats: AdminStats | null;
}) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [stats, setStats] = useState<AdminStats>(initialStats ?? EMPTY_STATS);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState<Filter<Size>>("all");
  const [paymentFilter, setPaymentFilter] = useState<Filter<PaymentStatus>>("all");
  const [statusFilter, setStatusFilter] = useState<Filter<OrderStatus>>("all");

  const hasMore = orders.length < totalCount;

  async function refreshStats() {
    const supabase = createClient();
    const { data } = await supabase.rpc("get_admin_stats");
    if (data) setStats(data as AdminStats);
  }

  function handleUpdated(updated: AdminOrder) {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    void refreshStats();
  }

  async function loadMore() {
    setLoadingMore(true);
    setLoadMoreError(null);
    try {
      const res = await fetch(`/api/admin/orders?offset=${orders.length}&limit=50`);
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Could not load more orders.");
      }
      setOrders((prev) => [...prev, ...(result.orders as AdminOrder[])]);
    } catch (err) {
      setLoadMoreError(err instanceof Error ? err.message : "Could not load more orders.");
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (query) {
        const haystack = `${order.customer_name} ${order.mobile_number} ${order.order_number}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (sizeFilter !== "all" && !order.order_items.some((item) => item.size === sizeFilter)) {
        return false;
      }
      if (paymentFilter !== "all" && order.payment_status !== paymentFilter) {
        return false;
      }
      if (statusFilter !== "all" && order.order_status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [orders, search, sizeFilter, paymentFilter, statusFilter]);

  const isFiltering = search.trim() !== "" || sizeFilter !== "all" || paymentFilter !== "all" || statusFilter !== "all";

  function handleExportCsv() {
    const csv = ordersToCsv(filteredOrders);
    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`hungry-bullers-orders-${stamp}.csv`, csv);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Shirts Ordered" value={stats.total_shirts.toLocaleString()} />
        <StatCard
          label="Revenue (Verified)"
          value={formatPHP(stats.verified_revenue)}
        />
        <StatCard label="Total Orders" value={stats.total_orders.toLocaleString()} />
        <StatCard label="Pending Payments" value={stats.pending_payments.toLocaleString()} />
      </div>

      <div className="border border-white/10 bg-charcoal p-4">
        <p className="mb-3 text-[11px] tracking-widest text-white/40 uppercase">
          Shirts Ordered per Size
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {SIZES.map((size) => (
            <div key={size} className="border border-white/10 p-2 text-center">
              <p className="text-xs text-white/50">{size}</p>
              <p className="text-lg font-bold text-white">{stats.size_totals[size] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 border border-white/10 bg-charcoal p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="min-w-[12rem] flex-1">
          <span className="mb-1.5 block text-[11px] tracking-widest text-white/40 uppercase">
            Search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, or order number"
            className="h-10 w-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-lime"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-[11px] tracking-widest text-white/40 uppercase">
            Size
          </span>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value as Filter<Size>)}
            className="h-10 w-full border border-white/15 bg-black px-2 text-sm text-white outline-none focus:border-lime"
          >
            <option value="all">All sizes</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-[11px] tracking-widest text-white/40 uppercase">
            Payment
          </span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as Filter<PaymentStatus>)}
            className="h-10 w-full border border-white/15 bg-black px-2 text-sm text-white outline-none focus:border-lime"
          >
            <option value="all">All payment statuses</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-[11px] tracking-widest text-white/40 uppercase">
            Order Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Filter<OrderStatus>)}
            className="h-10 w-full border border-white/15 bg-black px-2 text-sm text-white outline-none focus:border-lime"
          >
            <option value="all">All order statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filteredOrders.length === 0}
          className="h-10 border border-lime px-4 text-xs font-semibold tracking-widest text-lime uppercase transition-colors hover:bg-lime hover:text-black disabled:opacity-40"
        >
          Export CSV
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-white/40">
          Showing {filteredOrders.length} of {orders.length} loaded orders
          {totalCount > orders.length && ` (${totalCount} total)`}
        </p>
        {isFiltering && hasMore && (
          <p className="border-l-2 border-lime/60 bg-white/5 px-3 py-2 text-xs text-white/60">
            Search and filters only apply to orders loaded so far — load more below to search the full history.
          </p>
        )}

        {filteredOrders.length === 0 ? (
          <p className="border border-white/10 bg-charcoal p-6 text-center text-sm text-white/40">
            No orders match your filters.
          </p>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onUpdated={handleUpdated} />
          ))
        )}

        {hasMore && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="h-10 border border-white/20 px-6 text-xs font-semibold tracking-widest text-white/80 uppercase transition-colors hover:border-lime hover:text-lime disabled:opacity-40"
            >
              {loadingMore ? "Loading…" : `Load More (${totalCount - orders.length} remaining)`}
            </button>
            {loadMoreError && <p className="mt-2 text-xs text-red-400">{loadMoreError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
