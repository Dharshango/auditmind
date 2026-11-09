"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message?.includes("401")
          ? "Invalid email or password. Please verify credentials."
          : "Authentication service unavailable. Please check backend status."
      );
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="relative min-h-screen text-white flex flex-col justify-between items-center p-6 select-none overflow-x-hidden">
      {/* Top Header */}
      <header className="w-full max-w-5xl flex items-center justify-between z-20 pt-2">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          title="Return to Landing Page"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Image
              src="/assets/logo.svg"
              alt="AuditMind"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white group-hover:text-neutral-300 transition-colors">
            AuditMind
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs text-[#8E8E8E] hover:text-white transition-colors flex items-center gap-1.5 font-medium px-3.5 py-1.5 rounded-full bg-[#18181B] border border-white/10"
        >
          <span>← Back to Overview</span>
        </Link>
      </header>

      {/* Center Sign-In Card */}
      <main className="w-full max-w-[420px] my-auto z-20 animate-reveal">
        <div className="bg-[#111113]/90 border border-white/10 rounded-2xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#18181B] border border-white/10 text-white mb-3 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-[#8E8E8E] mt-1">
              Sign in to continue.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#8E8E8E] mb-1.5 tracking-wider">
                Corporate Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="compliance@meridianindustrial.com"
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A5A5E] focus:outline-none focus:border-white/40 transition pr-10"
                />
                <Mail className="w-4 h-4 text-[#5A5A5E] absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-[#8E8E8E] mb-1.5 tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#5A5A5E] focus:outline-none focus:border-white/40 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#5A5A5E] hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot password */}
            <div className="flex items-center justify-between text-xs text-[#8E8E8E] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-[#18181B] border-white/20 text-white focus:ring-0 w-3.5 h-3.5 accent-white"
                />
                <span className="text-[12px]">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setError("Password reset is managed by enterprise directory SSO. Contact IT admin.")}
                className="text-[11px] text-[#A1A1AA] hover:text-white transition"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-100 active:scale-[0.99] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="text-[10px] font-mono uppercase text-[#8E8E8E] text-center mb-2.5 tracking-wider">
              One-Click Demo Credentials
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setDemoCredentials(
                    "compliance@meridianindustrial.com",
                    "compliance123"
                  )
                }
                className="p-2 rounded-xl bg-[#18181B] hover:bg-[#202024] border border-white/10 hover:border-white/25 text-left transition group"
              >
                <div className="text-[11px] font-medium text-white group-hover:text-neutral-100 flex items-center justify-between">
                  <span>Sarah Jenkins</span>
                  <Check className="w-3 h-3 text-[#8E8E8E] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-[#8E8E8E]">VP Compliance</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDemoCredentials(
                    "auditor.north@meridianindustrial.com",
                    "auditor123"
                  )
                }
                className="p-2 rounded-xl bg-[#18181B] hover:bg-[#202024] border border-white/10 hover:border-white/25 text-left transition group"
              >
                <div className="text-[11px] font-medium text-white group-hover:text-neutral-100 flex items-center justify-between">
                  <span>Marcus Vance</span>
                  <Check className="w-3 h-3 text-[#8E8E8E] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-[#8E8E8E]">Lead Auditor</div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-4 text-[11px] text-[#A1A1AA] z-20">
        <span>© 2026 AuditMind Operational Compliance Intelligence • </span>
        <span className="font-mono">Tenant: Meridian Industrial Group</span>
      </footer>
    </div>
  );
}
