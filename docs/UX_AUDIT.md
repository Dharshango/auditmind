# AUDITMIND — Comprehensive UX & Content Audit
**Date**: November 8, 2026  
**Auditor**: Principal UX Designer & Frontend Architect  
**Scope**: All 9 primary application routes, modals, dialogs, forms, empty/loading states, mobile viewports, and AI agent interface.  
**Classification**: 
- **P0**: Broken, misleading, or seriously confusing.
- **P1**: Important usability, wordiness, or clarity problem.
- **P2**: Minor wording, spacing, or visual refinement.

---

## 1. Global Shell & Navigation System

| Issue ID | Component | Description | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-NAV-01` | `TopNav.tsx` | Breadcrumb category `"Workspace"` and `"Intelligence"` is redundant with sidebar grouping and clutters the header. | P2 | Simplify breadcrumb to display only the active page title and clean status indicator. |
| `UX-NAV-02` | `TopNav.tsx` | Tenant switcher dropdown contains technical database string `"Bank: auditmind-org-meridian-01"` visible to ordinary business users. | P1 | Replace raw internal bank ID with user-friendly label `"Memory Bank: Meridian Active"`. |
| `UX-NAV-03` | `Navigation.tsx` | Group headers (`WORKSPACE`, `INTELLIGENCE`, `OPERATIONS`, `COGNITIVE AI`) are all-caps and occupy too much vertical height. | P2 | Tone down uppercase styling to clean sentence/title case with subtle font-mono micro-labeling. |

---

## 2. Screen-by-Screen Audit

### 2.1 Overview Dashboard (`/`)
| Issue ID | Component / Element | Current Text / State | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-DASH-01` | Page Title Eyebrow | `"Executive Safety Intelligence • Q4 Enterprise Review"` | P1 | Simplify to `"Compliance overview • Q4 2026"`. |
| `UX-DASH-02` | Subtitle | `"Real-time compliance intelligence posture across Meridian Industrial Group's 5 operating facilities."` (13 words) | P1 | Simplify to `"Compliance status across 5 facilities."` |
| `UX-DASH-03` | Central Innovation Banner | Heading: `"A signed-off checklist does not mean a hazard was permanently eliminated."` (11 words) | P1 | Shorten to `"A closed action does not mean a hazard is gone."` |
| `UX-DASH-04` | Central Innovation Body | 29-word run-on sentence with technical jargon: `"AUDITMIND couples structured audit records with persistent Hindsight memory banks to enforce a deterministic 90-day observation window..."` | P0 | Simplify to: `"Standard compliance tools mark actions resolved when closed. AUDITMIND monitors findings over 90 days: if an issue returns, it is marked FAILED_RECURRED."` |
| `UX-DASH-05` | KPI StatCard Labels | `"Recurring Failures Detected"`, `"Overdue Corrective Actions"` | P1 | Simplify to concise labels: `"Recurring issues"` and `"Overdue actions"`. |
| `UX-DASH-06` | Chart Subtitle | `"Comparing total non-conformances vs chronic recurring citations across facilities."` | P1 | Shorten to `"Total findings vs recurring issues by category."` |

---

### 2.2 Facility Network (`/facilities`)
| Issue ID | Component / Element | Current Text / State | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-FAC-01` | Page Title | `"Operating Facilities & Sites"` | P1 | Simplify to `"Facilities"`. |
| `UX-FAC-02` | Subtitle | `"Physical topologies, operational shifts, aggregate audit cycles, and active site-level non-conformance profiles."` (12 words) | P1 | Shorten to `"Operating facilities, inspection history, and open findings."` |
| `UX-FAC-03` | Action Buttons | `"Sync Topology"` and `"Analyze Site Drift"` | P1 | Replace with direct business actions: `"Refresh"` and `"Ask agent"`. |
| `UX-FAC-04` | Search Placeholder | `"Search by name, site code (e.g. DET-01), or city..."` | P2 | Shorten to `"Search facilities..."` |
| `UX-FAC-05` | StatCard Labels | `"Total Monitored Area"`, `"Active Site Drift"` | P1 | Simplify to `"Total area"` and `"Sites with recurring issues"`. |

---

### 2.3 Audit Management & PDF Ingestion (`/audits`)
| Issue ID | Component / Element | Current Text / State | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-AUD-01` | Page Title | `"Audit Operations & Field Reports"` | P1 | Simplify to `"Audits"`. |
| `UX-AUD-02` | Subtitle | `"40 multi-facility operational audits with automated PyMuPDF document intelligence and persistent Hindsight memory ingestion."` (14 words, exposes PyMuPDF library) | P0 | Remove internal library name (`PyMuPDF`). Simplify to `"40 audits conducted across facilities."` |
| `UX-AUD-03` | Action Buttons | `"Sync Ledgers"` and `"Upload Audit PDF"` | P1 | Shorten to `"Refresh"` and `"Upload audit"`. |
| `UX-AUD-04` | Table Headers | High-density all-caps headers (`AUDIT DETAILS`, `FACILITY`, `AUDIT TYPE`, `INSPECTION DATE`) | P2 | Standardize to concise sentence-case: `Audit`, `Facility`, `Type`, `Date`, `Score`, `Findings`, `Actions`. |
| `UX-AUD-05` | Upload Modal | Lengthy instructions explaining internal OCR pipeline. | P1 | Replace with clear, actionable text: `"Upload an audit PDF to extract its findings."` |

---

### 2.4 Findings & Non-Conformance Ledger (`/findings`)
| Issue ID | Component / Element | Current Text / State | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-FIND-01` | Page Title | `"Findings & Non-Conformance Ledger"` | P1 | Simplify to `"Findings"`. |
| `UX-FIND-02` | Subtitle | `"Historical non-conformances classified by regulatory impact, systemic recurrence patterns, and SHA-256 evidence chain of custody."` | P1 | Simplify to `"Audit findings and non-conformances across all facilities."` |
| `UX-FIND-03` | StatCard Labels | `"Critical Hazard Tier"`, `"Recurring Failures"`, `"Open Remediations"` | P1 | Standardize to clean terminology: `"Critical findings"`, `"Recurring issues"`, `"Open actions"`. |
| `UX-FIND-04` | Search Placeholder | `"Search findings by code, description, regulation ref..."` | P2 | Simplify to `"Search findings..."` |
| `UX-FIND-05` | Detail Modal | Raw technical dates without human-friendly relative formatting. | P2 | Format dates cleanly with ISO and relative stamps (e.g., `"Mar 15, 2026 (4 mos ago)"`). |

---

### 2.5 Organizational Memory Explorer (`/memory`)
| Issue ID | Component / Element | Current Text / State | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-MEM-01` | Page Title | `"Organizational Memory Explorer"` | P1 | Simplify to `"Organizational memory"`. |
| `UX-MEM-02` | Subtitle | `"Real-time inspection of persistent compliance memory banks, 6 cognitive mental models, and episodic recall across the enterprise."` | P1 | Simplify to `"Historical memory banks, compliance mental models, and cross-facility recall."` |
| `UX-MEM-03` | Action Button | `"Sync DB to Hindsight"` | P1 | Simplify to `"Sync memory"`. |
| `UX-MEM-04` | Mental Model Cards | Jargon-heavy descriptions ("Holistic multi-site culture, aggregate compliance trajectory..."). | P1 | Simplify descriptions to direct operational benefits. |
| `UX-MEM-05` | Search Form | Search button says `"Query Memory Bank"`. | P2 | Simplify to `"Search memory"`. |

---

### 2.6 Recurring Failure Intelligence (`/recurring`)
| Issue ID | Component / Element | Current Text / State | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-REC-01` | Page Title | `"Recurring Failure Intelligence"` | P1 | Simplify to `"Recurring issues"`. |
| `UX-REC-02` | Subtitle | `"Multi-facility non-conformance clusters, time-to-recurrence distribution, and failed CAPA durability detection."` | P1 | Simplify to `"Repeated findings across facilities and time periods."` |
| `UX-REC-03` | Section Header | `"Recurring Non-Conformance Ledger (28)"` | P1 | Simplify to `"Recurring issues (28)"`. |
| `UX-REC-04` | Terminology | Inconsistent switching between "failures", "defects", "violations", and "citations". | P1 | Standardize on `"recurring issues"` and `"findings"`. |

---

### 2.7 Corrective Action Center (`/capa`)
| Issue ID | Component / Element | Current Text / State | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-CAPA-01` | Page Title | `"Corrective Action Center"` | P1 | Simplify to `"Corrective actions"`. |
| `UX-CAPA-02` | Subtitle | Multi-sentence explanation of durability. | P1 | Simplify to `"Track and verify corrective actions over 90 days to prevent recurrence."` |
| `UX-CAPA-03` | Approval Header | All-caps alarming label: `"HUMAN SIGN-OFF REQUIRED: AGENT REMEDIATION AUTHORIZATIONS (2)"` | P0 | Simplify to professional executive wording: `"Actions awaiting approval (2)"`. |
| `UX-CAPA-04` | Durability Status | Conflation between `COMPLETED` and `EFFECTIVE`. | P0 | Clearly badge: `COMPLETED` ("Pending 90-day review"), `EFFECTIVE` ("Verified durable"), `FAILED_RECURRED` ("Recurrence detected"). |

---

### 2.8 Evidence Vault (`/evidence`)
| Issue ID | Component / Element | Current Text / State | Priority | Recommended Action |
|---|---|---|---|---|
| `UX-EVID-01` | Page Title | `"Evidence Vault & Chain of Custody"` | P1 | Simplify to `"Evidence explorer"`. |
| `UX-EVID-02` | Subtitle | Lengthy cryptographic description. | P1 | Simplify to `"Audit attachments, field photos, and cryptographic verification."` |
| `UX-EVID-03` | File Name Display | Ingested PDF shows raw internal path: `reports\00000000-0000-0000-0000-000000000001_AUD-2026-TEST-INGEST-01_Test_Audit_Report.pdf` | P0 | Strip internal UUID and folder prefix in primary heading to display clean clean file name: `Test_Audit_Report.pdf`. Show full path only in secondary technical path field. |
| `UX-EVID-04` | Action Button | `"Sync Vault"` | P2 | Simplify to `"Refresh"`. |

---

### 2.9 AI Compliance Agent (`/agent`) — Critical Experience Overhaul
| Issue ID | Component / Element | Current Problem | Priority | Required Solution |
|---|---|---|---|---|
| `UX-AGT-01` | Overall Architecture | Overcrowded 3-column static grid with technical boxes permanently occupying 50% of the screen. | P0 | Implement standard premium AI interface: Left collapsible conversation history; Center spacious chat workspace; Right collapsible context & evidence drawer. |
| `UX-AGT-02` | Welcome Screen | Heavy greeting paragraph packed with technical statistics ("120 finding ledgers, 40 historical audits..."). | P1 | Minimal, welcoming prompt: `"What would you like to investigate?"` with 4 actionable suggestion cards. |
| `UX-AGT-03` | Conversation History | Missing conversation persistence, search, date groupings, rename, and delete actions. | P0 | Add real conversation session management: "New chat", recent sessions grouped by date (Today, Yesterday, Previous), rename, and delete confirmation. |
| `UX-AGT-04` | Message Bubbles | Heavy bordered boxes with rigid 8-point templates forced onto every single response. | P0 | Create scannable messages with natural typography: clear Summary, Findings, Historical context, Evidence citations, and Recommended next action. |
| `UX-AGT-05` | Input Composer | Single-line generic text input that does not expand or support multi-line `Shift+Enter`. | P0 | Premium auto-expanding multi-line composer with clear send action, keyboard hints, loading states, and disabled-state prevention. |
| `UX-AGT-06` | Context & Evidence | Tool calls and evidence are dumped inline as raw monospace badges. | P1 | Move evidence, parent audits, and active tool traces into a collapsible right-side drawer or elegant expandable cards. |
| `UX-AGT-07` | Citations & Sources | Citations to audits or findings are plain text without interactive click-through. | P0 | Interactive citation chips linking directly to finding/audit/evidence pages. |
| `UX-AGT-08` | Mobile Usability | 3-column desktop layout breaks on mobile with overlapping panels. | P0 | Full-screen mobile chat with sliding drawers for history and context. |

---

## 3. Summary of Issue Counts

- **P0 Issues**: 6 (Critical usability, raw internal data exposure, lack of conversation session management, broken mobile agent layout).
- **P1 Issues**: 18 (Wordy titles, verbose subtitles, all-caps alarming warnings, inconsistent terminology, static layout overcrowding).
- **P2 Issues**: 9 (Search placeholder brevity, button label simplification, date formatting).
- **Total Issues Identified**: 33

All issues are targeted for complete remediation in Phases 1 through 5.
