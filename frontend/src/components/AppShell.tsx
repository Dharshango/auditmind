"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "./Navigation";
import { TopNav } from "./TopNav";
import { CommandPalette } from "./CommandPalette";
import { UploadAuditModal } from "./UploadAuditModal";
import { CinematicBackground } from "./CinematicBackground";

const PUBLIC_ROUTES = ["/", "/login", "/product", "/case-studies", "/contact"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Check if current page is public landing, sign-in, or marketing page
  const isPublicPage = PUBLIC_ROUTES.includes(pathname);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Global keyboard shortcuts: ⌘K for command palette, ⌘U for upload
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "u") {
        e.preventDefault();
        setIsUploadOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // For public landing and marketing pages, render clean full-bleed layout with persistent cinematic video
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-black text-white relative selection:bg-white selection:text-black">
        <CinematicBackground
          position="fixed"
          scrimClassName="bg-gradient-to-b from-black/40 via-transparent to-black/60"
        />
        <main className="relative z-10 min-h-screen">{children}</main>
      </div>
    );
  }

  // Authenticated Command Center Dashboard Layout
  return (
    <div className="min-h-screen bg-black text-white flex antialiased relative selection:bg-white selection:text-black">
      {/* Ambient Cinematic Video with Calibrated Glassy Command Center Scrim */}
      <CinematicBackground position="fixed" scrimClassName="bg-black/60 backdrop-blur-[2px]" />

      {/* Subtle Architectural Drafting Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.7) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Slim, Premium Monochromatic Command Center Navigation */}
      <Navigation
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenCommand={() => setIsCommandOpen(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Workspace with Top Command Bar */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 relative z-10 ml-0 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-[272px]"
        }`}
      >
        <TopNav
          onOpenCommand={() => setIsCommandOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Global Command Center Modals */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />
      <UploadAuditModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
}
