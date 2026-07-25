import Image from "next/image";

export function Logo({ size = 44, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <Image
          src="/logo.png"
          alt="Hungry Bullers Pickleball Club logo"
          fill
          sizes={`${size}px`}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
      {!compact && (
        <div className="leading-none">
          <p className="font-display text-sm tracking-[0.2em] text-white uppercase">
            Hungry Bullers
          </p>
          <p className="text-[10px] tracking-[0.3em] text-lime uppercase">
            Pickleball Club
          </p>
        </div>
      )}
    </div>
  );
}
