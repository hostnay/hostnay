import { ReactNode } from "react";
import { Check } from "lucide-react";

export default function PricingCard({
  name,
  price,
  description,
  features,
  cta,
  highlight
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`glass card-hover rounded-3xl p-6 md:p-8 ${
        highlight ? "border border-accent/50 shadow-glow" : "border border-white/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-white">{name}</h3>
        {highlight && (
          <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
            Best Value
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-slate-300">{description}</p>
      <div className="mt-6 text-3xl font-display text-white">
        {price}
        <span className="text-sm font-normal text-slate-400">/mo</span>
      </div>
      <ul className="mt-6 space-y-3 text-sm text-slate-200">
        {features.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Check size={16} className="text-accent" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-6">{cta}</div>
    </div>
  );
}
