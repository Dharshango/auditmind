"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Building2,
  MapPin,
  Layers,
  Users,
  AlertCircle,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Activity,
  Calendar,
  Sparkles,
  Network,
  List,
  ChevronRight,
  ExternalLink,
  BrainCircuit,
  FileCheck2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";

interface Facility {
  id?: string;
  facility_code: string;
  name: string;
  location: string;
  facility_type: string;
  audit_count: number;
  open_findings_count?: number;
  metadata?: {
    sqft?: number;
    shifts?: number;
    primary_ops?: string;
  };
}

interface FacilityDetail extends Facility {
  open_findings?: Array<{
    id: string;
    finding_code?: string;
    title: string;
    severity: string;
    category: string;
    is_recurring?: boolean;
    recurrence_count?: number;
    audit_date?: string;
  }>;
  recent_audits?: Array<{
    id: string;
    audit_code: string;
    audit_type: string;
    audit_date: string;
    score?: number;
  }>;
}

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<FacilityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"network" | "list">("network");
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const fetchFacilities = async () => {
    try {
      setRefreshing(true);
      const data = await api.getFacilities();
      setFacilities(data.facilities || []);
      if (data.facilities?.length > 0 && !activeNode) {
        setActiveNode(data.facilities[0].facility_code);
      }
    } catch (err) {
      console.error("Error loading facilities:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openFacilityDetail = async (code: string) => {
    setActiveNode(code);
    setDetailLoading(true);
    try {
      const detail = await api.getFacility(code);
      setSelectedFacility(detail);
    } catch (err) {
      console.error("Facility detail error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const facilityTypes = useMemo(() => {
    const types = new Set<string>();
    facilities.forEach((f) => {
      if (f.facility_type) types.add(f.facility_type);
    });
    return ["ALL", ...Array.from(types)];
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchesSearch =
        searchQuery === "" ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.facility_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === "ALL" || f.facility_type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [facilities, searchQuery, selectedType]);

  const totalSqFt = useMemo(() => {
    return facilities.reduce((sum, f) => sum + (f.metadata?.sqft || 0), 0);
  }, [facilities]);

  const totalAudits = useMemo(() => {
    return facilities.reduce((sum, f) => sum + (f.audit_count || 0), 0);
  }, [facilities]);

  // Topology node coordinates for 5 facilities in a constellation
  const nodePositions: Record<string, { x: number; y: number }> = {
    "FAC-001": { x: 280, y: 130 },
    "FAC-002": { x: 580, y: 110 },
    "FAC-003": { x: 430, y: 260 },
    "FAC-004": { x: 210, y: 390 },
    "FAC-005": { x: 650, y: 380 },
  };

  // Shared compliance relationships between facilities
  const relationships = [
    { from: "FAC-001", to: "FAC-004", reason: "Shared NFPA 101 Egress Recurrence" },
    { from: "FAC-002", to: "FAC-003", reason: "EPA 40 CFR Secondary Containment Drift" },
    { from: "FAC-001", to: "FAC-002", reason: "Common ISO 9001 Stamping Press Operations" },
    { from: "FAC-003", to: "FAC-005", reason: "Shared Logistics Hazmat Handling Procedures" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-8 h-8 text-white animate-spin" />
        <p className="text-xs text-[#8E8E8E] font-mono tracking-tight">
          Loading facility network topology...
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
            Facility Network
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-1.5 max-w-2xl leading-relaxed">
            Operational status and risk topology across your facilities.
          </p>
        </div>

        {/* View Switcher & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center p-1 rounded-full bg-[#101010] border border-white/10 text-xs">
            <button
              onClick={() => setViewMode("network")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
                viewMode === "network"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-[#8E8E8E] hover:text-white"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Constellation Map</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all ${
                viewMode === "list"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-[#8E8E8E] hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Structured Ledger</span>
            </button>
          </div>

          <button
            onClick={fetchFacilities}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#101010] border border-white/10 hover:border-white/25 text-xs text-[#A1A1AA] hover:text-white transition shadow-sm"
            title="Refresh Facility Status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* 2. KPI PRESENTATION — Analytical Metrics Strip */}
      <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Operating Nodes
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {facilities.length}
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Manufacturing &amp; logistics sites</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Surveillance Area
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {(totalSqFt / 1000).toLocaleString()}k <span className="text-xs font-normal text-[#8E8E8E]">sq ft</span>
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Continuous physical floor monitoring</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Ingested Audits
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-white tracking-tight">
              {totalAudits}
            </div>
            <div className="text-[11px] text-[#A1A1AA]">Complete regulatory documentation</div>
          </div>

          <div className="p-3 md:p-4 space-y-1">
            <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em]">
              Active Risk Vectors
            </div>
            <div className="text-2xl md:text-3xl font-mono font-semibold text-[#D5A6B5] tracking-tight">
              {relationships.length}
            </div>
            <div className="text-[11px] text-[#C6B9D8] font-mono">Cross-facility correlation paths</div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE NETWORK OR STRUCTURED LIST */}
      {viewMode === "network" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Topology Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight font-sans">
                  Facility Risk Topology Map
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Correlations and shared compliance non-conformance vectors across operating sites
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#A1A1AA] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C6B9D8]" />
                <span>Click a node to inspect facility</span>
              </div>
            </div>

            {/* SVG Relationship Graph */}
            <div className="relative w-full h-[460px] bg-black/60 rounded-xl border border-white/5 overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 860 500">
                <defs>
                  <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C6B9D8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D5A6B5" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Render Relationships / Edges */}
                {relationships.map((rel, idx) => {
                  const p1 = nodePositions[rel.from];
                  const p2 = nodePositions[rel.to];
                  if (!p1 || !p2) return null;
                  const isHighlighted =
                    activeNode === rel.from || activeNode === rel.to;
                  return (
                    <g key={idx}>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={isHighlighted ? "#C6B9D8" : "rgba(255,255,255,0.15)"}
                        strokeWidth={isHighlighted ? 2 : 1}
                        strokeDasharray={isHighlighted ? "none" : "4 4"}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}

                {/* Render Facility Nodes */}
                {facilities.map((fac) => {
                  const pos = nodePositions[fac.facility_code] || { x: 400, y: 250 };
                  const isSelected = activeNode === fac.facility_code;
                  return (
                    <g
                      key={fac.facility_code}
                      onClick={() => setActiveNode(fac.facility_code)}
                      className="cursor-pointer group"
                    >
                      {/* Selection indicator ring */}
                      {isSelected && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={36}
                          fill="none"
                          stroke="#C6B9D8"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          opacity={0.8}
                        />
                      )}

                      {/* Outer node circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={28}
                        fill={isSelected ? "rgba(198, 185, 216, 0.2)" : "#18181B"}
                        stroke={isSelected ? "#FFFFFF" : "rgba(255,255,255,0.25)"}
                        strokeWidth={isSelected ? 2 : 1}
                        className="transition-colors duration-200 group-hover:stroke-white"
                      />

                      {/* Inner Dot */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={6}
                        fill={isSelected ? "#FFFFFF" : "#8E8E8E"}
                        className="transition-colors duration-200"
                      />

                      {/* Code Label */}
                      <text
                        x={pos.x}
                        y={pos.y - 36}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={11}
                        fontWeight="600"
                        fontFamily="ui-monospace, monospace"
                      >
                        {fac.facility_code}
                      </text>

                      {/* Name Label */}
                      <text
                        x={pos.x}
                        y={pos.y + 44}
                        textAnchor="middle"
                        fill={isSelected ? "#FFFFFF" : "#A1A1AA"}
                        fontSize={10}
                        fontWeight={isSelected ? "500" : "400"}
                        className="transition-colors duration-200"
                      >
                        {fac.name.length > 22 ? fac.name.substring(0, 22) + "..." : fac.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Legend overlay */}
              <div className="absolute bottom-3 left-4 text-[10px] font-mono text-[#8E8E8E] bg-[#101010]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 space-y-0.5">
                <div>Dashed lines show shared compliance risks across facilities</div>
              </div>
            </div>
          </div>

          {/* Facility Quick Inspector Panel (4 cols) */}
          <div className="lg:col-span-4 bg-[#101010] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-sans font-semibold text-sm tracking-wide text-white">
                Facility Specifications
              </h3>
              <span className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">ACTIVE NODE</span>
            </div>

            {selectedFacility || facilities.find((f) => f.facility_code === activeNode) ? (
              (() => {
                const fac =
                  selectedFacility ||
                  facilities.find((f) => f.facility_code === activeNode)!;
                return (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/15">
                        {fac.facility_code}
                      </span>
                      <h4 className="text-base font-semibold text-white mt-2">
                        {fac.name}
                      </h4>
                      <p className="text-xs text-[#8E8E8E] flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8E8E8E]" />
                        {fac.location}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#171717] border border-white/10">
                        <span className="text-[10px] font-mono text-[#8E8E8E]">Classification</span>
                        <div className="font-semibold text-white truncate">{fac.facility_type}</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#171717] border border-white/10">
                        <span className="text-[10px] font-mono text-[#8E8E8E]">Audit Volume</span>
                        <div className="font-semibold text-white">{fac.audit_count} Reports</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#171717] border border-white/10">
                        <span className="text-[10px] font-mono text-[#8E8E8E]">Footprint</span>
                        <div className="font-semibold text-white">
                          {(fac.metadata?.sqft || 0).toLocaleString()} sq ft
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#171717] border border-white/10">
                        <span className="text-[10px] font-mono text-[#8E8E8E]">Operating Shifts</span>
                        <div className="font-semibold text-white truncate">
                          {fac.metadata?.shifts || 3} Active Cycles
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={() => openFacilityDetail(fac.facility_code)}
                        className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>Open Deep Audit Workspace</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-[#8E8E8E]">Select a node on the constellation to inspect specifications.</p>
            )}
          </div>
        </div>
      ) : (
        /* Accessible Structured List */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
              <input
                type="text"
                placeholder="Search facility name, code, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#101010] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-[#8E8E8E] focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {facilityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    selectedType === type
                      ? "bg-white text-black font-semibold"
                      : "bg-[#101010] text-[#8E8E8E] hover:text-white border border-white/10"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFacilities.map((fac) => (
              <div
                key={fac.facility_code}
                onClick={() => openFacilityDetail(fac.facility_code)}
                className="p-5 rounded-2xl bg-[#101010] border border-white/10 hover:border-white/25 transition cursor-pointer space-y-3 group shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/15">
                    {fac.facility_code}
                  </span>
                  <span className="text-xs font-mono text-[#8E8E8E]">
                    {fac.audit_count} Audits Logged
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white group-hover:text-[#C6B9D8] transition-colors">
                    {fac.name}
                  </h4>
                  <p className="text-xs text-[#8E8E8E] flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {fac.location}
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#A1A1AA]">
                  <span>{fac.facility_type}</span>
                  <span className="text-white font-medium group-hover:underline flex items-center gap-1">
                    Inspect profile <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FACILITY DETAIL WORKSPACE MODAL */}
      {selectedFacility && (
        <Modal
          isOpen={Boolean(selectedFacility)}
          onClose={() => setSelectedFacility(null)}
          title={`${selectedFacility.name} (${selectedFacility.facility_code})`}
        >
          <div className="space-y-6 text-xs select-text">
            <div className="p-4 rounded-xl bg-[#171717] border border-white/10 space-y-2">
              <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">
                Site Specifications &amp; Operational Capacity
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-[#8E8E8E]">Location:</span>
                  <div className="font-semibold text-white">{selectedFacility.location}</div>
                </div>
                <div>
                  <span className="text-[#8E8E8E]">Classification:</span>
                  <div className="font-semibold text-white">{selectedFacility.facility_type}</div>
                </div>
                <div>
                  <span className="text-[#8E8E8E]">Floor Area:</span>
                  <div className="font-semibold text-white">
                    {(selectedFacility.metadata?.sqft || 0).toLocaleString()} sq ft
                  </div>
                </div>
              </div>
            </div>

            {/* Audit History */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm">Statutory Inspection History</h4>
              {selectedFacility.recent_audits && selectedFacility.recent_audits.length > 0 ? (
                <div className="space-y-2">
                  {selectedFacility.recent_audits.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-[#171717] border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{a.audit_code} • {a.audit_type}</div>
                        <div className="text-[10px] font-mono text-[#8E8E8E]">{a.audit_date}</div>
                      </div>
                      <div className="font-mono font-bold text-white text-sm">
                        {a.score ? `${a.score}%` : "Processed"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400">No recent statutory audits logged for this site.</p>
              )}
            </div>

            {/* Open Findings */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white text-sm">Active Non-Conformances &amp; Deviations</h4>
              {selectedFacility.open_findings && selectedFacility.open_findings.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFacility.open_findings.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-[#171717] border border-white/10 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className={f.severity === "CRITICAL" ? "text-red-400 font-semibold" : "text-amber-400 font-medium"}>
                          {f.severity}
                        </span>
                        {f.is_recurring && (
                          <span className="text-[#D5A6B5] font-semibold">
                            CHRONIC RECURRENCE ({f.recurrence_count || 2}x)
                          </span>
                        )}
                      </div>
                      <div className="text-white font-medium">{f.title}</div>
                      <div className="text-[10px] text-[#8E8E8E] font-mono">{f.category}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-400">All non-conformances remediated and verified durable.</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
