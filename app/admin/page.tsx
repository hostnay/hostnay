"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MotionDiv, MotionSection, fadeUp, stagger } from "../../components/motion";
import { fetchWithToken, login } from "../../lib/api";

const fallbackProducts = [
  { name: "VPS Basic", price: "$9", status: "Enabled" },
  { name: "VPS Pro", price: "$24", status: "Enabled" },
  { name: "Minecraft Server", price: "$18", status: "Enabled" },
  { name: "Rust Server", price: "$26", status: "Disabled" },
  { name: "Web Hosting Starter", price: "$6", status: "Enabled" }
];

const fallbackCoupons = [
  { code: "WELCOME20", discount: "20%", expires: "Apr 30, 2026", uses: "120/500" },
  { code: "GAMER15", discount: "15%", expires: "May 10, 2026", uses: "45/200" }
];

const fallbackOrders = [
  { id: "ORD-7821", user: "amina@hostnay.com", amount: "$28", status: "Pending" },
  { id: "ORD-7819", user: "leo@nebula.io", amount: "$64", status: "Approved" },
  { id: "ORD-7812", user: "sara@brightline.co", amount: "$14", status: "Refunded" }
];

const fallbackUsers = [
  { name: "Amina Farouk", email: "amina@hostnay.com", status: "Active" },
  { name: "Leo Grant", email: "leo@nebula.io", status: "Suspended" },
  { name: "Sofia Demir", email: "sofia@brightline.co", status: "Active" }
];

export default function AdminPage() {
  const [overview, setOverview] = useState({
    totalRevenue: "$482,900",
    monthlyRevenue: "$92,410",
    activeServices: "3,482",
    totalUsers: "12,904"
  });
  const [products, setProducts] = useState(fallbackProducts);
  const [coupons, setCoupons] = useState(fallbackCoupons);
  const [orders, setOrders] = useState(fallbackOrders);
  const [users, setUsers] = useState(fallbackUsers);
  const [maintenance, setMaintenance] = useState({
    status: "Operational",
    message: "Game server ordering temporarily disabled for maintenance."
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const auth = await login("admin@hostnay.com", "Admin123!");
        const [overviewData, productData, orderData, userData, couponData, maintenanceData] =
          await Promise.all([
            fetchWithToken<{ totalRevenue: number; monthlyRevenue: number; activeServices: number; totalUsers: number }>(
              "/api/admin/overview",
              auth.token
            ),
            fetchWithToken<{ id: string; name: string; price: number; status: string }[]>(
              "/api/admin/products",
              auth.token
            ),
            fetchWithToken<{ id: string; user: string; amount: number; status: string }[]>(
              "/api/admin/orders",
              auth.token
            ),
            fetchWithToken<{ id: string; name: string; email: string; status: string }[]>(
              "/api/admin/users",
              auth.token
            ),
            fetchWithToken<{ code: string; discount: string; expires: string; uses: string }[]>(
              "/api/admin/coupons",
              auth.token
            ),
            fetchWithToken<{ status: string; message: string }>("/api/admin/maintenance", auth.token)
          ]);

        if (!mounted) return;
        setOverview({
          totalRevenue: `$${overviewData.totalRevenue.toLocaleString()}`,
          monthlyRevenue: `$${overviewData.monthlyRevenue.toLocaleString()}`,
          activeServices: overviewData.activeServices.toLocaleString(),
          totalUsers: overviewData.totalUsers.toLocaleString()
        });
        setProducts(
          productData.map((product) => ({
            name: product.name,
            price: `$${product.price}`,
            status: product.status
          }))
        );
        setOrders(
          orderData.map((order) => ({
            id: order.id,
            user: order.user,
            amount: `$${order.amount}`,
            status: order.status
          }))
        );
        setUsers(
          userData.map((user) => ({
            name: user.name,
            email: user.email,
            status: user.status
          }))
        );
        setCoupons(
          couponData.map((coupon) => ({
            code: coupon.code,
            discount: coupon.discount,
            expires: new Date(coupon.expires).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            }),
            uses: coupon.uses
          }))
        );
        setMaintenance(maintenanceData);
      } catch {
        if (mounted) {
          setOverview({
            totalRevenue: "$482,900",
            monthlyRevenue: "$92,410",
            activeServices: "3,482",
            totalUsers: "12,904"
          });
          setProducts(fallbackProducts);
          setCoupons(fallbackCoupons);
          setOrders(fallbackOrders);
          setUsers(fallbackUsers);
          setMaintenance({
            status: "Operational",
            message: "Game server ordering temporarily disabled for maintenance."
          });
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
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin Console</p>
              <h1 className="mt-2 font-display text-3xl text-white">Hostnay Management</h1>
              <p className="mt-2 text-sm text-slate-300">
                Control products, billing, maintenance, and security from one secure dashboard.
              </p>
              {loading && (
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">Syncing live data...</p>
              )}
            </div>
          </MotionDiv>

          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              { label: "Total Revenue", value: overview.totalRevenue },
              { label: "Monthly Revenue", value: overview.monthlyRevenue },
              { label: "Active Services", value: overview.activeServices },
              { label: "Total Users", value: overview.totalUsers }
            ].map((item) => (
              <MotionDiv key={item.label} variants={fadeUp} className="glass rounded-2xl p-4">
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="mt-2 font-display text-2xl text-white">{item.value}</p>
              </MotionDiv>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6 lg:col-span-2">
              <h2 className="font-display text-xl text-white">Product Management</h2>
              <div className="mt-4 space-y-3">
                {products.map((product) => (
                  <div key={product.name} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.price} / month</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-white/10 px-2 py-1 text-slate-300">
                        {product.status}
                      </span>
                      <button className="rounded-full border border-white/20 px-3 py-1 text-slate-200">
                        Edit
                      </button>
                      <button className="rounded-full border border-white/20 px-3 py-1 text-slate-200">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:scale-105">
                Add Product
              </button>
            </MotionDiv>

            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Category Management</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>VPS</span>
                  <button className="text-accent">Edit</button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Game Servers</span>
                  <button className="text-accent">Edit</button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Web Hosting</span>
                  <button className="text-accent">Edit</button>
                </div>
                <button className="mt-4 w-full rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/80">
                  Add Category
                </button>
              </div>
            </MotionDiv>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Coupon System</h2>
              <div className="mt-4 space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="rounded-2xl border border-white/10 p-4">
                    <p className="text-sm text-white">{coupon.code}</p>
                    <p className="text-xs text-slate-400">{coupon.discount} • Expires {coupon.expires}</p>
                    <p className="mt-2 text-xs text-slate-400">Uses {coupon.uses}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white">
                Create Coupon
              </button>
            </MotionDiv>

            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Gift Card System</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Issued</p>
                  <p className="text-white">$24,300</p>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Redeemed</p>
                  <p className="text-white">$18,950</p>
                </div>
                <button className="mt-4 w-full rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white">
                  Generate Gift Cards
                </button>
              </div>
            </MotionDiv>

            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Maintenance</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="text-white">{maintenance.status}</p>
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Message</p>
                  <p className="text-white">{maintenance.message}</p>
                </div>
                <button className="mt-4 w-full rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white/80">
                  Enable Maintenance
                </button>
              </div>
            </MotionDiv>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Order Management</h2>
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4">
                    <div>
                      <p className="text-sm text-white">{order.id}</p>
                      <p className="text-xs text-slate-400">{order.user}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-white/10 px-2 py-1 text-slate-300">
                        {order.status}
                      </span>
                      <span className="text-slate-300">{order.amount}</span>
                      <button className="rounded-full border border-white/20 px-3 py-1 text-slate-200">
                        Approve
                      </button>
                      <button className="rounded-full border border-white/20 px-3 py-1 text-slate-200">
                        Refund
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </MotionDiv>

            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">User Management</h2>
              <div className="mt-4 space-y-3">
                {users.map((user) => (
                  <div key={user.email} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4">
                    <div>
                      <p className="text-sm text-white">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-white/10 px-2 py-1 text-slate-300">
                        {user.status}</span>
                      <button className="rounded-full border border-white/20 px-3 py-1 text-slate-200">
                        Suspend
                      </button>
                      <button className="rounded-full border border-white/20 px-3 py-1 text-slate-200">
                        Reset Password
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </MotionDiv>
          </div>

          <div className="mt-8">
            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Analytics Dashboard</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  { label: "New Orders", value: "248" },
                  { label: "Churn Rate", value: "1.8%" },
                  { label: "Avg. Response", value: "42m" }
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 p-4">
                    <p className="text-xs text-slate-400">{item.label}</p>
                    <p className="mt-2 text-lg text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Revenue Trend</p>
                  <div className="mt-4 h-32 rounded-xl bg-gradient-to-r from-accent/40 to-sky-400/20" />
                </div>
                <div className="rounded-2xl border border-white/10 p-4">
                  <p className="text-xs text-slate-400">Active Services Growth</p>
                  <div className="mt-4 h-32 rounded-xl bg-gradient-to-r from-sky-400/20 to-emerald-400/30" />
                </div>
              </div>
            </MotionDiv>
          </div>
        </MotionSection>
      </main>
      <Footer />
    </div>
  );
}
