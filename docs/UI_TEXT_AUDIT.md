# AUDITMIND — UI Text & Terminology Audit
**Date**: November 8, 2026  
**Purpose**: Systematic text reduction, grammar correction, and terminology standardization across all routes.

---

## 1. Terminology Standardization Guide

To ensure enterprise consistency across all pages, components, and notifications:

| Standard Term | Deprecated / Disallowed Terms | Rationale |
|---|---|---|
| **AUDITMIND** | AuditMind, Audit Mind, Compliance Agent | Official platform brand name. |
| **Hindsight** | Hindsight Engine, Vector DB, Vector Store | Official memory bank engine name. |
| **Audit** | Inspection ledger, Field assessment, Survey | Clear, universally understood compliance term. |
| **Finding** | Defect, Citation, Non-conformance item, Infraction | Standard OSHA/ISO audit defect entity. |
| **Facility** | Plant, Operating site, Topology node, Facility site | Standard organizational location entity. |
| **Evidence** | Artifact, Attachment file, Proof token | Physical or digital audit verification record. |
| **Corrective action** | CAPA item, Remediation task, Ticket, Fix | Standard preventive and corrective action term. |
| **Verification** | Sign-off, Closing approval, Durability check | Formal 90-day post-implementation review. |
| **Recurring issue** | Chronic defect, Repeat failure, Recurrence pattern | Direct, professional, non-alarmist phrasing. |
| **Organizational memory** | Cognitive memory, Episodic store, Vector memories | Accessible terminology for historical recall. |

---

## 2. Page-by-Page Text Corrections Catalog

### 2.1 Overview Dashboard (`/`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Eyebrow | `Executive Safety Intelligence • Q4 Enterprise Review` | `Compliance overview • Q4 2026` | Brevity | P1 | Planned |
| Subtitle | `Real-time compliance intelligence posture across Meridian Industrial Group's 5 operating facilities.` | `Compliance status across 5 facilities.` | Brevity | P1 | Planned |
| Innovation Badge | `THE CENTRAL INNOVATION: COMPLETED ≠ EFFECTIVE` | `Completed ≠ Effective` | Tone / Case | P1 | Planned |
| Innovation H2 | `A signed-off checklist does not mean a hazard was permanently eliminated.` | `A closed action does not mean a hazard is gone.` | Readability | P1 | Planned |
| Innovation Body | `Standard compliance ERPs treat a closed CAPA ticket as resolved. AUDITMIND couples structured audit records with persistent Hindsight memory banks to enforce a deterministic 90-day observation window: if a non-conformance recurs, the corrective action is automatically classified as FAILED_RECURRED.` | `Standard compliance tools mark actions resolved when closed. AUDITMIND monitors findings over 90 days: if an issue returns, the corrective action is marked FAILED_RECURRED.` | Clarity / Length | P0 | Planned |
| KPI 2 | `Total Audits` | `Audits` | Brevity | P2 | Planned |
| KPI 3 | `Open Findings` | `Open findings` | Consistency | P2 | Planned |
| KPI 4 | `Critical Findings` | `Critical findings` | Consistency | P2 | Planned |
| KPI 5 | `Recurring Failures` | `Recurring issues` | Terminology | P1 | Planned |
| KPI 6 | `Overdue CAPAs` | `Overdue actions` | Terminology | P1 | Planned |
| Chart Title | `Compliance Drift by Violation Category` | `Findings by violation category` | Clarity | P1 | Planned |
| Chart Subtitle | `Comparing total non-conformances vs chronic recurring citations across facilities.` | `Total findings vs recurring issues by category.` | Brevity | P1 | Planned |
| Vulnerability Title | `Site Vulnerability Index` | `Facility risk ranking` | Clarity | P1 | Planned |

---

### 2.2 Facilities (`/facilities`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Header Title | `Operating Facilities & Sites` | `Facilities` | Brevity | P1 | Planned |
| Eyebrow | `Network Topology • Physical Asset Infrastructure` | `Facilities • 5 active sites` | Clarity | P1 | Planned |
| Subtitle | `Physical topologies, operational shifts, aggregate audit cycles, and active site-level non-conformance profiles.` | `Operating facilities, inspection history, and open findings.` | Brevity | P1 | Planned |
| Action Button 1 | `Sync Topology` | `Refresh` | Clarity | P1 | Planned |
| Action Button 2 | `Analyze Site Drift` | `Ask agent` | Simplicity | P1 | Planned |
| Search Input | `Search by name, site code (e.g. DET-01), or city...` | `Search facilities...` | Brevity | P2 | Planned |
| KPI 2 | `Total Monitored Area` | `Total area` | Brevity | P2 | Planned |
| KPI 3 | `Cumulative Audits` | `Total audits` | Consistency | P2 | Planned |
| KPI 4 | `Active Site Drift` | `Sites with recurring issues` | Clarity | P1 | Planned |

---

### 2.3 Audits (`/audits` & `UploadAuditModal.tsx`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Header Title | `Audit Operations & Field Reports` | `Audits` | Brevity | P1 | Planned |
| Eyebrow | `Audit Operations • Historical Field Ledgers` | `Audits • Historical records` | Brevity | P1 | Planned |
| Subtitle | `40 multi-facility operational audits with automated PyMuPDF document intelligence and persistent Hindsight memory ingestion.` | `40 audits conducted across facilities.` | Clarity / Tech Removal | P0 | Planned |
| Action Button 1 | `Sync Ledgers` | `Refresh` | Simplicity | P1 | Planned |
| Action Button 2 | `Upload Audit PDF` | `Upload audit` | Brevity | P1 | Planned |
| Table Header 1 | `AUDIT DETAILS` | `Audit` | Case / Brevity | P2 | Planned |
| Table Header 2 | `FACILITY` | `Facility` | Case / Brevity | P2 | Planned |
| Table Header 3 | `AUDIT TYPE` | `Type` | Case / Brevity | P2 | Planned |
| Table Header 4 | `INSPECTION DATE` | `Date` | Case / Brevity | P2 | Planned |
| Table Header 5 | `LEAD AUDITOR` | `Lead auditor` | Case / Brevity | P2 | Planned |
| Upload Modal | `Upload your organizational audit documentation in PDF format to initiate the document extraction and compliance finding identification process.` | `Upload an audit PDF to extract its findings.` | Plain English | P0 | Planned |

---

### 2.4 Findings (`/findings`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Header Title | `Findings & Non-Conformance Ledger` | `Findings` | Brevity | P1 | Planned |
| Eyebrow | `Compliance Defect Register • Standard Violations` | `Findings • Defect register` | Brevity | P1 | Planned |
| Subtitle | `Historical non-conformances classified by regulatory impact, systemic recurrence patterns, and SHA-256 evidence chain of custody.` | `Audit findings and non-conformances across all facilities.` | Plain English | P1 | Planned |
| Search Input | `Search findings by code, description, regulation ref...` | `Search findings...` | Brevity | P2 | Planned |
| StatCard 1 | `Cataloged Findings` | `Total findings` | Consistency | P2 | Planned |
| StatCard 2 | `Critical Hazard Tier` | `Critical findings` | Terminology | P1 | Planned |
| StatCard 3 | `Recurring Failures` | `Recurring issues` | Terminology | P1 | Planned |
| StatCard 4 | `Open Remediations` | `Open actions` | Terminology | P1 | Planned |

---

### 2.5 Organizational Memory (`/memory`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Header Title | `Organizational Memory Explorer` | `Organizational memory` | Brevity | P1 | Planned |
| Eyebrow | `Cognitive Engine • Hindsight Knowledge Retention` | `Memory • Hindsight knowledge` | Brevity | P1 | Planned |
| Subtitle | `Real-time inspection of persistent compliance memory banks, 6 cognitive mental models, and episodic recall across the enterprise.` | `Historical memory banks, compliance mental models, and cross-facility recall.` | Clarity | P1 | Planned |
| Action Button | `Sync DB to Hindsight` | `Sync memory` | Brevity | P1 | Planned |
| Search Button | `Query Memory Bank` | `Search memory` | Simplicity | P2 | Planned |

---

### 2.6 Recurring Failures (`/recurring`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Header Title | `Recurring Failure Intelligence` | `Recurring issues` | Brevity | P1 | Planned |
| Eyebrow | `Pattern Recognition • Deterministic Observation Windows` | `Patterns • 90-day observation` | Clarity | P1 | Planned |
| Subtitle | `Multi-facility non-conformance clusters, time-to-recurrence distribution, and failed CAPA durability detection.` | `Repeated findings across facilities and time periods.` | Plain English | P1 | Planned |
| Section H2 | `Recurring Non-Conformance Ledger (28)` | `Recurring issues (28)` | Terminology | P1 | Planned |

---

### 2.7 Corrective Actions (`/capa`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Header Title | `Corrective Action Center` | `Corrective actions` | Brevity | P1 | Planned |
| Eyebrow | `Remediation Governance • Mathematical Durability Verification` | `Actions • Durability verification` | Clarity | P1 | Planned |
| Subtitle | `A completed corrective action is not automatically effective. AUDITMIND enforces 90-day post-closure verification against multi-facility recurrence.` | `Track and verify corrective actions over 90 days to prevent recurrence.` | Plain English | P1 | Planned |
| Approval H2 | `HUMAN SIGN-OFF REQUIRED: AGENT REMEDIATION AUTHORIZATIONS (2)` | `Actions awaiting approval (2)` | Tone / Case | P0 | Planned |
| Approval Sub | Alarming warning language | `The compliance agent recommended these corrective actions based on recurring findings.` | Professional Tone | P1 | Planned |

---

### 2.8 Evidence Explorer (`/evidence`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Header Title | `Evidence Vault & Chain of Custody` | `Evidence explorer` | Brevity | P1 | Planned |
| Eyebrow | `Cryptographic Ledger • SHA-256 Chain of Custody` | `Evidence • Verified attachments` | Clarity | P1 | Planned |
| Subtitle | `Tamper-evident audit attachments, digital source references, and SHA-256 cryptographic verification hashes.` | `Audit attachments, field photos, and cryptographic verification.` | Plain English | P1 | Planned |
| File Heading | `reports\00000000-0000-0000-0000-000000000001_AUD-2026-TEST-INGEST-01_Test_Audit_Report.pdf` | `Test_Audit_Report.pdf` | Internal Data Cleanup | P0 | Planned |

---

### 2.9 AI Compliance Agent (`/agent`)

| Location | Original Text | Improved Text | Category | Priority | Status |
|---|---|---|---|---|---|
| Header Title | `AUDITMIND AI Compliance Console` | `Compliance agent` | Brevity | P1 | Planned |
| Eyebrow | `Cognitive Agent Console • Groq LLaMA 3.3 70B & Hindsight v1.2` | `AI Agent • Groq & Hindsight` | Brevity | P1 | Planned |
| Welcome Heading | (Lengthy multi-paragraph technical greeting) | `What would you like to investigate?` | Minimal Design | P0 | Planned |
| Welcome Sub | (Complex statistics and technical descriptions) | `Ask AUDITMIND about audits, recurring issues, and corrective actions.` | Clarity | P0 | Planned |
| Prompt 1 | `Scenario A: Recurring Fire Egress Drift...` | `Find recurring issues` | Actionable | P0 | Planned |
| Prompt 2 | `Scenario B: Ineffective Completed CAPA...` | `Review overdue actions` | Actionable | P0 | Planned |
| Prompt 3 | `Scenario C: Forklift Training Drift...` | `Compare facilities` | Actionable | P0 | Planned |
| Prompt 4 | `Scenario D: Durable Chemical Berm Fix...` | `Explain an audit finding` | Actionable | P0 | Planned |
| Input Bar | Generic single-line input | Expanding multi-line composer with keyboard hints | Usability | P0 | Planned |
