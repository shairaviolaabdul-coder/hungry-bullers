import type { InputHTMLAttributes, ChangeEvent } from "react";
import { PICKUP_INFO, type DeliveryMethod } from "@/lib/mock-data";

export type CustomerDetails = {
  fullName: string;
  email: string;
  phone: string;
  messengerName: string;
  address: string;
};

function Field({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs tracking-[0.2em] text-white/50 uppercase">
        {label}
      </span>
      <input
        {...props}
        className="h-11 w-full border border-white/15 bg-charcoal px-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-lime"
      />
    </label>
  );
}

export function CustomerForm({
  details,
  onChange,
  delivery,
  onDeliveryChange,
}: {
  details: CustomerDetails;
  onChange: (details: CustomerDetails) => void;
  delivery: DeliveryMethod;
  onDeliveryChange: (method: DeliveryMethod) => void;
}) {
  const set = (key: keyof CustomerDetails) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...details, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <Field
        label="Full name"
        placeholder="Juan Dela Cruz"
        value={details.fullName}
        onChange={set("fullName")}
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          type="email"
          placeholder="juan@email.com"
          value={details.email}
          onChange={set("email")}
          required
        />
        <Field
          label="Mobile number"
          type="tel"
          placeholder="0917 000 0000"
          value={details.phone}
          onChange={set("phone")}
          required
        />
      </div>

      <Field
        label="Messenger / social name (optional)"
        placeholder="Facebook or Messenger name, if different"
        value={details.messengerName}
        onChange={set("messengerName")}
      />

      <div>
        <p className="mb-2 text-xs tracking-[0.25em] text-white/50 uppercase">
          Fulfillment
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["pickup", "delivery"] as DeliveryMethod[]).map((method) => {
            const active = delivery === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => onDeliveryChange(method)}
                className={`h-11 border text-sm font-semibold uppercase tracking-widest transition-colors ${
                  active
                    ? "border-lime bg-lime text-black"
                    : "border-white/15 text-white hover:border-lime/60"
                }`}
              >
                {method === "pickup" ? "Club Pickup" : "Delivery"}
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-xs text-white/40">
          {delivery === "pickup"
            ? `Club pickup is free. Pickup location: ${PICKUP_INFO.location}.`
            : "Delivery is currently free — no delivery fee is added to your total."}
        </p>
      </div>

      {delivery === "delivery" && (
        <Field
          label="Delivery address"
          placeholder="Unit, Street, Barangay, City"
          value={details.address}
          onChange={set("address")}
          required
        />
      )}
    </div>
  );
}
