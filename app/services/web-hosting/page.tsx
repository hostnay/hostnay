"use client";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SectionHeading from "../../../components/SectionHeading";
import PricingCard from "../../../components/PricingCard";
import { MotionDiv, MotionSection, fadeUp, stagger } from "../../../components/motion";

const webPlans = [
  {
    name: "Starter",
    price: "$6",
    description: "For personal sites and small portfolios.",
    features: ["50 GB storage", "Unlimited bandwidth", "5 email accounts", "1 domain"]
  },
  {
    name: "Business",
    price: "$14",
    description: "Optimized for growing companies.",
    features: ["150 GB storage", "Unlimited bandwidth", "25 email accounts", "10 domains"],
    highlight: true
  },
  {
    name: "Agency",
    price: "$32",
    description: "High traffic sites with premium support.",
    features: ["500 GB storage", "Unlimited bandwidth", "Unlimited email", "50 domains"]
  }
];

export default function WebHostingPage() {
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
              eyebrow="Web Hosting"
              title="Fast, secure hosting for modern websites"
              description="Launch reliable web hosting with SSL, daily backups, and powerful email hosting included."
            />
          </MotionDiv>
          <div className="grid gap-6 md:grid-cols-3">
            {webPlans.map((plan) => (
              <MotionDiv key={plan.name} variants={fadeUp}>
                <PricingCard
                  {...plan}
                  cta={
                    <button className="w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:scale-105">
                      Deploy Hosting
                    </button>
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
