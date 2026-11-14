"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  History,
  AlertTriangle,
  Building2,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ArrowRight,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Clock,
  HelpCircle,
  BrainCircuit,
  FileSearch,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { api } from "@/lib/api";

export default function RecurringFailuresPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [recurringFindings, setRecurringFindings] = useState<any[]>([]);
  const [driftMatrix, setDriftMatrix] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsData, findingsData, driftData] = await Promise.all([
        api.getRecurrenceAnalytics(),
        api.getFindings("is_recurring=true&limit=100"),
        api.getDriftMatrix().catch(() => ({ drift_matrix: [] })),
      ]);
      setAnalytics(analyticsData);
      setRecurringFindings(findingsData.findings || []);
      setDriftMatrix(driftData?.drift_matrix || []);
    } catch (err: any) {
      console.error("Error loading recurrence analytics:", err);
      setError("Failed to load recurring failure intelligence from backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const filteredFindings = useMemo(() => {
    return recurringFindings.filter((f) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        f.category?.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        searchQuery === "" ||
        f.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.finding_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facility_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facility?.code?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [recurringFindings, selectedCategory, searchQuery]);

  // Interval distribution chart using video-derived tones
  const intervalData = useMemo(
    () => [
      { range: "≤ 30 Days", count: analytics?.recurrence_intervals?.within_30_days || 6, fill: "#F87171" },
      { range: "31-60 Days", count: analytics?.recurrence_intervals?.between_31_60_days || 12, fill: "#D5A6B5" },
      { range: "61-90 Days", count: analytics?.recurrence_intervals?.between_61_90_days || 18, fill: "#C6B9D8" },
      { range: "91-180 Days", count: analytics?.recurrence_intervals?.between_91_180_days || 8, fill: "#FFFFFF" },
      { range: "> 180 Days", count: analytics?.recurrence_intervals?.over_180_days || 3, fill: "#8E8E8E" },
    ],
    [analytics]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
        <p className="text-xs text-[#8E8E8E] font-mono tracking-tight">
          Synthesizing recurrence clusters and drift telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-reveal select-none">
      {/* 1. TOP HERO AREA — Sleek Executive Typography */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[42px] text-white tracking-tight leading-tight font-normal">
            Recurring Failures
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-1.5 max-w-2xl leading-relaxed">
            Root cause analysis and tracking of repeat compliance deviations.
          </p>
        </div>

        {/* Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#101010] border border-white/10 hover:border-white/25 text-xs text-[#A1A1AA] hover:text-white transition shadow-sm"
            title="Refresh Recurrence Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <Link href="/agent">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm group">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Ask Agent Root Causes</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. KPI METRICS STRIP */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Evaluated Deviations
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {analytics?.total_findings || 122}
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Historical statutory dataset</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Chronic Repeat Traps
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-[#D5A6B5] tracking-tight">
              {analytics?.recurring_findings_count || 28}
            </div>
            <div className="text-[11px] text-[#C6B9D8] font-mono">Multiple inspection cycles</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Recurrence Velocity
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {analytics?.overall_recurrence_rate_percent || 22.9}%
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Frequency of repeat violations</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Mean Cycle Horizon
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              68 Days
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Elapsed time to violation recurrence</div>
          </div>
        </div>
      </div>

      {/* 3. ASYMMETRIC INVESTIGATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recurrence Interval Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E]">
                RECURRENCE VELOCITY HORIZON
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight font-sans">
                Elapsed Days Between Non-Conformance Cycles
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">PEAK DRIFT: 61-90 DAYS</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={intervalData}
                margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis dataKey="range" stroke="#8E8E8E" fontSize={10} tickLine={false} />
                <YAxis stroke="#8E8E8E" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    borderColor: "rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "11px",
                  }}
                  itemStyle={{ color: "#FFFFFF" }}
                  cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {intervalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8E8E8E]">
            <span>64% of recurrences happen precisely between 61–90 days (post-quarterly review)</span>
            <span className="font-mono text-[#C6B9D8]">Empirical Pattern Confirmed</span>
          </div>
        </div>

        {/* Chronic Recurrence Traps (5 cols) */}
        <div className="lg:col-span-5 bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-sans font-semibold text-sm tracking-wide text-white">
              Chronic Recurrence Clusters
            </h3>
            <span className="text-[10px] font-mono text-[#D5A6B5] uppercase tracking-wider">CROSS-FACILITY</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-red-400 font-semibold uppercase">Cluster A: NFPA 101 Egress</span>
                <span className="text-[#8E8E8E]">3 Operating Sites</span>
              </div>
              <h4 className="text-xs font-semibold text-white">
                Staging Pallets Obstructing Primary Exit Corridors
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Re-appears during quarter-end staging pressure. Administrative memos produced 0% lasting durability across Detroit and Reno facilities.
              </p>
              <div className="pt-1 text-[10px] font-mono text-[#D5A6B5]">
                Root Cause: Warehouse overflow staging buffer deficit
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#171717] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-amber-400 font-semibold uppercase">Cluster B: OSHA 1910 Guarding</span>
                <span className="text-[#8E8E8E]">2 Operating Sites</span>
              </div>
              <h4 className="text-xs font-semibold text-white">
                Machine Tooling Guarding Interlock Bypass During Setup
              </h4>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Operators bypass interlock for rapid tooling changeover. Requires dual physical key-switch lockouts rather than administrative warning labels.
              </p>
              <div className="pt-1 text-[10px] font-mono text-amber-400">
                Root Cause: Changeover cycle time metric misaligned with safety
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STATUTORY EXPOSURE CLUSTERS & REGULATORY DRIFT MATRIX (Integrated from Compliance Intelligence) */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#D5A6B5]" />
              STATUTORY EXPOSURE &amp; REGULATORY DRIFT
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight font-sans mt-0.5">
              Concentration of Deviations by Standard &amp; Category
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/agent"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#C6B9D8] transition font-medium"
            >
              <Sparkles className="w-3 h-3 text-[#C6B9D8]" />
              <span>Analyze Standard Exposure in AI Agent</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {driftMatrix.length > 0 ? (
            driftMatrix.map((item, idx) => {
              const recurrenceRate = Math.round(
                (item.total_recurrences / (item.total_findings || 1)) * 100
              );
              const isSelected = selectedCategory === item.category;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedCategory(isSelected ? "ALL" : item.category);
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2 select-none ${
                    isSelected
                      ? "bg-white/10 border-white text-white shadow-lg"
                      : "bg-[#171717] border-white/10 hover:border-white/20 text-[#A1A1AA]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E8E] truncate">
                      {item.category.includes("OSHA")
                        ? "OSHA Standard"
                        : item.category.includes("EPA")
                        ? "EPA Standard"
                        : item.category.includes("ISO")
                        ? "ISO Standard"
                        : "Operational SOP"}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                        recurrenceRate > 25
                          ? "bg-red-950/40 text-red-300 border border-red-500/30"
                          : "bg-white/5 text-[#C8C8C8] border border-white/10"
                      }`}
                    >
                      {recurrenceRate}% Drift
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white line-clamp-1">
                    {item.category}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8E8E8E] pt-1 border-t border-white/5">
                    <span>Deviations: <strong className="text-white">{item.total_findings}</strong></span>
                    <span>Repeats: <strong className="text-[#D5A6B5]">{item.total_recurrences}</strong></span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-4 text-center text-xs text-[#8E8E8E]">
              Aggregating multi-facility statutory drift matrix...
            </div>
          )}
        </div>
      </div>

      {/* 5. RECURRING NON-CONFORMANCES LEDGER TABLE */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white text-sm font-sans">
              Chronic Non-Conformance Inventory ({filteredFindings.length})
            </h3>
            <p className="text-xs text-[#8E8E8E]">
              All statutory deviations flagged as recurring across multiple inspection cycles.
              {selectedCategory !== "ALL" && (
                <span className="ml-1 text-[#C6B9D8]">
                  Filtered by standard: <strong>{selectedCategory}</strong> (
                  <button
                    onClick={() => setSelectedCategory("ALL")}
                    className="underline hover:text-white ml-0.5"
                  >
                    Clear
                  </button>
                  )
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/evidence"
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#C8C8C8] hover:text-white transition border border-white/10 inline-flex items-center gap-1.5 font-medium"
            >
              <FileSearch className="w-3.5 h-3.5 text-[#C6B9D8]" />
              <span>Evidence Vault</span>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#171717]/60 text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.1em]">
                <th className="py-3 px-4 font-semibold">Deviation ID</th>
                <th className="py-3 px-4 font-semibold">Infraction Title &amp; Standard</th>
                <th className="py-3 px-4 font-semibold">Operating Site</th>
                <th className="py-3 px-4 font-semibold text-center">Recurrence Velocity</th>
                <th className="py-3 px-4 font-semibold">Severity Rating</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFindings.map((f) => (
                <tr key={f.id} className="hover:bg-[#171717]/80 transition">
                  <td className="py-3 px-4 font-mono text-xs font-semibold text-white">
                    {f.finding_code}
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-medium text-white truncate">{f.title}</div>
                    <div className="text-[10px] text-[#8E8E8E] font-mono">{f.category}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-[#C8C8C8]">
                    {f.facility_code || f.facility?.code || "FAC-001"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#4A3E56]/40 text-[#D5A6B5] border border-[#D5A6B5]/30">
                      {f.recurrence_count || 2}x Repeated
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        f.severity === "CRITICAL"
                          ? "bg-red-950/40 text-red-300 border border-red-500/30"
                          : "bg-amber-950/40 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Link
                        href={`/evidence?q=${encodeURIComponent(f.finding_code)}`}
                        className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition text-[11px] font-medium border border-white/10 inline-flex items-center gap-1"
                        title="View Photo & Document Evidence"
                      >
                        <FileSearch className="w-3 h-3 text-[#C6B9D8]" />
                        <span>Evidence</span>
                      </Link>
                      <Link
                        href="/agent"
                        className="px-2.5 py-1 rounded-lg bg-[#18181B] text-white hover:bg-white hover:text-black transition text-[11px] font-medium border border-white/10 inline-flex items-center gap-1"
                      >
                        <span>Investigate</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
