"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";

interface MarketingHeaderProps {
  activePage: "home" | "product" | "case-studies" | "contact";
}

export function MarketingHeader({ activePage }: MarketingHeaderProps) {
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
    <>
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
            className={`relative px-3 py-2 transition-opacity flex flex-col items-center ${
              activePage === "home" ? "opacity-100 font-medium text-black" : "opacity-80 hover:opacity-100 font-medium text-[#2E2E2E]"
            }`}
          >
            <span>Home</span>
            {activePage === "home" && (
              <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
              </span>
            )}
          </Link>

          <Link
            href="/product"
            className={`relative px-3 py-2 transition-opacity flex flex-col items-center ${
              activePage === "product" ? "opacity-100 font-medium text-black" : "opacity-80 hover:opacity-100 font-medium text-[#2E2E2E]"
            }`}
          >
            <span>Product</span>
            {activePage === "product" && (
              <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
              </span>
            )}
          </Link>

          <Link
            href="/case-studies"
            className={`relative px-3 py-2 transition-opacity flex flex-col items-center ${
              activePage === "case-studies" ? "opacity-100 font-medium text-black" : "opacity-80 hover:opacity-100 font-medium text-[#2E2E2E]"
            }`}
          >
            <span>Case Studies</span>
            {activePage === "case-studies" && (
              <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
              </span>
            )}
          </Link>

          <Link
            href="/contact"
            className={`relative px-3 py-2 transition-opacity flex flex-col items-center ${
              activePage === "contact" ? "opacity-100 font-medium text-black" : "opacity-80 hover:opacity-100 font-medium text-[#2E2E2E]"
            }`}
          >
            <span>Contact</span>
            {activePage === "contact" && (
              <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 flex items-center gap-[5px]">
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
                <span className="w-[3px] h-[3px] rounded-full bg-black" />
              </span>
            )}
          </Link>
        </nav>

        {/* 3. Dark Pill (Sign In / Dashboard) */}
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

      {/* Mobile Menu Overlay & Sheet */}
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
              className={`text-[#2E2E2E] font-medium text-base relative pb-2 flex flex-col items-center ${
                activePage === "home" ? "opacity-100 font-semibold" : "opacity-60"
              }`}
            >
              <span>Home</span>
              {activePage === "home" && (
                <span className="flex items-center gap-[4px] mt-1">
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                </span>
              )}
            </Link>
            <Link
              href="/product"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-[#2E2E2E] font-medium text-base relative pb-2 flex flex-col items-center ${
                activePage === "product" ? "opacity-100 font-semibold" : "opacity-60"
              }`}
            >
              <span>Product</span>
              {activePage === "product" && (
                <span className="flex items-center gap-[4px] mt-1">
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                </span>
              )}
            </Link>
            <Link
              href="/case-studies"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-[#2E2E2E] font-medium text-base relative pb-2 flex flex-col items-center ${
                activePage === "case-studies" ? "opacity-100 font-semibold" : "opacity-60"
              }`}
            >
              <span>Case Studies</span>
              {activePage === "case-studies" && (
                <span className="flex items-center gap-[4px] mt-1">
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                </span>
              )}
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-[#2E2E2E] font-medium text-base relative pb-2 flex flex-col items-center ${
                activePage === "contact" ? "opacity-100 font-semibold" : "opacity-60"
              }`}
            >
              <span>Contact</span>
              {activePage === "contact" && (
                <span className="flex items-center gap-[4px] mt-1">
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                  <span className="w-[3px] h-[3px] rounded-full bg-black" />
                </span>
              )}
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
    </>
  );
}
