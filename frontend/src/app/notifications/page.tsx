"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Sparkles
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  timestamp: string;
  facility: string;
  read: boolean;
  actionHref?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-01",
    type: "critical",
    title: "Recurring Egress Compromise Detected",
    description: "FIND-2026-039 logged in Plant A shows 100% vector match with past quarter-end staging obstruction finding FIND-2026-001.",
    timestamp: "12 minutes ago",
    facility: "Plant A (Detroit)",
    read: false,
    actionHref: "/findings",
  },
  {
    id: "notif-02",
    type: "warning",
    title: "90-Day CAPA Durability Gate Approaching",
    description: "CAPA-2026-048 (Machine Guarding LOTO Placards) will reach 90-day verification deadline in 4 operating days.",
    timestamp: "2 hours ago",
    facility: "Plant B (Austin)",
    read: false,
    actionHref: "/capa",
  },
  {
    id: "notif-03",
    type: "success",
    title: "Empirical Durability Confirmed",
    description: "CAPA-2026-005 (Chemical Containment HDPE Liner) achieved 9 consecutive clean audit cycles with zero recurrences.",
    timestamp: "1 day ago",
    facility: "Warehouse A (Reno)",
    read: true,
    actionHref: "/memory",
  },
  {
    id: "notif-04",
    type: "info",
    title: "New Statutory Audit Ingested via OCR",
    description: "Audit AUD-2026-041 (OSHA Comprehensive Fall Protection) processed with 14 findings and 8 photographic evidences indexed.",
    timestamp: "2 days ago",
    facility: "Distribution Center C (Charlotte)",
    read: true,
    actionHref: "/audits",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-8 pb-16 animate-reveal select-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[42px] text-white tracking-tight leading-tight font-normal">
            Compliance Alerts
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-1.5 max-w-3xl leading-relaxed">
            Real-time feed of statutory non-conformance detections and CAPA milestones.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 rounded-full bg-[#18181B] border border-white/15 text-xs text-[#EDEDED] hover:text-white hover:bg-white/10 transition"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-[#101012] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="text-sm font-semibold text-white font-sans flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#C6B9D8]" />
            <span>Active Compliance Alerts ({notifications.filter(n => !n.read).length} unread)</span>
          </div>
        </div>

        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                item.read
                  ? "bg-[#141416]/50 border-white/5 text-[#A1A1AA]"
                  : "bg-[#18181B] border-white/15 text-white shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="mt-0.5 shrink-0">
                  {item.type === "critical" && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  {item.type === "warning" && <Clock className="w-4 h-4 text-amber-400" />}
                  {item.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {item.type === "info" && <ShieldAlert className="w-4 h-4 text-[#C6B9D8]" />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white font-sans">{item.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#8E8E93]">
                      {item.facility}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-3xl">
                    {item.description}
                  </p>
                  <div className="text-[11px] font-mono text-[#8E8E93] pt-0.5">
                    {item.timestamp}
                  </div>
                </div>
              </div>

              {item.actionHref && (
                <Link
                  href={item.actionHref}
                  className="shrink-0 flex items-center gap-1 text-xs text-white hover:text-[#C6B9D8] font-medium transition"
                >
                  <span>Inspect</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
