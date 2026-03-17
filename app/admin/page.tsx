"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { MotionDiv, MotionSection, fadeUp, stagger } from "../../components/motion";
import { apiFetch } from "../../lib/api";
import { getToken } from "../../lib/auth";
import Link from "next/link";

type Product = { id: string; name: string; price: number; status: string; categoryId?: string };

type Category = { id: string; name: string };

type Order = { id: string; user: string; amount: number; status: string };

type User = { id: string; name: string; email: string; status: string };

type Coupon = { code: string; discount: string; expires: string | null; uses: string };

export default function AdminPage() {
  const [overview, setOverview] = useState({
    totalRevenue: "$0",
    monthlyRevenue: "$0",
    activeServices: "0",
    totalUsers: "0"
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [maintenance, setMaintenance] = useState({ status: "Operational", message: "" });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

  const [newCategory, setNewCategory] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", categoryId: "" });

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
        const [overviewData, productData, orderData, userData, couponData, maintenanceData, categoryData] =
          await Promise.all([
            apiFetch<{ totalRevenue: number; monthlyRevenue: number; activeServices: number; totalUsers: number }>(
              "/api/admin/overview"
            ),
            apiFetch<Product[]>("/api/admin/products"),
            apiFetch<Order[]>("/api/admin/orders"),
            apiFetch<User[]>("/api/admin/users"),
            apiFetch<Coupon[]>("/api/admin/coupons"),
            apiFetch<{ status: string; message: string }>("/api/admin/maintenance"),
            apiFetch<Category[]>("/api/admin/categories")
          ]);

        if (!mounted) return;
        setOverview({
          totalRevenue: `$${overviewData.totalRevenue.toLocaleString()}`,
          monthlyRevenue: `$${overviewData.monthlyRevenue.toLocaleString()}`,
          activeServices: overviewData.activeServices.toLocaleString(),
          totalUsers: overviewData.totalUsers.toLocaleString()
        });
        setProducts(productData);
        setOrders(orderData);
        setUsers(userData);
        setCoupons(couponData);
        setMaintenance(maintenanceData);
        setCategories(categoryData);
      } catch {
        if (mounted) {
          setProducts([]);
          setOrders([]);
          setUsers([]);
          setCoupons([]);
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

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    const data = await apiFetch<Category>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name: newCategory })
    });
    setCategories((prev) => [...prev, data]);
    setNewCategory("");
  };

  const handleEditCategory = async (category: Category) => {
    const name = window.prompt("New category name", category.name);
    if (!name) return;
    const data = await apiFetch<Category>(`/api/admin/categories/${category.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name })
    });
    setCategories((prev) => prev.map((item) => (item.id === category.id ? data : item)));
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    const data = await apiFetch<Product>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify({
        name: newProduct.name,
        priceMonthly: Number(newProduct.price),
        categoryId: newProduct.categoryId || null
      })
    });
    setProducts((prev) => [...prev, data]);
    setNewProduct({ name: "", price: "", categoryId: "" });
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const data = await apiFetch<Product>(`/api/admin/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: updates.name,
        priceMonthly: updates.price,
        enabled: updates.status ? updates.status === "Enabled" : undefined
      })
    });
    setProducts((prev) => prev.map((item) => (item.id === id ? data : item)));
  };

  const handleDeleteProduct = async (id: string) => {
    await apiFetch<{ ok: boolean }>(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDeleteCategory = async (id: string) => {
    await apiFetch<{ ok: boolean }>(`/api/admin/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((item) => item.id !== id));
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-secondary text-white">
        <Navbar />
        <main className="section">
          <div className="glass rounded-3xl p-8 text-center">
            <h1 className="font-display text-3xl text-white">Admin access required</h1>
            <p className="mt-2 text-sm text-slate-300">Sign in with an admin account.</p>
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
                  <div key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4">
                    <div>
                      <input
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
                        value={product.name}
                        onChange={(e) =>
                          setProducts((prev) =>
                            prev.map((item) =>
                              item.id === product.id ? { ...item, name: e.target.value } : item
                            )
                          )
                        }
                      />
                      <input
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white"
                        value={product.price}
                        onChange={(e) =>
                          setProducts((prev) =>
                            prev.map((item) =>
                              item.id === product.id ? { ...item, price: Number(e.target.value) } : item
                            )
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <select
                        value={product.status}
                        onChange={(e) =>
                          setProducts((prev) =>
                            prev.map((item) =>
                              item.id === product.id ? { ...item, status: e.target.value } : item
                            )
                          )
                        }
                        className="rounded-full border border-white/20 bg-secondary px-3 py-1 text-slate-200"
                      >
                        <option>Enabled</option>
                        <option>Disabled</option>
                      </select>
                      <button
                        onClick={() => handleUpdateProduct(product.id, product)}
                        className="rounded-full border border-white/20 px-3 py-1 text-slate-200"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-full border border-white/20 px-3 py-1 text-slate-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <input
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="Product name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                />
                <input
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
                />
                <select
                  className="rounded-xl border border-white/10 bg-secondary px-3 py-2 text-sm text-white"
                  value={newProduct.categoryId}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, categoryId: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreateProduct}
                className="mt-4 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:scale-105"
              >
                Add Product
              </button>
            </MotionDiv>

            <MotionDiv variants={fadeUp} className="glass rounded-3xl p-6">
              <h2 className="font-display text-xl text-white">Category Management</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCategory(category)} className="text-accent">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteCategory(category.id)} className="text-accent">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    placeholder="New category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <button
                    onClick={handleCreateCategory}
                    className="rounded-full bg-accent px-3 py-2 text-xs font-semibold text-white"
                  >
                    Add
                  </button>
                </div>
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
                    <p className="text-xs text-slate-400">{coupon.discount} • Expires {coupon.expires || "-"}</p>
                    <p className="mt-2 text-xs text-slate-400">Uses {coupon.uses}</p>
                  </div>
                ))}
              </div>
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
                      <span className="text-slate-300">${order.amount}</span>
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
                        {user.status}
                      </span>
                    </div>
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
