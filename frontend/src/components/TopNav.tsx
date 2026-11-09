"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Upload,
  ChevronDown,
  Bell,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { api } from "@/lib/api";

interface TopNavProps {
  onOpenCommand?: () => void;
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
  "/settings": { title: "System Settings", category: "Settings" },
};

export function TopNav({
  onOpenUpload,
  onToggleMobileMenu,
}: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(2);

  const orgDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  // Sync unread notification count across the application
  useEffect(() => {
    const syncUnread = () => {
      try {
        const stored = localStorage.getItem("auditmind_read_notifs");
        if (stored) {
          const readIds = JSON.parse(stored) as string[];
          const unread = ["notif-01", "notif-02"].filter((id) => !readIds.includes(id)).length;
          setUnreadCount(unread);
        } else {
          setUnreadCount(2);
        }
      } catch (e) {
        setUnreadCount(0);
      }
    };

    syncUnread();
    window.addEventListener("auditmind_notifications_updated", syncUnread);
    window.addEventListener("storage", syncUnread);
    return () => {
      window.removeEventListener("auditmind_notifications_updated", syncUnread);
      window.removeEventListener("storage", syncUnread);
    };
  }, [pathname]);

  // Close dropdowns on route changes
  useEffect(() => {
    setShowOrgDropdown(false);
    setShowAccountDropdown(false);
  }, [pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(target)) {
        setShowOrgDropdown(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(target)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    router.push("/login");
  };

  const routeInfo = ROUTE_NAMES[pathname] || {
    title: "Command Center",
    category: "AuditMind",
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-black/40 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between transition-colors select-none shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      {/* Left: Mobile Menu Trigger + Organization Context & Breadcrumbs */}
      <div className="flex items-center gap-3 text-xs min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation drawer"
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10 transition lg:hidden cursor-pointer"
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

      {/* Right: Actions, Tenant Selector, Notifications, Settings & Account */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
        {/* 1. Quick Upload Action */}
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-2 h-9 px-3 sm:px-3.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 active:scale-95 transition shadow-sm font-sans shrink-0 cursor-pointer"
          title="Upload Audit Report"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Audit</span>
        </button>

        {/* 2. Tenant Organization Switcher */}
        <div className="relative" ref={orgDropdownRef}>
          <button
            onClick={() => {
              setShowOrgDropdown((prev) => !prev);
              setShowAccountDropdown(false);
            }}
            className={`flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-white/[0.1] text-xs font-medium text-white transition shadow-sm font-sans shrink-0 cursor-pointer ${
              showOrgDropdown ? "bg-white/[0.14] border-white/30" : ""
            }`}
            title="Tenant Organization: Meridian Industrial Group"
            aria-expanded={showOrgDropdown}
          >
            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] font-bold shrink-0">
              M
            </div>
            <span className="hidden md:inline font-semibold text-[12.5px]">Meridian</span>
            <ChevronDown
              className={`w-3 h-3 text-[#8E8E93] transition-transform duration-200 ${
                showOrgDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showOrgDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141416]/95 backdrop-blur-xl border border-white/15 p-2.5 shadow-2xl z-50 text-xs text-neutral-300 animate-reveal">
              <div className="px-3 py-2 border-b border-white/10">
                <div className="font-semibold text-white font-sans text-sm">
                  Meridian Industrial Group
                </div>
                <div className="text-[10px] font-mono text-[#8E8E93] mt-0.5">
                  Tier-1 Enterprise Tenant
                </div>
              </div>
              <div className="pt-2.5 px-1 space-y-1">
                <div className="text-[10px] font-mono text-[#8E8E93] px-2 uppercase tracking-wider">
                  Active Facilities (5)
                </div>
                <div className="px-2 py-1.5 text-[11.5px] text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/5 transition flex items-center justify-between">
                  <span>Apex Plant A</span>
                  <span className="text-[10px] font-mono text-[#71717A]">Detroit, MI</span>
                </div>
                <div className="px-2 py-1.5 text-[11.5px] text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/5 transition flex items-center justify-between">
                  <span>Vanguard Plant B</span>
                  <span className="text-[10px] font-mono text-[#71717A]">Austin, TX</span>
                </div>
                <div className="px-2 py-1.5 text-[11.5px] text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/5 transition flex items-center justify-between">
                  <span>Crestview Plant C</span>
                  <span className="text-[10px] font-mono text-[#71717A]">Cleveland, OH</span>
                </div>
                <div className="px-2 py-1.5 text-[11.5px] text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/5 transition flex items-center justify-between">
                  <span>Summit Warehouse A</span>
                  <span className="text-[10px] font-mono text-[#71717A]">Reno, NV</span>
                </div>
                <div className="px-2 py-1.5 text-[11.5px] text-[#A1A1AA] hover:text-white rounded-lg hover:bg-white/5 transition flex items-center justify-between">
                  <span>Metro Distribution B</span>
                  <span className="text-[10px] font-mono text-[#71717A]">Charlotte, NC</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Notifications Button (Compliance Alerts) */}
        <Link
          href="/notifications"
          className={`relative flex items-center justify-center h-9 w-9 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-white/[0.1] text-[#A1A1AA] hover:text-white transition shadow-sm shrink-0 ${
            pathname === "/notifications" ? "bg-white/[0.14] border-white/30 text-white" : ""
          }`}
          title={unreadCount > 0 ? `Compliance Alerts (${unreadCount} unread)` : "Compliance Alerts (All caught up)"}
          aria-label="Compliance Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C6B9D8] text-[9.5px] font-mono font-bold text-black ring-2 ring-black">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* 4. Account Button & Dropdown (Sarah Jenkins) */}
        <div className="relative" ref={accountDropdownRef}>
          <button
            onClick={() => {
              setShowAccountDropdown((prev) => !prev);
              setShowOrgDropdown(false);
            }}
            className={`flex items-center gap-2 h-9 pl-1.5 pr-2.5 sm:pr-3 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-white/25 hover:bg-white/[0.1] text-xs font-medium text-white transition shadow-sm font-sans shrink-0 cursor-pointer ${
              showAccountDropdown ? "bg-white/[0.14] border-white/30" : ""
            }`}
            title="Account: Sarah Jenkins (VP Compliance)"
            aria-expanded={showAccountDropdown}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#9B8EB8] to-[#DDD5E8] text-black font-semibold text-[10px] flex items-center justify-center shadow-inner shrink-0">
              SJ
            </div>
            <span className="hidden sm:inline font-medium text-[12.5px] text-white/90">
              Sarah Jenkins
            </span>
            <ChevronDown
              className={`w-3 h-3 text-[#8E8E93] transition-transform duration-200 ${
                showAccountDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showAccountDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141416]/95 backdrop-blur-xl border border-white/15 p-2 shadow-2xl z-50 text-xs text-neutral-300 animate-reveal">
              {/* User Profile Header */}
              <div className="px-3 py-2.5 border-b border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9B8EB8] to-[#DDD5E8] text-black font-bold text-xs flex items-center justify-center shadow-inner shrink-0">
                  SJ
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-white font-sans text-sm truncate">
                    Sarah Jenkins
                  </div>
                  <div className="text-[11px] text-[#A1A1AA] truncate">
                    VP Compliance
                  </div>
                  <div className="text-[10px] font-mono text-[#71717A] truncate mt-0.5">
                    compliance@meridianindustrial.com
                  </div>
                </div>
              </div>

              {/* Quick Navigation Links */}
              <div className="py-1 border-b border-white/10">
                <Link
                  href="/settings"
                  onClick={() => setShowAccountDropdown(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  <Settings className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span>System Settings</span>
                </Link>
              </div>

              {/* Sign Out Button */}
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-lg transition text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
