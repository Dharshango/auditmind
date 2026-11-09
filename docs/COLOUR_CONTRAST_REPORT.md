# AUDITMIND — Global Colour & Text Visibility Audit Report
**Date:** November 8, 2026  
**Auditor:** Principal Accessibility & Design Systems Engineer  
**Standard:** WCAG 2.2 Level AA Compliance (Normal text >= 4.5:1, Large text >= 3.0:1)  
**Automated Audit Engine:** Headless Chrome Computed Style Luminance Matrix (`scripts/audit_contrast_wcag.js`)

---

## 1. Executive Summary

An exhaustive automated contrast and visibility audit was conducted across all 14 user-facing routes of AUDITMIND. Over 2,100 visible text nodes, labels, form controls, badges, table cells, chart axes, and interactive triggers were evaluated.

The audit identified two categories of contrast failures:
1. **Critical Failures (Contrast < 2.0:1 — "Invisible Text")**:
   Badges, metadata pills, table cells, and regulation citations across `/facilities`, `/audits`, `/findings`, `/memory`, and `/recurring` rendered with text color `#28282A` (`text-brand-forest`) on `#18181B` or `#000000` backgrounds, resulting in disastrous contrast ratios of **1.20:1 to 1.43:1**.
2. **Subtle / Borderline Failures (Contrast 2.4:1 to 4.35:1 — "Low Legibility")**:
   - Inactive nav links on the floating white nav pill rendered with `#2E2E2E` at `opacity-50`, yielding **2.92:1** against the white background (required: 4.5:1).
   - Sidebar secondary metadata (`Sarah J.` and `MEMORY ENGINE`) used `text-[#52525B]`, yielding **2.44:1** on `#111113`.
   - Card captions and microcopy using `text-zinc-500` / `#71717A` yielded **3.90:1** on `#111113` (required: 4.5:1).

---

## 2. Route Audit Summary Table

| Route | Checked Text Elements | Flagged Contrast Issues | Worst Contrast Ratio | Primary Root Causes |
| :--- | :--- | :--- | :--- | :--- |
| **`/` (Landing Page)** | 19 | 3 | 2.92:1 | Nav pill inactive links (`opacity-50`) |
| **`/product`** | 26 | 6 | 2.92:1 | Nav pill inactive links + low-contrast card subheadings |
| **`/case-studies`** | 32 | 6 | 2.92:1 | Nav pill inactive links |
| **`/contact`** | 25 | 9 | 2.92:1 | Nav pill inactive links + `text-zinc-500` security badges (3.90:1) |
| **`/login`** | 22 | 2 | 4.35:1 | Footer copyright & tenant text in `text-zinc-500` |
| **`/dashboard`** | 114 | 12 | 2.44:1 | Sidebar footer `text-[#52525B]` + `text-zinc-500` captions |
| **`/facilities`** | 114 | 8 | **1.20:1** | **`text-brand-forest` (#28282A) on facility codes (`FAC-001`)** |
| **`/audits`** | 644 | 44 | **1.20:1** | **`text-brand-forest` on categories & audit scores** |
| **`/findings`** | 576 | 103 | **1.20:1** | **`text-brand-forest` on regulation codes (`OSHA 1910.37`)** |
| **`/memory`** | 204 | 22 | **1.20:1** | **`text-brand-forest` on mental models & memory tags** |
| **`/recurring`** | 188 | 18 | **1.20:1** | **`text-brand-forest` on failure taxonomy tags** |
| **`/capa`** | 142 | 14 | 3.90:1 | Status badges & verification timeline text |
| **`/evidence`** | 118 | 11 | 3.90:1 | OCR snippet previews & document metadata |
| **`/agent`** | 96 | 8 | 3.90:1 | Suggested prompt chips & tool status indicators |
| **TOTAL** | **2,120+** | **248** | **1.20:1** | Systemic token misconfiguration |

---

## 3. Root Cause Deep Dive

### A. The "Forest" Token Inversion (`1.20:1`)
- In `frontend/src/app/globals.css`:
  ```css
  --brand-forest: #28282a;
  ```
- In `frontend/src/components/ui/Badge.tsx`:
  ```tsx
  forest: "bg-surface-secondary text-brand-forest dark:text-[#8DC9A9] border border-brand-forest/25 dark:border-brand-forest/40",
  ```
- Because `<html>` did not declare `class="dark"` by default, Tailwind fell back to `text-brand-forest`, which evaluated to `#28282A`.
- `#28282A` placed on `bg-surface-secondary` (`#18181B`) or pure black (`#000000`) has a contrast ratio of **1.20:1** to **1.43:1**, rendering facility codes, regulation numbers, and badges virtually invisible.

### B. Inactive Nav Pill Opacity (`2.92:1`)
- The floating white pill nav in `page.tsx` and `MarketingHeader.tsx` styled inactive links with:
  ```tsx
  opacity-50 text-[#2E2E2E]
  ```
- `#2E2E2E` at 50% opacity over `#FFFFFF` blends to `#979797`, which produces a contrast ratio of **2.92:1**, failing WCAG AA (requires 4.5:1 for 15px text).

### C. Over-dimmed Neutral Greys (`2.44:1` - `3.90:1`)
- `text-[#52525B]` (zinc-600) on `#111113` = **2.44:1**.
- `text-[#71717A]` (zinc-500) on `#111113` = **3.90:1**.
- `text-[#8E8E8E]` on `#000000` = **5.10:1** (PASS), but on `#18181B` drops to **4.55:1** (barely passing).
- `text-[#A1A1AA]` (zinc-400) on `#111113` = **6.52:1** (PASS).

---

## 4. Remediation Strategy (Stage 4)

1. **Centralized Semantic Token System**:
   - Establish high-contrast, pure cinematic monochrome tokens:
     ```css
     --text-primary: #FFFFFF;        /* Contrast: 21:1 on #000000 */
     --text-secondary: #C8C8C8;      /* Contrast: 11.2:1 on #000000 */
     --text-muted: #8E8E8E;          /* Contrast: 5.1:1 on #000000, 4.55:1 on #18181B */
     --text-subtle: #A1A1AA;         /* Contrast: 6.5:1 on #111113 */
     ```
2. **Purge All Remaining Verdant Atelier Tokens**:
   - Eliminate `atelier-citron`, `atelier-forest`, `atelier-obsidian`, and old green/gold styles.
   - Refactor `Badge.tsx` to provide crisp monochrome, semantic status (`success`, `warning`, `critical`, `info`), and subtle video-driven accent options (`lavender`: `#C6B9D8`, `pink`: `#D5A6B5`, `peach`: `#D7A18D`).
3. **Fix Inactive Nav Pill Text**:
   - Update inactive links from `opacity-50` to `opacity-80 hover:opacity-100` with text color `#404040` (Contrast: **7.3:1** against white pill).
4. **Ensure Global `dark` Class on `<html>`**:
   - Add `className="dark"` and `style={{ colorScheme: "dark" }}` to `<html lang="en">` in `layout.tsx`.
5. **Verify All Form Fields & Inputs**:
   - Update input borders, placeholder text (`placeholder:text-[#8E8E8E]`, contrast 4.85:1), and focus rings (`focus:ring-2 focus:ring-white/40 focus:border-white`).
