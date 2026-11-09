"use client";

import React, { useState } from "react";
import {
  Settings,
  Building2,
  BrainCircuit,
  Key,
  Shield,
  Check,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"organization" | "memory" | "agent" | "security">("organization");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 animate-reveal select-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[42px] text-white tracking-tight leading-tight font-normal">
            Organization &amp; System Settings
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-1.5 max-w-3xl leading-relaxed">
            Configure enterprise tenant profiles, system preferences, and security settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm"
        >
          {saved ? <Check className="w-3.5 h-3.5 text-black" /> : null}
          <span>{saved ? "Changes Saved" : "Save Configurations"}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {[
          { id: "organization", label: "Organization Profile", icon: Building2 },
          { id: "memory", label: "Hindsight Memory Bank", icon: BrainCircuit },
          { id: "agent", label: "AI Agent Inference", icon: Key },
          { id: "security", label: "Security & Access", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                activeTab === tab.id
                  ? "bg-white/10 text-white font-semibold border border-white/15"
                  : "text-[#8E8E93] hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === "organization" && (
        <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-6 max-w-4xl">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white font-sans">Tenant Profile</h3>
            <p className="text-xs text-[#8E8E93]">Primary industrial organization identifier and operating domain.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8E8E93]">ORGANIZATION NAME</label>
              <input
                type="text"
                defaultValue="Meridian Industrial Group"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8E8E93]">TENANT UUID</label>
              <input
                type="text"
                readOnly
                defaultValue="00000000-0000-0000-0000-000000000001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416]/50 border border-white/10 text-[#8E8E93] font-mono text-xs cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8E8E93]">PRIMARY INDUSTRY SECTOR</label>
              <input
                type="text"
                defaultValue="Advanced Heavy Manufacturing &amp; Logistics"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-white/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8E8E93]">GOVERNING REGULATORY BODIES</label>
              <input
                type="text"
                defaultValue="OSHA (29 CFR), EPA (40 CFR), NFPA (101/70E), ISO 45001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416] border border-white/15 text-white text-xs font-medium focus:outline-none focus:border-white/40"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "memory" && (
        <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-6 max-w-4xl">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white font-sans">Hindsight Cognitive Memory Bank</h3>
            <p className="text-xs text-[#8E8E93]">Persistent associative memory layer capturing cross-site recurrence vectors.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#141416] border border-white/10">
              <div>
                <div className="text-xs font-semibold text-white">Memory Retention Horizon</div>
                <div className="text-[11px] text-[#8E8E93]">Long-term persistence window for past audit failures and CAPA outcomes.</div>
              </div>
              <span className="font-mono text-xs text-white px-2.5 py-1 rounded bg-black border border-white/15">
                365 Operating Days
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#141416] border border-white/10">
              <div>
                <div className="text-xs font-semibold text-white">Recurrence Association Threshold</div>
                <div className="text-[11px] text-[#8E8E93]">Cosine similarity threshold for triggering high-probability recurrence alerts.</div>
              </div>
              <span className="font-mono text-xs text-white px-2.5 py-1 rounded bg-black border border-white/15">
                0.82 (High Precision)
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "agent" && (
        <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-6 max-w-4xl">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white font-sans">AI Compliance Agent Inference</h3>
            <p className="text-xs text-[#8E8E93]">Groq LLM tool-calling configuration and deterministic fallbacks.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8E8E93]">INFERENCE MODEL</label>
              <input
                type="text"
                readOnly
                defaultValue="llama-3.3-70b-versatile"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416]/50 border border-white/10 text-white font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-[#8E8E93]">INFERENCE TEMPERATURE</label>
              <input
                type="text"
                readOnly
                defaultValue="0.2 (High Determinism / Evidence Bound)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141416]/50 border border-white/10 text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-6 max-w-4xl">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white font-sans">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-[#8E8E93]">Multi-tenant isolation and human-in-the-loop audit sign-off rules.</p>
          </div>

          <div className="p-4 rounded-xl bg-[#141416] border border-white/10 space-y-2">
            <div className="text-xs font-semibold text-white">Active Signed-in Identity</div>
            <div className="text-xs text-[#C8C8C8] font-mono">
              Sarah Jenkins • Lead EHS Auditor &amp; Regulatory Compliance Specialist
            </div>
            <div className="text-[11px] text-[#8E8E93]">
              Role: Enterprise Auditor (Tier 3 Clearance) • Meridian Industrial Group
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
