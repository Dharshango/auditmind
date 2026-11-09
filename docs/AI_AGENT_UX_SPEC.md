# AUDITMIND AI Compliance Agent — UX & Architecture Specification

## 1. Executive Overview

The **AUDITMIND AI Compliance Agent** (`/agent`) serves as the cognitive intelligence hub of the AUDITMIND platform. Rather than functioning as a generic chat interface, it provides safety directors, auditors, and executive plant managers with an enterprise-grade compliance workbench.

The agent orchestrates three primary computational systems:
1. **Deterministic PostgreSQL Auditing Ledgers**: Facility records, historical audit scores, finding chronologies, and 90-day CAPA durability verifications.
2. **Hindsight Organizational Memory Engine**: Semantic recall and reflection across multi-facility operations, linking findings from different years and plants through cross-tenant knowledge banks.
3. **Groq LLaMA 3.3 70B Reasoning**: High-velocity natural language processing with structured 8-point compliance reporting.

---

## 2. 3-Area Workspace Architecture

```
+--------------------------------------------------------------------------------------------------------------------+
| TOP APPLICATION HEADER (Verdant Atelier Navigation, Status Indicators, System Health)                             |
+--------------------------------------------------------------------------------------------------------------------+
| LEFT RAIL (History)            | CENTER WORKSPACE (Conversation & Inquest)           | RIGHT INSPECTOR (Context)   |
| Width: 280px (Collapsible)     | Flex: 1 (Primary focus area)                        | Width: 320px (Collapsible)  |
|                                |                                                     |                             |
| + New Inquest (Primary CTA)    | + Conversation Header & Session Title               | + Active Context Snapshot   |
| + Search Past Sessions         | + Hindsight Active Memory Badge                     |   - Facilities Referenced   |
| + Pinned Inquests              | + Actionable Benchmark Scenario Chips (Empty State) |   - Audits In Scope         |
| + Date Groupings:              | + Message Stream:                                   |   - Hindsight Memories      |
|   - Today                      |   - User Inquest (Obsidian bubble)                  |   - Linked Evidence Vault   |
|   - Yesterday                  |   - Agent Response (Porcelain / Forest accent)      | + Live Telemetry:           |
|   - Previous 7 Days            |   - Collapsible Tool Execution Trace                |   - Inference Model         |
|   - Older                      |   - Structured 8-Point Compliance Synthesis         |   - Hindsight Bank Status   |
| + Rename / Delete / Pin        |   - Clickable Evidence & Audit Citations            |   - Durability Engine       |
|                                |   - Response Action Bar (Copy, CAPA, Feedback)      | + Agent Event Ledger        |
|                                | + Expanding Multi-Line Composer with Context Chips  |                             |
+--------------------------------------------------------------------------------------------------------------------+
```

### Area 1: Left Rail — Conversation History & Session Management
- **Primary CTA**: Prominent "New Inquest" button with keyboard shortcut (`Ctrl+K` / `Cmd+K` or clean button).
- **Search Bar**: Real-time filtering across conversation titles and previous queries.
- **Categorized Timeline**: Grouped into `Today`, `Yesterday`, `Previous 7 Days`, and `Older`.
- **Session Actions**:
  - Active session indicator with Forest/Citron badge.
  - Inline rename capability with single-click confirmation.
  - Delete with safety confirmation popover to prevent accidental loss.
  - Pinning for persistent reference during multi-day audits.
- **Persistence**: All sessions, messages, and titles persist locally in `localStorage` (`auditmind_agent_sessions_v1`), retaining complete conversational context and structured reports without requiring backend session schema alterations.

### Area 2: Center Workspace — Inquest Conversation & Analysis
- **Welcome / Empty State**:
  - Clean, minimalist aesthetic with the AUDITMIND brand mark.
  - Clear value proposition: *"Autonomous multi-facility compliance intelligence backed by Hindsight organizational memory and 90-day verification engines."*
  - 4 one-click actionable benchmark scenarios:
    1. **Scenario A (Fire Egress)**: *"Investigate recurring fire-safety and emergency egress documentation failures across multiple facilities over the last 12 months."*
    2. **Scenario B (CAPA Ineffectiveness)**: *"Analyze Plant A machine guarding: Why did the corrective action get marked completed, but the failure returned in subsequent audits?"*
    3. **Scenario C (Forklift Training)**: *"Examine employee forklift certification records across Warehouse A and Warehouse B for systemic compliance drift."*
    4. **Scenario D (Chemical Containment)**: *"Verify whether the secondary containment berm reconstruction in Plant B proved genuinely effective or experienced recurrences."*
- **Message Rendering**:
  - **User Messages**: Obsidian background (`#101D19`), crisp porcelain text, subtle Citron accent indicator, timestamp.
  - **Agent Messages**: Warm porcelain surface (`#F4F3ED` light / `#173E35` dark), structured typography with Garamond headings and Plex Mono metadata tags.
  - **Executive Summary Header**: 2-line scannable executive digest at the top of every analysis.
  - **Tool Execution Trace**: Collapsible accordion showing actual tools called (`search_audits`, `recall_organizational_memory`, `verify_corrective_action`), parameters passed, execution duration, and status indicators.
  - **Structured 8-Point Compliance Synthesis**:
    - Finding Identification & Category
    - Historical Context & Earliest Recorded Defect
    - Cross-Facility Prevalence
    - 90-Day Durability Verification
    - Recurring Pattern Diagnostic
    - Root Cause Analysis
    - Cryptographic Evidence Citations
    - Recommended Corrective Action
  - **Clickable Citations**: Pill buttons that route directly to `/findings`, `/audits`, and `/evidence` with search filters pre-populated.
  - **Response Action Toolbar**:
    - Copy formatted response to clipboard with confirmation icon.
    - Quick "Create CAPA" routing button.
    - "Inspect Evidence" quick link.
    - Thumbs up / thumbs down sentiment feedback.
- **Composer Controls**:
  - Expanding multi-line textarea with auto-height adjustment.
  - Keyboard handling: `Enter` sends inquiry, `Shift+Enter` inserts new line.
  - **Context Selector Chips**: Optional filters for Facility (`All`, `FAC-01`, `FAC-02`, etc.), Audit Type, and Scope (`Quick Summary` vs `Deep Inquest`).
  - Loading animation with active status steps (`"Consulting Hindsight memory bank..."`, `"Verifying CAPA durability..."`).

### Area 3: Right Rail — Context & Evidence Inspector
- **Drawer State**: Collapsible; closed by default on desktop to maximize reading canvas, openable via header toggle.
- **Active Context Snapshot**:
  - Facilities actively referenced in the current turn.
  - Audits cited with audit dates and scores.
  - Hindsight memory bank entries recalled.
  - Cryptographic evidence hashes and thumbnail references.
- **Live Telemetry**:
  - Model: Groq LLaMA 3.3 70B (Versatile).
  - Memory: Hindsight v1.2 with cosine similarity.
  - Tenant Bank: `meridian-bank`.
  - Durability Engine: 90-Day Deterministic Verification.
- **Agent Event Ledger**: Live streaming feed of agent tool execution events fetched from `/api/agent/events`.

---

## 3. Visual Identity & Contrast Guidelines

1. **Theme Compliance**:
   - Primary Surface: Canvas `#F4F3ED` (Light) / `#101D19` (Dark).
   - Card / Bubble Surfaces: `#FFFFFF` / `#173E35`.
   - Primary Accents: Deep Forest `#173E35`, Electric Citron `#D9EF71`, Terracotta `#C68B68`.
2. **Strict Contrast Compliance**:
   - Citron (`#D9EF71`) is **never** used for text on pale porcelain surfaces. It is exclusively used for accent dots, borders, or on dark Obsidian surfaces where contrast exceeds 10:1.
   - Text on dark surfaces is strictly white/porcelain `#F4F3ED`.
   - Text on light surfaces is strictly ink-primary `#101D19` or ink-secondary `#3A4D46`.
3. **Responsive Presentation**:
   - Desktop (≥1280px): 3-column layout (Rail, Chat, Inspector).
   - Tablet (768px - 1279px): Chat full width; History and Inspector accessible via slide-over drawers.
   - Mobile (<768px): Full-screen conversation workspace with slide-in drawers and floating trigger controls.

---

## 4. Interaction Specification

| Trigger | Component | Expected Outcome |
| :--- | :--- | :--- |
| Click "New Inquest" | Left Rail CTA | Creates fresh conversation session, sets focus to composer, displays benchmark scenario cards. |
| Click Benchmark Card | Center Welcome | Injects benchmark prompt into input, triggers agent execution, creates titled session. |
| Type query + `Enter` | Composer | Submits query, appends user bubble, displays reasoning spinner, streams/awaits backend response. |
| Type query + `Shift+Enter` | Composer | Appends newline in textarea without submitting. |
| Click "Toggle Inspector" | Header / Button | Slides open or closes the Right Context & Evidence inspector. |
| Click Citation Pill | Response Bubble | Navigates to `/findings?search=<code>` or `/evidence?search=<code>`. |
| Click Tool Accordion | Response Bubble | Toggles visibility of tools executed, inputs, and outputs. |
| Click "Copy" | Action Bar | Copies text to clipboard, shows 2-second checkmark confirmation. |
| Click "Thumbs Up/Down" | Action Bar | Saves user feedback state to the message. |
| Click Session Trash | History Item | Opens confirmation popover; removes session on approval. |
