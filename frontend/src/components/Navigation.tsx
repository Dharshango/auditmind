"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileCheck2,
  AlertTriangle,
  BrainCircuit,
  History,
  ShieldAlert,
  CheckCircle2,
  FileSearch,
  BotMessageSquare,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string;
}

export const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
  {
    group: "OVERVIEW",
    items: [
      { name: "Executive Overview", href: "/dashboard", icon: LayoutDashboard },
      { name: "Facility Network", href: "/facilities", icon: Building2 },
    ],
  },
  {
    group: "AUDITS",
    items: [
      { name: "Audit Management", href: "/audits", icon: FileCheck2 },
      { name: "Findings", href: "/findings", icon: AlertTriangle },
    ],
  },
  {
    group: "INTELLIGENCE",
    items: [
      { name: "Organizational Memory", href: "/memory", icon: BrainCircuit },
      { name: "Recurring Failures", href: "/recurring", icon: History },
      { name: "Compliance Intelligence", href: "/intelligence", icon: ShieldAlert },
    ],
  },
  {
    group: "OPERATIONS",
    items: [
      { name: "Corrective Actions", href: "/capa", icon: CheckCircle2 },
      { name: "Evidence Explorer", href: "/evidence", icon: FileSearch },
    ],
  },
  {
    group: "AI",
    items: [
      {
        name: "AI Compliance Agent",
        href: "/agent",
        icon: BotMessageSquare,
        highlight: true,
      },
    ],
  },
];

export function Navigation({
  collapsed,
  onToggleCollapse,
  onOpenCommand,
  mobileOpen = false,
  onCloseMobile,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenCommand?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed || false);
  const [hoveredItem, setHoveredItem] = useState<{ name: string; y: number } | null>(null);
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);

  // Sync internal collapsed state with parent prop if provided
  useEffect(() => {
    if (typeof collapsed === "boolean") {
      setIsCollapsed(collapsed);
    }
  }, [collapsed]);

  const normalizedPathname = pathname
    ? pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname
    : "";

  // Reset optimistic path whenever pathname actually changes
  useEffect(() => {
    setOptimisticPath(null);
  }, [pathname]);

  const currentPath = optimisticPath || normalizedPathname;

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onToggleCollapse) onToggleCollapse();
  };

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-reveal"
          aria-hidden="true"
        />
      )}

      {/* Primary Sidebar Rail — Glassy, Compact & Fully Responsive */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-black/40 backdrop-blur-2xl border-r border-white/10 text-white font-sans transition-all duration-200 select-none shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
          isCollapsed ? "w-[72px]" : "w-[272px]"
        } ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          fontStretch: "normal",
        }}
      >
        {/* Floating Expand Pill on Sidebar Rail Border — Only Visible When Collapsed */}
        {isCollapsed && (
          <button
            onClick={toggle}
            aria-label="Expand sidebar rail"
            className="hidden lg:flex items-center justify-center absolute -right-3 top-5 w-6 h-6 rounded-full bg-[#18181B] border border-white/20 text-[#A1A1AA] hover:text-white hover:bg-white/20 hover:border-white/40 hover:scale-110 active:scale-95 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.6)] z-50 group cursor-pointer"
            title="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* 1. BRAND HEADER — Height 64px (h-16), perfectly matches TopNav height */}
        <div className={`h-16 ${isCollapsed ? "px-0 justify-center" : "px-4 justify-between"} border-b border-white/10 bg-white/[0.02] flex items-center shrink-0`}>
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className={`flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8] rounded-lg p-1 ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="AuditMind Command Center"
          >
            {/* White Circular Monogram Icon */}
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-[0_2px_10px_rgba(255,255,255,0.15)] transition-transform duration-200 group-hover:scale-105">
              <div className="w-4 h-4 relative flex items-center justify-center">
                <Image
                  src="/assets/logo.svg"
                  alt="AuditMind Logo"
                  width={16}
                  height={16}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Brand Wordmark — Clean, Premium, No Enterprise Tag */}
            {!isCollapsed && (
              <span className="font-semibold text-[15px] tracking-tight text-white leading-none font-sans">
                AuditMind
              </span>
            )}
          </Link>

          {/* Desktop collapse button when expanded */}
          {!isCollapsed && (
            <button
              onClick={toggle}
              aria-label="Collapse sidebar rail"
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8] shrink-0 ml-auto"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            aria-label="Close mobile navigation"
            className="p-1 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10 transition lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. COMPACT NAVIGATION GROUPS CONTAINER — Zero Scroll Required */}
        <nav
          className="flex-1 px-2.5 py-2.5 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-none"
          role="navigation"
          aria-label="Main Navigation"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.group} className="space-y-0.5">
              {/* Compact Section Header */}
              {!isCollapsed && (
                <div className="px-3 pt-2 pb-1 text-[9.5px] font-mono font-semibold uppercase tracking-[0.12em] text-white/35">
                  {group.group}
                </div>
              )}

              {/* Group Nav Items — Premium Obsidian Aesthetic */}
              {group.items.map((item) => {
                const isActive = currentPath === item.href;
                const Icon = item.icon;

                return (
                  <div
                    key={item.href}
                    className="relative"
                    onMouseEnter={(e) => {
                      if (isCollapsed) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredItem({ name: item.name, y: rect.top + rect.height / 2 });
                      }
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href={item.href}
                      onClick={() => {
                        setOptimisticPath(item.href);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-2.5 min-h-[36px] py-1.5 px-3 rounded-xl transition-all duration-150 relative font-sans text-[13px] leading-tight font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8] ${
                        isActive
                          ? "bg-white/[0.12] text-white font-semibold backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                          : "text-white/70 hover:text-white hover:bg-white/[0.06]"
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1 h-3.5 rounded-full bg-[#C6B9D8] transition-all" />
                      )}

                      {/* Icon */}
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                          isActive
                            ? "text-white"
                            : item.highlight
                            ? "text-[#C6B9D8]"
                            : "text-[#A1A1AA]"
                        }`}
                      />

                      {/* Item Label */}
                      {!isCollapsed && (
                        <span className="truncate flex-1 tracking-normal font-sans">
                          {item.name}
                        </span>
                      )}

                      {/* AI Feature Highlight Badge */}
                      {!isCollapsed && item.highlight && (
                        <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white/10 text-white border border-white/15 font-semibold shrink-0">
                          <Sparkles className="w-2.5 h-2.5 text-[#C6B9D8]" />
                          AI
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Floating Hover Tooltip for Collapsed Sidebar */}
      {isCollapsed && hoveredItem && (
        <div
          className="fixed left-[80px] -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#14151C] border border-white/15 text-white text-xs font-medium font-sans shadow-2xl z-50 whitespace-nowrap pointer-events-none animate-reveal"
          style={{ top: `${hoveredItem.y}px` }}
        >
          {hoveredItem.name}
        </div>
      )}
    </>
  );
}
