"use client";

import React, { useEffect, useRef, useState } from "react";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4";

const FALLBACK_POSTER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='black'><rect width='100' height='100'/></svg>";

interface CinematicBackgroundProps {
  /**
   * Optional custom scrim overlay. Defaults to subtle cinematic gradient
   * preserving the organic liquid contours (from-black/40 via-transparent to-black/60).
   */
  scrimClassName?: string;
  /**
   * Layout positioning: 'fixed' (default, perfect for long-scroll pages)
   * or 'absolute' (for strictly bound viewport containers).
   */
  position?: "fixed" | "absolute";
}

export function CinematicBackground({
  scrimClassName = "bg-gradient-to-b from-black/40 via-transparent to-black/60",
  position = "fixed",
}: CinematicBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
    } else if (!prefersReducedMotion && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, [prefersReducedMotion]);

  return (
    <div
      aria-hidden="true"
      className={`${
        position === "fixed" ? "fixed" : "absolute"
      } inset-0 z-0 overflow-hidden bg-black pointer-events-none select-none`}
    >
      {!hasError && !prefersReducedMotion && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={FALLBACK_POSTER}
          onError={() => setHasError(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      {/* Subtle organic scrim overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${scrimClassName}`}
      />
    </div>
  );
}
