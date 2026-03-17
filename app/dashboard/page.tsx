"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MotionDiv, MotionSection, fadeUp, stagger } from "../../components/motion";
import { apiFetch } from "../../lib/api";
import { getToken } from "../../lib/auth";
import Link from "next/link";

type ServiceItem = { name: string; status: string; region: string; renew: string };

type InvoiceItem = { id: string; amount: string; status: string; date: string };

type OrderItem = { id: string; service: string; total: string; date: string };

type ProductItem = { id: string; name: string; price: number; category: string; enabled: boolean };

const tickets = [
  { subject: "Scale VPS CPU", status: "Open", updated: "2 hours ago" },
  { subject: "Billing address update", status: "Resolved", updated: "1 day ago" }
];

export default function DashboardPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadDashboard = async () => {
    const data = await apiFetch<{
      services: { id: string; name: string; status: string; renewsAt: string | null }[];
      invoices: { id: string; amount: number; status: string }[];
      orders: { id: string; name: string; total: number; createdAt: string }[];
    }>("/api/dashboard");

    setServices(
      data.services.map((service) => ({
        name: service.name,
        status: service.status === "active" ? "Active" : service.status,
        region: service.name.includes("Minecraft") ? "New York" : "Frankfurt",
        renew: service.renewsAt
          ? new Date(service.renewsAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })
          : "-"
      }))
    );
    setInvoices(
      data.invoices.map((invoice) => ({
        id: invoice.id,
        amount: `$${invoice.amount.toFixed(2)}`,
        status: invoice.status === "due" ? "Due" : invoice.status,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      }))
    );
    setOrders(
      data.orders.map((order) => ({
        id: order.id,
        service: order.name,
        total: `$${order.total.toFixed(2)}`,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      }))
    );
  };

  const loadProducts = async () => {
    const data = await apiFetch<ProductItem[]>("/api/products");
    setProducts(data.filter((product) => product.enabled));
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function load() {
      try {
        await Promise.all([loadDashboard(), loadProducts()]);
      } catch {
        if (mounted) {
          setServices([]);
          setInvoices([]);
          setOrders([]);
          setProducts([]);
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

  const handleOrder = async (productId: string) => {
    setMessage(null);
    try {
      const { invoice } = await apiFetch<{ invoice: { id: string } }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({ productId })
      });

      const callbackUrl = `${window.location.origin}/api/payments/oxapay/webhook`;
      const returnUrl = `${window.location.origin}/dashboard`;

      const checkout = await apiFetch<{ checkoutUrl: string | null }>("/api/payments/oxapay/invoice", {
        method: "POST",
        body: JSON.stringify({ invoiceId: invoice.id, callbackUrl, returnUrl })
      });

      await loadDashboard();

      if (checkout.checkoutUrl) {
        window.open(checkout.checkoutUrl, "_blank", "noopener,noreferrer");
      } else {
        setMessage("Order created. Please check your invoices for payment.");
      }
    } catch (err) {
      setMessage("Unable to create order. Please try again.");
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    setMessage(null);
    try {
      const callbackUrl = `${window.location.origin}/api/payments/oxapay/webhook`;
      const returnUrl = `${window.location.origin}/dashboard`;

      const checkout = await apiFetch<{ checkoutUrl: string | null }>("/api/payments/oxapay/invoice", {
        method: "POST",
        body: JSON.stringify({ invoiceId, callbackUrl, returnUrl })
      });

      if (checkout.checkoutUrl) {
        window.open(checkout.checkoutUrl, "_blank", "noopener,noreferrer");
      } else {
        setMessage("Invoice ready. Please refresh and try again.");
      }
    } catch {
      setMessage("Payment failed. Please try again.");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-secondary text-white">
        <Navbar />
        <main className="section">
          <div className="glass rounded-3xl p-8 text-center">
            <h1 className="font-display text-3xl text-white">Sign in required</h1>
            <p className="mt-2 text-sm text-slate-300">Log in to access your dashboard.</p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white"
            >
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-white">
      <Navbar />
      <main>
        <MotionSection className="section" initial="hidden" animate="visible" variants={stagger}>
          <MotionDiv variants={fadeUp}>
            <div className="glass rounded-3xl p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Client Dashboard</p>
                  <h1 className="mt-2 font-display text-3xl text-white">Welcome back.</h1>
                  <p className="mt-2 text-sm text-slate-300">
                    Manage your services, invoices, and support tickets from a single control panel.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/60">
                    Open Ticket
                  </button>
                  <Link
                    href="/services/vps"
                    className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
                  >
                    Add Service
                  </Link>
                </div>
              </div>
              {loading && (
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                  Syncing live data...
                </p>
              )}
              {message && <p className="mt-4 text-xs text-emerald-300">{message}</p>}
            </div>
          </MotionDiv>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { label: "Active Services", value: services.length.toString() },
              { label: "Monthly Spend", value: "$0.00" },
              { label: "Tickets Open", value: "0" }
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
                {services.length === 0 && (
                  <p className="text-sm text-slate-400">No active services yet.</p>
                )}
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
                {invoices.length === 0 && (
                  <p className="text-sm text-slate-400">No invoices yet.</p>
                )}
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
                    {invoice.status.toLowerCase() === "due" && (
                      <button
                        onClick={() => handlePayInvoice(invoice.id)}
                        className="mt-3 w-full rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:scale-105"
                      >
                        Pay Invoice
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </MotionDiv>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Billing History</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>No billing history yet.</p>
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
                <p>Update your profile and security settings soon.</p>
              </div>
            </MotionDiv>
          </div>

          <div className="mt-8">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Order History</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {orders.length === 0 && <p>No orders yet.</p>}
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4">
                    <div>
                      <p className="text-white">{order.id}</p>
                      <p className="text-xs text-slate-400">{order.service}</p>
                    </div>
                    <div className="text-xs text-slate-400">{order.date}</div>
                    <div className="text-sm text-white">{order.total}</div>
                  </div>
                ))}
              </div>
            </MotionDiv>
          </div>

          <div className="mt-8">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Available Products</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {products.length === 0 && <p className="text-sm text-slate-400">No products available yet.</p>}
                {products.map((product) => (
                  <div key={product.id} className="rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white">{product.name}</p>
                    <p className="text-xs text-slate-400">{product.category}</p>
                    <p className="mt-2 text-sm text-white">${product.price}/mo</p>
                    <button
                      onClick={() => handleOrder(product.id)}
                      className="mt-3 w-full rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:scale-105"
                    >
                      Buy Now
                    </button>
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
