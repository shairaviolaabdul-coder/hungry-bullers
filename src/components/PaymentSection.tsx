"use client";

import { useState } from "react";
import Image from "next/image";
import { GCASH_INFO, type DeliveryMethod, type LineItem } from "@/lib/mock-data";
import { formatPHP } from "@/lib/format";
import { computeCartTotals } from "@/components/OrderSummary";

function QRCode({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden border border-white/15 bg-white p-2 ${className}`}
    >
      <Image
        src="/qr-code.png"
        alt="GCash payment QR code"
        fill
        sizes="420px"
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}

export function PaymentSection({
  cart,
  delivery,
  proofFileName,
  onProofChange,
  confirmedPayment,
  onConfirmedPaymentChange,
}: {
  cart: LineItem[];
  delivery: DeliveryMethod;
  proofFileName: string | null;
  onProofChange: (file: File | null) => void;
  confirmedPayment: boolean;
  onConfirmedPaymentChange: (value: boolean) => void;
}) {
  const [enlarged, setEnlarged] = useState(false);
  const { total } = computeCartTotals(cart, delivery);

  return (
    <div className="space-y-5">
      <div className="border border-white/10 bg-charcoal p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setEnlarged(true)}
              aria-label="Enlarge QR code"
            >
              <QRCode className="h-56 w-56" />
            </button>
            <button
              type="button"
              onClick={() => setEnlarged(true)}
              className="text-xs font-semibold tracking-widest text-lime uppercase transition-colors hover:text-white"
            >
              Tap to enlarge
            </button>
          </div>
          <div className="w-full space-y-1 text-sm">
            <p className="text-xs tracking-[0.25em] text-white/50 uppercase">
              Pay via GCash
            </p>
            <p className="font-semibold text-white">{GCASH_INFO.accountName}</p>
            <p className="text-white/60">
              Scan the QR code using your GCash app to pay.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-white/10 pt-4">
          <span className="text-xs tracking-[0.25em] text-white/50 uppercase">
            Amount to Pay
          </span>
          <span className="text-3xl font-bold text-lime">{formatPHP(total)}</span>
        </div>
      </div>

      <div className="border-l-2 border-lime/60 bg-white/5 p-4 text-sm text-white/70">
        <p className="mb-1 text-xs tracking-[0.25em] text-white/50 uppercase">
          Instructions
        </p>
        <ol className="list-inside list-decimal space-y-1">
          <li>Open your GCash app and scan the QR code above.</li>
          <li>Confirm the recipient name matches {GCASH_INFO.accountName}.</li>
          <li>Pay the exact amount shown above — {formatPHP(total)}.</li>
          <li>Screenshot your GCash payment confirmation.</li>
          <li>Upload the screenshot below as proof of payment.</li>
        </ol>
        <p className="mt-3 text-white/50">
          Payments are verified manually by the club. Please don&apos;t close this
          page until your order has been submitted successfully.
        </p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs tracking-[0.2em] text-white/50 uppercase">
          Payment proof
        </span>
        <div className="flex h-11 w-full items-center border border-white/15 bg-charcoal px-3 text-sm">
          <span className="flex-1 truncate text-white/60">
            {proofFileName ?? "No file selected"}
          </span>
          <span className="ml-3 shrink-0 text-xs font-semibold tracking-widest text-lime uppercase">
            Browse
          </span>
        </div>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onProofChange(e.target.files?.[0] ?? null)}
        />
      </label>
      <p className="text-xs text-white/40">
        Your payment screenshot is stored privately and is only ever visible to
        club admins for verification — it is never public or browsable.
      </p>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={confirmedPayment}
          onChange={(e) => onConfirmedPaymentChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-lime"
        />
        <span className="text-sm text-white/70">
          I paid the exact amount and saved my payment confirmation.
        </span>
      </label>

      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setEnlarged(false)}
        >
          <div className="flex flex-col items-center gap-4">
            <QRCode className="h-[80vw] max-h-[420px] w-[80vw] max-w-[420px]" />
            <button
              type="button"
              onClick={() => setEnlarged(false)}
              className="border border-lime px-4 py-2 text-xs font-semibold tracking-widest text-lime uppercase transition-colors hover:bg-lime hover:text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
