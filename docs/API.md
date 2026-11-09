# AUDITMIND — REST API Specification & Integration Contract

**Service**: AUDITMIND Operational Compliance Intelligence  
**Version**: 1.0.0  
**Protocols**: HTTP/1.1, JSON, Multipart/form-data  
**Dual Route Aliases**: Both `/api/...` and `/api/v1/...` paths are active and equivalent.

---

## 1. Authentication & Multi-Tenant Authorization

Every API request operates under strict multi-tenant data isolation:

| Header Name | Type | Description | Default / Example |
|---|---|---|---|
| `X-Organization-Id` | UUID (string) | Tenant Organization identifier. Queries and writes are scoped strictly to this tenant. | `00000000-0000-0000-0000-000000000001` (Meridian Industrial Group) |
| `Authorization` | Bearer token | Optional authentication token or API key. In production, verified against cryptographic secret. | `Bearer auditmind-prod-key` |

### Security Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Entity created successfully.
- `400 Bad Request`: Invalid file format, malformed input, or validation failure.
- `401 Unauthorized`: Missing or invalid bearer credentials when authentication is enforced.
- `403 Forbidden`: `X-Organization-Id` not found in database or inactive. Prevents tenant escalation.
- `404 Not Found`: Target entity not found in the authenticated organization.
- `422 Unprocessable Entity`: Pydantic request schema validation failed.

---

## 2. System Health & Infrastructure Diagnostics

### `GET /health`
Returns top-level application and configuration health.
```json
{
  "status": "healthy",
  "service": "AUDITMIND Operational Compliance Intelligence",
  "version": "1.0.0",
  "environment": "development",
  "database": "sqlite+aiosqlite",
  "hindsight_configured": true,
  "groq_configured": true
}
```

### `GET /api/health/database`
Pings database connection, verifies active transaction lifecycle, and reports table entity counts.
```json
{
  "status": "healthy",
  "database_type": "sqlite",
  "connected": true,
  "latency_ms": 1.45,
  "organization_count": 2,
  "facility_count": 5,
  "audit_count": 40,
  "finding_count": 120
}
```

### `GET /api/health/hindsight`
Reports Hindsight Memory Engine SDK status, active memory bank ID, and ledger state.
```json
{
  "status": "healthy",
  "service": "Hindsight Compliance Memory Engine",
  "bank_id": "auditmind_org_00000000_0000_0000_0000_000000000001",
  "base_url": "http://localhost:8000",
  "cloud_connected": false,
  "fallback_store_active": true,
  "retained_memories_count": 260
}
```

### `GET /api/health/llm`
Verifies Groq function calling configuration and active model status.
```json
{
  "status": "healthy",
  "provider": "Groq",
  "model": "llama-3.3-70b-versatile",
  "configured": true,
  "fallback_available": true,
  "latency_ms": 12.5
}
```

---

## 3. Executive Dashboard & Analytics

### `GET /api/dashboard` (or `GET /api/dashboard/overview`)
Aggregates enterprise compliance metrics, recurrence rates, and facility risk rankings.
```json
{
  "organization_id": "00000000-0000-0000-0000-000000000001",
  "total_audits": 40,
  "avg_compliance_score": 84.7,
  "total_findings": 120,
  "open_findings": 38,
  "recurring_findings": 47,
  "recurrence_rate_percent": 39.2,
  "total_capas": 76,
  "completed_capas": 75,
  "effective_capas": 25,
  "failed_recurred_capas": 42,
  "effectiveness_rate_percent": 33.3,
  "facilities_ranking": [
    {
      "facility_code": "FAC-001",
      "name": "Apex Manufacturing Plant A",
      "facility_type": "Manufacturing",
      "findings_count": 28,
      "critical_count": 6,
      "recurring_count": 12,
      "risk_score": 56.0
    }
  ]
}
```

### `GET /api/analytics/recurrence`
Computes multi-site recurrence intelligence across observation windows and non-conformance categories.
```json
{
  "organization_id": "00000000-0000-0000-0000-000000000001",
  "total_findings": 120,
  "recurring_findings_count": 47,
  "overall_recurrence_rate_percent": 39.2,
  "categories_with_recurrence": 4,
  "recurrence_clusters": [
    {
      "category": "Fire Safety",
      "facilities_affected": ["FAC-001", "FAC-002", "FAC-003", "FAC-004", "FAC-005"],
      "recurring_findings_count": 19,
      "sample_titles": [
        "[FS-EGRESS] Emergency exit route obstructed by staging pallets",
        "[FS-EXTINGUISH] Fire extinguisher annual inspection tag expired"
      ],
      "time_window_days": 90
    }
  ],
  "facility_breakdowns": [
    {
      "facility_code": "FAC-001",
      "name": "Apex Manufacturing Plant A",
      "total_findings": 28,
      "recurring_findings": 12,
      "recurrence_rate_percent": 42.9
    }
  ],
  "recurrence_intervals": {
    "within_30_days": 6,
    "between_31_60_days": 12,
    "between_61_90_days": 18,
    "between_91_180_days": 8,
    "over_180_days": 3
  }
}
```

---

## 4. Facilities

### `GET /api/facilities`
Lists all physical sites operating within the authenticated tenant.
```json
{
  "facilities": [
    {
      "id": "fac-uuid-001",
      "facility_code": "FAC-001",
      "name": "Apex Manufacturing Plant A",
      "facility_type": "Manufacturing",
      "location": "Dallas, TX",
      "metadata": {"square_feet": 240000, "shifts": 3},
      "audit_count": 10
    }
  ]
}
```

---

## 5. Audits & Document Ingestion

### `GET /api/audits`
Query parameters:
- `facility_code` (string): Filter by site (e.g. `FAC-001`).
- `audit_type` (string): Filter by category (e.g. `Safety`, `Quality`).
- `limit` (int, default: 50, max: 100): Items per page.
- `offset` (int, default: 0): Pagination offset.

```json
{
  "total": 40,
  "audits": [
    {
      "id": "audit-uuid",
      "audit_number": "AUD-2026-001",
      "title": "Comprehensive Safety and EHS Inspection",
      "facility_code": "FAC-001",
      "facility_name": "Apex Manufacturing Plant A",
      "audit_type": "Safety & EHS",
      "auditor_name": "Sarah Jenkins, CSP",
      "audit_date": "2026-01-14",
      "status": "COMPLETED",
      "compliance_score": 86.5
    }
  ]
}
```

### `POST /api/audits/upload`
Multipart file upload (`file: UploadFile`).
- **Validation**: Rejects non-PDFs and files exceeding 25 MB with 400 Bad Request.
- **Processing**: Digital PDF text extraction via PyMuPDF (`fitz`), scanned page detection, OCR fallback, structured finding parsing, database commit, and async Hindsight retention.
```json
{
  "status": "ingested",
  "audit_number": "AUD-2026-041",
  "findings_extracted": 3,
  "scanned_pages": [],
  "ocr_applied": false,
  "memory_retained": true
}
```

---

## 6. Findings & Evidence Chain of Custody

### `GET /api/findings`
Query parameters:
- `severity` (`CRITICAL`, `MAJOR`, `MINOR`, `OBSERVATION`).
- `category` (string, case-insensitive substring).
- `is_recurring` (boolean: `true`/`false`).
- `facility_code` (string).
- `limit` (int, default: 50).
- `offset` (int, default: 0).

```json
{
  "total": 120,
  "findings": [
    {
      "id": "find-uuid-001",
      "finding_code": "FIND-2026-001",
      "title": "[FS-EGRESS] Emergency exit route obstructed by staging pallets",
      "description": "Forklift staging pallets encroaching on exit path.",
      "category": "Fire Safety",
      "severity": "CRITICAL",
      "regulation_ref": "OSHA 1910.36",
      "facility_code": "FAC-001",
      "facility_name": "Apex Manufacturing Plant A",
      "audit_number": "AUD-2026-001",
      "audit_date": "2026-01-14",
      "status": "OPEN",
      "is_recurring": true,
      "recurrence_count": 3
    }
  ]
}
```

### `GET /api/findings/{id}`
Returns complete finding entity with linked evidence items, historical CAPAs, and recurrence status.

### `GET /api/evidence/{id}`
Retrieves a specific evidence item with its cryptographic SHA-256 hash and finding association.
```json
{
  "id": "ev-uuid-001",
  "organization_id": "00000000-0000-0000-0000-000000000001",
  "finding_id": "find-uuid-001",
  "file_name": "exit_bay_blocked_photo.jpg",
  "file_type": "image/jpeg",
  "file_path": "/data/evidence/exit_bay_blocked_photo.jpg",
  "hash_sha256": "4a7d1ed414474e4033ac29ccb8653d9b",
  "description": "Pallet stack 48 inches high within designated yellow crosshatch egress boundary.",
  "captured_at": "2026-01-14T09:30:00",
  "finding_code": "FIND-2026-001",
  "finding_title": "[FS-EGRESS] Emergency exit route obstructed by staging pallets",
  "facility_code": "FAC-001"
}
```

---

## 7. Corrective Actions & Recurrence Verification

### `GET /api/actions` (or `GET /api/corrective-actions`)
Query parameters:
- `effectiveness` (`EFFECTIVE`, `FAILED_RECURRED`, `PENDING`).
- `action_type` (`ENGINEERING`, `PROCEDURAL`, `TRAINING`, `ADMINISTRATIVE`).
- `status` (`OPEN`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `AWAITING_VERIFICATION`, `VERIFIED_EFFECTIVE`, `FAILED_VERIFICATION`, `RECURRENCE_DETECTED`).
- `facility_code` (string).
- `limit` (int, default: 50).
- `offset` (int, default: 0).

### `POST /api/actions` (or `POST /api/corrective-actions`)
Creates a new corrective action with schema validation and async Hindsight retention.
```json
{
  "finding_code": "FIND-2026-001",
  "title": "Automated egress laser boundary interlock",
  "proposed_action": "Install dual-channel photoelectric laser sensors to alarm on egress corridor obstructions.",
  "action_type": "ENGINEERING",
  "assigned_to": "Lead Controls Engineer",
  "due_date": "2026-12-15",
  "status": "ASSIGNED"
}
```
**Response (201 Created)**:
```json
{
  "id": "ca-uuid-076",
  "organization_id": "00000000-0000-0000-0000-000000000001",
  "finding_id": "find-uuid-001",
  "ca_number": "CAPA-2026-076",
  "title": "Automated egress laser boundary interlock",
  "proposed_action": "Install dual-channel photoelectric laser sensors...",
  "action_type": "ENGINEERING",
  "assigned_to": "Lead Controls Engineer",
  "due_date": "2026-12-15",
  "status": "ASSIGNED",
  "effectiveness_status": "PENDING",
  "recurrence_detected": false,
  "created_at": "2026-11-08T13:25:00",
  "finding_code": "FIND-2026-001",
  "facility_code": "FAC-001"
}
```

### `POST /api/actions/{identifier}/verify`
Deterministically checks post-closure audit records against the 90-day observation window.
```json
{
  "ca_number": "CAPA-2026-003",
  "title": "Operator refresher training on interlock switch protocols",
  "action_type": "TRAINING",
  "assigned_to": "Stamping Department Supervisor",
  "facility_code": "FAC-001",
  "completed_date": "2026-02-15",
  "effectiveness_status": "FAILED_RECURRED",
  "is_effective": false,
  "reason": "Recurrence detected: Finding FIND-2026-033 occurred at FAC-001 110 days post-closure. Action type 'TRAINING' failed to permanently mitigate root cause.",
  "recurrences_detected_count": 1,
  "recurrence_details": [
    {
      "finding_code": "FIND-2026-033",
      "title": "[MG-INTERLOCK] Optical safety light curtain bypassed with reflector tape",
      "facility_code": "FAC-001",
      "audit_number": "AUD-2026-015",
      "audit_date": "2026-06-05",
      "days_post_closure": 110,
      "within_window": false
    }
  ]
}
```

---

## 8. Compliance Agent & Organizational Memory

### `POST /api/agent/chat`
Invokes the AUDITMIND Compliance Agent with Groq tool calling and 8-point structured output contract.
```json
{
  "message": "Investigate recurring exit route obstructions across all plants",
  "history": []
}
```
**Response**:
```json
{
  "query": "Investigate recurring exit route obstructions across all plants",
  "response": "### AUDITMIND Compliance Investigation Report\n\n1. **Finding**:\nEmergency egress route obstruction...\n\n2. **Historical Context**:\nRecurring egress blockage observed across 4 consecutive quarters...\n\n3. **Relevant Records**:\n- Regulation: OSHA 1910.36(g)(1)\n- Findings: FIND-2026-001, FIND-2026-009, FIND-2026-025\n\n4. **Evidence References**:\n- Inspection photographs showing pallet staging in crosshatch areas.\n\n5. **Recurring Pattern**:\nCross-Facility Month-End Shipping Rush Recurrence.\n\n6. **Possible Explanation**:\nReceiving bay buffer rack deficit.\n\n7. **Confidence and Limitations**:\nConfidence: 94% based on 8 historical audits across 3 facilities.\n\n8. **Recommended Next Action**:\nInstall laser boundary sensors.\n*(Requires Human Approval from VP Operational Compliance)*",
  "tools_used": [
    {"tool": "get_finding_history", "args": {"category": "Fire Safety"}},
    {"tool": "analyze_recurring_failures", "args": {"category": "Fire Safety"}}
  ],
  "mode": "deterministic_compliance_synthesis"
}
```

### `POST /api/agent/recall`
Direct semantic search across organizational memory bank.
```json
{
  "query": "stamping press guard bypass",
  "tags": ["machine-safety", "lessons"],
  "limit": 3
}
```

### `POST /api/agent/reflect`
Cognitive synthesis across multi-event memory streams.
```json
{
  "query": "Summarize systemic safety compliance weaknesses"
}
```
**Response**:
```json
{
  "query": "Summarize systemic safety compliance weaknesses",
  "reflection": "Organizational Memory Reflection on 'Summarize systemic safety compliance weaknesses':\nBased on historical audit memory for auditmind_org_..., 5 relevant operational records were identified. Historical observations indicate recurring patterns tied to month-end quota surges and temporary staffing turnover.",
  "status": "completed"
}
```
