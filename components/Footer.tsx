import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-secondary/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <h3 className="font-display text-lg text-white">Hostnay</h3>
          <p className="mt-3 text-sm text-slate-300">
            Premium hosting infrastructure built for speed, control, and scale.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Services</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>
              <Link href="/services/vps" className="hover:text-white">
                VPS Hosting
              </Link>
            </li>
            <li>
              <Link href="/services/games" className="hover:text-white">
                Game Servers
              </Link>
            </li>
            <li>
              <Link href="/services/web-hosting" className="hover:text-white">
                Web Hosting
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Platform</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Control Panel</li>
            <li>Billing & Payments</li>
            <li>Monitoring</li>
            <li>Security</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>support@hostnay.com</li>
            <li>+1 (800) 555-0199</li>
            <li>Riyadh • New York • Frankfurt</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-6 text-center text-xs text-slate-400">
        © 2026 Hostnay. All rights reserved.
      </div>
    </footer>
  );
}
