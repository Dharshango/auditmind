# AUDITMIND — Executive Industrial Intelligence Design System

This document specifies the complete design token system, typography hierarchy, component architecture, and interaction standards for AUDITMIND.

---

## 1. Visual Direction: Executive Industrial Intelligence

AUDITMIND balances **industrial operational rigor** with **executive analytical luxury**. It is designed for Chief Compliance Officers, plant managers, and regulatory auditors who require immediate clarity, mathematical precision, and an aesthetically superior desktop experience.

### Core Influences
- **Linear**: Razor-sharp density, subtle micro-borders, collapsible sidebar, global command palette (`⌘K`), keyboard accessibility.
- **Stripe**: Tabular financial/compliance precision, refined Recharts styling, clear visual hierarchies, restrained status chips.
- **Vercel**: Minimalist workspace switcher, clean breadcrumb navigation, crisp badge typography.
- **Drata**: Compliance control monitoring, risk readiness indicators, evidence verification drawer.
- **Made Good Designs**: Warm ivory canvas (`#F5F4F0`), editorial serif highlights, champagne gold (`#B49A6A`) executive accents.
- **Rauno Freiberg**: 150–250ms ease transitions, tactile button press feedback, polished focus rings.

---

## 2. Color Token Architecture

The design system supports **Warm Light Mode (Default)** and **Deep Navy Dark Mode (Optional)** with seamless CSS variable transitions.

```css
:root {
  /* Warm Light Mode (Default) */
  --canvas-bg: #F5F4F0;
  --surface-primary: #FFFFFF;
  --surface-secondary: #EFEFEA;
  --surface-elevated: #FFFFFF;
  
  --text-primary: #172132;
  --text-secondary: #697587;
  --text-muted: #9BA4B2;
  
  --border-subtle: #E4E5E2;
  --border-strong: #D1D3CD;
  
  --brand-navy: #111B2A;
  --brand-navy-light: #1A283A;
  --accent-gold: #B49A6A;
  --accent-gold-light: #F4EEDF;
  --intelligence-teal: #278F80;
  --intelligence-teal-light: #E7F5F3;
  
  /* Semantic Status */
  --status-critical: #C94B4B;
  --status-critical-bg: #FDF2F2;
  --status-warning: #D59B45;
  --status-warning-bg: #FEF8ED;
  --status-success: #319575;
  --status-success-bg: #EDF7F4;
  --status-info: #507BB6;
  --status-info-bg: #EDF3FB;
}

.dark {
  /* Deep Navy Dark Mode */
  --canvas-bg: #0B111A;
  --surface-primary: #111B2A;
  --surface-secondary: #162235;
  --surface-elevated: #1B293F;
  
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  
  --border-subtle: #1E293B;
  --border-strong: #334155;
  
  --brand-navy: #0B111A;
  --brand-navy-light: #162235;
  --accent-gold: #D4AF37;
  --accent-gold-light: rgba(212, 175, 55, 0.12);
  --intelligence-teal: #2DD4BF;
  --intelligence-teal-light: rgba(45, 212, 191, 0.12);
  
  /* Semantic Status (Dark) */
  --status-critical: #F87171;
  --status-critical-bg: rgba(239, 68, 68, 0.15);
  --status-warning: #FBBF24;
  --status-warning-bg: rgba(245, 158, 11, 0.15);
  --status-success: #34D399;
  --status-success-bg: rgba(16, 185, 129, 0.15);
  --status-info: #60A5FA;
  --status-info-bg: rgba(59, 130, 246, 0.15);
}
```

---

## 3. Typography System

- **Primary UI Sans**: Inter / Geist / System Sans.
  - `font-sans antialiased text-[13px] tracking-tight`
- **Tabular Figures**:
  - `font-mono tabular-nums` for all metrics, percentages, finding codes (`FIND-2026-001`), and dates.
- **Editorial Headings**:
  - Refined serif styling for selected executive milestone titles and dashboard headers:
    `font-serif tracking-tight font-medium`

---

## 4. Spacing, Borders & Elevation

| Element | Specification | Utility Class |
|---|---|---|
| **Border Radius** | Small: 6px, Standard: 10px, Card: 14px, Large: 20px | `rounded-md`, `rounded-xl`, `rounded-2xl` |
| **Borders** | 1px solid, ultra-subtle | `border border-[#E4E5E2] dark:border-slate-800/80` |
| **Shadows** | Restrained ambient shadow with zero neon bloom | `shadow-[0_1px_3px_rgba(0,0,0,0.03)]` |
| **Card Padding** | Compact: 16px, Standard: 20px, Hero: 28px | `p-4`, `p-5`, `p-7` |

---

## 5. Component Standards

### A. Navigation & Shell
- **Collapsible Sidebar**: Toggleable between 260px expanded and 72px icon rail.
- **Top Navigation Bar**: Sticky 56px bar with dynamic breadcrumbs, quick upload modal trigger, command palette shortcut (`⌘K`), theme toggle, and tenant identity pill.
- **Command Palette (`⌘K` / `Ctrl+K`)**: Keyboard-driven modal enabling rapid jumping across all 9 modules, facilities, and scenarios.

### B. Analytical KPI Cards
- Compact, information-dense cards with small uppercase metadata label, primary tabular figure, trend direction chip, and contextual explanation.

### C. Data Tables
- Sticky headers, clean zebra/hover highlight (`hover:bg-slate-50/50 dark:hover:bg-slate-800/40`), tabular codes, severity pill badges, and quick-action icon buttons.

### D. 3-Pane AI Agent Console
- **Pane 1 (Left 280px)**: Saved compliance investigations & quick scenario launchers.
- **Pane 2 (Center flex-1)**: Interactive conversation stream with 8-point structured reports.
- **Pane 3 (Right 340px)**: Live inspection drawer displaying tool execution logs, Hindsight memory recall items, and source PDF citations.

---

## 6. Motion & Microinteractions
- **Duration**: 150–250ms with `cubic-bezier(0.16, 1, 0.3, 1)` easing.
- **Interactive States**:
  - Buttons: `active:scale-[0.98] transition-all`
  - Cards: `hover:border-[#D1D3CD] dark:hover:border-slate-700 transition-colors`
  - Tabs: Smooth border-bottom pill transition.
- **Accessibility**: `@media (prefers-reduced-motion: reduce)` disables scale transforms and transitions.
