import Image from "next/image";
import { PRODUCT, lineTotal, type DeliveryMethod, type LineItem } from "@/lib/mock-data";
import { computeCartTotals } from "./OrderSummary";

export function ConfirmationScreen({
  orderNumber,
  cart,
  delivery,
  fullName,
  onNewOrder,
}: {
  orderNumber: string;
  cart: LineItem[];
  delivery: DeliveryMethod;
  fullName: string;
  onNewOrder: () => void;
}) {
  const { total } = computeCartTotals(cart, delivery);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="relative h-16 w-16">
        <Image src="/logo.png" alt="Hungry Bullers logo" fill style={{ objectFit: "contain" }} />
      </div>

      <div className="flex h-14 w-14 items-center justify-center border-2 border-lime text-2xl text-lime">
        ✓
      </div>

      <div>
        <h1 className="font-display text-2xl tracking-wide text-white uppercase">
          Order Received
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Thanks{fullName ? `, ${fullName.split(" ")[0]}` : ""} — stay hungry, play hard.
          The Hungry Bullers team will verify your GCash payment and confirm within 24
          hours.
        </p>
      </div>

      <div className="w-full border border-white/10 bg-charcoal p-5 text-left text-sm">
        <div className="flex justify-between border-b border-white/10 pb-3">
          <span className="text-white/50 uppercase tracking-widest text-xs">
            Order No.
          </span>
          <span className="font-semibold text-lime">{orderNumber}</span>
        </div>
        <div className="mt-3 space-y-2 text-white/70">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {PRODUCT.name}
                <span className="block text-xs text-white/50">
                  {item.size} × {item.qty}
                  {item.playerName && (
                    <>
                      {" "}
                      — <span className="text-white">{item.playerName}</span>
                    </>
                  )}
                </span>
              </span>
              <span className="whitespace-nowrap">
                {PRODUCT.currency} {lineTotal(item).toLocaleString()}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-1">
            <span>Fulfillment</span>
            <span className="capitalize">
              {delivery === "pickup" ? "Club pickup" : "Delivery"}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-white">
            <span>Total paid</span>
            <span className="text-lime">
              {PRODUCT.currency} {total.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewOrder}
        className="h-12 w-full border border-lime text-sm font-semibold tracking-widest text-lime uppercase transition-colors hover:bg-lime hover:text-black"
      >
        Place Another Order
      </button>
    </div>
  );
}
