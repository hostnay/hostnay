"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SectionHeading from "../components/SectionHeading";
import PricingCard from "../components/PricingCard";
import { FeatureCard, StatCard } from "../components/Cards";
import { MotionDiv, MotionSection, fadeUp, stagger } from "../components/motion";
import {
  Activity,
  Cloud,
  Globe,
  Shield,
  Server,
  Sparkles,
  Wallet
} from "lucide-react";

const pricing = [
  {
    name: "Launch",
    price: "$12",
    description: "Perfect for projects that need reliable performance.",
    features: [
      "2 vCPU",
      "4 GB RAM",
      "80 GB NVMe",
      "3 TB bandwidth",
      "Instant provisioning"
    ]
  },
  {
    name: "Scale",
    price: "$28",
    description: "Built for fast-growing businesses and teams.",
    features: [
      "4 vCPU",
      "8 GB RAM",
      "160 GB NVMe",
      "6 TB bandwidth",
      "Dedicated support"
    ],
    highlight: true
  },
  {
    name: "Orbit",
    price: "$64",
    description: "Enterprise-grade clusters with maximum control.",
    features: [
      "8 vCPU",
      "16 GB RAM",
      "320 GB NVMe",
      "12 TB bandwidth",
      "Advanced security"
    ]
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-secondary text-white">
      <Navbar />

      <main>
        <MotionSection
          className="section relative overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <div className="absolute inset-0 bg-hero-radial" />
          <div className="relative grid gap-12 md:grid-cols-2">
            <MotionDiv variants={fadeUp} className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/80">
                Premium Hosting Platform
              </p>
              <h1 className="font-display text-4xl leading-tight text-white md:text-5xl">
                High Performance Hosting Without Limits.
              </h1>
              <p className="text-base text-slate-300">
                Launch VPS, game servers, and web hosting in seconds with smart automation,
                transparent billing, and a control panel built for speed.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/services/vps"
                  className="glow-button rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:scale-105"
                >
                  Explore VPS
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
                >
                  View Dashboard
                </Link>
              </div>
              <div className="grid max-w-md grid-cols-3 gap-3">
                <StatCard label="Uptime" value="99.99%" />
                <StatCard label="Regions" value="18" />
                <StatCard label="Deploy" value="45s" />
              </div>
            </MotionDiv>
            <MotionDiv
              variants={fadeUp}
              className="relative flex items-center justify-center"
            >
              <div className="absolute -top-10 left-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
              <div className="glass shadow-glow relative w-full max-w-md rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Active Nodes</p>
                    <p className="font-display text-2xl text-white">1,248</p>
                  </div>
                  <div className="animate-float rounded-2xl bg-accent/20 p-3 text-accent">
                    <Server />
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="glass rounded-2xl p-4">
                    <p className="text-xs text-slate-400">Core Network</p>
                    <p className="text-sm text-white">Global Edge Mesh</p>
                    <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                      <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-accent to-sky-400" />
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-4">
                    <p className="text-xs text-slate-400">Auto-Scaling</p>
                    <p className="text-sm text-white">Dynamic Load Balancing</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-accent" />
                      <div className="h-2 w-12 rounded-full bg-sky-500/60" />
                      <div className="h-2 w-8 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </MotionSection>

        <MotionSection
          className="section parallax-section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <SectionHeading
            eyebrow="Services"
            title="Everything you need to launch fast"
            description="Choose the infrastructure that fits your growth, from flexible VPS clusters to instant game server deployment."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "VPS Hosting",
                description: "NVMe performance, root access, and full control over your stack.",
                icon: <Cloud />
              },
              {
                title: "Game Servers",
                description: "Deploy optimized servers for the biggest multiplayer titles.",
                icon: <Activity />
              },
              {
                title: "Web Hosting",
                description: "Reliable, secure hosting for modern business websites.",
                icon: <Globe />
              }
            ].map((item) => (
              <MotionDiv key={item.title} variants={fadeUp}>
                <FeatureCard {...item} />
              </MotionDiv>
            ))}
          </div>
        </MotionSection>

        <MotionSection
          className="section relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <SectionHeading
            eyebrow="Features"
            title="Cloud-grade control with a premium experience"
            description="Hostnay combines security, automation, and billing into one unified platform for teams and agencies."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Instant Provisioning",
                description: "Spin up servers in under 60 seconds with automated orchestration.",
                icon: <Sparkles />
              },
              {
                title: "Secure Authentication",
                description: "JWT secured sessions, role-based access, and device logs.",
                icon: <Shield />
              },
              {
                title: "Unified Billing",
                description: "Consolidate invoices, coupons, and gift cards in one dashboard.",
                icon: <Wallet />
              }
            ].map((item) => (
              <MotionDiv key={item.title} variants={fadeUp}>
                <FeatureCard {...item} />
              </MotionDiv>
            ))}
          </div>
        </MotionSection>

        <MotionSection
          className="section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <SectionHeading
            eyebrow="Pricing"
            title="Flexible plans that scale with you"
            description="Choose a plan and customize at checkout. All plans include DDoS protection, snapshots, and 24/7 support."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {pricing.map((plan) => (
              <MotionDiv key={plan.name} variants={fadeUp}>
                <PricingCard
                  {...plan}
                  cta={
                    <Link
                      href="/services/vps"
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

        <MotionSection
          className="section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <SectionHeading
            eyebrow="Control Panel"
            title="A modern dashboard built for fast teams"
            description="Monitor usage, launch new products, and manage billing with a clean, cloud-native interface."
          />
          <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6 md:p-10">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cluster Health</p>
                <h3 className="font-display text-2xl text-white">Operations Overview</h3>
                <p className="text-sm text-slate-300">
                  Unified control over VPS, game servers, and web hosting from a single view.
                </p>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Deploy Queue</p>
                  <p className="text-sm text-white">3 pending • 12 completed today</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: "Active Services", value: "428" },
                    { label: "Monthly Revenue", value: "$92,410" },
                    { label: "Tickets", value: "14 open" },
                    { label: "Latency", value: "18ms avg" }
                  ].map((item) => (
                    <div key={item.label} className="glass rounded-2xl p-4">
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="mt-2 text-lg text-white">{item.value}</p>
                      <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                        <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-accent to-sky-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </MotionDiv>
        </MotionSection>

        <MotionSection
          className="section"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <SectionHeading
            eyebrow="Testimonials"
            title="Trusted by global creators and studios"
            description="Teams choose Hostnay for reliability, developer-friendly tooling, and premium support."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Ava Kingston",
                role: "CTO, Nebula Labs",
                quote:
                  "Hostnay cut our deployment time in half and the dashboard feels like a premium cloud suite."
              },
              {
                name: "Marcus Lee",
                role: "Founder, GuildForge",
                quote:
                  "Our community servers stay stable even during peak events. The support team is elite."
              },
              {
                name: "Sofia Demir",
                role: "Head of Ops, Brightline",
                quote:
                  "Billing automation, coupon workflows, and monitoring are all in one place."
              }
            ].map((item) => (
              <MotionDiv key={item.name} variants={fadeUp} className="glass card-hover rounded-3xl p-6">
                <p className="text-sm text-slate-300">"{item.quote}"</p>
                <div className="mt-4 text-sm text-white">{item.name}</div>
                <div className="text-xs text-slate-400">{item.role}</div>
              </MotionDiv>
            ))}
          </div>
        </MotionSection>
      </main>

      <Footer />
    </div>
  );
}
