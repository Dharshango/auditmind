import pytest
from app.memory.hindsight_client import get_hindsight_client
from app.memory.bank_manager import bank_manager, DEFAULT_BANK_ID
from app.memory.retention import retention_engine
from app.memory.retrieval import retrieval_engine


@pytest.mark.asyncio
async def test_phase1_hindsight_health_check():
    """Verify Hindsight client health check and configuration."""
    client = get_hindsight_client()
    health = await client.check_health()
    assert health["status"] == "healthy"
    assert "Hindsight SDK" in health["engine"]
    assert "api_url" in health


@pytest.mark.asyncio
async def test_phase1_memory_bank_creation_and_mission():
    """Verify creation and mission configuration of 'meridian-industrial-demo' bank."""
    bank_info = await bank_manager.ensure_memory_bank(
        bank_id="meridian-industrial-demo",
        name="Meridian Industrial Group Demo Bank",
        mission=(
            "Maintain persistent organizational compliance memory, including historical "
            "audit findings, corrective actions, verification outcomes and operational experiences."
        )
    )
    assert bank_info["bank_id"] == "meridian-industrial-demo"
    assert bank_info["status"] in ["ready", "created_cloud", "existing_cloud", "created_local", "fallback_active"]
    assert "compliance memory" in bank_info["mission"].lower()


@pytest.mark.asyncio
async def test_phase1_retain_finding_capa_and_verification():
    """Retain fire-safety finding, related CAPA, and verification event."""
    bank_id = "meridian-industrial-demo"

    # 1. Retain a fire-safety finding
    res_finding = await retention_engine.retain_event(
        bank_id=bank_id,
        content="CRITICAL: Emergency fire egress exit door blocked by stacked pallets in Bay 4 at Plant A.",
        document_id="FIND-2026-FIRE-01",
        metadata={"category": "FINDING", "severity": "CRITICAL", "facility": "FAC-001"},
        tags=["fire_safety", "egress", "hazard", "FAC-001"]
    )
    assert res_finding["status"] in ["retained", "already_retained"]
    assert res_finding["event_hash"] is not None

    # Idempotency check: duplicate retain
    res_dup = await retention_engine.retain_event(
        bank_id=bank_id,
        content="CRITICAL: Emergency fire egress exit door blocked by stacked pallets in Bay 4 at Plant A.",
        document_id="FIND-2026-FIRE-01"
    )
    assert res_dup["status"] == "already_retained"
    assert res_dup["idempotent"] is True

    # 2. Retain a related corrective action
    res_capa = await retention_engine.retain_event(
        bank_id=bank_id,
        content="CORRECTIVE ACTION: Removed pallets from Bay 4 exit door and issued safety retraining memo to shift leads.",
        document_id="CAPA-2026-FIRE-01",
        metadata={"category": "CORRECTIVE_ACTION", "finding_ref": "FIND-2026-FIRE-01", "assigned_to": "EHS Supervisor"},
        tags=["fire_safety", "capa", "retraining", "FAC-001"]
    )
    assert res_capa["status"] in ["retained", "already_retained"]

    # 3. Retain a verification event
    res_verification = await retention_engine.retain_event(
        bank_id=bank_id,
        content="VERIFICATION OUTCOME: Re-inspection 45 days later identified pallets re-staging in front of Bay 4 exit. CAPA failed recurrence durability.",
        document_id="VERIFY-2026-FIRE-01",
        metadata={"category": "VERIFICATION", "outcome": "FAILED_RECURRED", "observation_window_days": "45"},
        tags=["fire_safety", "verification", "failed_recurred", "FAC-001"]
    )
    assert res_verification["status"] in ["retained", "already_retained"]


@pytest.mark.asyncio
async def test_phase1_recall_and_reflection():
    """Recall earlier finding and reflect over all three sequential compliance events."""
    bank_id = "meridian-industrial-demo"

    # 4. Recall the earlier finding
    recalled = await retrieval_engine.recall_memories(
        bank_id=bank_id,
        query="emergency fire egress exit door blocked pallets",
        limit=5
    )
    assert len(recalled) > 0
    contents = [r.get("content", "") for r in recalled]
    assert any("egress exit door blocked" in c.lower() or "pallets" in c.lower() for c in contents)

    # 5. Reflect over all three events
    reflection = await retrieval_engine.reflect_over_memories(
        bank_id=bank_id,
        query="What is the durability and recurrence risk of procedural training for fire door obstructions?"
    )
    assert reflection["bank_id"] == bank_id
    assert "reflection" in reflection
    text = reflection["reflection"]
    assert len(text) > 50
    # Reflection identifies the recurrence pattern or lesson
    assert "recur" in text.lower() or "durability" in text.lower() or "interlock" in text.lower()


@pytest.mark.asyncio
async def test_phase1_persistence_across_separate_interaction():
    """Verify memory retrieval succeeds in a distinct separate interaction."""
    bank_id = "meridian-industrial-demo"

    # Separate query without explicitly specifying fire terminology
    interaction_query = "Plant A Bay 4 safety hazard outcome"
    results = await retrieval_engine.recall_memories(
        bank_id=bank_id,
        query=interaction_query,
        limit=3
    )

    assert len(results) > 0
    # Confirms memory retained in previous test is accessible in this separate interaction
    matched_text = " ".join([r.get("content", "") for r in results])
    assert "Plant A" in matched_text or "Bay 4" in matched_text
