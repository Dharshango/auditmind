# AUDITMIND Database Schema & Entity Specification

## 1. Schema Overview

All transactional entities belong to the `public` schema and enforce organization-level scoping via `organization_id` foreign keys with appropriate cascade policies and indexes.

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ USERS : contains
    ORGANIZATIONS ||--o{ FACILITIES : operates
    ORGANIZATIONS ||--o{ REGULATIONS : tracks
    FACILITIES ||--o{ AUDITS : hosts
    AUDITS ||--o{ FINDINGS : discovers
    FINDINGS ||--o{ EVIDENCE : supports
    FINDINGS ||--o{ CORRECTIVE_ACTIONS : requires
    CORRECTIVE_ACTIONS ||--o{ VERIFICATIONS : confirms
    ORGANIZATIONS ||--o{ AGENT_EVENTS : logs

    ORGANIZATIONS {
        uuid id PK
        string name
        string slug UK
        string industry
        jsonb settings
        timestamp created_at
        timestamp updated_at
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        string email UK
        string full_name
        string role
        string hashed_password
        boolean is_active
        timestamp created_at
    }

    FACILITIES {
        uuid id PK
        uuid organization_id FK
        string facility_code UK
        string name
        string facility_type
        string location
        jsonb metadata
        timestamp created_at
    }

    AUDITS {
        uuid id PK
        uuid organization_id FK
        uuid facility_id FK
        string audit_number UK
        string title
        string audit_type
        string auditor_name
        date audit_date
        string status
        float compliance_score
        text summary
        string report_file_path
        timestamp created_at
    }

    FINDINGS {
        uuid id PK
        uuid organization_id FK
        uuid audit_id FK
        uuid facility_id FK
        string finding_code UK
        string title
        text description
        string category
        string severity
        string regulation_ref
        string status
        boolean is_recurring
        uuid recurring_parent_id FK
        timestamp created_at
    }

    EVIDENCE {
        uuid id PK
        uuid organization_id FK
        uuid finding_id FK
        string file_name
        string file_type
        string file_path
        string hash_sha256
        text description
        timestamp captured_at
    }

    CORRECTIVE_ACTIONS {
        uuid id PK
        uuid organization_id FK
        uuid finding_id FK
        string ca_number UK
        text proposed_action
        string assigned_to
        date due_date
        date completed_date
        string status
        string effectiveness_status
        text outcome_notes
        timestamp created_at
    }

    VERIFICATIONS {
        uuid id PK
        uuid organization_id FK
        uuid corrective_action_id FK
        string verified_by
        date verification_date
        string result
        text notes
        boolean recurrence_detected
        timestamp created_at
    }

    REGULATIONS {
        uuid id PK
        uuid organization_id FK
        string code UK
        string jurisdiction
        string title
        text description
        string category
    }

    AGENT_EVENTS {
        uuid id PK
        uuid organization_id FK
        string event_type
        string tool_name
        jsonb tool_input
        jsonb tool_output
        text agent_reasoning
        timestamp created_at
    }
```

---

## 2. Table Specifications & Indexes

1. **organizations**:
   - Primary Key: `id` (UUID)
   - Unique: `slug`
2. **facilities**:
   - Foreign Key: `organization_id`
   - Unique: `facility_code`
   - Index on: `(organization_id, facility_type)`
3. **audits**:
   - Foreign Key: `facility_id`, `organization_id`
   - Indexes on: `(organization_id, audit_date)`, `(facility_id, status)`
4. **findings**:
   - Foreign Key: `audit_id`, `facility_id`, `organization_id`
   - Indexes on: `(organization_id, category)`, `(organization_id, severity)`, `(facility_id, is_recurring)`
5. **corrective_actions**:
   - Foreign Key: `finding_id`, `organization_id`
   - Indexes on: `(organization_id, effectiveness_status)`, `(finding_id)`
6. **verifications**:
   - Foreign Key: `corrective_action_id`, `organization_id`
   - Index on: `(corrective_action_id, verification_date)`
7. **agent_events**:
   - Foreign Key: `organization_id`
   - Index on: `(organization_id, created_at)`
