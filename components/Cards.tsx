import { ReactNode } from "react";

export function FeatureCard({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="glass card-hover rounded-2xl p-6">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-accent">
        {icon}
      </div>
      <h3 className="font-display text-lg text-white">{title}</h3>
      <p className="mt-3 text-sm text-slate-300">{description}</p>
    </div>
  );
}

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="text-2xl font-display text-white">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </div>
    </div>
  );
}
