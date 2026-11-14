"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  History,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";

export default function IntelligencePage() {
  const [overview, setOverview] = useState<any>(null);
  const [driftMatrix, setDriftMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ovData, driftData] = await Promise.all([
          api.getDashboardOverview(),
          api.getDriftMatrix(),
        ]);
        setOverview(ovData);
        setDriftMatrix(driftData?.drift_matrix || []);
      } catch (err) {
        console.error("Failed to load intelligence telemetry", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-16 animate-reveal select-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[42px] text-white tracking-tight leading-tight font-normal">
            Compliance Intelligence
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-1.5 max-w-3xl leading-relaxed">
            Predictive drift analysis, cross-facility risk attribution, and compliance velocity.
          </p>
        </div>

        <Link href="/agent">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm group">
            <Sparkles className="w-3.5 h-3.5 text-black group-hover:rotate-12 transition-transform" />
            <span>Launch AI Forensic Agent</span>
          </button>
        </Link>
      </div>

      {/* Integration Notice */}
      <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#A1A1AA]">
          <ShieldAlert className="w-4 h-4 text-[#D5A6B5] shrink-0" />
          <span>
            This regulatory analysis is also embedded directly within{" "}
            <Link href="/recurring" className="text-white underline font-semibold hover:text-[#C6B9D8]">
              Intelligence &gt; Recurring Failures
            </Link>{" "}
            for integrated recurrence and standard drift tracking.
          </span>
        </div>
        <Link
          href="/recurring"
          className="text-xs text-[#C6B9D8] hover:text-white font-mono flex items-center gap-1 shrink-0"
        >
          <span>View in Recurring Failures →</span>
        </Link>
      </div>

      {/* Intelligence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93]">
            <span>SYSTEMIC DRIFT INDEX</span>
            <ShieldAlert className="w-4 h-4 text-[#D5A6B5]" />
          </div>
          <div className="text-3xl font-mono font-semibold text-white tracking-tight">
            {overview?.recurrence_rate_percent || 22.9}%
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Proportion of all statutory deviations that recur across identical operating lines within 90 days of procedural closure.
          </p>
        </div>

        <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93]">
            <span>ORGANIZATIONAL MEMORIES</span>
            <BrainCircuit className="w-4 h-4 text-[#C6B9D8]" />
          </div>
          <div className="text-3xl font-mono font-semibold text-white tracking-tight">
            18 Banking Nodes
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Active Hindsight experiential vectors capturing machine safety, fire egress, and chemical containment failure precedents.
          </p>
        </div>

        <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93]">
            <span>VERIFIED CAPA DURABILITY</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-semibold text-emerald-400 tracking-tight">
            {overview?.effectiveness_rate_percent || 46.7}%
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Empirically verified corrective mitigations demonstrating zero recurrence across the complete 90-day statutory stress window.
          </p>
        </div>
      </div>

      {/* Regulatory Categories Matrix */}
      <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E93]">
              STATUTORY EXPOSURE CLUSTERS
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight font-sans">
              Concentration of Deviations by Standard &amp; Category
            </h3>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {driftMatrix.map((item, idx) => (
            <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate font-sans">
                  {item.category}
                </div>
                <div className="text-xs text-[#8E8E93] font-mono mt-0.5">
                  Total Deviations: {item.total_findings} • Recurrences: {item.total_recurrences}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 text-[#EDEDED] border border-white/10">
                  {Math.round((item.total_recurrences / (item.total_findings || 1)) * 100)}% Recurrence
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
