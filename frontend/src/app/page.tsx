"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { CinematicBackground } from "@/components/CinematicBackground";

export default function LandingPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasStartedCount, setHasStartedCount] = useState(false);

  // Animated metrics states
  const [inferenceVal, setInferenceVal] = useState(0);
  const [uptimeVal, setUptimeVal] = useState(0);
  const [runtimeVal, setRuntimeVal] = useState(0);
  const [contextVal, setContextVal] = useState(0);

  const statsRef = useRef<HTMLDivElement>(null);

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

  // IntersectionObserver & count-up easing
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStartedCount) {
          setHasStartedCount(true);
        }
      },
      { threshold: 0.25 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasStartedCount]);

  useEffect(() => {
    if (!hasStartedCount) return;

    let startTime: number | null = null;
    const duration = 1600; // ms

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = easeOutCubic(progress);

      setInferenceVal(Math.round(eased * 120));
      setUptimeVal(parseFloat((eased * 99.99).toFixed(2)));
      setRuntimeVal(Math.round(eased * 24));
      setContextVal(parseFloat((eased * 2.4).toFixed(1)));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setInferenceVal(120);
        setUptimeVal(99.99);
        setRuntimeVal(24);
        setContextVal(2.4);
      }
    };

    requestAnimationFrame(step);
  }, [hasStartedCount]);

  return (
    <div className="relative w-full h-screen min-h-[640px] max-h-screen bg-black text-white overflow-hidden flex flex-col justify-between items-center select-none font-sans">
      {/* Background Video (Mandatory CloudFront Stream) */}
      <CinematicBackground position="absolute" />

      {/* Floating Centered Header (max-w: 720px, gap: clamp(18px, 2.8vw, 28px)) */}
      <header className="w-full max-w-[720px] px-4 pt-6 z-30 flex items-center justify-between md:justify-center gap-[clamp(18px,2.8vw,28px)] animate-slide-down">
        {/* 1. Circular White Logo Button (clamp(40px, 4.4vw, 46px)) */}
        <Link
          href="/"
          className="w-[clamp(40px,4.4vw,46px)] h-[clamp(40px,4.4vw,46px)] rounded-full bg-white flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.16)] hover:scale-[1.04] transition-transform shrink-0"
          title="AUDITMIND Home"
        >
          <div className="w-[72%] h-[72%] relative flex items-center justify-center">
            <Image
              src="/assets/logo.svg"
              alt="AUDITMIND Logo"
              width={32}
              height={32}
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* 2. Floating White Nav Pill (clamp(44px, 5.2vw, 48px), max-w: 430px, flex: 1) */}
        <nav className="hidden md:flex items-center justify-around flex-1 max-w-[430px] h-[clamp(44px,5.2vw,48px)] bg-white rounded-full px-4 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.16)] text-[#2E2E2E] text-[clamp(13px,1.4vw,15px)] font-medium tracking-[-0.01em]">
          <Link
            href="/"
            className="relative px-3 py-2 text-[#2E2E2E] font-medium opacity-100 flex flex-col items-center"
          >
            <span>Home</span>
            {/* Active Indicator: Three 3px x 3px black dots positioned at bottom 5px */}
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

        {/* 3. Dark Sign In Pill Button (matching nav height, #28282A, #C8C8C8) */}
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

        {/* Mobile Hamburger Button (48x48px, #28282A, three 18px x 1.5px bars) */}
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

      {/* Mobile Menu Overlay & White Card Sheet (Exact Reference Specification) */}
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

      {/* Main Hero Container (Centered vertically, max-w: 900px) */}
      <main className="flex flex-col items-center justify-center text-center px-4 my-auto max-w-[900px] z-10 w-full">
        {/* 8.1 Trust Row: 3 Avatar Circles + Trust Pill */}
        <div className="mb-[clamp(16px,2.5vh,26px)] flex items-center justify-center animate-slide-down">
          <div className="flex items-center">
            {/* Avatar 1: Microsoft (Z-Index: 1) */}
            <div
              style={{ width: "clamp(34px, 4.5vw, 42px)", height: "clamp(34px, 4.5vw, 42px)" }}
              className="rounded-full bg-[#28282A] border border-white/40 p-[5px] flex items-center justify-center shadow-md z-[1] hover:-translate-y-[2px] transition-transform duration-300 shrink-0"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <i className="fa-brands fa-microsoft text-[#111111] text-[13px]" />
              </div>
            </div>

            {/* Avatar 2: Amazon (Z-Index: 2, margin-left overlap) */}
            <div
              style={{
                width: "clamp(34px, 4.5vw, 42px)",
                height: "clamp(34px, 4.5vw, 42px)",
                marginLeft: "calc(clamp(34px, 4.5vw, 42px) * -0.42)",
              }}
              className="rounded-full bg-[#28282A] border border-white/40 p-[5px] flex items-center justify-center shadow-md z-[2] hover:-translate-y-[4px] transition-transform duration-300 shrink-0"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <i className="fa-brands fa-amazon text-[#111111] text-[13px]" />
              </div>
            </div>

            {/* Avatar 3: Google (Z-Index: 4, margin-left overlap) */}
            <div
              style={{
                width: "clamp(34px, 4.5vw, 42px)",
                height: "clamp(34px, 4.5vw, 42px)",
                marginLeft: "calc(clamp(34px, 4.5vw, 42px) * -0.42)",
              }}
              className="rounded-full bg-[#28282A] border border-white/40 p-[5px] flex items-center justify-center shadow-md z-[4] hover:-translate-y-[2px] transition-transform duration-300 shrink-0"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <i className="fa-brands fa-google text-[#111111] text-[13px]" />
              </div>
            </div>
          </div>

          {/* Trust Pill: margin-left -42%, pl 58% */}
          <div
            style={{
              height: "clamp(34px, 4.5vw, 42px)",
              marginLeft: "calc(clamp(34px, 4.5vw, 42px) * -0.42)",
              paddingLeft: "calc(clamp(34px, 4.5vw, 42px) * 0.58)",
            }}
            className="bg-[#28282A] border border-white/40 text-[#C4C2C3] text-[clamp(12px,1.4vw,13.5px)] font-medium pr-4 rounded-full flex items-center shadow-sm whitespace-nowrap"
          >
            Built for Enterprise Workflows
          </div>
        </div>

        {/* 8.2 Hero Headline (Solid #FFFFFF BubbledotICG-FinePos, Two Spans) */}
        <h1 className="font-display text-[clamp(28px,6.2vw,80px)] text-white tracking-[-0.04em] max-[720px]:tracking-[-0.08em] max-[420px]:tracking-[-0.09em] leading-[1.12] max-[720px]:leading-[1.05] max-[420px]:leading-[1.04] text-center mb-5 font-normal whitespace-nowrap">
          <span className="block animate-headline-1">Intelligence</span>
          <span className="block animate-headline-2">Designed To Evolve</span>
        </h1>

        {/* 8.3 Subheading (Inter 400, #D0D0D0, max-w: min(500px, 92%), line-height: 1.55) */}
        <p className="text-[#D0D0D0] text-[clamp(calc(13.5px+2pt),calc(1.55vw+2pt),calc(16.5px+2pt))] max-w-[min(500px,92%)] leading-[1.55] opacity-80 mb-7 animate-reveal font-normal text-center mx-auto">
          Build applications that reason, adapt and collaborate using a modular AI platform designed for production.
        </p>

        {/* 8.4 CTA Button (White pill, black text, radial drop-glow) */}
        <div className="animate-reveal-pulse">
          <Link
            href={isAuth ? "/dashboard" : "/login"}
            className="inline-flex items-center justify-center px-[clamp(22px,3vw,28px)] py-[clamp(11px,1.6vh,13px)] rounded-full bg-white text-black text-[clamp(13.5px,1.5vw,14.5px)] font-semibold hover:-translate-y-[2px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_0_22px_rgba(255,255,255,0.32),0_0_44px_rgba(255,255,255,0.12)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_28px_rgba(255,255,255,0.45),0_0_52px_rgba(255,255,255,0.18)]"
          >
            {isAuth ? "Open Dashboard" : "Get Started"}
          </Link>
        </div>
      </main>

      {/* 9. Statistics Footer (4 Columns, max-w: 920px, 2x2 on <=720px) */}
      <footer
        ref={statsRef}
        className="w-full max-w-[920px] px-6 pb-6 pt-2 z-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {/* Metric 1 */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline justify-center">
              <span className="font-display text-[clamp(22px,3vw,33px)] text-white mr-1.5 font-normal">
                &lt;
              </span>
              <span className="text-[clamp(18px,2.2vw,26px)] font-semibold text-white tracking-[-0.025em] tabular-nums">
                {inferenceVal} ms
              </span>
            </div>
            <div className="text-[clamp(11px,1.2vw,12.5px)] text-[#8E8E8E] font-normal mt-0.5">
              Inference Time
            </div>
          </div>

          {/* Metric 2 */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline justify-center">
              <span className="font-display text-[clamp(22px,3vw,33px)] text-white mr-1.5 font-normal">
                %
              </span>
              <span className="text-[clamp(18px,2.2vw,26px)] font-semibold text-white tracking-[-0.025em] tabular-nums">
                {uptimeVal.toFixed(2)} %
              </span>
            </div>
            <div className="text-[clamp(11px,1.2vw,12.5px)] text-[#8E8E8E] font-normal mt-0.5">
              Platform Uptime
            </div>
          </div>

          {/* Metric 3 */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline justify-center">
              <span className="font-display text-[clamp(22px,3vw,33px)] text-white mr-1.5 font-normal">
                *
              </span>
              <span className="text-[clamp(18px,2.2vw,26px)] font-semibold text-white tracking-[-0.025em] tabular-nums">
                {runtimeVal} /7
              </span>
            </div>
            <div className="text-[clamp(11px,1.2vw,12.5px)] text-[#8E8E8E] font-normal mt-0.5">
              Autonomous Runtime
            </div>
          </div>

          {/* Metric 4 */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline justify-center">
              <span className="font-display text-[clamp(22px,3vw,33px)] text-white mr-1.5 font-normal">
                #
              </span>
              <span className="text-[clamp(18px,2.2vw,26px)] font-semibold text-white tracking-[-0.025em] tabular-nums">
                {contextVal.toFixed(1)} M
              </span>
            </div>
            <div className="text-[clamp(11px,1.2vw,12.5px)] text-[#8E8E8E] font-normal mt-0.5">
              Context Windows
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
