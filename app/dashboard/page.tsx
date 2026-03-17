"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MotionDiv, MotionSection, fadeUp, stagger } from "../../components/motion";
import { fetchWithToken, login } from "../../lib/api";

const tickets = [
  { subject: "Scale VPS CPU", status: "Open", updated: "2 hours ago" },
  { subject: "Billing address update", status: "Resolved", updated: "1 day ago" }
];

const fallbackServices = [
  { name: "VPS Pro", status: "Active", region: "Frankfurt", renew: "Apr 2, 2026" },
  { name: "Minecraft Server", status: "Active", region: "New York", renew: "Apr 6, 2026" },
  { name: "Web Hosting Business", status: "Trial", region: "Global", renew: "Mar 24, 2026" }
];

const fallbackInvoices = [
  { id: "INV-1042", amount: "$28.00", status: "Paid", date: "Mar 10, 2026" },
  { id: "INV-1043", amount: "$42.00", status: "Due", date: "Mar 18, 2026" },
  { id: "INV-1044", amount: "$14.00", status: "Scheduled", date: "Apr 10, 2026" }
];

const fallbackOrders = [
  { id: "ORD-7821", service: "VPS Pro", total: "$28.00", date: "Mar 10, 2026" },
  { id: "ORD-7816", service: "Minecraft Server", total: "$18.00", date: "Feb 10, 2026" },
  { id: "ORD-7809", service: "Web Hosting Business", total: "$14.00", date: "Jan 10, 2026" }
];

export default function DashboardPage() {
  const [services, setServices] = useState(fallbackServices);
  const [invoices, setInvoices] = useState(fallbackInvoices);
  const [orders, setOrders] = useState(fallbackOrders);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const auth = await login("amina@hostnay.com", "Password123!");
        const data = await fetchWithToken<{
          services: { id: string; name: string; status: string; renewsAt: string }[];
          invoices: { id: string; amount: number; status: string }[];
        }>("/api/dashboard", auth.token);

        if (!mounted) return;
        setServices(
          data.services.map((service) => ({
            name: service.name,
            status: service.status === "active" ? "Active" : service.status,
            region: service.name.includes("Minecraft") ? "New York" : "Frankfurt",
            renew: new Date(service.renewsAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })
          }))
        );
        setInvoices(
          data.invoices.map((invoice) => ({
            id: invoice.id,
            amount: `$${invoice.amount.toFixed(2)}`,
            status: invoice.status === "due" ? "Due" : "Scheduled",
            date: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })
          }))
        );
        setOrders((prev) => prev);
      } catch {
        if (mounted) {
          setServices(fallbackServices);
          setInvoices(fallbackInvoices);
          setOrders(fallbackOrders);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

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
            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Client Dashboard</p>
                  <h1 className="mt-2 font-display text-3xl text-white">Welcome back, Amina.</h1>
                  <p className="mt-2 text-sm text-slate-300">
                    Manage your services, invoices, and support tickets from a single control panel.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/60">
                    Open Ticket
                  </button>
                  <button className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:scale-105">
                    Add Service
                  </button>
                </div>
              </div>
              {loading && (
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                  Syncing live data...
                </p>
              )}
            </div>
          </MotionDiv>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { label: "Active Services", value: "5" },
              { label: "Monthly Spend", value: "$112.00" },
              { label: "Tickets Open", value: "2" }
            ].map((item) => (
              <MotionDiv key={item.label} variants={fadeUp} className="glass rounded-2xl p-4">
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="mt-2 font-display text-2xl text-white">{item.value}</p>
              </MotionDiv>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6 lg:col-span-2">
              <h2 className="font-display text-xl text-white">Purchased Services</h2>
              <div className="mt-4 space-y-4">
                {services.map((service) => (
                  <div key={service.name} className="rounded-2xl border border-white/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{service.name}</p>
                        <p className="text-xs text-slate-400">Region: {service.region}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300">
                        {service.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-400">
                      <span>Renewal: {service.renew}</span>
                      <button className="text-accent hover:text-sky-300">Manage Service</button>
                    </div>
                  </div>
                ))}
              </div>
            </MotionDiv>

            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Invoices</h2>
              <div className="mt-4 space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white">{invoice.id}</p>
                      <span className="text-xs text-slate-400">{invoice.date}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{invoice.amount}</span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-slate-300">
                        {invoice.status}
                      </span>
                    </div>
                    <button className="mt-3 w-full rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:scale-105">
                      Pay Invoice
                    </button>
                  </div>
                ))}
              </div>
            </MotionDiv>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Billing History</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>OxaPay • Mar 1</span>
                  <span>$42.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>OxaPay • Feb 1</span>
                  <span>$42.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Card • Jan 1</span>
                  <span>$36.00</span>
                </div>
              </div>
            </MotionDiv>

            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Support Tickets</h2>
              <div className="mt-4 space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.subject} className="rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white">{ticket.subject}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{ticket.status}</span>
                      <span>{ticket.updated}</span>
                    </div>
                  </div>
                ))}
              </div>
            </MotionDiv>

            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Account Settings</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Email</span>
                  <span>amina@hostnay.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Plan</span>
                  <span>Scale</span>
                </div>
                <button className="mt-4 w-full rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/80 transition hover:border-white/60">
                  Update Profile
                </button>
              </div>
            </MotionDiv>
          </div>

          <div className="mt-8">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Order History</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4">
                    <div>
                      <p className="text-white">{order.id}</p>
                      <p className="text-xs text-slate-400">{order.service}</p>
                    </div>
                    <div className="text-xs text-slate-400">
                      {order.date}
                    </div>
                    <div className="text-sm text-white">{order.total}</div>
                  </div>
                ))}
              </div>
            </MotionDiv>
          </div>
        </MotionSection>
      </main>
      <Footer />
    </div>
  );
}
