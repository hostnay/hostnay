import { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="mb-10 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/80">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl text-white md:text-4xl">{title}</h2>
      <p className="mt-4 text-base text-slate-300">{description}</p>
    </div>
  );
}
