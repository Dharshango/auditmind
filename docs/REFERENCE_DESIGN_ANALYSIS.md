# AUDITMIND — Reference Design Analysis & Integration Specification

**Document Version**: 1.0  
**Date**: November 8, 2026  
**Reference Subject**: AI Runtime Cinematic Landing Page & Unified Monochrome Design System  
**Application Target**: AUDITMIND Operational Compliance Intelligence Platform  

---

## 1. Reference Screenshot Decomposition

The reference design showcases a hyper-modern, cinematic AI software landing page. It is defined by a single-viewport full-bleed atmosphere, an organic flowing video background featuring lavender, dusty pink, peach, and deep black contours, ultra-clean floating navigation pills, retro pixel / dot-matrix display typography, and an architectural four-metric statistical footer.

### Visual Architecture Hierarchy
```
+----------------------------------------------------------------------------------------------------+
| [VIDEO BACKGROUND: Fluid organic canvas with peach/lavender flows & black negative space]          |
|                                                                                                    |
|                            [HEADER ROW: max-w-720px, gap 18-28px]                                 |
|       (Logo Pill: 44px)        [Nav Pill: Home • Product • Case Studies • Contact]   (Sign In: 44px) |
|                                                                                                    |
|                                                                                                    |
|                                      [HERO CONTAINER: max-w-900px]                                 |
|                              (OOO) [Trusted by 2000+ Enterprises] Pill                              |
|                                                                                                    |
|                                         Intelligence                                               |
|                                      Designed To Evolve                                            |
|                                 (BubbledotICG-FinePos, Solid White)                                |
|                                                                                                    |
|                   Build applications that reason, adapt and collaborate using a                    |
|                        modular AI platform designed for production.                                |
|                                   (Inter 400, #D0D0D0)                                             |
|                                                                                                    |
|                                      [ Get Started ]                                               |
|                                (White Pill with Subtle Glow)                                       |
|                                                                                                    |
|                                                                                                    |
|                           [STATISTICS FOOTER: 4 Columns, max-w-920px]                              |
|         < 120 ms             % 99.99 %              * 24 /7                 # 2.4 M                |
|      Inference Time       Platform Uptime     Autonomous Runtime        Context Windows            |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Color System & Design Tokens

The new design system completely replaces the previous Verdant Atelier green/ivory/gold system with a stark, cinematic monochrome foundation elevated by the natural organic video hues.

```css
:root {
  --bg: #000000;
  --text: #ffffff;
  --muted: #8e8e8e;
  --nav-text: #2e2e2e;
  --pill-dark: #28282a;
  --sign-in-text: #c8c8c8;
  --nav-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
  --trust-bg: #28282a;
  --trust-border: rgba(255, 255, 255, 0.4);
  --trust-text: #c4c2c3;

  /* Typography Stacks */
  --font-sans: "Inter", "Segoe UI", system-ui, sans-serif;
  --font-display: "BubbledotICG-FinePos", "Geist Pixel Circle", monospace;
}
```

### Exact Surface & Component Mapping
- **Canvas / Root Background**: `#000000` (Pure pitch black).
- **Navigation Pill**: Solid `#FFFFFF` container, `#2E2E2E` links at `0.5` opacity (default), `0.75` (hover), and `1.0` (active with 3-dot black indicator).
- **Logo Button**: Circular `#FFFFFF` container with centered AUDITMIND mark scaled to 72%.
- **Sign In / Dark Pills**: `#28282A` background, `#C8C8C8` text, hover `#323234` with `#FFFFFF` text.
- **Hero Headline**: Solid `#FFFFFF` dot-matrix typography.
- **Subheading**: `#D0D0D0` at `0.8` opacity, max-width `min(500px, 92%)`.
- **CTA Button**: Solid `#FFFFFF` with `#000000` text, radial drop-glow `0 0 0 1px rgba(255,255,255,0.15), 0 0 22px rgba(255,255,255,0.32), 0 0 44px rgba(255,255,255,0.12)`.
- **Statistics Footers**: White glyphs (`BubbledotICG-FinePos`), white values with Inter tabular numbers, `#8E8E8E` muted labels.

---

## 3. Typography Specifications

1. **Inter**: Loaded via Google Fonts (`400;500;600`).
   - Used for navigation, body text, buttons, numeric values, dashboard tables, forms, and dialogs.
2. **BubbledotICG-FinePos**: Loaded via OnlineWebFonts stylesheet (`https://db.onlinewebfonts.com/c/8cb707a9b8a73f8a7403336b861c3074?family=BubbledotICG-FinePos`).
   - Primary retro dot-matrix display face used for hero headlines, display titles, and statistics glyphs (`<`, `%`, `*`, `#`).
3. **Geist Pixel Circle**: Fallback font configured in `@font-face` / display stack.
4. **Font Awesome 6.5.2**: Loaded via cdnjs (`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css`) for brand icons.

---

## 4. Element Sizing & Precision Geometry

| Component | Dimensions / Bounds | Padding / Margin | Typography |
| :--- | :--- | :--- | :--- |
| **Circular Logo** | `clamp(40px, 4.4vw, 46px)` | 50% radius, grid center | Internal mark scaled 72% |
| **Nav Pill** | `clamp(44px, 5.2vw, 48px)`, max-w 430px | `4px 8px`, 999px radius | Inter 500, `clamp(13px, 1.4vw, 15px)` |
| **Active Indicator** | Three 3px × 3px dots, 5px spacing | 5px from bottom edge | Solid black `#000000` |
| **Sign In Button** | Height matching nav pill, 999px radius | `0 18px` | Inter 500, `#C8C8C8` |
| **Trust Avatars** | `clamp(36px, 4.5vw, 42px)` | -42% margin-left overlap | Dark ring `#28282A` + white inner disc |
| **Trust Pill** | Height matching avatars, 999px radius | `margin-left: -42%`, `pl: 58%` | Inter 500, `clamp(12px, 1.4vw, 13.5px)` |
| **Hero Headline** | `clamp(28px, 6.2vw, 80px)`, max-w 900px | `line-height: 1.12`, `ls: -0.04em` | BubbledotICG-FinePos, `#FFFFFF` |
| **Subheading** | `clamp(15.5px, 1.7vw, 18.5px)`, max-w 500px | `line-height: 1.55` | Inter 400, `#D0D0D0` (0.8 opacity) |
| **CTA Button** | `clamp(13.5px, 1.5vw, 14.5px)` | `12px 26px`, 999px radius | Inter 600, Black on White with glow |
| **Stats Grid** | 4 columns, max-w 920px (2x2 on <=720px) | Staggered 0.5s-0.74s | Glyphs 22-33px, Numbers 18-26px |

---

## 5. Animation Architecture & Reduced Motion

- **Header Entrance**: `slideDown 0.7s cubic-bezier(0.22, 1, 0.36, 1)` from `translateY(-18px)` and `opacity: 0`.
- **Headline Lines**: Independent line reveals via `headlineFade 0.85s cubic-bezier(0.22, 1, 0.36, 1)`:
  - Line 1 delay: `0.12s`
  - Line 2 delay: `0.30s`
- **Subheading & CTA**: `reveal 0.85s` with `0.28s` and `0.40s` delays.
- **Statistics Counter**: Interactive count-up using `IntersectionObserver` (threshold `0.25`, duration `1500ms + i*80ms`, easeOutCubic).
- **Reduced Motion Support**:
  - `@media (prefers-reduced-motion: reduce)`: All animations neutralized (`animation: none`), opacity 100%, background video paused with static poster fallback.

---

## 6. Application Integration Strategy

```
URL Structure:
/               -> Public Cinematic Landing Page (Single viewport, video background, exact reference recreation)
/login          -> Cinematic Sign-In Page (Inherits video background, dark card, real auth authentication)
/dashboard      -> Authenticated Executive Overview Dashboard (Dark cinematic layout, live DB data)
/facilities     -> Facility Network (Dark cinematic theme)
/audits         -> Audit Management (Dark cinematic theme)
/findings       -> Findings Ledger (Dark cinematic theme)
/memory         -> Organizational Memory (Dark cinematic theme)
/recurring      -> Recurring Failures (Dark cinematic theme)
/capa           -> Corrective Actions (Dark cinematic theme)
/evidence       -> Evidence Vault (Dark cinematic theme)
/agent          -> Flagship AI Compliance Agent (Dark cinematic theme)
```

1. **Landing Route Separation**:
   - `AppShell.tsx` dynamically detects routes via `usePathname()`.
   - On `/` and `/login`, the application shell hides the dashboard sidebar and top navbar, rendering the full-bleed single-viewport layout.
   - On `/dashboard` and internal routes, the application shell renders the unified dark cinematic sidebar and top navigation.
2. **Authentication Integration**:
   - Backend provides `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`.
   - Frontend manages session state in `localStorage` + secure cookie (`auditmind_auth_token`).
   - If signed in: Landing header displays `Dashboard`, CTA displays `Open Dashboard`.
   - If signed out: Landing header displays `Sign In`, CTA displays `Get Started` (`/login`).
   - Unauthenticated attempts to access `/dashboard` or internal features prompt redirection or modal sign-in.
3. **Dashboard Theme Unification**:
   - All dashboard components, tables, charts, cards, and modal dialogs are updated to the unified `#000000` base, `#28282A` containers, `#FFFFFF` headers, and `#8E8E8E` metadata, fully extinguishing the previous Verdant Atelier green/ivory system.
