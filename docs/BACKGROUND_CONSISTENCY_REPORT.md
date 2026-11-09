# AUDITMIND — Background Consistency Audit Report
**Date:** November 8, 2026  
**Auditor:** Principal UI/UX Architect & Systems Engineer  
**Scope:** Public marketing routes (`/`, `/product`, `/case-studies`, `/contact`, `/login`) and authenticated dashboard background architecture.

---

## 1. Executive Summary

A comprehensive visual and technical audit of AUDITMIND's background rendering architecture was conducted to evaluate consistency against the authoritative visual reference established on the homepage (`/`).

While the homepage features a full-bleed, hardware-accelerated video background (`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4`) with delicate organic gradients, public subpages (`/product`, `/case-studies`, `/contact`) suffered from visual divergence, disparate video opacity levels, heavy opaque overlays, and separate local implementations.

---

## 2. Route-by-Route Background Inspection

| Route | Video URL Used | Positioning / Layout | Video Opacity | Scrim / Overlays | Background Consistency Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`/` (Homepage - Reference)** | CloudFront MP4 | Full-bleed, `absolute inset-0`, `object-cover` | 100% | `from-black/40 via-transparent to-black/60` | **SOURCE OF TRUTH** (Vibrant lavender/peach contours) |
| **`/product`** | CloudFront MP4 | `fixed inset-0` | **40% (`opacity-40`)** | **`bg-black/60`** (Heavy dark scrim) | **FAILED**: Video dimmed by >75%; contours invisible |
| **`/case-studies`** | CloudFront MP4 | `fixed inset-0` | **40% (`opacity-40`)** | **`bg-black/60`** (Heavy dark scrim) | **FAILED**: Video dimmed by >75%; inconsistent with `/` |
| **`/contact`** | CloudFront MP4 | `fixed inset-0` | **40% (`opacity-40`)** | **`bg-black/60`** (Heavy dark scrim) | **FAILED**: Form container clashed with background |
| **`/login`** | CloudFront MP4 | `absolute inset-0` | 100% | `bg-black/50 backdrop-blur-[2px]` | **PARTIAL**: Duplicated code; slight blur drift |
| **`/dashboard` & authenticated** | N/A (Monochrome atmospheric canvas) | `fixed inset-0` | N/A | Ambient radial gradients + micro-dots | **CORRECT**: Pure black `#000000` with subtle ambient lighting |

---

## 3. Key Issues Identified

1. **Independent Duplicate Implementations**:
   Each public page implemented its own `<video className="bg-video">` container rather than utilizing a single reusable `CinematicBackground` component. This architecture invites divergence and rendering drift.
2. **Excessive Dimming / Heavy Overlays on Subpages**:
   In `product/page.tsx`, `case-studies/page.tsx`, and `contact/page.tsx`, the video was styled with `opacity-40` AND placed under `bg-black/60`. This compounded attenuation (effective video brightness < 16%), extinguishing the distinctive lavender, peach, and organic liquid motion that characterizes the reference identity.
3. **Scroll & Stacking Context Mismatches**:
   The homepage uses an unscrollable viewport container (`h-screen max-h-screen overflow-hidden`), whereas `/product`, `/case-studies`, and `/contact` have scrollable long-form content. Using `fixed inset-0` on long-form pages requires an isolated hardware-accelerated stacking context (`z-0 pointer-events-none`) so cards and interactive controls cleanly float above the background without clipping.
4. **Missing Reduced-Motion Handling**:
   The current video tags lack standard `prefers-reduced-motion` media query handling. Users requesting reduced motion should have playback paused or gracefully substituted with the dark fallback poster.

---

## 4. Remediation Plan (Stage 2)

1. **Build `CinematicBackground.tsx`**:
   - Create a single, high-performance reusable component in `frontend/src/components/CinematicBackground.tsx`.
   - Embed the exact CloudFront video URL with `autoPlay`, `muted`, `loop`, `playsInline`, `preload="auto"`, and pure black SVG poster fallback.
   - Use identical delicate scrim (`from-black/40 via-transparent to-black/60`) to preserve the liquid contours.
   - Respect `prefers-reduced-motion` via CSS / media query.
2. **Apply across all public pages**:
   - Replace local video snippets in `/`, `/product`, `/case-studies`, `/contact`, and `/login` with `<CinematicBackground />`.
   - Ensure cards on `/product`, `/case-studies`, and `/contact` use translucent dark glass (`#111113`/90 with `border-white/10` and `backdrop-blur-md`) so content is 100% readable while the cinematic background flows seamlessly beneath.
3. **Preserve Authenticated Dashboard Separation**:
   - Maintain the specialized `AtmosphericBackground` on authenticated dashboard routes (`/dashboard`, `/facilities`, etc.) to prevent background video distraction over dense data tables and OCR evidence.
