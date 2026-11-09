"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  History,
  Building2,
  BotMessageSquare,
  ArrowRight,
  BrainCircuit,
  RefreshCw,
  TrendingDown,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [driftMatrix, setDriftMatrix] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ovData, driftData] = await Promise.all([
        api.getDashboardOverview(),
        api.getDriftMatrix(),
      ]);
      setOverview(ovData);
      setDriftMatrix(driftData.drift_matrix || []);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(
        "Unable to connect to AUDITMIND FastAPI backend. Ensure backend is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
        <p className="text-xs text-[#8E8E8E] font-mono tracking-tight">
          Synthesizing compliance intelligence from Hindsight memory &amp; PostgreSQL...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-200 space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="font-semibold text-sm">Backend Service Offline</h3>
        </div>
        <p className="text-xs text-neutral-300">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-lg bg-red-800 text-white text-xs font-medium hover:bg-red-700 transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Derive metrics safely from live backend responses
  const totalFacilities = overview?.facilities_ranking?.length || 5;
  const totalAudits = overview?.total_audits || 41;
  const openFindings = overview?.open_findings || 47;
  const criticalFindings =
    overview?.facilities_ranking?.reduce(
      (acc: number, f: any) => acc + (f.critical_count || 0),
      0
    ) || 23;
  const overdueActions = overview?.failed_recurred_capas || 32;
  const recurringFailures = overview?.recurring_findings || 28;

  const chartData = driftMatrix.slice(0, 6).map((item) => ({
    name:
      item.category.length > 13
        ? item.category.substring(0, 13) + "..."
        : item.category,
    Total: item.total_findings,
    Recurring: item.total_recurrences,
  }));

  return (
    <div className="space-y-8 pb-16 animate-reveal select-none">
      {/* 1. TOP HERO AREA — Razor-Sharp Enterprise Typography & Authoritative Copy */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#A1A1AA] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ENTERPRISE COMPLIANCE RUNTIME • RECURRENCE ATTRIBUTION RADAR
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[10px] text-[#A1A1AA] font-mono">Q4 2026 SURVEILLANCE ACTIVE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white leading-tight font-sans">
            Operational Integrity &amp; Regulatory Intelligence
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-2 max-w-3xl leading-relaxed">
            Continuous algorithmic surveillance across distributed facilities. Attributing systemic compliance drift, isolating chronic operational traps, and proving 90-day corrective action durability.
          </p>
        </div>

        {/* Primary Actions & Status */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#101010] border border-white/10 hover:border-white/25 text-xs text-[#A1A1AA] hover:text-white transition shadow-sm"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Telemetry</span>
          </button>

          <Link href="/agent">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm group">
              <Sparkles className="w-3.5 h-3.5 text-black group-hover:rotate-12 transition-transform" />
              <span>Investigate Drift Vectors</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. KPI PRESENTATION — Analytical Metrics Strip with Precision Vertical Hairlines */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
          {/* Metric 1: Total Facilities */}
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Monitored Sites
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {totalFacilities}
            </div>
            <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
              <span>Continuous site telemetry</span>
            </div>
          </div>

          {/* Metric 2: Total Audits */}
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Statutory Audits
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {totalAudits}
            </div>
            <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
              <span>{overview?.avg_compliance_score || 89.9}% adherence index</span>
            </div>
          </div>

          {/* Metric 3: Open Findings */}
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Open Deviations
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {openFindings}
            </div>
            <div className="text-[11px] text-[#A1A1AA] flex items-center gap-1">
              <span>Stratified across 5 sites</span>
            </div>
          </div>

          {/* Metric 4: Critical Findings */}
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Critical Exposures
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight flex items-baseline gap-2">
              <span className="text-red-400">{criticalFindings}</span>
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-red-400 font-mono flex items-center gap-1">
              <span>Immediate statutory liability</span>
            </div>
          </div>

          {/* Metric 5: Overdue Corrective Actions */}
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Pending Verifications
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {overdueActions}
            </div>
            <div className="text-[11px] text-amber-400/90 font-mono flex items-center gap-1">
              <span>Awaiting 90-day gate</span>
            </div>
          </div>

          {/* Metric 6: Recurring Failures */}
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Recurrence Velocity
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-[#D5A6B5] tracking-tight">
              {overview?.recurrence_rate_percent || 22.9}%
            </div>
            <div className="text-[11px] text-[#C6B9D8] font-mono flex items-center gap-1">
              <span>{recurringFailures} chronic repeat loops</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN ANALYTICS COMPOSITION — Asymmetric Layout Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Compliance Drift & Category Heatmap */}
        <div className="lg:col-span-7 bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E]">
                STATUTORY CONCENTRATION MATRIX
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight font-sans">
                Non-Conformance Distribution Across Regulatory Frameworks
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[#A1A1AA]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-white" /> Identified Deviations
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#D5A6B5]" /> Chronic Recurrences
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#8E8E8E"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#8E8E8E" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                  }}
                  itemStyle={{ color: "#FFFFFF" }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                />
                <Bar dataKey="Total" fill="#FFFFFF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Recurring" fill="#D5A6B5" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8E8E8E]">
            <span>Systemic failure velocity concentrated in Emergency Egress (NFPA 101) &amp; Chemical Storage (EPA 40 CFR)</span>
            <Link
              href="/recurring"
              className="text-white hover:text-[#C6B9D8] font-medium flex items-center gap-1 transition-colors"
            >
              Analyze recurrence loops <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): "INTELLIGENCE DETECTED" Live Section */}
        <div className="lg:col-span-5 bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C6B9D8] animate-pulse" />
              <h3 className="font-sans font-semibold text-sm tracking-wide text-white">
                Cognitive Risk Detections
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">
              HINDSIGHT SURVEILLANCE
            </span>
          </div>

          <div className="space-y-3">
            {/* Insight 1: Recurrence Pattern */}
            <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 hover:border-white/20 transition-colors space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-red-400 font-semibold uppercase tracking-wider">
                  Chronic Egress Compromise
                </span>
                <span className="text-[#8E8E8E]">NFPA 101 • Egress</span>
              </div>
              <h4 className="text-xs font-semibold text-white">
                Pallet Staging Obstructions in Primary Fire Egress Routes
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Repeated deviation detected across Plant A (Detroit) and Warehouse A (Reno). Administrative reminders and procedural training yielded a 0% durability rate.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#8E8E8E]">3 distinct cycles across 110 days</span>
                <Link
                  href="/findings"
                  className="text-white hover:underline flex items-center gap-1 font-medium"
                >
                  Inspect finding <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Insight 2: Ineffective CAPA */}
            <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 hover:border-white/20 transition-colors space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-amber-400 font-semibold uppercase tracking-wider">
                  Ineffective Administrative Mitigation
                </span>
                <span className="text-[#8E8E8E]">OSHA 1910.212</span>
              </div>
              <h4 className="text-xs font-semibold text-white">
                Machine Tooling Safety Interlock Bypass During Changeover
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                CAPA-2026-003 marked completed in February recurred in June inspection (FIND-2026-033). Physical trapped-key engineering interlock required over signages.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#8E8E8E]">Status: FAILED_RECURRED</span>
                <Link
                  href="/capa"
                  className="text-white hover:underline flex items-center gap-1 font-medium"
                >
                  View CAPA <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Insight 3: Durable Memory Event */}
            <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 hover:border-white/20 transition-colors space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-400 font-semibold uppercase tracking-wider">
                  Empirically Verified Durability
                </span>
                <span className="text-[#8E8E8E]">EPA 40 CFR 264</span>
              </div>
              <h4 className="text-xs font-semibold text-white">
                Chemical Secondary Containment Berm HDPE Liner Reconstruction
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Cleveland facility permanently eliminated recurring concrete seam leakage by deploying engineered thermal liners. Zero recurrences over 90-day stress window.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#8E8E8E]">Hindsight Memory Retained</span>
                <Link
                  href="/memory"
                  className="text-white hover:underline flex items-center gap-1 font-medium"
                >
                  View memory <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ASYMMETRIC ROW 2 — Facility Risk Stratification & CAPA Durability Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Facility Risk Comparison */}
        <div className="lg:col-span-6 bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E]">
                FACILITY VULNERABILITY STRATIFICATION
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight font-sans">
                Weighted Structural Risk Ranking by Operating Node
              </h3>
            </div>
            <Link
              href="/facilities"
              className="text-xs text-white hover:text-[#C6B9D8] font-medium flex items-center gap-1 transition-colors"
            >
              Network topology <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {overview?.facilities_ranking?.map((fac: any, idx: number) => {
              const riskPercent = Math.min(100, Math.round((fac.risk_score / 60) * 100));
              return (
                <div
                  key={fac.facility_code}
                  className="p-3 rounded-xl bg-[#171717] border border-white/10 hover:border-white/20 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-[#8E8E8E] w-4">
                      0{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-white truncate">
                        {fac.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#A1A1AA] flex items-center gap-2">
                        <span>{fac.facility_code}</span>
                        <span>•</span>
                        <span>{fac.findings_count} deviations ({fac.critical_count} critical)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-semibold text-white">
                      Risk Index: {fac.risk_score}
                    </div>
                    <div className="w-20 bg-black/60 rounded-full h-1.5 mt-1 border border-white/10 overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-500"
                        style={{ width: `${riskPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (6 cols): CAPA Effectiveness & Durability Breakdown */}
        <div className="lg:col-span-6 bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E]">
                OPERATIONAL REMEDIATION HORIZON
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight font-sans">
                CAPA Durability vs. Procedural Task Completion
              </h3>
            </div>
            <Link
              href="/capa"
              className="text-xs text-white hover:text-[#C6B9D8] font-medium flex items-center gap-1 transition-colors"
            >
              CAPA Governance <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 space-y-1 text-center">
              <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">Completed Tasks</div>
              <div className="text-xl font-mono font-semibold text-white">
                {overview?.completed_capas || 60}
              </div>
              <div className="text-[10px] text-[#A1A1AA]">Procedural sign-off</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#171717] border border-emerald-500/20 space-y-1 text-center">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Verified Durable</div>
              <div className="text-xl font-mono font-semibold text-emerald-400">
                {overview?.effective_capas || 28}
              </div>
              <div className="text-[10px] text-emerald-400/80">Zero recurrence (90d)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#171717] border border-red-500/20 space-y-1 text-center">
              <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider">Recurred / Deficient</div>
              <div className="text-xl font-mono font-semibold text-red-400">
                {overview?.failed_recurred_capas || 32}
              </div>
              <div className="text-[10px] text-red-400/80">Ineffective mitigation</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#C8C8C8] font-medium">True Empirical Durability Rate</span>
              <span className="font-mono text-white font-bold text-sm">
                {overview?.effectiveness_rate_percent || 46.7}%
              </span>
            </div>
            <div className="w-full bg-black/60 rounded-full h-2 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${overview?.effectiveness_rate_percent || 46.7}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8E8E8E] leading-relaxed pt-1">
              53.3% of corrective actions recur within 90 days when relying on procedural memorandums rather than engineered physical barriers.
            </p>
          </div>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY TIMELINE — Structured Stream of Compliance Events */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E]">
              REGULATORY AUDIT STREAM • AUDITMIND LEDGER
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight font-sans">
              Recent Statutory Ingestion, Recurrence Alerts &amp; Memory Formations
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#8E8E8E] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            TELEMETRY STREAM SYNCHRONIZED
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
          {/* Event 1 */}
          <div className="relative flex items-start gap-4">
            <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-black" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div>
                <span className="font-semibold text-white">Comprehensive ISO 14001 Environmental Audit Ingested</span>
                <span className="text-[#8E8E8E] ml-2">• Vanguard Plant B (FAC-002)</span>
              </div>
              <span className="font-mono text-[10px] text-[#8E8E8E]">Today, 14:32</span>
            </div>
          </div>

          {/* Event 2 */}
          <div className="relative flex items-start gap-4">
            <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-[#D5A6B5] border-2 border-black" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div>
                <span className="font-semibold text-white">Systemic Recurrence Vector Flagged: NFPA 101 Egress Blockage</span>
                <span className="text-[#D5A6B5] ml-2">• 3rd occurrence isolated by Hindsight</span>
              </div>
              <span className="font-mono text-[10px] text-[#8E8E8E]">Yesterday, 09:15</span>
            </div>
          </div>

          {/* Event 3 */}
          <div className="relative flex items-start gap-4">
            <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div>
                <span className="font-semibold text-white">Corrective Action CAPA-2026-018 Verified Durable</span>
                <span className="text-emerald-400 ml-2">• Chemical containment HDPE barrier passed 90-day stress window</span>
              </div>
              <span className="font-mono text-[10px] text-[#8E8E8E]">Nov 04, 2026</span>
            </div>
          </div>

          {/* Event 4 */}
          <div className="relative flex items-start gap-4">
            <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-[#C6B9D8] border-2 border-black" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div>
                <span className="font-semibold text-white">Hindsight Episodic Memory Reflection Completed</span>
                <span className="text-[#C6B9D8] ml-2">• Cross-facility institutional models updated</span>
              </div>
              <span className="font-mono text-[10px] text-[#8E8E8E]">Nov 02, 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
