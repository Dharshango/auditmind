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
  Menu,
} from "lucide-react";

interface TopNavProps {
  onOpenCommand: () => void;
  onOpenUpload: () => void;
  onToggleMobileMenu?: () => void;
}

const ROUTE_NAMES: Record<string, { title: string; category: string }> = {
  "/": { title: "Executive Overview", category: "Workspace" },
  "/dashboard": { title: "Executive Overview", category: "Overview" },
  "/facilities": { title: "Facility Network", category: "Overview" },
  "/audits": { title: "Audit Management", category: "Audits" },
  "/findings": { title: "Findings & Non-Conformances", category: "Audits" },
  "/memory": { title: "Organizational Memory", category: "Intelligence" },
  "/recurring": { title: "Recurring Failures", category: "Intelligence" },
  "/intelligence": { title: "Compliance Intelligence", category: "Intelligence" },
  "/capa": { title: "Corrective Actions (CAPA)", category: "Operations" },
  "/evidence": { title: "Evidence Explorer", category: "Operations" },
  "/agent": { title: "AI Compliance Agent", category: "Cognitive AI" },
  "/notifications": { title: "Compliance Alerts", category: "Operations" },
  "/settings": { title: "System Governance", category: "Configuration" },
};

export function TopNav({
  onOpenCommand,
  onOpenUpload,
  onToggleMobileMenu,
}: TopNavProps) {
  const pathname = usePathname();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const routeInfo = ROUTE_NAMES[pathname] || {
    title: "Command Center",
    category: "AUDITMIND",
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-black/75 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between transition-colors select-none">
      {/* Left: Mobile Menu Trigger + Organization context & Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation drawer"
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10 transition lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#8E8E93] hidden sm:inline">
            {routeInfo.category}
          </span>
          <span className="text-white/20 hidden sm:inline">/</span>
          <span className="font-semibold text-white tracking-tight text-sm truncate font-sans">
            {routeInfo.title}
          </span>
        </div>
      </div>

      {/* Center: Global Search / Command Bar */}
      <div className="hidden md:flex items-center">
        <button
          onClick={onOpenCommand}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#101012] border border-white/10 hover:border-white/25 text-[#A1A1AA] text-xs transition shadow-sm group"
        >
          <Search className="w-3.5 h-3.5 text-[#8E8E93] group-hover:text-white transition-colors" />
          <span className="text-[#8E8E93] text-[11px] font-sans">Quick search findings, audits, memory...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-black border border-white/10 text-[#8E8E93]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Hindsight Status, Tenant Pill */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Quick Upload Action */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm font-sans"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Audit</span>
        </button>

        {/* Hindsight Status Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101012] text-white border border-white/10 text-[11px] font-medium font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C6B9D8] animate-pulse" />
          <span className="text-[10px] tracking-wider font-semibold text-[#C8C8C8]">
            HINDSIGHT: ACTIVE
          </span>
        </div>

        {/* Date context indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-[10px] font-mono text-[#8E8E93] px-2.5 py-1 rounded-full bg-[#101012] border border-white/5">
          <Calendar className="w-3 h-3 text-[#8E8E93]" />
          <span>Q4 2026</span>
        </div>

        {/* Tenant Organization Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101012] border border-white/10 hover:border-white/25 text-xs font-medium text-white transition shadow-sm font-sans"
          >
            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold shrink-0">
              M
            </div>
            <span className="hidden md:inline font-semibold">Meridian</span>
            <ChevronDown className="w-3 h-3 text-[#8E8E93]" />
          </button>

          {showOrgDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141416] border border-white/15 p-2 shadow-2xl z-50 text-xs text-neutral-300 animate-reveal">
              <div className="px-3 py-2 border-b border-white/10">
                <div className="font-semibold text-white font-sans">Meridian Industrial Group</div>
                <div className="text-[10px] font-mono text-[#8E8E93]">Tier-1 Enterprise Tenant</div>
              </div>
              <div className="pt-2 px-1 space-y-1">
                <div className="text-[10px] font-mono text-[#8E8E93] px-2 uppercase tracking-wider">
                  Active Facilities (5)
                </div>
                <div className="px-2 py-1 text-[11px] text-[#A1A1AA]">Apex Plant A • Detroit, MI</div>
                <div className="px-2 py-1 text-[11px] text-[#A1A1AA]">Vanguard Plant B • Austin, TX</div>
                <div className="px-2 py-1 text-[11px] text-[#A1A1AA]">Crestview Plant C • Cleveland, OH</div>
                <div className="px-2 py-1 text-[11px] text-[#A1A1AA]">Summit Warehouse A • Reno, NV</div>
                <div className="px-2 py-1 text-[11px] text-[#A1A1AA]">Metro Distribution B • Charlotte, NC</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
