"use client";

import { useEffect } from "react";
import { SIZE_GUIDE } from "@/lib/mock-data";

export function SizeGuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto border-t border-white/15 bg-charcoal p-6 sm:border"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id="size-guide-title" className="font-display text-xl tracking-wide text-white uppercase">
            Size Guide
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="shrink-0 text-2xl leading-none text-white/50 hover:text-lime"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-white/60">{SIZE_GUIDE.measurementNote}</p>
        <p className="mt-2 text-sm text-white/60">{SIZE_GUIDE.compareNote}</p>

        <div className="mt-5 overflow-hidden border border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] tracking-widest text-white/40 uppercase">
                <th className="px-3 py-2 font-normal">Size</th>
                <th className="px-3 py-2 font-normal">Chest width</th>
                <th className="px-3 py-2 font-normal">Length</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.rows.map((row) => (
                <tr key={row.size} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2 font-semibold text-white">{row.size}</td>
                  <td className="px-3 py-2 text-white/60">
                    {row.chestWidthIn != null ? `${row.chestWidthIn}"` : "To be confirmed"}
                  </td>
                  <td className="px-3 py-2 text-white/60">
                    {row.lengthIn != null ? `${row.lengthIn}"` : "To be confirmed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
