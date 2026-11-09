"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Building2,
  FileCheck2,
  AlertTriangle,
  BrainCircuit,
  History,
  CheckCircle2,
  FileSearch,
  BotMessageSquare,
  Upload,
  Moon,
  Sun,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface CommandItem {
  id: string;
  name: string;
  category: "Navigation" | "Action" | "Scenarios";
  href?: string;
  action?: () => void;
  icon: React.ReactNode;
  shortcut?: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload?: () => void;
}) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-overview",
      name: "Overview Dashboard",
      category: "Navigation",
      href: "/",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "nav-facilities",
      name: "Facility Network (5 Sites)",
      category: "Navigation",
      href: "/facilities",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "nav-audits",
      name: "Audit Management & Reports",
      category: "Navigation",
      href: "/audits",
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      id: "nav-findings",
      name: "Findings & Violations Ledger",
      category: "Navigation",
      href: "/findings",
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      id: "nav-memory",
      name: "Organizational Memory & Mental Models",
      category: "Navigation",
      href: "/memory",
      icon: <BrainCircuit className="w-4 h-4" />,
    },
    {
      id: "nav-recurring",
      name: "Recurring Failure Intelligence",
      category: "Navigation",
      href: "/recurring",
      icon: <History className="w-4 h-4" />,
    },
    {
      id: "nav-capa",
      name: "Corrective Action (CAPA) Center",
      category: "Navigation",
      href: "/capa",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      id: "nav-evidence",
      name: "Evidence Vault & PDF Hash Inspector",
      category: "Navigation",
      href: "/evidence",
      icon: <FileSearch className="w-4 h-4" />,
    },
    {
      id: "nav-agent",
      name: "AuditMind AI Compliance Agent",
      category: "Navigation",
      href: "/agent",
      icon: <BotMessageSquare className="w-4 h-4" />,
      shortcut: "⌘A",
    },

    // Actions
    {
      id: "action-upload",
      name: "Upload New Audit Report PDF",
      category: "Action",
      action: () => {
        onClose();
        if (onOpenUpload) onOpenUpload();
      },
      icon: <Upload className="w-4 h-4 text-teal-intelligence" />,
      shortcut: "⌘U",
    },
    {
      id: "action-theme",
      name: `Switch Theme to ${theme === "light" ? "Deep Navy Dark" : "Warm Ivory Light"}`,
      category: "Action",
      action: () => {
        toggleTheme();
        onClose();
      },
      icon: theme === "light" ? <Moon className="w-4 h-4 text-brand-navy" /> : <Sun className="w-4 h-4 text-gold" />,
    },

    // Scenarios
    {
      id: "scen-fire",
      name: "Scenario A: Fire Safety Egress Drift (Plant A & Reno)",
      category: "Scenarios",
      href: "/agent",
      icon: <ShieldCheck className="w-4 h-4 text-status-warning" />,
    },
    {
      id: "scen-machine",
      name: "Scenario B: Machine Guarding Completed CAPA Recurrence",
      category: "Scenarios",
      href: "/capa",
      icon: <ShieldCheck className="w-4 h-4 text-status-critical" />,
    },
  ];

  const filtered = commands.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          if (selected.action) {
            selected.action();
          } else if (selected.href) {
            router.push(selected.href);
            onClose();
          }
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filtered, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden z-10 transition-all">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-zinc-800/80 bg-zinc-900/40 gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, facilities, audits, or scenarios..."
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none font-sans"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No matching commands or navigation routes.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.action) item.action();
                    else if (item.href) {
                      router.push(item.href);
                      onClose();
                    }
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-300 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isSelected ? "text-black" : "text-zinc-400"}`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider ${isSelected ? "text-zinc-600" : "text-zinc-400"}`}>
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${isSelected ? "bg-zinc-200 text-black border-zinc-300" : "bg-zinc-900 border-zinc-700 text-zinc-400"}`}>
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Navigate with ↑ ↓ and ↵ to select</span>
          <span className="font-mono text-[10px] text-zinc-500">AuditMind CLI</span>
        </div>
      </div>
    </div>
  );
}
