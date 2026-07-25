import Image from "next/image";

function ShirtFrame({ label, src }: { label: string; src: string }) {
  return (
    <div className="flex-1">
      <div className="relative aspect-[4/5] w-full overflow-hidden border border-white/10 bg-charcoal">
        <Image
          src={src}
          alt={`Hungry Bullers jersey ${label} view`}
          fill
          sizes="(min-width: 768px) 320px, 45vw"
          style={{ objectFit: "contain" }}
        />
        <div className="absolute top-0 left-0 h-[3px] w-8 bg-lime" />
      </div>
      <p className="mt-2 text-center text-[11px] tracking-[0.3em] text-white/50 uppercase">
        {label}
      </p>
    </div>
  );
}

export function ShirtMockup() {
  return (
    <div className="flex gap-3">
      <ShirtFrame label="Front" src="/front.png" />
      <ShirtFrame label="Back" src="/back.png" />
    </div>
  );
}
