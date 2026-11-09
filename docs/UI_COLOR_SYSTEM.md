# AUDITMIND — Design Tokens & Color System
## The Verdant Atelier Design Edition

**Design Philosophy**: *"Quiet luxury meets intelligent enterprise technology."*  
**Palette Structure**: Botanical greens, deep obsidian surfaces, warm porcelain backgrounds, electric citron highlights, and restrained earth tones.

---

## 1. Master Palette Definition

### Primary Foundations

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| **Obsidian** | `#101D19` | Structural surfaces, primary sidebar in light mode, deep contrast frames |
| **Deep Forest** | `#173E35` | Secondary dark structural surfaces, ambient gradients, card headers in dark mode |
| **Forest** | `#1D5948` | Primary brand actions, active navigation indicators, key interactive elements |
| **Citron** | `#D9EF71` | High-voltage electric highlight (~2% ratio). Pips, live status indicators, dark-mode badges |
| **Porcelain** | `#F4F3ED` | Primary application canvas (light mode). Warm, organic, non-clinical |

### Supporting Accents

| Token Name | Hex Code | Role & Usage |
|---|---|---|
| **Sage** | `#B6D8C8` | Secondary visual information, soft badge backgrounds, chart series |
| **Slate** | `#65736B` | Secondary text, subtle metadata, muted iconography |
| **Terracotta**| `#C68B68` | Earthy secondary warnings, distinct metric callouts |
| **Mist** | `#DCE2DA` | Subtle surface borders, dividers, subtle architectural grid lines |

### Semantic State Colors

| State | Hex Code | Dark Equivalent | Usage |
|---|---|---|---|
| **Success** | `#2E8061` | `#48B88B` | Verified effective CAPAs, 100% compliance, active health |
| **Warning** | `#B97828` | `#E2A34A` | 90-day observation window, moderate non-conformances |
| **Critical** | `#B74F4B` | `#E77470` | Life safety violations, recurring failure spikes, failed CAPAs |
| **Information**| `#4E78A8`| `#7EA4D1` | Regulatory citations, ISO standards, auditor credentials |

---

## 2. Theme Tokens & CSS Variable Mapping

### Light Theme (Default: Warm Porcelain Atelier)

```css
:root {
  /* Canvas & Surfaces */
  --canvas-bg: #F4F3ED;           /* Porcelain */
  --surface-primary: #FCFCF8;     /* Warm Porcelain White */
  --surface-secondary: #ECEFE8;   /* Subtle Botanical Tint */
  --surface-elevated: #FFFFFF;    /* Crisp Elevated Sheet */

  /* Text & Ink */
  --text-primary: #18241F;        /* Deep Botanical Charcoal (13.5:1 on Porcelain) */
  --text-secondary: #65736B;      /* Slate (4.6:1 on Porcelain) */
  --text-muted: #8E9B93;          /* Soft Foliage Gray */

  /* Structural & Navigation */
  --sidebar-bg: #101D19;          /* Obsidian */
  --sidebar-surface: #172A23;     /* Elevated Deep Forest */
  --sidebar-text: #E3E9E5;        /* Light Mist */
  --sidebar-muted: #84968D;       /* Slate Mist */

  /* Brand & Actions */
  --action-primary: #1D5948;      /* Forest */
  --action-primary-hover: #174638;/* Deep Forest Hover */
  --brand-forest: #1D5948;
  --brand-citron: #D9EF71;        /* Electric Citron Accent */
  --brand-sage: #B6D8C8;
  --brand-terracotta: #C68B68;

  /* Borders & Dividers */
  --border-subtle: #DCE2DA;       /* Mist */
  --border-strong: #C4CCC1;       /* Deep Mist */

  /* Status Tokens */
  --status-success: #2E8061;
  --status-success-bg: #E8F4EE;
  --status-warning: #B97828;
  --status-warning-bg: #F9F1E6;
  --status-critical: #B74F4B;
  --status-critical-bg: #FAEEEE;
  --status-info: #4E78A8;
  --status-info-bg: #EDF2F8;
}
```

### Dark Theme (Deep Obsidian & Forest Atelier)

```css
.dark {
  /* Canvas & Surfaces */
  --canvas-bg: #0D1512;           /* Deep Obsidian Night */
  --surface-primary: #131E19;     /* Layered Obsidian Surface */
  --surface-secondary: #172520;   /* Muted Forest Surface */
  --surface-elevated: #1B2A23;    /* Elevated Forest Sheet */

  /* Text & Ink */
  --text-primary: #F0F2E9;        /* Pale Porcelain (14.1:1 on Obsidian) */
  --text-secondary: #A3B0A7;      /* Muted Sage (7.2:1 on Obsidian) */
  --text-muted: #6C7D73;          /* Dark Slate Mist */

  /* Structural & Navigation */
  --sidebar-bg: #0A120F;          /* True Obsidian Void */
  --sidebar-surface: #101D19;     /* Deep Obsidian */
  --sidebar-text: #F0F2E9;
  --sidebar-muted: #7E9086;

  /* Brand & Actions */
  --action-primary: #8DC9A9;      /* Luminous Botanical Green */
  --action-primary-hover: #A5DCBF;
  --brand-forest: #2A6E5A;
  --brand-citron: #D9EF71;        /* Electric Citron (11.2:1 on Obsidian) */
  --brand-sage: #B6D8C8;
  --brand-terracotta: #D99E7D;

  /* Borders & Dividers */
  --border-subtle: #293A31;       /* Deep Forest Line */
  --border-strong: #3D5548;       /* Medium Forest Line */

  /* Status Tokens */
  --status-success: #48B88B;
  --status-success-bg: rgba(46, 128, 97, 0.16);
  --status-warning: #E2A34A;
  --status-warning-bg: rgba(185, 120, 40, 0.16);
  --status-critical: #E77470;
  --status-critical-bg: rgba(183, 79, 75, 0.16);
  --status-info: #7EA4D1;
  --status-info-bg: rgba(78, 120, 168, 0.16);
}
```

---

## 3. Visual Weight & Hierarchy (The 70/20/8/2 Rule)

The interface follows a deliberate optical weight balance:
- **70% Neutral Background & Spacious Canvas**: Porcelain `#F4F3ED` (light) or Obsidian `#0D1512` (dark) creating generous negative space and calm visual breathing room.
- **20% Structural Surfaces & Typography**: Primary cards `#FCFCF8`, Obsidian sidebar `#101D19`, and Deep Charcoal text `#18241F`.
- **8% Brand Forest & Sage**: Navigation highlights, primary action buttons, table header chips, and primary chart series.
- **2% Electric Citron (`#D9EF71`)**: Rare, highly selective emphasis — active status pips, live Hindsight indicators, and key metric badges.

---

## 4. Contrast & Accessibility Matrix (WCAG AA & AAA)

| Foreground Element | Background Surface | Contrast Ratio | WCAG Compliance | Usage Rules |
|---|---|---|---|---|
| Deep Charcoal (`#18241F`) | Porcelain (`#F4F3ED`) | **13.5:1** | AAA Pass | All primary light mode body text & titles |
| Slate (`#65736B`) | Porcelain (`#F4F3ED`) | **4.6:1** | AA Pass | Secondary metadata, dates, table headers |
| Forest (`#1D5948`) | Porcelain (`#F4F3ED`) | **6.8:1** | AAA Pass | Brand badges, links, primary actions |
| Citron (`#D9EF71`) | Obsidian (`#101D19`) | **11.2:1** | AAA Pass | Pips, dark badges, high-impact tags |
| Pale Porcelain (`#F0F2E9`)| Obsidian (`#0D1512`) | **14.1:1** | AAA Pass | Dark mode primary body text & headings |
| Muted Sage (`#A3B0A7`) | Obsidian (`#0D1512`) | **7.2:1** | AAA Pass | Dark mode secondary text & labels |
| **RESTRICTION** | Citron on Porcelain | *1.3:1 (FAIL)* | **FORBIDDEN** | Never render Citron text on pale surfaces |
