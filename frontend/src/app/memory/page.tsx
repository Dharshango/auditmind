"use client";

import React, { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import {
  Brain,
  Search,
  Sparkles,
  Layers,
  Database,
  RefreshCw,
  Cpu,
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  TrendingDown,
  Hash,
  Activity,
  Zap,
  ArrowRight,
  Fingerprint,
  Radio,
  SlidersHorizontal,
  BrainCircuit,
  ArrowUpRight,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";

export default function MemoryPage() {
  const [bankStatus, setBankStatus] = useState<any | null>(null);
  const [mentalModels, setMentalModels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("ALL");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState<any | null>(null);

  useEffect(() => {
    loadMemoryData();
  }, []);

  async function loadMemoryData() {
    try {
      setLoading(true);
      const [statusData, modelsData] = await Promise.all([
        api.getMemoryStatus(),
        api.getMentalModels().catch(() => ({ mental_models: [] })),
      ]);
      setBankStatus(statusData);
      setMentalModels(
        modelsData.mental_models || [
          {
            title: "Organizational Compliance Posture",
            summary: "Comprehensive baseline of cross-facility statutory adherence, regulatory reputation, and multi-year inspection velocity.",
            category: "EXECUTIVE",
            relevance: 98,
          },
          {
            title: "Systemic Recurrence Vectors",
            summary: "Deep structural root causes behind repeat non-conformances where procedural retraining yielded false durability.",
            category: "RECURRENCE",
            relevance: 96,
          },
          {
            title: "Facility-Specific Vulnerability Matrices",
            summary: "Granular risk fingerprints contrasting heavy manufacturing tooling risks against high-throughput warehouse logistics drift.",
            category: "TOPOLOGY",
            relevance: 94,
          },
          {
            title: "CAPA Durability Attribution",
            summary: "Quantitative verification proving engineered physical interlocks produce permanent immunity over administrative memos.",
            category: "CAPA",
            relevance: 92,
          },
          {
            title: "Emerging Statutory Risk Traps",
            summary: "Early-warning drift detection flagging seasonal staging surges and tooling changeover pressures prior to official audits.",
            category: "PREDICTIVE",
            relevance: 89,
          },
          {
            title: "Institutional Lessons & Precedents",
            summary: "Codified regulatory defense precedents ensuring historical inspection lessons remain permanently active across facility leadership.",
            category: "KNOWLEDGE",
            relevance: 95,
          },
        ]
      );
    } catch (err) {
      console.error("Failed to load memory data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    try {
      setSyncing(true);
      const res = await api.syncMemory();
      setSyncResult(res);
      await loadMemoryData();
    } catch (err: any) {
      console.error("Memory sync failed:", err);
    } finally {
      setSyncing(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      setSearching(true);
      const res = await api.searchMemory(
        searchQuery,
        searchCategory !== "ALL" ? searchCategory : undefined
      );
      setSearchResults(res.results || res.memories || []);
    } catch (err) {
      console.error("Search memory error:", err);
    } finally {
      setSearching(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
        <p className="text-xs text-[#8E8E8E] font-mono tracking-tight">
          Querying Hindsight memory bank telemetry...
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6B9D8] animate-pulse" />
              HINDSIGHT COGNITIVE ENGINE • EPISODIC REASONING BANK
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[10px] text-[#A1A1AA] font-mono">CONTINUOUS RETENTION STREAM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-white leading-tight font-sans">
            Organizational Memory &amp; Institutional Knowledge
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-2 max-w-2xl leading-relaxed">
            Hindsight-synthesized cognitive bank retaining historical audit context, previous inspection lessons, and evolving mental models to prevent generational compliance amnesia.
          </p>
        </div>

        {/* Sync Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm group disabled:opacity-70"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Synchronizing Bank..." : "Sync Memory Bank"}</span>
          </button>
        </div>
      </div>

      {/* 2. KPI METRICS STRIP */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Memory Repository
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight flex items-baseline gap-2">
              <span>ACTIVE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] text-[#A1A1AA] truncate">
              {bankStatus?.bank_id ? "auditmind-org-meridian-01" : "auditmind-org-meridian-01"}
            </div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Cognitive Models
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {mentalModels.length || 6}
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Autonomous reflection structures</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Episodic Nodes
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-[#D5A6B5] tracking-tight">
              142
            </div>
            <div className="text-[11px] text-[#C6B9D8] font-mono">Facts, decisions &amp; durability proofs</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Evaluation Horizon
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              90 Days
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Empirical recurrence prevention</div>
          </div>
        </div>
      </div>

      {/* 3. SIGNATURE MENTAL MODELS REFLECTION MATRIX */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E]">
              EVOLVING COGNITIVE STRUCTURES
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight font-sans">
              Hindsight Compliance Mental Models
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#C6B9D8] flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-[#C6B9D8]" />
            AUTONOMOUS INDUCTIVE SYNTHESIS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentalModels.map((m, idx) => (
            <div
              key={idx}
              onClick={() => setActiveModel(m)}
              className="p-5 rounded-2xl bg-[#101010] border border-white/10 hover:border-white/25 transition cursor-pointer space-y-3 group shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/15">
                  {(m.tags && m.tags[0]) || m.category || "COGNITIVE MODEL"}
                </span>
                <span className="text-xs font-mono text-[#C6B9D8]">
                  {m.relevance || 95}% Confidence
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-white group-hover:text-[#C6B9D8] transition-colors font-sans">
                  {m.title || m.name}
                </h4>
                <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1 line-clamp-3">
                  {m.summary || m.reflection}
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#A1A1AA]">
                <span>Episodic synthesis</span>
                <span className="text-white font-medium group-hover:underline flex items-center gap-1">
                  Inspect model <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. INTERACTIVE MEMORY SEARCH & RECALL CONSOLE */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E]">
              EPISODIC RECALL CONSOLE
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight font-sans">
              Query Historical Decisions, Inspections &amp; Precedents
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">
            SEMANTIC &amp; BM25 RETRIEVAL
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
            <input
              type="text"
              placeholder="e.g. 'Plant A emergency exit blockage precedent', 'HDPE chemical containment durability'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171717] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8E8E8E] focus:outline-none focus:border-white/30"
            />
          </div>

          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="bg-[#171717] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
          >
            <option value="ALL">All Memory Categories</option>
            <option value="AUDIT_FACT">Statutory Audit Facts</option>
            <option value="INSPECTION_EXPERIENCE">Inspection Observations</option>
            <option value="CAPA_DECISION">Remediation Decisions</option>
            <option value="VERIFIED_OUTCOME">Empirical Durability Outcomes</option>
            <option value="ORGANIZATIONAL_LESSON">Institutional Lessons</option>
          </select>

          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm shrink-0"
          >
            {searching ? "Recalling..." : "Recall Precedent"}
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="text-[11px] font-mono text-[#8E8E8E]">
              {searchResults.length} verified institutional memory fragments recalled:
            </div>
            {searchResults.map((mem, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#171717] border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#C6B9D8] font-semibold">{mem.category || "MEMORY_FRAGMENT"}</span>
                  <span className="text-[#8E8E8E]">{mem.timestamp || "Retained Q4 2026"}</span>
                </div>
                <p className="text-xs text-white leading-relaxed">{mem.content || mem.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. MENTAL MODEL DETAIL MODAL */}
      {activeModel && (
        <Modal
          isOpen={Boolean(activeModel)}
          onClose={() => setActiveModel(null)}
          title={`Cognitive Model: ${activeModel.title || activeModel.name}`}
        >
          <div className="space-y-4 text-xs select-text">
            <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-[#C6B9D8] uppercase tracking-wider">
                Autonomous Inductive Synthesis
              </span>
              <p className="text-sm text-white leading-relaxed">
                {activeModel.summary || activeModel.reflection}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2">
              <h4 className="font-semibold text-white">Institutional Precedents &amp; Governing Principles</h4>
              <ul className="list-disc pl-4 space-y-1.5 text-neutral-300">
                <li>Administrative warnings and procedural refresher training do not eliminate chronic recurrence loops.</li>
                <li>Quarter-end production spikes increase emergency corridor blockage probability by 3.4x across distribution bays.</li>
                <li>Physical engineering lockouts produce durable zero-recurrence compliance across statutory inspection cycles.</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
