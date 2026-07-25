export const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"] as const;
export type Size = (typeof SIZES)[number];

export const PRODUCT = {
  name: "Hungry Bullers Club Jersey",
  subtitle: "Stay Hungry. Play Hard.",
  price: 360,
  currency: "PHP",
  description:
    "The official Hungry Bullers Pickleball Club jersey — a short-sleeve performance tee in the club's signature black-and-lime colorway, printed front and back.",
};

export const NAME_CUSTOMIZATION_FEE = 0;
export const NAME_MAX_LENGTH = 16;

export const PICKUP_INFO = {
  location: "To be confirmed by the club",
  isFree: true,
};

export const TRUST_INFO = {
  verificationTimeframe: "Within 24 hours of submission",
  changePolicy:
    "To be confirmed — contact the club before production begins if you need to change your order.",
  contactName: "Hungry Bullers Pickleball Club",
};

export const GCASH_INFO = {
  accountName: "SANDRALEI ANGULO",
};

export type DeliveryMethod = "pickup" | "delivery";

export const DELIVERY_FEE = 0;

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
