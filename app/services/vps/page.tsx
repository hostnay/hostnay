"use client";

import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SectionHeading from "../../../components/SectionHeading";
import PricingCard from "../../../components/PricingCard";
import { MotionDiv, MotionSection, fadeUp, stagger } from "../../../components/motion";

const vpsPlans = [
  {
    name: "VPS Basic",
    price: "$9",
    description: "Reliable compute for startups and dev environments.",
    features: ["2 CPU", "4 GB RAM", "80 GB NVMe", "3 TB bandwidth"]
  },
  {
    name: "VPS Pro",
    price: "$24",
    description: "Balanced performance for production workloads.",
    features: ["4 CPU", "8 GB RAM", "160 GB NVMe", "6 TB bandwidth"],
    highlight: true
  },
  {
    name: "VPS Ultra",
    price: "$48",
    description: "High frequency compute for demanding applications.",
    features: ["8 CPU", "16 GB RAM", "320 GB NVMe", "12 TB bandwidth"]
  }
];

export default function VPSPage() {
  return (
    <div className="min-h-screen bg-secondary text-white">
      <Navbar />
      <main>
        <MotionSection
          className="section"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <MotionDiv variants={fadeUp}>
            <SectionHeading
              eyebrow="VPS Hosting"
              title="Launch high-performance VPS in under a minute"
              description="Choose the exact amount of CPU, RAM, and NVMe storage you need. All VPS plans include root access, snapshots, and global networking."
            />
          </MotionDiv>
          <div className="grid gap-6 md:grid-cols-3">
            {vpsPlans.map((plan) => (
              <MotionDiv key={plan.name} variants={fadeUp}>
                <PricingCard
                  {...plan}
                  cta={
                    <Link
                      href="/dashboard"
                      className="inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:scale-105"
                    >
                      Deploy VPS
                    </Link>
                  }
                />
              </MotionDiv>
            ))}
          </div>
        </MotionSection>
      </main>
      <Footer />
    </div>
  );
}
