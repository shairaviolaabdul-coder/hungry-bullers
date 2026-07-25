import Image from "next/image";
import { TRUST_INFO, lineTotal, type DeliveryMethod, type LineItem } from "@/lib/mock-data";
import { formatPHP } from "@/lib/format";
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-16 text-center print:py-4">
      <div className="relative h-16 w-16 print:hidden">
        <Image src="/logo.png" alt="Hungry Bullers logo" fill style={{ objectFit: "contain" }} />
      </div>

      <div className="flex h-14 w-14 items-center justify-center border-2 border-lime text-2xl text-lime print:hidden">
        ✓
      </div>

      <div>
        <h1 className="font-display text-2xl tracking-wide text-white uppercase">
          Order Received
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Thanks{fullName ? `, ${fullName.split(" ")[0]}` : ""} — stay hungry, play hard.
        </p>
      </div>

      <div className="w-full border border-white/10 bg-charcoal p-5 text-left text-sm print:border-black print:bg-white print:text-black">
        <div className="flex justify-between border-b border-white/10 pb-3 print:border-black">
          <span className="text-white/50 uppercase tracking-widest text-xs print:text-black">
            Order No.
          </span>
          <span className="font-semibold text-lime print:text-black">{orderNumber}</span>
        </div>

        <div className="flex justify-between border-b border-white/10 py-3 print:border-black">
          <span className="text-white/50 uppercase tracking-widest text-xs print:text-black">
            Customer Name
          </span>
          <span className="font-semibold text-white print:text-black">{fullName}</span>
        </div>

        <div className="flex justify-between border-b border-white/10 py-3 print:border-black">
          <span className="text-white/50 uppercase tracking-widest text-xs print:text-black">
            Payment Status
          </span>
          <span className="font-semibold text-white print:text-black">Pending verification</span>
        </div>

        <div className="mt-3 space-y-2 text-white/70 print:text-black">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                Size {item.size} × {item.qty}
                {item.playerName && (
                  <span className="block text-xs text-white/50 print:text-black">
                    Name on back: {item.playerName}
                  </span>
                )}
              </span>
              <span className="whitespace-nowrap">{formatPHP(lineTotal(item))}</span>
            </div>
          ))}
          <div className="flex justify-between pt-1">
            <span>Fulfillment</span>
            <span className="capitalize">
              {delivery === "pickup" ? "Club pickup" : "Delivery"}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-white print:text-black">
            <span>Final Amount</span>
            <span className="text-lime print:text-black">{formatPHP(total)}</span>
          </div>
        </div>
      </div>

      <div className="w-full border-l-2 border-lime/60 bg-white/5 p-4 text-left text-sm text-white/70 print:hidden">
        <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">
          What happens next
        </p>
        <p>
          Save a screenshot of this confirmation. The club will manually verify
          your payment ({TRUST_INFO.verificationTimeframe.toLowerCase()}) and
          update your order status.
        </p>
        <p className="mt-2">
          Questions about your order? Contact {TRUST_INFO.contactName}.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewOrder}
        className="h-12 w-full border border-lime text-sm font-semibold tracking-widest text-lime uppercase transition-colors hover:bg-lime hover:text-black print:hidden"
      >
        Place Another Order
      </button>
    </div>
  );
}
