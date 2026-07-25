"use client";

import { useState, type ReactNode, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { ShirtMockup } from "@/components/ShirtMockup";
import { CartEditor } from "@/components/CartEditor";
import { CustomerForm, type CustomerDetails } from "@/components/CustomerForm";
import { PaymentSection } from "@/components/PaymentSection";
import { OrderSummary } from "@/components/OrderSummary";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { PRODUCT, createLineItem, type DeliveryMethod, type LineItem } from "@/lib/mock-data";
import { uploadPaymentProof } from "@/lib/upload";

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-white/10 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-lime/50 text-[11px] font-semibold text-lime">
            {step}
          </span>
          <h2 className="text-xs tracking-[0.3em] text-white/70 uppercase">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const [cart, setCart] = useState<LineItem[]>([createLineItem()]);
  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [details, setDetails] = useState<CustomerDetails>({
    fullName: "",
    email: "",
    phone: "",
    messengerName: "",
    address: "",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const canSubmit =
    cart.length > 0 &&
    details.fullName.trim() !== "" &&
    details.email.trim() !== "" &&
    details.phone.trim() !== "" &&
    (delivery === "pickup" || details.address.trim() !== "") &&
    proofFile !== null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !proofFile || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const paymentProofPath = await uploadPaymentProof(proofFile);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: details.fullName,
          email: details.email,
          phone: details.phone,
          messengerName: details.messengerName,
          fulfillment: delivery,
          address: details.address,
          paymentProofPath,
          cart: cart.map((item) => ({
            size: item.size,
            qty: item.qty,
            playerName: item.playerName,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Something went wrong while placing your order.");
      }

      setOrderNumber(result.order.order_number);
      setSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <ConfirmationScreen
        orderNumber={orderNumber}
        cart={cart}
        delivery={delivery}
        fullName={details.fullName}
        onNewOrder={() => {
          setSubmitted(false);
          setCart([createLineItem()]);
          setProofFile(null);
          setSubmitError(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black pb-16 text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/90 px-5 py-4 backdrop-blur sm:px-8">
        <Logo />
      </header>

      <div className="border-b border-white/10 bg-charcoal px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <ShirtMockup />
        </div>
      </div>

      <section className="border-b border-white/10 px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs tracking-[0.3em] text-lime uppercase">
            Official Club Merch
          </p>
          <h1 className="font-display mt-2 text-2xl leading-tight tracking-wide text-white uppercase sm:text-3xl">
            {PRODUCT.name}
          </h1>
          <p className="mt-2 text-sm text-white/50">{PRODUCT.subtitle}</p>
          <p className="mt-4 text-3xl font-bold text-lime">
            {PRODUCT.currency} {PRODUCT.price.toLocaleString()}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/60">
            {PRODUCT.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRODUCT.features.map((f) => (
              <span
                key={f}
                className="border border-white/15 px-2.5 py-1 text-[10px] tracking-widest text-white/60 uppercase"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <Section step={1} title="Build your order">
          <CartEditor cart={cart} onChange={setCart} />
        </Section>

        <Section step={2} title="Your details">
          <CustomerForm
            details={details}
            onChange={setDetails}
            delivery={delivery}
            onDeliveryChange={setDelivery}
          />
        </Section>

        <Section step={3} title="Payment">
          <PaymentSection
            proofFileName={proofFile?.name ?? null}
            onProofChange={setProofFile}
          />
        </Section>

        <Section step={4} title="Review & submit">
          <div className="space-y-5">
            <OrderSummary cart={cart} delivery={delivery} />
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="h-13 w-full border border-lime bg-lime py-3.5 text-sm font-semibold tracking-[0.2em] text-black uppercase transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            >
              {submitting ? "Submitting…" : "Submit Order"}
            </button>
            {submitError && (
              <p className="border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {submitError}
              </p>
            )}
            {!canSubmit && !submitError && (
              <p className="text-center text-xs text-white/40">
                Fill in your details and upload payment proof to submit.
              </p>
            )}
          </div>
        </Section>
      </form>
    </div>
  );
}
