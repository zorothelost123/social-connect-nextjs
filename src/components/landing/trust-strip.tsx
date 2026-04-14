import { ShieldCheck, Zap, Globe, Cpu } from "lucide-react";

const items = [
  { label: "Secure Auth", icon: ShieldCheck },
  { label: "Fast Delivery", icon: Zap },
  { label: "Global Ready", icon: Globe },
  { label: "Scalable Stack", icon: Cpu },
];

export function TrustStrip() {
  return (
    <section className="reveal-up mt-8 rounded-2xl border bg-card/80 p-4 backdrop-blur">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3 rounded-xl border p-3">
              <Icon className="h-4 w-4 text-brand-500" />
              <p className="text-sm font-medium">{item.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
