import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.models import Audit, Finding, CorrectiveAction, Verification, Facility
from app.services.hindsight_service import hindsight_service, AUDITMIND_MENTAL_MODELS

logger = logging.getLogger(__name__)

MEMORY_CATEGORIES = {
    "AUDIT_FACT": "Historical point-in-time audit and non-conformance records",
    "INSPECTION_EXPERIENCE": "Inspector notes, operational context, and environmental conditions",
    "CAPA_DECISION": "Remediation strategy decisions (procedural vs engineering vs training)",
    "VERIFIED_OUTCOME": "Post-remediation re-inspection results and recurrence checks",
    "ORGANIZATIONAL_OBSERVATION": "Cross-facility systemic patterns and seasonal trends",
    "ORGANIZATIONAL_LESSON": "Durable compliance lessons and proven engineering controls"
}


class MemoryManager:
    def __init__(self):
        pass

    async def sync_organization_history_to_hindsight(self, org_id: str) -> Dict[str, Any]:
        """Loads historical records from SQL database and retains them as structured memories in Hindsight."""
        async with AsyncSessionLocal() as session:
            # 1. Fetch facilities map
            fac_stmt = select(Facility).where(Facility.organization_id == org_id)
            fac_rows = (await session.execute(fac_stmt)).scalars().all()
            fac_map = {f.id: f for f in fac_rows}

            # 2. Fetch all findings with corrective actions and verifications
            finding_stmt = (
                select(Finding)
                .options(
                    selectinload(Finding.corrective_actions).selectinload(CorrectiveAction.verifications),
                    selectinload(Finding.audit)
                )
                .where(Finding.organization_id == org_id)
            )
            findings = (await session.execute(finding_stmt)).scalars().all()

        retained_count = 0
        categories_retained = {k: 0 for k in MEMORY_CATEGORIES}

        # Initialize bank
        await hindsight_service.initialize_bank(org_id, "Meridian Compliance Bank")

        for f in findings:
            fac = fac_map.get(f.facility_id)
            fac_code = fac.facility_code if fac else "UNKNOWN"
            fac_name = fac.name if fac else "Unknown Facility"
            audit_num = f.audit.audit_number if f.audit else "UNKNOWN"

            # 1. AUDIT_FACT
            fact_content = (
                f"[{f.severity}] {f.title} at {fac_name} ({fac_code}). "
                f"Regulation: {f.regulation_ref or 'Internal SOP'}. Category: {f.category}. "
                f"Description: {f.description}"
            )
            await hindsight_service.aretain(
                org_id=org_id,
                content=fact_content,
                document_id=f.finding_code,
                metadata={
                    "category": "AUDIT_FACT",
                    "facility_code": fac_code,
                    "severity": f.severity,
                    "audit_number": audit_num
                },
                tags=["audit_fact", fac_code.lower(), f.category.lower().replace(" ", "_"), f.severity.lower()]
            )
            retained_count += 1
            categories_retained["AUDIT_FACT"] += 1

            # 2. CAPA_DECISION and VERIFIED_OUTCOME
            for ca in f.corrective_actions:
                capa_content = (
                    f"CAPA {ca.ca_number} for {f.finding_code} ({f.title}) at {fac_code}: "
                    f"Action Type: {ca.action_type}. Strategy: {ca.proposed_action}. "
                    f"Assigned to: {ca.assigned_to}. Closure Status: {ca.status}."
                )
                await hindsight_service.aretain(
                    org_id=org_id,
                    content=capa_content,
                    document_id=ca.ca_number,
                    metadata={
                        "category": "CAPA_DECISION",
                        "action_type": ca.action_type,
                        "facility_code": fac_code
                    },
                    tags=["capa_decision", fac_code.lower(), ca.action_type.lower()]
                )
                retained_count += 1
                categories_retained["CAPA_DECISION"] += 1

                # Verified Outcome
                outcome_content = (
                    f"Effectiveness assessment for {ca.ca_number} ({fac_code}): "
                    f"Result: {ca.effectiveness_status}. Recurrence detected: {ca.recurrence_detected}. "
                    f"Notes: {ca.outcome_notes or 'No notes recorded.'}"
                )
                await hindsight_service.aretain(
                    org_id=org_id,
                    content=outcome_content,
                    document_id=f"{ca.ca_number}-OUTCOME",
                    metadata={
                        "category": "VERIFIED_OUTCOME",
                        "effectiveness": ca.effectiveness_status,
                        "recurrence": str(ca.recurrence_detected)
                    },
                    tags=["verified_outcome", fac_code.lower(), ca.effectiveness_status.lower()]
                )
                retained_count += 1
                categories_retained["VERIFIED_OUTCOME"] += 1

        # 3. Retain Cross-Facility Organizational Observations and Lessons
        org_observations = [
            {
                "content": "Cross-facility egress drift: Staging bottlenecks repeatedly recur during quarter-end push across FAC-001, FAC-004, and FAC-005. Pallet overflow blocks marked fire doors when receiving dock staging capacity is exceeded.",
                "doc_id": "OBS-FIRE-EGRESS-DRIFT",
                "cat": "ORGANIZATIONAL_OBSERVATION",
                "tags": ["observation", "cross_facility", "fire_safety", "staging"]
            },
            {
                "content": "Machine guarding CAPA durability lesson: In stamping and CNC operations (FAC-001), procedural training refreshers consistently fail to prevent operator interlock bypasses. Mechanical lockout redesigns and physical barriers are required for permanent mitigation.",
                "doc_id": "LESSON-MACHINE-GUARD-DURABILITY",
                "cat": "ORGANIZATIONAL_LESSON",
                "tags": ["lesson", "machine_guarding", "engineering_control", "fac-001"]
            },
            {
                "content": "Hazardous materials containment lesson: In chemical plating lines (FAC-002), concrete containment sumps crack over 12-month thermal cycling. Installing HDPE liners with ultrasonic level sensors completely eliminated leak non-conformances.",
                "doc_id": "LESSON-CHEM-CONTAINMENT-HDPE",
                "cat": "ORGANIZATIONAL_LESSON",
                "tags": ["lesson", "chemical_safety", "containment", "fac-002"]
            },
            {
                "content": "Workforce certification observation: High agency temporary labor turnover in third-shift logistics (FAC-003, FAC-004) directly causes recurring OSHA 1910.178 powered industrial truck certification lapses.",
                "doc_id": "OBS-FORKLIFT-TURNOVER",
                "cat": "ORGANIZATIONAL_OBSERVATION",
                "tags": ["observation", "forklift", "training", "turnover", "fac-003", "fac-004"]
            }
        ]

        for obs in org_observations:
            await hindsight_service.aretain(
                org_id=org_id,
                content=obs["content"],
                document_id=obs["doc_id"],
                metadata={"category": obs["cat"]},
                tags=obs["tags"]
            )
            retained_count += 1
            categories_retained[obs["cat"]] += 1

        return {
            "status": "synchronized",
            "organization_id": org_id,
            "total_memories_retained": retained_count,
            "categories": categories_retained,
            "mental_models_active": len(AUDITMIND_MENTAL_MODELS)
        }

    async def get_memory_status(self, org_id: str) -> Dict[str, Any]:
        """Returns comprehensive status of organization's Hindsight memory bank."""
        bank_id = hindsight_service.get_bank_id(org_id)
        all_memories = await hindsight_service.list_memories(org_id, limit=200)

        # Count by category from metadata
        category_counts = {k: 0 for k in MEMORY_CATEGORIES}
        facility_counts = {}

        for m in all_memories:
            meta = m.get("metadata", {})
            cat = meta.get("category", "AUDIT_FACT")
            if cat in category_counts:
                category_counts[cat] += 1
            fac = meta.get("facility_code")
            if fac:
                facility_counts[fac] = facility_counts.get(fac, 0) + 1

        return {
            "bank_id": bank_id,
            "organization_id": org_id,
            "is_live_hindsight": hindsight_service.client is not None,
            "hindsight_base_url": hindsight_service.base_url,
            "total_memories": len(all_memories),
            "category_breakdown": category_counts,
            "facility_breakdown": facility_counts,
            "mental_models": [mm["name"] for mm in AUDITMIND_MENTAL_MODELS],
            "last_synced": datetime.utcnow().isoformat()
        }

    async def synthesize_mental_model(self, org_id: str, model_id: str) -> Dict[str, Any]:
        """Synthesizes high-level organizational reflection for a specific compliance mental model."""
        model_meta = next((mm for mm in AUDITMIND_MENTAL_MODELS if mm["id"] == model_id), None)
        if not model_meta:
            raise ValueError(f"Unknown mental model id: {model_id}")

        query = model_meta["source_query"]
        reflection = await hindsight_service.areflect(org_id=org_id, query=query)

        return {
            "model_id": model_id,
            "name": model_meta["name"],
            "query": query,
            "reflection": reflection["reflection"],
            "tags": model_meta["tags"],
            "generated_at": datetime.utcnow().isoformat()
        }

    async def get_all_mental_models(self, org_id: str) -> List[Dict[str, Any]]:
        """Retrieves reflections for all 6 core compliance mental models."""
        results = []
        for mm in AUDITMIND_MENTAL_MODELS:
            res = await self.synthesize_mental_model(org_id, mm["id"])
            results.append(res)
        return results


memory_manager = MemoryManager()
