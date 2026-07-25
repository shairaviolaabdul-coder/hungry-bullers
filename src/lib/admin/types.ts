export type PaymentStatus = "pending" | "verified" | "rejected";

export type OrderStatus =
  | "new"
  | "preparing"
  | "ready_for_pickup"
  | "shipped"
  | "completed"
  | "cancelled";

export const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "verified", "rejected"];

export const ORDER_STATUSES: OrderStatus[] = [
  "new",
  "preparing",
  "ready_for_pickup",
  "shipped",
  "completed",
  "cancelled",
];

export type AdminOrderItem = {
  id: string;
  product_name: string;
  size: string;
  quantity: number;
  player_name: string | null;
  unit_price: number;
  customization_price: number;
  line_total: number;
};

export type AdminStats = {
  total_orders: number;
  pending_payments: number;
  verified_revenue: number;
  total_shirts: number;
  size_totals: Record<string, number>;
};

export type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  mobile_number: string;
  messenger_name: string | null;
  email: string;
  fulfillment_method: "pickup" | "delivery";
  delivery_address: string | null;
  merchandise_subtotal: number;
  customization_total: number;
  delivery_fee: number;
  total_amount: number;
  payment_reference: string | null;
  payment_proof_path: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  customer_notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: AdminOrderItem[];
};
