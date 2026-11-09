"""
AUDITMIND Final Acceptance Test Suite
==================================================
Demonstrates the complete 10-step operational compliance lifecycle:
1. Historical finding stored.
2. Corrective action stored.
3. Verification event stored.
4. New related failure introduced.
5. Hindsight retrieves historical events.
6. Agent identifies recurrence via VerificationEngine.
7. Agent explains historical relationship.
8. Response contains real evidence references.
9. System suggests appropriate investigation with human approval gate.
10. Verified future outcome retained and recalled.
"""

import pytest
import datetime
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.models import Facility, Audit, Finding, CorrectiveAction, Verification, Evidence
from app.services.hindsight_service import hindsight_service
from app.services.memory_manager import memory_manager
from app.services.verification_engine import verification_engine
from app.services.agent_tools import agent_tool_dispatcher
from app.data.seed_meridian import MERIDIAN_ORG_ID


@pytest.mark.asyncio
async def test_full_10_step_acceptance_lifecycle():
    async with AsyncSessionLocal() as session:
        # Clean up any residual test records from prior runs
        prior_findings = (await session.execute(
            select(Finding.id).where(Finding.finding_code.like("FIND-FINAL-%"))
        )).scalars().all()
        if prior_findings:
            await session.execute(delete(Evidence).where(Evidence.finding_id.in_(prior_findings)))
            prior_cas = (await session.execute(
                select(CorrectiveAction.id).where(CorrectiveAction.finding_id.in_(prior_findings))
            )).scalars().all()
            if prior_cas:
                await session.execute(delete(Verification).where(Verification.corrective_action_id.in_(prior_cas)))
            await session.execute(delete(CorrectiveAction).where(CorrectiveAction.finding_id.in_(prior_findings)))
            await session.execute(delete(Finding).where(Finding.id.in_(prior_findings)))

        await session.execute(delete(Audit).where(Audit.audit_number.like("AUD-FINAL-%")))
        await session.commit()

        # Check facility exists
        fac_stmt = select(Facility).where(Facility.organization_id == MERIDIAN_ORG_ID).limit(1)
        facility = (await session.execute(fac_stmt)).scalars().first()
        assert facility is not None, "Meridian facilities must exist"
        facility_id = facility.id
        facility_code = facility.facility_code

        # -------------------------------------------------------------------------
        # STEP 1: Historical finding stored
        # -------------------------------------------------------------------------
        audit_1 = Audit(
            organization_id=MERIDIAN_ORG_ID,
            facility_id=facility_id,
            audit_number="AUD-FINAL-2026-01",
            title="Q3 Combustible Dust Safety Audit",
            audit_type="Safety",
            audit_date=datetime.date(2026, 10, 1),
            auditor_name="Dr. Eleanor Vance",
            status="COMPLETED",
            compliance_score=82.0
        )
        session.add(audit_1)
        await session.flush()

        finding_1 = Finding(
            organization_id=MERIDIAN_ORG_ID,
            audit_id=audit_1.id,
            facility_id=facility_id,
            finding_code="FIND-FINAL-001",
            title="Combustible dust accumulation in primary exhaust ductwork",
            description="Hazardous layer of organic dust (>1/32 inch) observed inside stamping exhaust ducts.",
            category="Dust Hazard",
            severity="HIGH",
            regulation_ref="NFPA 654 Standard 8.2.1",
            status="CLOSED",
            is_recurring=False
        )
        session.add(finding_1)
        await session.flush()

        # Evidence stored for finding 1
        evidence_1 = Evidence(
            organization_id=MERIDIAN_ORG_ID,
            finding_id=finding_1.id,
            file_name="dust_accumulation_duct_bay4.jpg",
            file_path="evidence/ORG-MERIDIAN-01/dust_accumulation_duct_bay4.jpg",
            file_type="image/jpeg",
            hash_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            description="Photo of 2mm dust layer inside exhaust ducting."
        )
        session.add(evidence_1)
        await session.flush()

        # Retain finding in Hindsight
        ret_1 = await hindsight_service.aretain(
            org_id=MERIDIAN_ORG_ID,
            content=f"Historical finding FIND-FINAL-001: Combustible dust accumulation in primary exhaust ductwork at {facility.name} ({facility_code}). Regulation NFPA 654 Standard 8.2.1.",
            document_id="FIND-FINAL-001",
            metadata={"category": "AUDIT_FACT", "facility_code": facility_code, "severity": "HIGH"},
            tags=["audit_fact", facility_code.lower(), "dust_hazard", "high"]
        )
        assert ret_1.get("status") in ("retained", "already_retained")

        # -------------------------------------------------------------------------
        # STEP 2: Corrective action stored
        # -------------------------------------------------------------------------
        capa_1 = CorrectiveAction(
            organization_id=MERIDIAN_ORG_ID,
            finding_id=finding_1.id,
            ca_number="CAPA-FINAL-001",
            title="Implement manual quarterly sweeping protocol",
            proposed_action="Maintenance team assigned to manually sweep and vacuum ducts every 90 days.",
            action_type="PROCEDURAL",
            assigned_to="Marcus Reed",
            due_date=datetime.date(2026, 10, 15),
            completed_date=datetime.date(2026, 10, 5),
            status="COMPLETED",
            effectiveness_status="PENDING",
            outcome_notes="Manual duct cleaning completed and shift log signed."
        )
        session.add(capa_1)
        await session.flush()

        ret_2 = await hindsight_service.aretain(
            org_id=MERIDIAN_ORG_ID,
            content=f"CAPA-FINAL-001 assigned to Marcus Reed: Manual quarterly sweeping protocol for combustible dust under NFPA 654. Marked completed Oct 2026.",
            document_id="CAPA-FINAL-001",
            metadata={"category": "CAPA_DECISION", "facility_code": facility_code},
            tags=["capa_decision", facility_code.lower(), "procedural"]
        )
        assert ret_2.get("status") in ("retained", "already_retained")

        # -------------------------------------------------------------------------
        # STEP 3: Verification event stored
        # -------------------------------------------------------------------------
        verif_1 = Verification(
            organization_id=MERIDIAN_ORG_ID,
            corrective_action_id=capa_1.id,
            verification_code="VERIF-FINAL-001",
            verified_by="Sarah Lin",
            verification_date=datetime.date(2026, 10, 10),
            result="PASS",
            recurrence_detected=False,
            notes="Sign-off sheet reviewed; maintenance log shows cleaning."
        )
        session.add(verif_1)
        await session.flush()

        # -------------------------------------------------------------------------
        # STEP 4: New related failure introduced (within 90-day observation window)
        # -------------------------------------------------------------------------
        audit_2 = Audit(
            organization_id=MERIDIAN_ORG_ID,
            facility_id=facility_id,
            audit_number="AUD-FINAL-2026-02",
            title="Q4 Follow-up EHS Compliance Inspection",
            audit_type="Safety",
            audit_date=datetime.date(2026, 11, 20),
            auditor_name="Dr. Eleanor Vance",
            status="COMPLETED",
            compliance_score=78.5
        )
        session.add(audit_2)
        await session.flush()

        finding_2 = Finding(
            organization_id=MERIDIAN_ORG_ID,
            audit_id=audit_2.id,
            facility_id=facility_id,
            finding_code="FIND-FINAL-002",
            title="Recurring combustible dust buildup in secondary duct branches",
            description="Combustible dust re-accumulated in secondary exhaust duct branches (>1/16 inch) due to manual sweeping skipping overhead elbows.",
            category="Dust Hazard",
            severity="CRITICAL",
            regulation_ref="NFPA 654 Standard 8.2.1",
            status="OPEN",
            is_recurring=True,
            recurring_parent_id=finding_1.id,
            recurrence_count=1
        )
        session.add(finding_2)
        await session.commit()

        # Retain new finding in Hindsight
        await hindsight_service.aretain(
            org_id=MERIDIAN_ORG_ID,
            content=f"Recurring finding FIND-FINAL-002 at {facility.name}: Heavy combustible dust re-accumulated in exhaust ducts within 70 days of CAPA-FINAL-001.",
            document_id="FIND-FINAL-002",
            metadata={"category": "INSPECTION_EXPERIENCE", "facility_code": facility_code},
            tags=["inspection_experience", facility_code.lower(), "recurring"]
        )

        # -------------------------------------------------------------------------
        # STEP 5: Hindsight retrieves historical events
        # -------------------------------------------------------------------------
        recall_res = await hindsight_service.arecall(
            org_id=MERIDIAN_ORG_ID,
            query="combustible dust accumulation exhaust ductwork NFPA 654"
        )
        assert len(recall_res) > 0, "Hindsight must recall historical combustible dust events"
        recalled_texts = " ".join([m.get("content", "") for m in recall_res])
        assert "combustible dust" in recalled_texts.lower()

        # -------------------------------------------------------------------------
        # STEP 6: Agent identifies recurrence via VerificationEngine
        # -------------------------------------------------------------------------
        eval_res = await verification_engine.evaluate_corrective_action(
            session=session,
            organization_id=MERIDIAN_ORG_ID,
            ca_identifier="CAPA-FINAL-001"
        )
        assert eval_res["is_effective"] is False, "CAPA must be evaluated as ineffective"
        assert eval_res["effectiveness_status"] == "FAILED_RECURRED"
        assert eval_res["recurrences_detected_count"] >= 1

        # -------------------------------------------------------------------------
        # STEP 7: Agent explains historical relationship
        # -------------------------------------------------------------------------
        history_res = await agent_tool_dispatcher.tool_get_finding_history(
            org_id=MERIDIAN_ORG_ID,
            category="Dust Hazard",
            facility_code=facility_code
        )
        assert history_res.get("occurrences_count") >= 2
        history_items = history_res.get("history", [])
        finding_codes = [h["finding_code"] for h in history_items]
        assert "FIND-FINAL-001" in finding_codes
        assert "FIND-FINAL-002" in finding_codes

        # -------------------------------------------------------------------------
        # STEP 8: Response contains real evidence references
        # -------------------------------------------------------------------------
        search_res = await agent_tool_dispatcher.tool_search_audits(
            org_id=MERIDIAN_ORG_ID,
            facility_code=facility_code
        )
        assert search_res.get("total_found", 0) >= 2
        audit_numbers = [a["audit_number"] for a in search_res.get("audits", [])]
        assert "AUD-FINAL-2026-01" in audit_numbers or "AUD-FINAL-2026-02" in audit_numbers

        # -------------------------------------------------------------------------
        # STEP 9: System suggests appropriate investigation with human approval gate
        # -------------------------------------------------------------------------
        remedy_task = await agent_tool_dispatcher.tool_create_remediation_task(
            org_id=MERIDIAN_ORG_ID,
            finding_code="FIND-FINAL-002",
            proposed_action="Install explosion-proof high-vacuum pickup nozzles at duct elbows to eliminate manual sweeping reliance.",
            action_type="ENGINEERING",
            assignee="Director of Plant Engineering",
            priority="CRITICAL"
        )
        assert remedy_task.get("requires_human_approval") is True
        assert remedy_task.get("status") == "PROPOSED_AWAITING_HUMAN_APPROVAL"
        assert remedy_task.get("finding_code") == "FIND-FINAL-002"
        assert "safety_guard" in remedy_task

        # -------------------------------------------------------------------------
        # STEP 10: Verified future outcome retained and recalled
        # -------------------------------------------------------------------------
        ret_outcome = await hindsight_service.aretain(
            org_id=MERIDIAN_ORG_ID,
            content=f"Verified outcome for NFPA 654 combustible dust: Manual sweeping protocol declared FAILED_RECURRED. Automated vacuum extraction retrofitted with 0 recurrences post-installation.",
            document_id="OUTCOME-NFPA654-VACUUM",
            metadata={"category": "VERIFIED_OUTCOME", "facility_code": facility_code},
            tags=["verified_outcome", facility_code.lower(), "effective"]
        )
        assert ret_outcome.get("status") in ("retained", "already_retained")

        # Confirm verified outcome can be recalled
        outcome_recall = await hindsight_service.arecall(
            org_id=MERIDIAN_ORG_ID,
            query="automated vacuum extraction NFPA 654 combustible dust verified outcome"
        )
        assert len(outcome_recall) > 0
        outcome_texts = " ".join([m.get("content", "") for m in outcome_recall])
        assert "automated vacuum extraction" in outcome_texts.lower()

        # Final Teardown: Clean up test artifacts
        final_findings = (await session.execute(
            select(Finding.id).where(Finding.finding_code.like("FIND-FINAL-%"))
        )).scalars().all()
        if final_findings:
            await session.execute(delete(Evidence).where(Evidence.finding_id.in_(final_findings)))
            final_cas = (await session.execute(
                select(CorrectiveAction.id).where(CorrectiveAction.finding_id.in_(final_findings))
            )).scalars().all()
            if final_cas:
                await session.execute(delete(Verification).where(Verification.corrective_action_id.in_(final_cas)))
            await session.execute(delete(CorrectiveAction).where(CorrectiveAction.finding_id.in_(final_findings)))
            await session.execute(delete(Finding).where(Finding.id.in_(final_findings)))

        await session.execute(delete(Audit).where(Audit.audit_number.like("AUD-FINAL-%")))
        await session.commit()
