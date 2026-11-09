import pytest
from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal
from app.models import (
    Organization, Facility, Audit, Finding,
    Evidence, CorrectiveAction, Verification, Regulation
)
from app.data.seed_meridian import MERIDIAN_ORG_ID


@pytest.mark.asyncio
async def test_meridian_counts():
    async with AsyncSessionLocal() as session:
        # Organization
        org = await session.get(Organization, MERIDIAN_ORG_ID)
        assert org is not None
        assert org.name == "Meridian Industrial Group"

        # Facilities count == 5
        fac_count = await session.scalar(
            select(func.count(Facility.id)).where(Facility.organization_id == MERIDIAN_ORG_ID)
        )
        assert fac_count == 5

        # Base Seed Audits count == 40 (AUD-2026-001 to AUD-2026-040)
        audit_count = await session.scalar(
            select(func.count(Audit.id)).where(
                Audit.organization_id == MERIDIAN_ORG_ID,
                Audit.audit_number.like("AUD-2026-___")
            )
        )
        assert audit_count == 40

        # Base Seed Findings count == 120 (FIND-2026-001 to FIND-2026-120)
        finding_count = await session.scalar(
            select(func.count(Finding.id)).where(
                Finding.organization_id == MERIDIAN_ORG_ID,
                Finding.finding_code.like("FIND-2026-___")
            )
        )
        assert finding_count == 120

        # Corrective Actions count >= 75 (Seeded 75 baseline CAPAs plus any runtime created CAPAs)
        ca_count = await session.scalar(
            select(func.count(CorrectiveAction.id)).where(CorrectiveAction.organization_id == MERIDIAN_ORG_ID)
        )
        assert ca_count >= 75

        # Verifications count >= 25 (Baseline 25 verifications plus runtime verifications)
        v_count = await session.scalar(
            select(func.count(Verification.id)).where(Verification.organization_id == MERIDIAN_ORG_ID)
        )
        assert v_count >= 25


@pytest.mark.asyncio
async def test_scenario_a_cross_facility_fire_safety():
    """Scenario A: Recurring fire-safety documentation failures across multiple facilities."""
    async with AsyncSessionLocal() as session:
        stmt = (
            select(Finding, Facility.facility_code)
            .join(Facility, Finding.facility_id == Facility.id)
            .where(
                Finding.organization_id == MERIDIAN_ORG_ID,
                Finding.category == "Fire Safety"
            )
        )
        rows = (await session.execute(stmt)).all()
        assert len(rows) > 0
        facility_codes = {r[1] for r in rows}
        # Fire safety findings must exist across multiple facilities
        assert len(facility_codes) >= 3


@pytest.mark.asyncio
async def test_scenario_b_completed_capa_recurred():
    """Scenario B: A corrective action is completed and verified but the same problem returns later."""
    async with AsyncSessionLocal() as session:
        stmt = select(CorrectiveAction).where(
            CorrectiveAction.organization_id == MERIDIAN_ORG_ID,
            CorrectiveAction.title.like("%interlock switch%"),
            CorrectiveAction.status == "COMPLETED"
        )
        cas = (await session.execute(stmt)).scalars().all()
        assert len(cas) >= 1
        for ca in cas:
            # Must be flagged as FAILED_RECURRED despite status == COMPLETED
            assert ca.effectiveness_status == "FAILED_RECURRED"
            assert ca.recurrence_detected is True


@pytest.mark.asyncio
async def test_scenario_d_effective_capa():
    """Scenario D: A genuinely successful corrective action."""
    async with AsyncSessionLocal() as session:
        stmt = select(CorrectiveAction).where(
            CorrectiveAction.organization_id == MERIDIAN_ORG_ID,
            CorrectiveAction.action_type == "ENGINEERING",
            CorrectiveAction.title.like("%ultrasonic level telemetry%")
        )
        cas = (await session.execute(stmt)).scalars().all()
        assert len(cas) >= 1
        for ca in cas:
            assert ca.effectiveness_status == "EFFECTIVE"
            assert ca.recurrence_detected is False


@pytest.mark.asyncio
async def test_scenario_e_semantic_similarity_divergent_causes():
    """Scenario E: Similar wording representing different root problems."""
    async with AsyncSessionLocal() as session:
        stmt = select(Finding).where(
            Finding.organization_id == MERIDIAN_ORG_ID,
            Finding.title.like("%Improper ventilation%")
        )
        findings = (await session.execute(stmt)).scalars().all()
        assert len(findings) >= 2
        descriptions = [f.description for f in findings]
        assert any("solvent" in d.lower() for d in descriptions)
        assert any("hydrogen" in d.lower() or "battery" in d.lower() for d in descriptions)


@pytest.mark.asyncio
async def test_scenario_c_employee_training_failures():
    """Scenario C: Repeated employee training documentation gaps."""
    async with AsyncSessionLocal() as session:
        stmt = select(Finding).where(
            Finding.organization_id == MERIDIAN_ORG_ID,
            Finding.title.like("%TR-FORKLIFT%")
        )
        findings = (await session.execute(stmt)).scalars().all()
        assert len(findings) >= 1
        for f in findings:
            assert f.category == "Training Records" or "training" in f.category.lower()

        # Check related corrective action
        ca_stmt = select(CorrectiveAction).where(
            CorrectiveAction.organization_id == MERIDIAN_ORG_ID,
            CorrectiveAction.title.like("%staffing certification%")
        )
        cas = (await session.execute(ca_stmt)).scalars().all()
        assert len(cas) >= 1
        assert cas[0].effectiveness_status == "FAILED_RECURRED"


@pytest.mark.asyncio
async def test_scenario_f_incomplete_evidence():
    """Scenario F: Incomplete or missing evidence for findings."""
    async with AsyncSessionLocal() as session:
        # Findings with evidence
        stmt_with_ev = select(Finding).join(Evidence, Finding.id == Evidence.finding_id).where(
            Finding.organization_id == MERIDIAN_ORG_ID
        )
        findings_with_ev = (await session.execute(stmt_with_ev)).scalars().all()
        assert len(findings_with_ev) >= 40

        # Findings without evidence (evidence gaps)
        stmt_all = select(func.count(Finding.id)).where(
            Finding.organization_id == MERIDIAN_ORG_ID,
            Finding.finding_code.like("FIND-2026-___")
        )
        total_findings = await session.scalar(stmt_all)
        assert total_findings == 120
        # 120 total findings - 40 with evidence = 80 findings with incomplete evidence
        assert (total_findings - len(findings_with_ev)) > 0


@pytest.mark.asyncio
async def test_tenant_isolation():
    """Verify that a separate organization ID cannot access Meridian data."""
    fake_org_id = "99999999-9999-9999-9999-999999999999"
    async with AsyncSessionLocal() as session:
        count = await session.scalar(
            select(func.count(Audit.id)).where(Audit.organization_id == fake_org_id)
        )
        assert count == 0
