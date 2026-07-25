import { PRODUCT, lineTotal, lineUnitPrice, type DeliveryMethod, type LineItem } from "@/lib/mock-data";

export function computeCartTotals(cart: LineItem[], delivery: DeliveryMethod) {
  const subtotal = cart.reduce((sum, item) => sum + lineTotal(item), 0);
  // Delivery is free — fulfillment method affects logistics only, not price.
  void delivery;
  return { subtotal, fee: 0, total: subtotal };
}

export function OrderSummary({
  cart,
  delivery,
}: {
  cart: LineItem[];
  delivery: DeliveryMethod;
}) {
  const { subtotal, total } = computeCartTotals(cart, delivery);

  return (
    <div className="border border-white/10 bg-charcoal p-5">
      <p className="mb-4 text-xs tracking-[0.25em] text-white/50 uppercase">
        Order Summary
      </p>
      <div className="space-y-3 text-sm">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-white/80">
            <span>
              {PRODUCT.name}
              <span className="block text-xs text-white/50">
                {item.size} × {item.qty}
                {item.playerName && (
                  <>
                    {" "}
                    — name:{" "}
                    <span className="text-lime">{item.playerName}</span>
                  </>
                )}
              </span>
            </span>
            <span className="whitespace-nowrap">
              {PRODUCT.currency} {lineTotal(item).toLocaleString()}
            </span>
          </div>
        ))}

        <div className="my-3 border-t border-white/10" />
        <div className="flex justify-between text-white/50">
          <span>Fulfillment</span>
          <span className="capitalize">
            {delivery === "pickup" ? "Club pickup" : "Delivery (free)"}
          </span>
        </div>
        <div className="my-3 border-t border-white/10" />
        <div className="flex justify-between text-white/60">
          <span>Merchandise subtotal</span>
          <span>
            {PRODUCT.currency} {subtotal.toLocaleString()}
          </span>
        </div>
        <div className="my-3 border-t border-white/10" />
        <div className="flex items-baseline justify-between">
          <span className="text-sm tracking-widest text-white uppercase">
            Final Total
          </span>
          <span className="text-2xl font-bold text-lime">
            {PRODUCT.currency} {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

export { lineUnitPrice };
