"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

export default function LandingPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsAuth(api.isAuthenticated());

    const handleResize = () => {
      if (window.innerWidth > 720) {
        setMobileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative w-full h-screen min-h-[640px] max-h-screen text-white overflow-hidden flex flex-col justify-between items-center select-none font-sans">
      {/* Floating Centered Header */}
      <header className="w-full max-w-[820px] px-4 pt-6 z-30 flex items-center justify-between md:justify-center gap-[clamp(14px,2.2vw,24px)] animate-slide-down">
        {/* 1. Circular White Logo Button + AuditMind Brand Typography */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none shrink-0"
          title="AuditMind Home"
        >
          <div className="w-[clamp(40px,4.4vw,46px)] h-[clamp(40px,4.4vw,46px)] rounded-full bg-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.16)] group-hover:scale-[1.04] transition-transform shrink-0">
            <div className="w-[72%] h-[72%] relative flex items-center justify-center">
              <Image
                src="/assets/logo.svg"
                alt="AuditMind Logo"
                width={32}
                height={32}
                priority
                className="object-contain"
              />
            </div>
          </div>
          <span className="font-semibold text-white tracking-[-0.02em] text-[17px] font-sans">
            AuditMind
          </span>
        </Link>

        {/* 2. Floating White Nav Pill */}
        <nav className="hidden md:flex items-center justify-around flex-1 max-w-[430px] h-[clamp(44px,5.2vw,48px)] bg-white rounded-full px-4 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.16)] text-[#2E2E2E] text-[clamp(13px,1.4vw,15px)] font-medium tracking-[-0.01em]">
          <Link
            href="/"
            className="relative px-3 py-2 text-[#2E2E2E] font-medium opacity-100 flex flex-col items-center"
          >
            <span>Home</span>
            {/* Active Indicator: Three 3px x 3px black dots */}
            <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
              <span className="w-[3px] h-[3px] rounded-full bg-black" />
              <span className="w-[3px] h-[3px] rounded-full bg-black" />
              <span className="w-[3px] h-[3px] rounded-full bg-black" />
            </span>
          </Link>
          <Link
            href="/product"
            className="px-3 py-2 text-[#2E2E2E] opacity-80 hover:opacity-100 font-medium transition-opacity"
          >
            Product
          </Link>
          <Link
            href="/case-studies"
            className="px-3 py-2 text-[#2E2E2E] opacity-80 hover:opacity-100 font-medium transition-opacity"
          >
            Case Studies
          </Link>
          <Link
            href="/contact"
            className="px-3 py-2 text-[#2E2E2E] opacity-80 hover:opacity-100 font-medium transition-opacity"
          >
            Contact
          </Link>
        </nav>

        {/* 3. Dark Sign In Pill Button */}
        <div className="hidden md:block">
          {isAuth ? (
            <Link
              href="/dashboard"
              className="h-[clamp(44px,5.2vw,48px)] px-5 rounded-full bg-[#28282A] text-[#C8C8C8] hover:text-white hover:bg-[#323234] hover:-translate-y-px text-[clamp(13px,1.4vw,14.5px)] font-medium transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)] flex items-center justify-center shrink-0"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="h-[clamp(44px,5.2vw,48px)] px-5 rounded-full bg-[#28282A] text-[#C8C8C8] hover:text-white hover:bg-[#323234] hover:-translate-y-px text-[clamp(13px,1.4vw,14.5px)] font-medium transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)] flex items-center justify-center shrink-0"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          className={`md:hidden w-12 h-12 rounded-full flex flex-col items-center justify-center gap-[5px] z-40 transition-colors shadow-lg ${
            mobileMenuOpen ? "bg-white" : "bg-[#28282A]"
          }`}
        >
          <span
            className={`w-[18px] h-[1.5px] transition-all duration-300 ${
              mobileMenuOpen ? "bg-black rotate-45 translate-y-[6.5px]" : "bg-white"
            }`}
          />
          <span
            className={`w-[18px] h-[1.5px] transition-all duration-300 ${
              mobileMenuOpen ? "opacity-0" : "bg-white"
            }`}
          />
          <span
            className={`w-[18px] h-[1.5px] transition-all duration-300 ${
              mobileMenuOpen ? "bg-black -rotate-45 -translate-y-[6.5px]" : "bg-white"
            }`}
          />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-[6px] z-30 flex flex-col items-center pt-24 px-6 animate-overlay-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-white rounded-[28px] p-[22px_18px_20px] shadow-[0_20px_60px_rgba(0,0,0,0.45)] text-center flex flex-col items-center space-y-4 animate-reveal"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#2E2E2E] font-medium text-base relative pb-2 flex flex-col items-center"
            >
              <span>Home</span>
              <span className="flex items-center gap-[4px] mt-1">
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
              </span>
            </Link>
            <Link
              href="/product"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#2E2E2E] opacity-60 hover:opacity-100 font-medium text-base transition-opacity"
            >
              Product
            </Link>
            <Link
              href="/case-studies"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#2E2E2E] opacity-60 hover:opacity-100 font-medium text-base transition-opacity"
            >
              Case Studies
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[#2E2E2E] opacity-60 hover:opacity-100 font-medium text-base transition-opacity"
            >
              Contact
            </Link>

            <div className="w-full pt-2">
              {isAuth ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full bg-[#28282A] text-white font-medium text-sm flex items-center justify-center shadow-md"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full bg-[#28282A] text-white font-medium text-sm flex items-center justify-center shadow-md"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

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
