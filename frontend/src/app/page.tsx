"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MarketingHeader } from "@/components/MarketingHeader";
import { api } from "@/lib/api";

export default function LandingPage() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(api.isAuthenticated());
  }, []);

  return (
    <div className="relative w-full h-screen min-h-[640px] max-h-screen text-white overflow-hidden flex flex-col justify-between items-center select-none font-sans">
      {/* Floating Centered Header */}
      <MarketingHeader activePage="home" />

      {/* Main Hero Container */}
      <main className="flex flex-col items-center justify-center text-center px-4 my-auto max-w-[900px] z-10 w-full py-12">
        {/* Hero Headline */}
        <h1 className="font-display text-[clamp(28px,6.2vw,80px)] text-white tracking-[-0.04em] max-[720px]:tracking-[-0.08em] max-[420px]:tracking-[-0.09em] leading-[1.12] max-[720px]:leading-[1.05] max-[420px]:leading-[1.04] text-center mb-6 font-normal whitespace-nowrap">
          <span className="block animate-headline-1">Intelligence</span>
          <span className="block animate-headline-2">Designed To Evolve</span>
        </h1>

        {/* Subheading */}
        <p className="text-[#D0D0D0] text-[clamp(calc(13.5px+2pt),calc(1.55vw+2pt),calc(16.5px+2pt))] max-w-[min(540px,92%)] leading-[1.55] opacity-80 mb-9 animate-reveal font-normal text-center mx-auto">
          Build applications that reason, adapt and collaborate using a modular AI platform designed for production.
        </p>

        {/* CTA Button */}
        <div className="animate-reveal-pulse">
          <Link
            href={isAuth ? "/dashboard" : "/login"}
            className="inline-flex items-center justify-center px-[clamp(24px,3.2vw,32px)] py-[clamp(12px,1.8vh,14.5px)] rounded-full bg-white text-black text-[clamp(13.5px,1.5vw,15px)] font-semibold hover:-translate-y-[2px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_22px_rgba(255,255,255,0.32),0_0_44px_rgba(255,255,255,0.12)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_28px_rgba(255,255,255,0.45),0_0_52px_rgba(255,255,255,0.18)]"
          >
            {isAuth ? "Open Dashboard" : "Get Started"}
          </Link>
        </div>
      </main>

      {/* Subtle bottom padding container */}
      <div className="h-10 w-full" />
    </div>
  );
}
