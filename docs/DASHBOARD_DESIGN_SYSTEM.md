# AUDITMIND — DASHBOARD DESIGN SYSTEM SPECIFICATION (STAGE 2)
## CINEMATIC INTELLIGENCE COMMAND CENTER

> **Tagline:** *"Clarity across every facility. Intelligence across every decision."*  
> **Source of Truth:** Motion Sites Cinematic Landing Page (`hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4`)  
> **Target Audience:** Enterprise VPs of Quality, Regulatory Compliance Directors, Facility General Managers, Lead Auditors.

---

## 1. Visual Identity & Design Principles

1. **Exact Landing Page Continuation:**  
   The authenticated dashboard is not a disjointed admin portal; it is the command workspace revealed behind the public landing page. It shares the exact cinematic canvas, typography, and atmospheric video depth.
2. **Monochromatic Authority:**  
   Deep black `#000000` canvas and layered charcoal surfaces (`#101010`, `#171717`, `#202020`) provide maximum contrast and seriousness for multi-million dollar compliance operations.
3. **Restrained Video-Derived Accents:**  
   Color is sampled directly from the CloudFront background video (lavender, dusty pink, soft peach, deep purple) and reserved strictly for analytical data series, risk highlights, and intelligence badges.
4. **Editorial Asymmetry Over Card Sprawl:**  
   Eschew repetitive rounded card grids. Utilize asymmetric editorial composition, expansive whitespace, hairline grid borders (`border-white/10`), and prominent tabular numerals.
5. **Purposeful Dot-Matrix Typography:**  
   The signature dot-matrix/pixel display typography (`BubbledotICG-FinePos` / `Geist Pixel Circle`) is applied selectively to main page titles, KPI figures, and intelligence tags. High-density data tables and operational text use `Inter` for WCAG 2.2 AAA readability.

---

## 2. Color Palette & Token Definitions

### 2.1 Core Monochrome Foundation
```css
--dashboard-bg: #000000;
--dashboard-surface: #101010;
--dashboard-surface-secondary: #171717;
--dashboard-surface-elevated: #202020;
--dashboard-surface-floating: rgba(16, 16, 16, 0.85);

--dashboard-text: #FFFFFF;
--dashboard-text-secondary: #C8C8C8;
--dashboard-text-muted: #8E8E8E;
--dashboard-text-subtle: #A1A1AA;

--dashboard-border: rgba(255, 255, 255, 0.12);
--dashboard-border-subtle: rgba(255, 255, 255, 0.07);
--dashboard-border-strong: rgba(255, 255, 255, 0.22);
```

### 2.2 Video-Derived Accent Palette (Sampled from CloudFront MP4)
```css
/* Ambient highlights & data visualization series */
--accent-lavender: #C6B9D8;       /* Primary analytics highlight, trendlines */
--accent-pink: #D5A6B5;           /* Recurrence alerts, drift indicators */
--accent-peach: #D7A18D;          /* Facility comparison secondary series */
--accent-purple-deep: #4A3E56;    /* Dark badge backdrops, subtle glow */
```

### 2.3 Semantic Operational Accents (Contrast-Calibrated)
```css
--status-critical: #F87171;       /* Red-400: High severity finding, recurrence */
--status-warning: #FBBF24;        /* Amber-400: Approaching overdue, pending verification */
--status-success: #34D399;        /* Emerald-400: Verified durable, audit passed */
--status-info: #60A5FA;           /* Blue-400: Hindsight memory retain/sync */
```

---

## 3. Typography Architecture

### 3.1 Font Stacks
- **UI & Body Stack:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Display & Pixel Stack:** `"BubbledotICG-FinePos", "Geist Pixel Circle", monospace`
- **Tabular Data & Code Stack:** `ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace`

### 3.2 Typographic Hierarchy
| Role | Font Family | Size | Weight | Tracking | Usage |
|---|---|---|---|---|---|
| **Editorial Hero** | Display / Pixel | 32px – 40px | Regular | -0.02em | Top command center headings (`"Your organization, in focus."`) |
| **KPI Numerals** | Mono / Tabular | 28px – 36px | Medium | -0.03em | Primary metric strip numbers |
| **Section Identifier**| Display / Pixel | 13px – 15px | Regular | +0.05em | Intelligence tags, module badges (`INTELLIGENCE DETECTED`) |
| **Section Heading** | UI (Inter) | 18px – 20px | SemiBold | -0.01em | Table & chart headers, workspace titles |
| **Data Table Text** | UI (Inter) | 12px – 13px | Regular | Normal | Findings rows, audit records, CAPA tasks |
| **Metadata & Subtext**| Mono (Inter/Mono)| 10px – 11px | Medium | +0.04em | Timestamps, SHA-256 hashes, facility codes |

---

## 4. Background & Atmosphere System

The dashboard integrates the CloudFront video asset (`...hf_20260809_012548...mp4`) through a calibrated dual-layer system:

```
[Layer 0] Video Element (autoplay, muted, loop, object-cover)
    ↓
[Layer 1] Ambient Dark Scrim (bg-black/85 backdrop-blur-[1px])
    ↓
[Layer 2] Subtle Geometric Micro-Grid (radial 1px dots at 32px intervals, opacity 0.03)
    ↓
[Layer 3] Command Center Surfaces (#101010 / #171717 with rgba(255,255,255,0.1) borders)
```

- **Readability Guarantee:** All text is rendered on either opaque surfaces (`#101010` / `#171717`) or above the calibrated `bg-black/85` scrim, ensuring a contrast ratio exceeding **7.5:1 (WCAG AAA)**.
- **Motion Sensitivity:** Respects `prefers-reduced-motion` by automatically pausing video playback and freezing atmospheric transitions.

---

## 5. Signature Components Architecture

### 5.1 Analytical Metrics Strip (`MetricsStrip`)
Replaces isolated floating stat cards with a unified analytical bar:
- 6 key operational metrics: Total Facilities, Total Audits, Open Findings, Critical Findings, Overdue Corrective Actions, Recurring Failures.
- Metrics are separated by vertical hairline dividers (`border-white/10`).
- Values feature tabular figures with subtle trend indicators.

### 5.2 Intelligence Detected Panel (`IntelligenceDetectedPanel`)
A prominent editorial section showcasing real-time compliance insights:
- New recurrence detected across facilities.
- Corrective actions failing verification.
- Memory drift detected by Hindsight.
- Direct drill-down link to the exact finding or audit document.

### 5.3 Interactive Facility Network Graph (`NetworkGraph`)
An abstract canvas/SVG topology graph:
- Facilities rendered as interactive glowing nodes.
- Inter-facility edges signify shared non-conformances or common root causes.
- Instant toggle to an accessible, high-density structured list.

### 5.4 3-Pane Split Workspace (`SplitWorkspace`)
Standardized layout for complex document investigation (`Evidence Vault` & `AI Compliance Agent`):
- **Pane 1 (Left, 280px):** Filterable file manifest, session history, or document tree.
- **Pane 2 (Center, Flex-1):** High-fidelity document viewer or conversational command workspace.
- **Pane 3 (Right, 360px):** Contextual metadata, SHA-256 cryptographic proof, Hindsight memory reflections, and tool traces.

---

## 6. Motion & Animation Standards

- **Micro-Interactions (150ms – 200ms):** Button active states, hover border transitions, badge expansions (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Macro Transitions (250ms – 350ms):** Sidebar collapse/expand, modal slide-ins, split-pane toggles.
- **Data Visualizations:** Subtle 400ms progressive draw for Recharts bar and area elements with zero bounce.
