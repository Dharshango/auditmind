import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.hindsight_service import hindsight_service


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AuditMind" in data["service"]


@pytest.mark.asyncio
async def test_hindsight_initialization():
    org_id = "test-org-001"
    bank = await hindsight_service.initialize_bank(org_id=org_id, org_name="Test Enterprise")
    assert bank["bank_id"] == "auditmind-org_test_org_001"
    assert bank["mental_models_registered"] == 6


@pytest.mark.asyncio
async def test_hindsight_retain_idempotency_and_recall():
    org_id = "test-org-002"
    finding_content = "FAC-001: Machine guard interlock bypassed on Stamping Press #4 creating pinch hazard."
    doc_id = "AUD-2026-001"
    metadata = {"facility_id": "FAC-001", "severity": "CRITICAL", "category": "MACHINE_SAFETY"}
    tags = ["safety", "machine_guard", "plant_a"]

    # 1. Retain initial event
    res1 = await hindsight_service.aretain(
        org_id=org_id,
        content=finding_content,
        document_id=doc_id,
        metadata=metadata,
        tags=tags
    )
    assert res1["status"] == "retained"
    assert "event_hash" in res1

    # 2. Retain identical event -> must be idempotent
    res2 = await hindsight_service.aretain(
        org_id=org_id,
        content=finding_content,
        document_id=doc_id,
        metadata=metadata,
        tags=tags
    )
    assert res2["status"] == "already_retained"
    assert res2["idempotent"] is True
    assert res2["event_hash"] == res1["event_hash"]

    # 3. Recall memory
    memories = await hindsight_service.arecall(
        org_id=org_id,
        query="stamping press machine guard hazard",
        tags=["safety"]
    )
    assert len(memories) >= 1
    assert "Stamping Press #4" in memories[0]["content"]
    assert memories[0]["metadata"]["severity"] == "CRITICAL"


@pytest.mark.asyncio
async def test_hindsight_reflect():
    org_id = "test-org-002"
    reflection = await hindsight_service.areflect(
        org_id=org_id,
        query="Evaluate machine guard safety trends"
    )
    assert "reflection" in reflection
    assert "auditmind-org_test_org_002" in reflection["bank_id"]
