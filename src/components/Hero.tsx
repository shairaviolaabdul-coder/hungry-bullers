"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPHP } from "@/lib/format";
import { PRODUCT } from "@/lib/mock-data";

function scrollToConfigurator() {
  document.getElementById("configurator")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  const [view, setView] = useState<"front" | "back">("front");

  return (
    <section className="relative overflow-hidden bg-charcoal">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2 md:items-center md:gap-8">
        <div className="order-2 md:order-1">
          <p className="text-xs tracking-[0.35em] text-lime uppercase">Official Club Merch</p>
          <h1 className="font-display mt-3 text-4xl leading-[1.05] tracking-wide text-white uppercase sm:text-5xl">
            The Official Hungry Bullers Club Jersey
          </h1>
          <p className="mt-4 max-w-sm text-base text-white/60">
            Built for the court. Made for the crew.
          </p>
          <button
            type="button"
            onClick={scrollToConfigurator}
            className="mt-8 h-14 w-full border border-lime bg-lime px-6 text-sm font-semibold tracking-[0.2em] text-black uppercase transition-opacity hover:opacity-90 sm:w-auto"
          >
            Order Your Jersey — {formatPHP(PRODUCT.price)}
          </button>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
            <Image
              src={view === "front" ? "/front.png" : "/back.png"}
              alt={`Hungry Bullers jersey ${view} view`}
              fill
              priority
              sizes="(min-width: 768px) 420px, 90vw"
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {(["front", "back"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`h-9 px-4 text-xs font-semibold tracking-widest uppercase transition-colors ${
                  view === v
                    ? "bg-lime text-black"
                    : "border border-white/20 text-white/60 hover:border-lime/60"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
