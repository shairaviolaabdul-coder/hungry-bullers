export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
export type Size = (typeof SIZES)[number];

export const PRODUCT = {
  name: "Hungry Bullers Performance Jersey",
  subtitle: "Stay Hungry. Play Hard.",
  price: 360,
  currency: "PHP",
  description:
    "Moisture-wicking, breathable performance tee with laser-cut ventilation and 4-way stretch. Silicone bull logo, contoured side panels, woven hem label.",
  features: ["Moisture wicking", "Breathable", "Lightweight", "4-way stretch"],
};

export const NAME_CUSTOMIZATION_FEE = 0;

export const GCASH_INFO = {
  accountName: "SANDRALEI ANGULO",
};

export type DeliveryMethod = "pickup" | "delivery";

export type LineItem = {
  id: string;
  size: Size;
  qty: number;
  playerName: string;
};

export function createLineItem(overrides: Partial<Omit<LineItem, "id">> = {}): LineItem {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `item-${Math.random().toString(36).slice(2, 10)}`,
    size: "M",
    qty: 1,
    playerName: "",
    ...overrides,
  };
}

export function lineUnitPrice(item: LineItem) {
  return PRODUCT.price + (item.playerName.trim() ? NAME_CUSTOMIZATION_FEE : 0);
}

export function lineTotal(item: LineItem) {
  return lineUnitPrice(item) * item.qty;
}
