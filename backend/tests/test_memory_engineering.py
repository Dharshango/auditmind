import pytest
from app.services.memory_manager import memory_manager
from app.services.hindsight_service import hindsight_service, AUDITMIND_MENTAL_MODELS
from app.data.seed_meridian import MERIDIAN_ORG_ID


@pytest.mark.asyncio
async def test_sync_organization_history_to_hindsight():
    sync_result = await memory_manager.sync_organization_history_to_hindsight(MERIDIAN_ORG_ID)
    assert sync_result["status"] == "synchronized"
    assert sync_result["total_memories_retained"] >= 100
    assert sync_result["categories"]["AUDIT_FACT"] >= 40
    assert sync_result["categories"]["CAPA_DECISION"] >= 40
    assert sync_result["mental_models_active"] == 6


@pytest.mark.asyncio
async def test_memory_status_inspection():
    status = await memory_manager.get_memory_status(MERIDIAN_ORG_ID)
    assert "auditmind-org" in status["bank_id"]
    assert status["total_memories"] >= 100
    assert len(status["mental_models"]) == 6
    assert "Recurring Compliance Failures" in status["mental_models"]


@pytest.mark.asyncio
async def test_mental_models_synthesis():
    # Test individual mental model
    single_mm = await memory_manager.synthesize_mental_model(MERIDIAN_ORG_ID, "recurring-failures")
    assert single_mm["name"] == "Recurring Compliance Failures"
    assert len(single_mm["reflection"]) > 20

    # Test all 6 mental models
    all_mm = await memory_manager.get_all_mental_models(MERIDIAN_ORG_ID)
    assert len(all_mm) == 6
    model_ids = {m["model_id"] for m in all_mm}
    assert model_ids == {
        "compliance-profile",
        "recurring-failures",
        "facility-weaknesses",
        "corrective-action-effectiveness",
        "emerging-operational-risks",
        "lessons-learned"
    }


@pytest.mark.asyncio
async def test_cross_facility_and_lesson_recall():
    # 1. Cross-facility fire safety recall
    fire_memories = await hindsight_service.arecall(
        org_id=MERIDIAN_ORG_ID,
        query="cross-facility fire egress staging pallets"
    )
    assert len(fire_memories) >= 1
    assert any("FAC-001" in m["content"] or "staging" in m["content"] for m in fire_memories)

    # 2. Machine guard durability lesson recall
    guard_memories = await hindsight_service.arecall(
        org_id=MERIDIAN_ORG_ID,
        query="machine guard interlock procedural training failure"
    )
    assert len(guard_memories) >= 1
    assert any("interlock" in m["content"].lower() for m in guard_memories)


@pytest.mark.asyncio
async def test_idempotent_retry_and_tenant_memory_isolation():
    """Verify that retrying a retain operation prevents duplicate events and isolates tenant banks."""
    test_content = "Confidential hazard: Unauthorized forklift modification in charging aisle."
    doc_id = "IDEMP-TEST-001"

    # Retain once for Meridian
    res1 = await hindsight_service.aretain(
        org_id=MERIDIAN_ORG_ID,
        content=test_content,
        document_id=doc_id,
        metadata={"category": "AUDIT_FACT"}
    )
    assert res1["status"] in ["retained", "already_retained"]

    # Retain again (retry): Must be caught by idempotency check
    res2 = await hindsight_service.aretain(
        org_id=MERIDIAN_ORG_ID,
        content=test_content,
        document_id=doc_id,
        metadata={"category": "AUDIT_FACT"}
    )
    assert res2["status"] == "already_retained"
    assert res2["idempotent"] is True

    # Check tenant isolation
    other_org_id = "00000000-0000-0000-0000-000000000099"
    other_recalled = await hindsight_service.arecall(
        org_id=other_org_id,
        query="Unauthorized forklift modification"
    )
    assert not any("charging aisle" in str(m) for m in other_recalled)
