"use client";

import React from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2, History, Building2 } from "lucide-react";

export default function CaseStudiesPage() {
  return (
    <div className="relative min-h-screen text-white flex flex-col justify-between items-center select-none overflow-x-hidden">
      {/* Floating Header */}
      <MarketingHeader activePage="case-studies" />

      {/* Main Content */}
      <main className="w-full max-w-5xl px-6 py-16 z-10 flex flex-col items-center">
        {/* Pill Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181B] border border-white/10 text-xs text-[#C4C2C3] animate-slide-down">
          <History className="w-3.5 h-3.5 text-white" />
          <span>ENTERPRISE CASE STUDY: MERIDIAN INDUSTRIAL GROUP</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white text-center tracking-tight leading-[1.1] mb-6 max-w-3xl animate-headline-1">
          The Compliance Failure That Kept Coming Back
        </h1>

        <p className="text-[#D0D0D0] text-base sm:text-lg text-center max-w-2xl opacity-80 mb-12 animate-reveal">
          How Meridian Industrial Group eliminated recurring OSHA violations across 5 industrial manufacturing plants by connecting audit history to an autonomous cognitive memory engine.
        </p>

        {/* Story Narrative Box */}
        <div className="w-full bg-[#111113]/90 border border-white/10 rounded-2xl p-8 backdrop-blur-md mb-12 animate-reveal">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div>
              <div className="text-xs font-mono text-[#8E8E8E] uppercase">
                Facility Network
              </div>
              <div className="text-lg font-semibold text-white mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white" />
                <span>5 Manufacturing &amp; Logistics Hubs • 1,840 Personnel</span>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-[#18181B] border border-white/10 text-xs font-mono text-white">
              ROI: $420,000 Penalties Avoided
            </div>
          </div>

          {/* Timeline of the Failure */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            {/* Step 1 */}
            <div className="p-5 rounded-xl bg-[#18181B]/70 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8E8E8E]">OCTOBER 2024</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30">
                  INCIDENT 1
                </span>
              </div>
              <div className="font-semibold text-white text-sm">
                Cleveland Stamping (FAC-001)
              </div>
              <p className="text-xs text-[#8E8E8E] leading-relaxed">
                Auditors discover missing fire-safety records and obstructed egress corridors. A CAPA was initiated, signed off, and marked &ldquo;verified&rdquo; in the siloed spreadsheet tracker.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-xl bg-[#18181B]/70 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8E8E8E]">MARCH 2025</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                  RECURRENCE
                </span>
              </div>
              <div className="font-semibold text-white text-sm">
                Detroit Assembly (FAC-003)
              </div>
              <p className="text-xs text-[#8E8E8E] leading-relaxed">
                Six months later, Detroit Assembly receives a major citation for the identical egress and documentation root cause. Plant managers were unaware Cleveland had solved it earlier.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-xl bg-[#18181B]/70 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#8E8E8E]">DEPLOYMENT</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                  AuditMind
                </span>
              </div>
              <div className="font-semibold text-white text-sm">
                Cross-Plant Memory Recall
              </div>
              <p className="text-xs text-[#8E8E8E] leading-relaxed">
                Hindsight memory banks ingested all historical non-conformances. When Gary Engine entered its Q2 audit, AuditMind proactively surfaced the pattern and triggered corrective actions in 48 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison: Memoryless vs. Memory-Enabled */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 animate-reveal">
          <div className="bg-[#111113]/80 border border-white/10 rounded-2xl p-6">
            <div className="text-xs font-mono text-red-400 uppercase tracking-wider mb-2">
              Traditional Memoryless Systems
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Isolated Audits &amp; Amnesia
            </h3>
            <ul className="space-y-3 text-xs text-[#8E8E8E]">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>Audits are filed as isolated PDF attachments with zero cross-plant awareness.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>Remediations are closed administratively without empirical 90-day verification.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span>Root causes replicate across sister plants until regulatory fines are levied.</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#111113]/80 border border-white/20 rounded-2xl p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <div className="text-xs font-mono text-white uppercase tracking-wider mb-2">
              AuditMind Cognitive Engine
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Permanent Cross-Plant Recall
            </h3>
            <ul className="space-y-3 text-xs text-neutral-200">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span>Every non-conformance is embedded into Hindsight memory banks with tag taxonomy.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span>Automated recurrence engine alerts compliance directors before external audits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white mt-1.5 shrink-0" />
                <span>AI compliance agent reflects on systemic patterns and drafts preventive action plans.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center animate-reveal">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-100 transition shadow-[0_0_24px_rgba(255,255,255,0.3)] inline-flex items-center gap-2"
          >
            <span>Review Live Meridian Dataset</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-6 text-xs text-[#71717A] border-t border-white/5 z-10">
        © 2026 AuditMind Operational Compliance Intelligence • Production System
      </footer>
    </div>
  );
}
