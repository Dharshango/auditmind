# AUDITMIND — AI COMPLIANCE AGENT INTERFACE REPORT (PHASE 4)
**Date**: 2026-11-09  
**Version**: 4.0.0 (Enterprise Premium UI Architecture)  
**Standard**: Industrial Command Center / High-Contrast Dark Architecture  
**Status**: VERIFIED & DEPLOYED  

---

## 1. THREE-AREA WORKSPACE LAYOUT

AUDITMIND transforms the AI compliance interaction into an integrated, industrial-grade intelligence workspace:

```
┌───────────────────────────┬───────────────────────────────────────────┬───────────────────────────┐
│ AREA 1: LEFT RAIL         │ AREA 2: CENTER CONVERSATION               │ AREA 3: RIGHT PANEL       │
│ Conversation History      │ Main Inquest Workspace                    │ Evidence & Context        │
│ (260px - 280px)           │ (Flex-1, max-w-4xl, primary focus)        │ (320px - 360px)           │
├───────────────────────────┼───────────────────────────────────────────┼───────────────────────────┤
│ • "New inquiry" button    │ • Clean message cards                     │ • Closed by default       │
│ • Search conversations    │ • High-contrast pure white text           │ • Current facility card   │
│ • Pinned & chronological  │ • Sectional modular cards:                │ • Related audits          │
│ • Inline rename & check   │   - WHAT WE FOUND                         │ • Historical findings     │
│ • Inline delete with      │   - HISTORICAL PATTERN                    │ • Hindsight memory nodes  │
│   confirmation prompt     │   - POSSIBLE EXPLANATION                  │ • Evidence attachments    │
│ • Active indicator ring   │   - RECOMMENDED NEXT ACTION               │ • Clickable citations     │
│ • Compact clean items     │   - EVIDENTIARY GROUNDING                 │ • Live backend data       │
│                           │ • Compact action toolbar                  │                           │
│                           │ • Auto-expanding composer console         │                           │
│                           │ • Stop generation button                  │                           │
└───────────────────────────┴───────────────────────────────────────────┴───────────────────────────┘
```

---

## 2. MINIMALIST WELCOME SCREEN

Adhering strictly to user specifications:
- **Heading**: `"What would you like to investigate?"`
- **Description**: `"Ask about audits, findings and recurring issues."`
- **Four Purpose-Built Suggested Queries**:
  1. **Find recurring issues.** -> Directly queries multi-site failure recurrence clusters under OSHA 1910.37 (fire safety egress) and OSHA 1910.212 (machine guarding).
  2. **Review overdue actions.** -> Audits pending CAPA milestones, unverified closures, and overdue 90-day verification gates (`CAPA-2026-001`, `CAPA-2026-003`).
  3. **Compare facilities.** -> Synthesizes weighted risk scores and compliance drift across all 5 operating facilities.
  4. **Explain an audit finding.** -> Forensically breaks down critical finding `FIND-2026-003` (stamping press interlock switch bypass) with photographic proof and root-cause analysis.

---

## 3. CONVERSATION HISTORY & SESSION LIFECYCLE

- **Storage**: Persistent multi-session management stored under client key `auditmind_agent_sessions_v3`.
- **Search**: Real-time filtering across conversation titles.
- **Organization**: Temporal grouping (Pinned, Today, Yesterday, Previous 7 Days, Older).
- **Inline Rename**: Click edit icon, modify title, press checkmark or Enter.
- **Safe Deletion**: Two-step confirmation barrier (`"Delete this chat?"` -> `[Delete]` / `[Cancel]`).
- **Active Indicator**: Visual highlighted state with `ring-1 ring-white/20 border-white/40 bg-white/[0.08]`.

---

## 4. MESSAGE COMPOSER & INTERACTION CONTROLS

- **Placeholder**: `"Ask about audits, findings or recurring issues..."`
- **Auto-Expanding Textarea**: Min height 44px, expands smoothly up to 180px with content.
- **Keyboard Shortcuts**:
  - `Enter`: Instant message dispatch.
  - `Shift + Enter`: Multi-line expansion.
- **Empty-Input Prevention**: Send button disabled when input contains only whitespace.
- **Generation Cancellation**: Prominent `[■ Stop]` button rendered during live inference, enabling instant execution abort.
- **Attachment Support**: Integrated paperclip trigger supporting `.pdf`, `.jpg`, `.jpeg`, `.png`, and `.csv`.

---

## 5. REAL AGENT ACTIVITY STREAM

During query execution, AUDITMIND displays deterministic progress states matching actual tool invocations:
1. `Understanding your request.`
2. `Searching audit records.`
3. `Checking historical memory.`
4. `Reviewing corrective actions.`
5. `Verifying evidence.`
6. `Preparing response.`

No fabricated hidden reasoning or chain-of-thought traces are exposed to users.

---

## 6. EVIDENCE & CONTEXT INSPECTOR PANEL

- **Default State**: Closed by default when empty or unprompted; opens smoothly when citations are clicked or upon user toggle.
- **Information Architecture**:
  - **Active Facility**: Displays code (`FAC-001`), full facility name, operational type, and location.
  - **Related Audits**: Lists all referenced audits (`AUD-2026-001`, `AUD-2026-021`) with direct inspection links.
  - **Historical Findings**: Lists referenced non-conformances (`FIND-2026-003`, `FIND-2026-039`) with regulatory standard tags.
  - **Memory References**: Surfacing Hindsight episodic nodes (`MEM-2026-003`, `MEM-2026-008`).
  - **Evidence Documents**: Direct links to photographic attachments (`EVID-FIND-2026-003-photo-01.jpg`) and PDF audit reports.
  - **Real Backend Grounding**: Populated directly via `/api/v1/facilities`, `/api/v1/audits`, `/api/v1/findings`.

---

## 7. RESPONSE ACTIONS & FOLLOW-UP INTELLIGENCE

Every assistant message provides a compact utility toolbar:
- **Copy**: One-click clipboard copy with green confirmation pill.
- **Regenerate**: Re-runs the previous user inquiry through the compliance engine.
- **Feedback**: Positive / Negative evaluation buttons (`ThumbsUp` / `ThumbsDown`).
- **View Evidence**: Direct toggle to focus the right-hand evidence drawer.
- **Related Audits**: Fast shortcut to `/audits`.
- **Create Action**: Fast shortcut to `/capa` to propose human-approved engineering controls.
- **Dynamic Follow-Ups**: Context-aware queries generated based on cited regulations (e.g. *"Show related audits"*, *"Compare facilities"*, *"Was the previous action effective?"*).

---

## 8. BROWSER VERIFICATION & SCREENSHOT EVIDENCE

- **Welcome Screen**: `docs/screenshots/agent_welcome_benchmarks.png`
- **Modular Investigation**: `docs/screenshots/agent_benchmark_2_modular_response.png`
- **CAPA Durability Banner**: `docs/screenshots/agent_benchmark_3_durability_response.png`
- **Factual Direct Count**: `docs/screenshots/agent_benchmark_1_factual_response.png`
