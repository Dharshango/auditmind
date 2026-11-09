"use client";

import React, { useState } from "react";
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
  CheckCircle2,
  FileSearch,
  BotMessageSquare,
  ChevronLeft,
  ChevronRight,
  Command,
  LogOut,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}

const NAV_GROUPS: { group: string; items: NavItem[] }[] = [
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
    group: "AI INTELLIGENCE",
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
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenCommand?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(collapsed || false);
  const [optimisticHref, setOptimisticHref] = useState<string | null>(null);

  // Synchronize optimistic state with real pathname
  React.useEffect(() => {
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

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-[#0A0A0C]/90 backdrop-blur-md border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 text-neutral-300 z-30 transition-all duration-200 select-none shadow-2xl`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm transition-transform group-hover:scale-105">
            <div className="w-5 h-5 relative flex items-center justify-center">
              <Image
                src="/assets/logo.svg"
                alt="Logo"
                width={18}
                height={18}
                className="object-contain"
              />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex items-baseline gap-1.5 overflow-hidden">
              <span className="font-bold text-sm tracking-tight text-white">
                AUDITMIND
              </span>
              <span className="text-[9px] font-mono px-1 py-0.5 bg-[#18181B] text-[#C4C2C3] rounded border border-white/10 font-medium tracking-wider">
                INTELLIGENCE
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle button */}
        <button
          onClick={toggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="p-1 rounded-md text-[#8E8E8E] hover:text-white hover:bg-[#18181B] transition"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Organization Badge (Expanded only) */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 bg-[#101010]/80 border-b border-white/10 flex items-center justify-between">
          <div className="overflow-hidden">
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#8E8E8E]">
              Organization
            </div>
            <div className="text-xs font-semibold text-white truncate">
              Meridian Industrial Group
            </div>
          </div>
          <span
            className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0"
            title="Hindsight Memory Bank Active"
          />
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-2.5 pb-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#8E8E8E]">
                {group.group}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = effectivePath === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (effectivePath !== item.href) {
                      setOptimisticHref(item.href);
                    }
                  }}
                  title={isCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors duration-150 relative ${
                    isActive
                      ? "bg-[#18181B] text-white font-semibold border border-white/15 shadow-sm"
                      : "text-[#8E8E8E] hover:text-white hover:bg-[#18181B]/40 border border-transparent"
                  }`}
                >
                  {/* Indicator pip for active page with smooth opacity */}
                  <span
                    className={`absolute left-1 w-1 h-4 rounded-full bg-white transition-all duration-150 ${
                      isActive ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
                    }`}
                  />

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                      isActive ? "text-white" : "text-[#8E8E8E]"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!isCollapsed && item.highlight && (
                    <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-white border border-white/15">
                      <Sparkles className="w-2.5 h-2.5 text-[#C6B9D8]" />
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Info, Command Trigger & Logout */}
      <div className="p-3 border-t border-white/10 bg-[#101010]/80 space-y-2">
        {onOpenCommand && !isCollapsed && (
          <button
            onClick={onOpenCommand}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-white/10 text-[11px] text-[#A1A1AA] hover:text-white hover:border-white/20 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Command className="w-3 h-3 text-white" />
              <span>Command Palette</span>
            </span>
            <kbd className="px-1 font-mono text-[9px] bg-black text-white rounded border border-white/20">
              ⌘K
            </kbd>
          </button>
        )}

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center" : "justify-between"
          } px-2.5 py-1.5 rounded-lg text-[11px] text-[#A1A1AA] hover:text-white hover:bg-[#18181B] transition-colors`}
          title="Sign out of active session"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 text-[#A1A1AA]" />
            {!isCollapsed && <span>Sign Out</span>}
          </span>
          {!isCollapsed && (
            <span className="text-[10px] font-mono text-[#C4C2C3]">Sarah J.</span>
          )}
        </button>

        {!isCollapsed && (
          <div className="px-1 pt-1 text-[9px] text-[#8E8E8E] font-mono flex items-center justify-between border-t border-white/5">
            <span>MEMORY BANK</span>
            <span className="text-white font-semibold">HINDSIGHT ACTIVE</span>
          </div>
        )}
      </div>
    </aside>
  );
}
