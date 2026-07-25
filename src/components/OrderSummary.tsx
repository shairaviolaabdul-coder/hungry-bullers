import { lineTotal, lineUnitPrice, type DeliveryMethod, type LineItem } from "@/lib/mock-data";
import { formatPHP } from "@/lib/format";

export function computeCartTotals(cart: LineItem[], delivery: DeliveryMethod) {
  const subtotal = cart.reduce((sum, item) => sum + lineTotal(item), 0);
  const customizationFee = 0; // name-on-back is currently free
  // Delivery is free — fulfillment method affects logistics only, not price.
  void delivery;
  const deliveryFee = 0;
  return { subtotal, customizationFee, fee: deliveryFee, total: subtotal + customizationFee + deliveryFee };
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

      <div className="divide-y divide-white/10">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between gap-4 py-3 first:pt-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                Size {item.size} × {item.qty}
              </p>
              <p className="text-xs text-white/50">
                Name on back:{" "}
                {item.playerName ? (
                  <span className="text-lime">{item.playerName}</span>
                ) : (
                  <span className="text-white/30">none</span>
                )}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold whitespace-nowrap text-white">
              {formatPHP(lineTotal(item))}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between text-white/60">
          <span>Merchandise subtotal</span>
          <span>{formatPHP(subtotal)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
        <span className="text-sm tracking-widest text-white uppercase">
          Final Total
        </span>
        <span className="text-2xl font-bold text-lime">{formatPHP(total)}</span>
      </div>
    </div>
  );
}

export { lineUnitPrice };
