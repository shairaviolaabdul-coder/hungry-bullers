"use client";

import { useState } from "react";
import {
  ORDER_STATUSES,
  type AdminOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/admin/types";
import { formatPHP } from "@/lib/format";

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  pending: "border-white/25 text-white/60",
  verified: "border-lime text-lime",
  rejected: "border-red-500 text-red-400",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function OrderCard({
  order,
  onUpdated,
}: {
  order: AdminOrder;
  onUpdated: (order: AdminOrder) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(order.internal_notes ?? "");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);

  async function patchOrder(payload: Record<string, unknown>, tag: string) {
    setSaving(tag);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Update failed.");
      }
      onUpdated(result.order as AdminOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(null);
    }
  }

  async function viewProof() {
    setProofLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: order.payment_proof_path }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? "Could not load payment proof.");
      }
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load payment proof.");
    } finally {
      setProofLoading(false);
    }
  }

  return (
    <div className="border border-white/10 bg-charcoal">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-col gap-2 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <p className="font-semibold text-lime">{order.order_number}</p>
          <p className="truncate text-sm text-white/80">{order.customer_name}</p>
          <p className="text-xs text-white/40">{formatDate(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`border px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase ${PAYMENT_BADGE[order.payment_status]}`}
          >
            {order.payment_status}
          </span>
          <span className="border border-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-white/70 uppercase">
            {STATUS_LABEL[order.order_status]}
          </span>
          <span className="text-sm font-semibold text-white">
            {formatPHP(order.total_amount)}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="space-y-5 border-t border-white/10 p-4">
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[11px] tracking-widest text-white/40 uppercase">Contact</p>
              <p className="text-white/80">{order.mobile_number}</p>
              {order.messenger_name && <p className="text-white/60">Messenger: {order.messenger_name}</p>}
              <p className="text-white/60">{order.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] tracking-widest text-white/40 uppercase">Fulfillment</p>
              <p className="text-white/80 capitalize">{order.fulfillment_method}</p>
              {order.delivery_address && <p className="text-white/60">{order.delivery_address}</p>}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] tracking-widest text-white/40 uppercase">Line Items</p>
            <div className="space-y-1.5">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-white/70">
                  <span>
                    {item.size} x{item.quantity}
                    {item.player_name && (
                      <span className="text-white/40"> - {item.player_name}</span>
                    )}
                  </span>
                  <span>{formatPHP(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between border-t border-white/10 pt-2 text-sm text-white/50">
              <span>Subtotal / Delivery</span>
              <span>
                {formatPHP(order.merchandise_subtotal)} + {formatPHP(order.delivery_fee)}
              </span>
            </div>
          </div>

          {order.customer_notes && (
            <div>
              <p className="mb-1 text-[11px] tracking-widest text-white/40 uppercase">
                Customer Notes
              </p>
              <p className="text-sm text-white/70">{order.customer_notes}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={viewProof}
              disabled={proofLoading}
              className="h-9 border border-white/20 px-3 text-xs font-semibold tracking-widest text-white/80 uppercase transition-colors hover:border-lime hover:text-lime disabled:opacity-40"
            >
              {proofLoading ? "Loading..." : "View Payment Proof"}
            </button>

            <button
              type="button"
              onClick={() => patchOrder({ payment_status: "verified" }, "verify")}
              disabled={saving !== null}
              className="h-9 border border-lime px-3 text-xs font-semibold tracking-widest text-lime uppercase transition-colors hover:bg-lime hover:text-black disabled:opacity-40"
            >
              {saving === "verify" ? "Saving..." : "Verify Payment"}
            </button>

            <button
              type="button"
              onClick={() => patchOrder({ payment_status: "rejected" }, "reject")}
              disabled={saving !== null}
              className="h-9 border border-red-500 px-3 text-xs font-semibold tracking-widest text-red-400 uppercase transition-colors hover:bg-red-500 hover:text-black disabled:opacity-40"
            >
              {saving === "reject" ? "Saving..." : "Reject Payment"}
            </button>
          </div>

          <label className="block max-w-xs">
            <span className="mb-1.5 block text-[11px] tracking-widest text-white/40 uppercase">
              Order Status
            </span>
            <select
              value={order.order_status}
              onChange={(e) => patchOrder({ order_status: e.target.value }, "status")}
              disabled={saving !== null}
              className="h-9 w-full border border-white/15 bg-black px-2 text-sm text-white outline-none focus:border-lime"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-1.5 text-[11px] tracking-widest text-white/40 uppercase">
              Internal Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-white/15 bg-black p-2 text-sm text-white outline-none focus:border-lime"
              placeholder="Admin-only notes about this order..."
            />
            <button
              type="button"
              onClick={() => patchOrder({ internal_notes: notes }, "notes")}
              disabled={saving !== null}
              className="mt-2 h-8 border border-white/20 px-3 text-xs font-semibold tracking-widest text-white/70 uppercase transition-colors hover:border-lime hover:text-lime disabled:opacity-40"
            >
              {saving === "notes" ? "Saving..." : "Save Notes"}
            </button>
          </div>

          {error && (
            <p className="border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
