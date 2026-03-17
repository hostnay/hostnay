import "./globals.css";
import type { Metadata } from "next";
import { Sora, Space_Grotesk } from "next/font/google";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap"
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Hostnay | Premium Hosting Platform",
  description: "High performance VPS, game server, and web hosting with modern cloud tooling.",
  icons: [{ rel: "icon", url: "/favicon.svg" }]
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${space.variable}`}>
      <body className="bg-secondary text-white font-body antialiased">
        {children}
      </body>
    </html>
  );
}
