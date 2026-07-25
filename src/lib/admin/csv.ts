import type { AdminOrder } from "@/lib/admin/types";

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ordersToCsv(orders: AdminOrder[]): string {
  const headers = [
    "order_number",
    "created_at",
    "customer_name",
    "mobile_number",
    "messenger_name",
    "email",
    "fulfillment_method",
    "delivery_address",
    "sizes_and_quantities",
    "merchandise_subtotal",
    "delivery_fee",
    "total_amount",
    "payment_status",
    "order_status",
    "customer_notes",
  ];

  const rows = orders.map((order) => {
    const sizesSummary = order.order_items
      .map((item) => `${item.size} x${item.quantity}${item.player_name ? ` (${item.player_name})` : ""}`)
      .join("; ");

    return [
      order.order_number,
      order.created_at,
      order.customer_name,
      order.mobile_number,
      order.messenger_name ?? "",
      order.email,
      order.fulfillment_method,
      order.delivery_address ?? "",
      sizesSummary,
      order.merchandise_subtotal,
      order.delivery_fee,
      order.total_amount,
      order.payment_status,
      order.order_status,
      order.customer_notes ?? "",
    ]
      .map(csvEscape)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
