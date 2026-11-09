"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  Search,
  Filter,
  Sparkles,
  ShieldAlert,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Camera,
  Hash,
  Clock,
  CheckCircle,
  FileText,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";

interface FindingRecord {
  id: string;
  finding_code: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  regulation_ref?: string;
  identified_date?: string;
  status: string;
  is_recurring?: boolean;
  recurrence_count?: number;
  risk_score?: number;
  facility?: {
    code?: string;
    name?: string;
  };
  audit?: {
    audit_code?: string;
    title?: string;
  };
  evidence?: any[];
}

export default function FindingsPage() {
  const [findings, setFindings] = useState<FindingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [activeFinding, setActiveFinding] = useState<FindingRecord | null>(null);

  useEffect(() => {
    loadFindings();
  }, []);

  async function loadFindings() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getFindings();
      setFindings(res.findings || res || []);
    } catch (err: any) {
      console.error("Failed to load findings:", err);
      setError("Unable to load findings. Ensure backend is running on port 8000.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadFindings();
  }

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const matchSeverity =
        selectedSeverity === "ALL" || f.severity === selectedSeverity;
      const matchStatus =
        selectedStatus === "ALL" || f.status === selectedStatus;
      const matchSearch =
        search === "" ||
        f.title?.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase()) ||
        f.finding_code?.toLowerCase().includes(search.toLowerCase()) ||
        f.category?.toLowerCase().includes(search.toLowerCase()) ||
        f.facility?.name?.toLowerCase().includes(search.toLowerCase());

      return matchSeverity && matchStatus && matchSearch;
    });
  }, [findings, selectedSeverity, selectedStatus, search]);

  const totalCount = findings.length;
  const openCount = findings.filter(
    (f) => f.status === "OPEN" || f.status === "IN_REMEDIATION"
  ).length;
  const criticalCount = findings.filter((f) => f.severity === "CRITICAL").length;
  const recurringCount = findings.filter((f) => f.is_recurring).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
        <p className="text-xs text-[#8E8E8E] font-mono tracking-tight">
          Loading non-conformance records and regulatory references...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-reveal select-none">
      {/* 1. TOP HERO AREA — Sleek Executive Typography */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#A1A1AA] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              STATUTORY DEVIATION REPOSITORY • EVIDENCE-BACKED LEDGER
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[10px] text-[#A1A1AA] font-mono">MERIDIAN INDUSTRIAL GROUP</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white leading-tight font-sans">
            Findings &amp; Non-Conformance Intelligence
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-2 max-w-2xl leading-relaxed">
            Comprehensive ledger of physical hazards and procedural infractions. Automated classification of chronic recurrence loops and statutory penalties.
          </p>
        </div>

        {/* Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#101010] border border-white/10 hover:border-white/25 text-xs text-[#A1A1AA] hover:text-white transition shadow-sm"
            title="Refresh Findings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>

          <Link href="/recurring">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm group">
              <ShieldAlert className="w-3.5 h-3.5 text-black" />
              <span>Inspect Recurrences</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. KPI METRICS STRIP */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Total Deviations
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {totalCount}
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Cataloged from certified audits</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Active Remediation
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {openCount}
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Assigned to engineering teams</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Critical Exposures
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-red-400 tracking-tight flex items-baseline gap-2">
              <span>{criticalCount}</span>
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-red-400/90 font-mono">Immediate life-safety risk</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Chronic Recurrence Traps
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-[#D5A6B5] tracking-tight">
              {recurringCount}
            </div>
            <div className="text-[11px] text-[#C6B9D8] font-mono">Failed previous administrative CAPAs</div>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & RESTRAINED FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
          <input
            type="text"
            placeholder="Search finding code, regulatory standard, facility, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#101010] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#8E8E8E] focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Severity filter pills */}
          <div className="flex gap-1.5 p-1 rounded-xl bg-[#101010] border border-white/10 text-xs">
            {["ALL", "CRITICAL", "MAJOR", "MINOR"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedSeverity === sev
                    ? "bg-white text-black font-semibold"
                    : "text-[#8E8E8E] hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#101010] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
          >
            <option value="ALL">All Operational Statuses</option>
            <option value="OPEN">Open Deviations</option>
            <option value="IN_REMEDIATION">In Remediation</option>
            <option value="CLOSED">Closed &amp; Verified Durable</option>
          </select>
        </div>
      </div>

      {/* 4. VISUALLY ORGANIZED LEDGER TABLE */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-[#171717]/60 text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.1em]">
                <th className="py-3.5 px-4 font-semibold">Deviation ID</th>
                <th className="py-3.5 px-4 font-semibold">Finding Title &amp; Statutory Standard</th>
                <th className="py-3.5 px-4 font-semibold">Operating Site</th>
                <th className="py-3.5 px-4 font-semibold">Severity Rating</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-center">Pattern History</th>
                <th className="py-3.5 px-4 font-semibold text-right">Forensic Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredFindings.map((f) => {
                const isCritical = f.severity === "CRITICAL";
                const isMajor = f.severity === "MAJOR";
                return (
                  <tr
                    key={f.id}
                    onClick={() => setActiveFinding(f)}
                    className="hover:bg-[#171717]/80 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-white whitespace-nowrap">
                      {f.finding_code}
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-medium text-white truncate group-hover:text-[#C6B9D8] transition-colors">
                        {f.title}
                      </div>
                      <div className="text-[10px] text-[#8E8E8E] font-mono mt-0.5">
                        {f.regulation_ref || f.category}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-[#C8C8C8]">
                        {f.facility?.code || "FAC-001"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          isCritical
                            ? "bg-red-950/40 text-red-300 border border-red-500/30"
                            : isMajor
                            ? "bg-amber-950/40 text-amber-300 border border-amber-500/30"
                            : "bg-[#18181B] text-[#A1A1AA] border border-white/10"
                        }`}
                      >
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-mono text-[#A1A1AA]">
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {f.is_recurring ? (
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#4A3E56]/40 text-[#D5A6B5] border border-[#D5A6B5]/30">
                          RECURRING ({f.recurrence_count || 2}x)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#8E8E8E]">
                          Initial Discovery
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveFinding(f);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#18181B] text-white hover:bg-white hover:text-black transition text-[11px] font-medium border border-white/10"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SLIDE-OVER / DETAIL MODAL */}
      {activeFinding && (
        <Modal
          isOpen={Boolean(activeFinding)}
          onClose={() => setActiveFinding(null)}
          title={`Forensic Investigation: ${activeFinding.finding_code}`}
        >
          <div className="space-y-6 text-xs select-text">
            <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    activeFinding.severity === "CRITICAL"
                      ? "bg-red-950/50 text-red-300 border border-red-500/40"
                      : "bg-amber-950/50 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {activeFinding.severity}
                </span>
                <span className="text-[10px] font-mono text-[#8E8E8E]">
                  Status: {activeFinding.status}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-white">
                {activeFinding.title}
              </h3>

              <p className="text-xs text-[#C8C8C8] leading-relaxed">
                {activeFinding.description}
              </p>

              <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] font-mono text-[#8E8E8E]">
                <div>Operating Node: <span className="text-white">{activeFinding.facility?.name || activeFinding.facility?.code}</span></div>
                <div>Statutory Citation: <span className="text-white">{activeFinding.regulation_ref || activeFinding.category}</span></div>
                <div>Audit Protocol: <span className="text-white">{activeFinding.audit?.audit_code || "AUD-2026-001"}</span></div>
                <div>Risk Rating Index: <span className="text-white">{activeFinding.risk_score || 8.5}/10</span></div>
              </div>
            </div>

            {/* Recurrence telemetry if recurring */}
            {activeFinding.is_recurring && (
              <div className="p-3.5 rounded-xl bg-[#4A3E56]/20 border border-[#D5A6B5]/30 space-y-1.5">
                <div className="text-[10px] font-mono text-[#D5A6B5] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Chronic Failure Trap Detected
                </div>
                <p className="text-xs text-[#C6B9D8] leading-relaxed">
                  This non-conformance has recurred across {activeFinding.recurrence_count || 2} distinct audit cycles despite previously signed-off corrective action tasks.
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <Link
                href="/agent"
                className="text-xs text-[#C6B9D8] hover:underline flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI Agent for root cause analysis →</span>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
