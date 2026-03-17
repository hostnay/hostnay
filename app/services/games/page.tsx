"use client";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import SectionHeading from "../../../components/SectionHeading";
import { MotionDiv, MotionSection, fadeUp, stagger } from "../../../components/motion";

const games = ["Minecraft", "Rust", "CS2", "FiveM"];
const locations = ["Frankfurt", "New York", "Singapore", "Riyadh"];
const ramOptions = ["4 GB", "8 GB", "16 GB", "32 GB"];

export default function GameServersPage() {
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
              eyebrow="Game Servers"
              title="Deploy optimized game servers in seconds"
              description="Select your game, choose the RAM tier, and launch a low-latency server backed by NVMe storage."
            />
          </MotionDiv>
          <div className="grid gap-6 md:grid-cols-3">
            {games.map((game) => (
              <MotionDiv key={game} variants={fadeUp} className="glass card-hover rounded-3xl p-6">
                <h3 className="font-display text-xl text-white">{game} Server</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Dedicated performance tuning and DDoS protection included.
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">RAM</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ramOptions.map((ram) => (
                        <span key={ram} className="rounded-full border border-white/10 px-3 py-1 text-xs">
                          {ram}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Location</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {locations.map((location) => (
                        <span key={location} className="rounded-full border border-white/10 px-3 py-1 text-xs">
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Version</p>
                    <p className="mt-2 rounded-2xl border border-white/10 px-3 py-2 text-xs text-slate-300">
                      Select the latest stable build or upload your own.
                    </p>
                  </div>
                </div>
                <button className="mt-6 w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:scale-105">
                  Deploy {game}
                </button>
              </MotionDiv>
            ))}
          </div>
        </MotionSection>
      </main>
      <Footer />
    </div>
  );
}
