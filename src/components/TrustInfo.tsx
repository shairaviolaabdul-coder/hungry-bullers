import { PICKUP_INFO, TRUST_INFO } from "@/lib/mock-data";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <span className="text-xs tracking-widest text-white/40 uppercase">{label}</span>
      <span className="text-right text-sm text-white/80">{value}</span>
    </div>
  );
}

export function TrustInfo() {
  return (
    <div className="border-t border-white/10 py-2">
      <InfoRow label="Payment verification" value={TRUST_INFO.verificationTimeframe} />
      <InfoRow label="Pickup location" value={PICKUP_INFO.location} />
      <InfoRow label="Order changes / refunds" value={TRUST_INFO.changePolicy} />
      <InfoRow label="Contact" value={TRUST_INFO.contactName} />
    </div>
  );
}
