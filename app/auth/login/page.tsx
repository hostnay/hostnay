"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { login } from "../../../lib/api";
import { setToken } from "../../../lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      setToken(data.token);
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary text-white">
      <Navbar />
      <main className="section">
        <div className="mx-auto max-w-md glass rounded-3xl p-8">
          <h1 className="font-display text-3xl text-white">Sign In</h1>
          <p className="mt-2 text-sm text-slate-300">Access your Hostnay dashboard.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                required
              />
            </div>
            {error && <p className="text-xs text-rose-300">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:scale-105 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="mt-4 text-xs text-slate-400">
            Don’t have an account?{" "}
            <Link href="/auth/register" className="text-accent hover:text-sky-300">
              Register
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
