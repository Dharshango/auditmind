"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Upload,
  ChevronDown,
  Building2,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";

interface TopNavProps {
  onOpenCommand: () => void;
  onOpenUpload: () => void;
}

const ROUTE_NAMES: Record<string, { title: string; category: string }> = {
  "/": { title: "Executive Overview", category: "Workspace" },
  "/dashboard": { title: "Executive Overview", category: "Overview" },
  "/facilities": { title: "Facility Network", category: "Overview" },
  "/audits": { title: "Audit Management", category: "Audits" },
  "/findings": { title: "Findings & Non-Conformances", category: "Audits" },
  "/memory": { title: "Organizational Memory", category: "Intelligence" },
  "/recurring": { title: "Recurring Failures", category: "Intelligence" },
  "/capa": { title: "Corrective Actions (CAPA)", category: "Operations" },
  "/evidence": { title: "Evidence Explorer", category: "Operations" },
  "/agent": { title: "AI Compliance Agent", category: "Cognitive AI" },
};

export function TopNav({ onOpenCommand, onOpenUpload }: TopNavProps) {
  const pathname = usePathname();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const routeInfo = ROUTE_NAMES[pathname] || {
    title: "Command Center",
    category: "AUDITMIND",
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-black/75 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between transition-colors select-none">
      {/* Left: Organization context & Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8E8E8E]">
          {routeInfo.category}
        </span>
        <span className="text-white/20">/</span>
        <span className="font-semibold text-white tracking-tight text-sm">
          {routeInfo.title}
        </span>
      </div>

      {/* Center: Global Search / Command Bar */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#101010]/90 border border-white/10 hover:border-white/25 text-[#A1A1AA] text-xs transition shadow-sm group"
        >
          <Search className="w-3.5 h-3.5 text-[#8E8E8E] group-hover:text-white transition-colors" />
          <span className="text-[#8E8E8E] text-[11px]">Quick search findings, audits, memory...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-black border border-white/10 text-[#8E8E8E]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Hindsight Status, Tenant Pill */}
      <div className="flex items-center gap-3">
        {/* Quick Upload Action */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Audit</span>
        </button>

        {/* Hindsight Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101010]/90 text-white border border-white/10 text-[11px] font-medium font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6B9D8] animate-pulse" />
          <span className="text-[10px] tracking-wider font-semibold text-[#C8C8C8]">
            HINDSIGHT: ACTIVE
          </span>
        </div>

        {/* Date context indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-[#8E8E8E] px-2.5 py-1 rounded-full bg-[#101010]/60 border border-white/5">
          <Calendar className="w-3 h-3 text-[#8E8E8E]" />
          <span>Q4 2026</span>
        </div>

        {/* Tenant Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101010]/90 border border-white/10 hover:border-white/25 text-xs font-medium text-white transition shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold">
              M
            </div>
            <span className="hidden sm:inline-block max-w-[130px] truncate text-white">
              Meridian Industrial
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8E8E8E]" />
          </button>

          {showOrgDropdown && (
            <div
              className="absolute right-0 mt-2 w-64 bg-[#101010] rounded-2xl border border-white/15 shadow-2xl p-3 z-30 transition-all text-xs animate-reveal"
              onMouseLeave={() => setShowOrgDropdown(false)}
            >
              <div className="px-2 py-1.5 text-[10px] font-mono font-semibold text-[#8E8E8E] uppercase tracking-wider">
                Active Organization
              </div>
              <div className="p-2.5 rounded-xl bg-[#171717] border border-white/10 space-y-1">
                <div className="font-semibold text-white">Meridian Industrial Group</div>
                <div className="text-[11px] text-[#A1A1AA]">5 Facilities • Manufacturing &amp; Logistics</div>
                <div className="pt-1.5 border-t border-white/10 mt-1 text-[10px] font-mono text-[#C6B9D8] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6B9D8]" />
                  <span>Bank: auditmind-org-meridian-01</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 px-2 text-[10px] text-[#8E8E8E] font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-white" />
                <span>Multi-tenant isolation enforced.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
