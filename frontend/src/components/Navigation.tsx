"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  Command,
  LogOut,
  Sparkles,
  Bell,
  Settings,
  X,
} from "lucide-react";
import { api } from "@/lib/api";

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

const BOTTOM_ITEMS: NavItem[] = [
  { name: "Notifications", href: "/notifications", icon: Bell, badge: "2" },
  { name: "Settings", href: "/settings", icon: Settings },
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
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(collapsed || false);
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ name: string; y: number } | null>(null);

  // Sync internal collapsed state with parent prop if provided
  useEffect(() => {
    if (typeof collapsed === "boolean") {
      setIsCollapsed(collapsed);
    }
  }, [collapsed]);

  // Synchronize optimistic state with real pathname
  useEffect(() => {
    setOptimisticHref(null);
  }, [pathname]);

  const normalizedPathname = pathname
    ? pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname
    : "";

  const effectivePath = optimisticHref || normalizedPathname;

  const toggle = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (onToggleCollapse) onToggleCollapse();
  };

  const handleLogout = async () => {
    await api.logout();
    router.push("/login");
  };

  const handleItemClick = (href: string) => {
    if (effectivePath !== href) {
      setOptimisticHref(href);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
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

      {/* Primary Sidebar Rail */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#09090B] border-r border-white/[0.08] text-white font-sans transition-all duration-200 select-none shadow-2xl ${
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
        {/* 1. BRAND HEADER */}
        <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <Link
            href="/dashboard"
            onClick={() => handleItemClick("/dashboard")}
            className="flex items-center gap-3 overflow-hidden group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8] rounded-lg p-1"
          >
            {/* White Circular Monogram Icon */}
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <div className="w-5 h-5 relative flex items-center justify-center">
                <Image
                  src="/assets/logo.svg"
                  alt="AUDITMIND Logo"
                  width={18}
                  height={18}
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Typography: Healthy Positive Spacing, Never Squashed */}
            {!isCollapsed && (
              <div className="flex items-baseline gap-2 overflow-hidden min-w-0">
                <span className="font-bold text-[15px] tracking-[0.06em] text-white leading-none font-sans">
                  AUDITMIND
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#18181B] text-[#C6B9D8] rounded border border-white/10 font-semibold tracking-wider">
                  ENTERPRISE
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle / Mobile Close Button */}
          <div className="flex items-center">
            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              aria-label="Close mobile navigation"
              className="p-1.5 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10 transition lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={toggle}
              aria-label={isCollapsed ? "Expand sidebar rail" : "Collapse sidebar rail"}
              className="hidden lg:flex p-1.5 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8]"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 2. TENANT IDENTITY PILL (Expanded view only) */}
        {!isCollapsed && (
          <div className="px-4 py-3 bg-[#111114]/80 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div className="min-w-0 overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E93] font-semibold">
                SURVEILLANCE NODE
              </div>
              <div className="text-[12.5px] font-medium text-white truncate font-sans mt-0.5">
                Meridian Industrial Group
              </div>
            </div>
            <span
              className="w-2 h-2 rounded-full bg-[#C6B9D8] animate-pulse shrink-0 ml-2"
              title="Hindsight Experiential Memory Active"
            />
          </div>
        )}

        {/* 3. NAVIGATION GROUPS CONTAINER */}
        <nav
          className="flex-1 px-3 py-4 space-y-5 overflow-y-auto overflow-x-hidden scrollbar-none"
          role="navigation"
          aria-label="Main Navigation"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.group} className="space-y-1">
              {/* Section Header: Compliant 11px Sans-Serif with Muted Tone */}
              {!isCollapsed && (
                <div className="px-3.5 pb-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.08em] text-[#8E8E93]">
                  {group.group}
                </div>
              )}

              {/* Group Nav Items */}
              {group.items.map((item) => {
                const isActive = effectivePath === item.href;
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
                      onClick={() => handleItemClick(item.href)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 min-h-[44px] px-3.5 rounded-xl transition-all duration-150 relative font-sans text-[14px] leading-[1.45] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8] ${
                        isActive
                          ? "bg-white/[0.08] text-white font-semibold border-l-[3px] border-[#C6B9D8] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                          : "text-[#D4D4D8] hover:text-white hover:bg-white/[0.04] border-l-[3px] border-transparent"
                      }`}
                      style={{
                        letterSpacing: "0em",
                      }}
                    >
                      {/* Icon */}
                      <Icon
                        className={`w-[18px] h-[18px] shrink-0 transition-colors duration-150 ${
                          isActive
                            ? "text-white"
                            : item.highlight
                            ? "text-[#C6B9D8]"
                            : "text-[#A1A1AA]"
                        }`}
                      />

                      {/* Item Label (Hidden on collapsed) */}
                      {!isCollapsed && (
                        <span className="truncate flex-1 tracking-normal font-sans">
                          {item.name}
                        </span>
                      )}

                      {/* AI Feature Highlight Badge */}
                      {!isCollapsed && item.highlight && (
                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/15 font-semibold shrink-0">
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

        {/* 4. BOTTOM SECTION: Notifications, Settings, Profile & Sign Out */}
        <div className="p-3 border-t border-white/[0.08] bg-[#111114]/90 space-y-1.5 shrink-0">
          {/* Notifications & Settings Links */}
          <div className="space-y-0.5">
            {BOTTOM_ITEMS.map((item) => {
              const isActive = effectivePath === item.href;
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
                    onClick={() => handleItemClick(item.href)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 min-h-[40px] px-3.5 rounded-xl transition-all duration-150 relative font-sans text-[13.5px] leading-[1.45] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8] ${
                      isActive
                        ? "bg-white/[0.08] text-white font-semibold border-l-[3px] border-[#C6B9D8]"
                        : "text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] border-l-[3px] border-transparent"
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-white" : "text-[#A1A1AA]"}`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1 tracking-normal font-sans">
                        {item.name}
                      </span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-[#EDEDED] font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Quick Command Palette Button */}
          {onOpenCommand && !isCollapsed && (
            <button
              onClick={onOpenCommand}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-[#A1A1AA] hover:text-white hover:border-white/20 hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8]"
            >
              <span className="flex items-center gap-2">
                <Command className="w-3.5 h-3.5 text-white" />
                <span className="font-sans text-[12px] font-medium">Command Palette</span>
              </span>
              <kbd className="px-1.5 py-0.5 font-mono text-[9px] bg-black text-white rounded border border-white/20">
                ⌘K
              </kbd>
            </button>
          )}

          {/* User Profile & Sign Out Bar */}
          <div className="pt-1.5 border-t border-white/[0.06]">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center" : "justify-between"
              } px-3 py-2 rounded-xl text-xs text-[#A1A1AA] hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C6B9D8]`}
              title="Sign out of active auditor session"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
                  SJ
                </div>
                {!isCollapsed && (
                  <div className="text-left min-w-0">
                    <div className="text-[12px] font-medium text-white truncate font-sans">
                      Sarah Jenkins
                    </div>
                    <div className="text-[10px] font-mono text-[#8E8E93] truncate">
                      Lead Auditor
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <LogOut className="w-4 h-4 text-[#8E8E93] hover:text-white shrink-0 ml-2" />
              )}
            </button>
          </div>
        </div>
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
