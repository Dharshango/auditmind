"use client";

import React from "react";

export function AtmosphericBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none bg-black"
    >
      {/* Subtle top ambient monochrome glow */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-full opacity-20 blur-[140px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.12) 0%, rgba(200, 200, 220, 0.05) 45%, transparent 70%)",
        }}
      />

      {/* Subtle secondary ambient lighting with soft lavender tint matching the video mood */}
      <div
        className="absolute top-[10%] -right-[10%] w-[650px] h-[480px] rounded-full opacity-15 blur-[120px]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(230, 210, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 50%, transparent 70%)",
        }}
      />

      {/* Architectural drafting micro-dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.6) 1px, transparent 0)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 50%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 50%, transparent 90%)",
        }}
      />
    </div>
  );
}
