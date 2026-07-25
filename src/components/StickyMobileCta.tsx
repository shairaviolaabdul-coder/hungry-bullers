"use client";

import { useEffect, useState } from "react";
import { formatPHP } from "@/lib/format";
import { PRODUCT } from "@/lib/mock-data";

export function StickyMobileCta() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const target = document.getElementById("configurator");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(false);
      },
      { threshold: 0.1 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-lime/40 bg-black/95 p-3 backdrop-blur sm:hidden">
      <button
        type="button"
        onClick={() =>
          document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        className="h-12 w-full bg-lime text-sm font-semibold tracking-[0.2em] text-black uppercase"
      >
        Order Your Jersey — {formatPHP(PRODUCT.price)}
      </button>
    </div>
  );
}
