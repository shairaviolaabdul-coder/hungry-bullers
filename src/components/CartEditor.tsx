"use client";

import { useState } from "react";
import {
  NAME_MAX_LENGTH,
  SIZES,
  createLineItem,
  lineTotal,
  lineUnitPrice,
  type LineItem,
} from "@/lib/mock-data";
import { formatPHP } from "@/lib/format";
import { SizeGuideModal } from "@/components/SizeGuideModal";

function LineItemRow({
  item,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  item: LineItem;
  index: number;
  canRemove: boolean;
  onChange: (item: LineItem) => void;
  onRemove: () => void;
}) {
  const dec = () => onChange({ ...item, qty: Math.max(1, item.qty - 1) });
  const inc = () => onChange({ ...item, qty: Math.min(20, item.qty + 1) });

  return (
    <div className="border-b border-white/10 py-6 first:pt-0 last:border-0">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs tracking-[0.25em] text-white/50 uppercase">
          Shirt {index + 1}
        </p>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs tracking-widest text-white/40 uppercase transition-colors hover:text-lime"
          >
            Remove
          </button>
        )}
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[11px] tracking-[0.2em] text-white/40 uppercase">
          Size
        </p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {SIZES.map((size) => {
            const active = size === item.size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ ...item, size })}
                className={`h-9 border text-xs font-semibold tracking-wide transition-colors ${
                  active
                    ? "border-lime bg-lime text-black"
                    : "border-white/15 bg-transparent text-white hover:border-lime/60"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-2 text-[11px] tracking-[0.2em] text-white/40 uppercase">
            Quantity
          </p>
          <div className="flex h-9 w-28 items-stretch border border-white/15">
            <button
              type="button"
              onClick={dec}
              aria-label="Decrease quantity"
              className="w-9 text-base text-white/70 transition-colors hover:bg-white/5 hover:text-lime"
            >
              −
            </button>
            <div className="flex flex-1 items-center justify-center border-x border-white/15 text-sm font-semibold">
              {item.qty}
            </div>
            <button
              type="button"
              onClick={inc}
              aria-label="Increase quantity"
              className="w-9 text-base text-white/70 transition-colors hover:bg-white/5 hover:text-lime"
            >
              +
            </button>
          </div>
        </div>

        <label className="min-w-[10rem] flex-1">
          <span className="mb-2 flex items-baseline justify-between text-[11px] tracking-[0.2em] text-white/40 uppercase">
            <span>Name on back (optional)</span>
            <span className="normal-case tracking-normal text-white/30">
              {item.playerName.length}/{NAME_MAX_LENGTH}
            </span>
          </span>
          <input
            value={item.playerName}
            onChange={(e) =>
              onChange({ ...item, playerName: e.target.value.toUpperCase().slice(0, NAME_MAX_LENGTH) })
            }
            placeholder="SANDRA"
            maxLength={NAME_MAX_LENGTH}
            className="h-9 w-full border border-white/15 bg-black px-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-lime"
          />
        </label>
      </div>

      <p className="mb-4 text-xs text-white/40">
        {item.playerName.trim()
          ? "This name will be printed on the jersey back, exactly as typed above."
          : "Leave blank and the jersey back will print without a name."}
      </p>

      {item.playerName.trim() && (
        <div className="mb-4 flex justify-center border border-white/10 bg-black py-4">
          <span className="font-display text-lg tracking-[0.15em] text-lime">
            {item.playerName}
          </span>
        </div>
      )}

      <div className="flex justify-between border-t border-white/10 pt-3 text-sm">
        <span className="text-white/50">
          {formatPHP(lineUnitPrice(item))} × {item.qty}
        </span>
        <span className="font-semibold text-lime">{formatPHP(lineTotal(item))}</span>
      </div>
    </div>
  );
}

export function CartEditor({
  cart,
  onChange,
}: {
  cart: LineItem[];
  onChange: (cart: LineItem[]) => void;
}) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const updateItem = (id: string, next: LineItem) =>
    onChange(cart.map((item) => (item.id === id ? next : item)));

  const removeItem = (id: string) =>
    onChange(cart.filter((item) => item.id !== id));

  const addItem = () => onChange([...cart, createLineItem()]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={() => setShowSizeGuide(true)}
          className="text-xs font-semibold tracking-widest text-lime uppercase underline-offset-4 hover:underline"
        >
          View Size Guide
        </button>
      </div>

      {cart.map((item, index) => (
        <LineItemRow
          key={item.id}
          item={item}
          index={index}
          canRemove={cart.length > 1}
          onChange={(next) => updateItem(item.id, next)}
          onRemove={() => removeItem(item.id)}
        />
      ))}

      <button
        type="button"
        onClick={addItem}
        className="mt-6 h-11 w-full border border-dashed border-white/25 text-sm font-semibold tracking-widest text-white/60 uppercase transition-colors hover:border-lime hover:text-lime"
      >
        + Add Another Shirt
      </button>

      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}
    </div>
  );
}
