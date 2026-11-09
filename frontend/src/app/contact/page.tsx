"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { Mail, Building2, ShieldCheck, CheckCircle2, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    org: "",
    facilities: "5-10 Facilities",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col justify-between items-center select-none overflow-x-hidden">
      {/* Floating Header */}
      <MarketingHeader activePage="contact" />

      {/* Main Content */}
      <main className="w-full max-w-4xl px-6 py-16 z-10 flex flex-col items-center">
        {/* Pill Badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181B] border border-white/10 text-xs text-[#C4C2C3] animate-slide-down">
          <MessageSquare className="w-3.5 h-3.5 text-white" />
          <span>ENTERPRISE INQUIRY &amp; ARCHITECT ACCESS</span>
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white text-center tracking-tight leading-[1.1] mb-6 max-w-2xl animate-headline-1">
          Deploy Permanent Compliance Intelligence
        </h1>

        <p className="text-[#D0D0D0] text-base sm:text-lg text-center max-w-xl opacity-80 mb-12 animate-reveal">
          Connect your multi-facility network to AUDITMIND. Request architecture documentation or discuss enterprise deployment with our compliance engineers.
        </p>

        {/* Form or Success Box */}
        <div className="w-full max-w-xl bg-[#111113]/90 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl animate-reveal">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 mx-auto flex items-center justify-center text-white">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Inquiry Successfully Logged
              </h3>
              <p className="text-xs text-[#8E8E8E] max-w-md mx-auto leading-relaxed">
                Thank you for contacting AUDITMIND. A compliance solutions architect will review your facility profile and reach out within 4 business hours.
              </p>
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-100 transition inline-block"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8E8E8E] mb-1.5 tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Sarah Jenkins"
                    className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A5A5E] focus:outline-none focus:border-white/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8E8E8E] mb-1.5 tracking-wider">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="sjenkins@enterprise.com"
                    className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A5A5E] focus:outline-none focus:border-white/40 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8E8E8E] mb-1.5 tracking-wider">
                    Enterprise Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.org}
                    onChange={(e) =>
                      setFormData({ ...formData, org: e.target.value })
                    }
                    placeholder="Meridian Industrial Group"
                    className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A5A5E] focus:outline-none focus:border-white/40 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-[#8E8E8E] mb-1.5 tracking-wider">
                    Network Facility Scale
                  </label>
                  <select
                    value={formData.facilities}
                    onChange={(e) =>
                      setFormData({ ...formData, facilities: e.target.value })
                    }
                    className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40 transition"
                  >
                    <option value="1-5 Facilities">1 - 5 Facilities</option>
                    <option value="6-20 Facilities">6 - 20 Facilities</option>
                    <option value="20+ Facilities">20+ Facilities (Global)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-[#8E8E8E] mb-1.5 tracking-wider">
                  Audit Scope &amp; Compliance Requirements
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Describe your current audit workflow, standards (OSHA, EPA, ISO 9001), and memory integration goals..."
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A5A5E] focus:outline-none focus:border-white/40 transition resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-100 transition shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Submit Enterprise Inquiry</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* Security & Isolation Callout */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#A1A1AA] font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>SOC 2 Type II Isolated</span>
            </span>
            <span>Zero Data Leakage Across Tenants</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-6 text-xs text-[#A1A1AA] border-t border-white/5 z-10">
        © 2026 AUDITMIND Operational Compliance Intelligence • Production System
      </footer>
    </div>
  );
}
