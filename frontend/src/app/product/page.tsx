"use client";

import React from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { BrainCircuit, ShieldAlert, CheckCircle2, FileSearch, ArrowRight, Activity, Cpu } from "lucide-react";

export default function ProductPage() {
  return (
    <div className="relative min-h-screen text-white flex flex-col justify-between items-center select-none overflow-x-hidden">
      {/* Floating Header */}
      <MarketingHeader activePage="product" />

      {/* Main Content */}
      <main className="w-full max-w-5xl px-6 py-16 z-10 flex flex-col items-center">
        {/* Pill Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181B] border border-white/10 text-xs text-[#C4C2C3] animate-slide-down">
          <Cpu className="w-3.5 h-3.5 text-white" />
          <span>PRODUCTION-GRADE AI ARCHITECTURE</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white text-center tracking-tight leading-[1.1] mb-6 max-w-3xl animate-headline-1">
          Cognitive Memory Designed for Compliance Operations
        </h1>

        <p className="text-[#D0D0D0] text-base sm:text-lg text-center max-w-2xl opacity-80 mb-12 animate-reveal">
          Standard audit software forgets findings the moment a report is closed.
          AUDITMIND establishes permanent organizational memory across every facility,
          detecting systemic drift before regulatory interventions occur.
        </p>

        {/* Three Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16 animate-reveal">
          {/* Pillar 1 */}
          <div className="bg-[#111113]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center text-white mb-4">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Hindsight Memory Engine
              </h3>
              <p className="text-xs text-[#8E8E8E] leading-relaxed">
                Connects audit non-conformances, CAPA actions, and root causes across all facilities into an active mental model. Recalls historical findings in &lt;120ms during new audit intake.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#C4C2C3]">
              <span>BANK ISOLATION</span>
              <span>100% DETERMINISTIC</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#111113]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center text-white mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                90-Day Verification Protocol
              </h3>
              <p className="text-xs text-[#8E8E8E] leading-relaxed">
                Tracks remediation effectiveness beyond paperwork sign-off. Automatically flags recurrent violations that appear within 90 days at sister plants, halting the &ldquo;whack-a-mole&rdquo; cycle.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#C4C2C3]">
              <span>CLOSED-LOOP CAPA</span>
              <span>SLO TRACKING</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#111113]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-white/10 flex items-center justify-center text-white mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Autonomous Compliance Agent
              </h3>
              <p className="text-xs text-[#8E8E8E] leading-relaxed">
                Empowers compliance officers with multi-facility chat, citation cross-referencing, evidence retrieval, and executive reflection powered by Groq LLaMA 3.3 70B inference.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#C4C2C3]">
              <span>MULTI-STEP AGENT</span>
              <span>ZERO MOCK DATA</span>
            </div>
          </div>
        </div>

        {/* Technical Architecture Spec Box */}
        <div className="w-full bg-[#111113]/80 border border-white/10 rounded-2xl p-8 backdrop-blur-md mb-16 animate-reveal">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="text-xs font-mono text-[#8E8E8E] uppercase tracking-wider">
                Full-Stack Technical Foundation
              </div>
              <div className="text-xl font-semibold text-white mt-1">
                Zero-Lag Enterprise Architecture
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-100 transition shadow-[0_0_15px_rgba(255,255,255,0.2)] inline-flex items-center gap-2"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
            <div>
              <div className="text-[11px] font-mono text-[#8E8E8E] uppercase">Inference Engine</div>
              <div className="text-sm font-semibold text-white mt-1">Groq LLaMA 3.3 70B</div>
              <div className="text-[11px] text-[#71717A] mt-0.5">&lt;120ms Latency</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#8E8E8E] uppercase">Long-Term Memory</div>
              <div className="text-sm font-semibold text-white mt-1">Hindsight REST API</div>
              <div className="text-[11px] text-[#71717A] mt-0.5">Isolated Org Banks</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#8E8E8E] uppercase">Audit Document Parser</div>
              <div className="text-sm font-semibold text-white mt-1">PyMuPDF Engine</div>
              <div className="text-[11px] text-[#71717A] mt-0.5">Vector Bounding Boxes</div>
            </div>
            <div>
              <div className="text-[11px] font-mono text-[#8E8E8E] uppercase">Database &amp; ORM</div>
              <div className="text-sm font-semibold text-white mt-1">PostgreSQL + SQLAlchemy</div>
              <div className="text-[11px] text-[#71717A] mt-0.5">Multi-Tenant Enforced</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-6 text-xs text-[#71717A] border-t border-white/5 z-10">
        © 2026 AUDITMIND Operational Compliance Intelligence • Production System
      </footer>
    </div>
  );
}
