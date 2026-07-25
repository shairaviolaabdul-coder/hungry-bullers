"use client";

import { useState, type ReactNode, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { Hero } from "@/components/Hero";
import { StickyMobileCta } from "@/components/StickyMobileCta";
import { TrustInfo } from "@/components/TrustInfo";
import { CartEditor } from "@/components/CartEditor";
import { CustomerForm, type CustomerDetails } from "@/components/CustomerForm";
import { PaymentSection } from "@/components/PaymentSection";
import { OrderSummary } from "@/components/OrderSummary";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import {
  PRODUCT,
  PRODUCT_SPECS,
  TRUST_INFO,
  createLineItem,
  type DeliveryMethod,
  type LineItem,
} from "@/lib/mock-data";
import { formatPHP } from "@/lib/format";
import { uploadPaymentProof } from "@/lib/upload";

function Section({
  step,
  title,
  id,
  children,
}: {
  step: number;
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="border-t border-white/10 px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-baseline gap-3">
          <span className="font-display text-2xl text-white/20">{String(step).padStart(2, "0")}</span>
          <h2 className="font-display text-xl tracking-wide text-white uppercase">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function SpecRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between border-b border-white/10 py-2.5 text-sm last:border-0">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80">{value ?? "To be confirmed"}</span>
    </div>
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
  const [confirmedPayment, setConfirmedPayment] = useState(false);
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
    proofFile !== null &&
    confirmedPayment;

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
          setConfirmedPayment(false);
          setSubmitError(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 text-white sm:pb-16">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/90 px-5 py-3 backdrop-blur sm:px-8">
        <Logo size={32} compact />
      </header>

      <Hero />

      <section className="border-t border-white/10 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-lg tracking-wide text-white uppercase">
            {PRODUCT.name}
          </h2>
          <p className="mt-2 text-2xl font-bold text-lime">{formatPHP(PRODUCT.price)}</p>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/60">
            {PRODUCT.description}
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs tracking-[0.25em] text-white/40 uppercase">
                Specifications
              </p>
              <SpecRow label="Fabric" value={PRODUCT_SPECS.fabric} />
              <SpecRow label="GSM" value={PRODUCT_SPECS.gsm} />
              <SpecRow label="Fit" value={PRODUCT_SPECS.fit} />
              <SpecRow label="Care" value={PRODUCT_SPECS.care} />
            </div>
            <div>
              <p className="mb-2 text-xs tracking-[0.25em] text-white/40 uppercase">
                Order Deadline &amp; Timeline
              </p>
              <SpecRow label="Order deadline" value={TRUST_INFO.orderDeadline} />
              <SpecRow label="Estimated production" value={TRUST_INFO.estimatedProductionTimeline} />
              <SpecRow label="Estimated release" value={TRUST_INFO.estimatedRelease} />
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <Section step={1} title="Build your order" id="configurator">
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
            cart={cart}
            delivery={delivery}
            proofFileName={proofFile?.name ?? null}
            onProofChange={setProofFile}
            confirmedPayment={confirmedPayment}
            onConfirmedPaymentChange={setConfirmedPayment}
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
              {submitting ? "Submitting…" : "Place My Order"}
            </button>
            {submitError && (
              <p className="border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {submitError}
              </p>
            )}
            {!canSubmit && !submitError && (
              <p className="text-center text-xs text-white/40">
                Fill in your details, upload payment proof, and confirm the payment
                checkbox to submit.
              </p>
            )}
          </div>
        </Section>
      </form>

      <section className="border-t border-white/10 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-lg tracking-wide text-white uppercase">
            Good to Know
          </h2>
          <TrustInfo />
        </div>
      </section>

      <StickyMobileCta />
    </div>
  );
}
