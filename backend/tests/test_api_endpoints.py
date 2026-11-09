import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.data.seed_meridian import MERIDIAN_ORG_ID

HEADERS = {"X-Organization-Id": MERIDIAN_ORG_ID}


@pytest.mark.asyncio
async def test_dashboard_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Overview
        resp = await ac.get("/api/v1/dashboard/overview", headers=HEADERS)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_audits"] >= 40
        assert data["total_findings"] >= 120
        assert "recurrence_rate_percent" in data
        assert "effectiveness_rate_percent" in data
        assert len(data["facilities_ranking"]) == 5

        # Drift matrix
        drift_resp = await ac.get("/api/v1/dashboard/drift-matrix", headers=HEADERS)
        assert drift_resp.status_code == 200
        drift_data = drift_resp.json()
        assert "drift_matrix" in drift_data
        assert len(drift_data["drift_matrix"]) >= 4


@pytest.mark.asyncio
async def test_facilities_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/facilities", headers=HEADERS)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["facilities"]) == 5

        # Detail for FAC-001
        detail_resp = await ac.get("/api/v1/facilities/FAC-001", headers=HEADERS)
        assert detail_resp.status_code == 200
        detail = detail_resp.json()
        assert detail["facility_code"] == "FAC-001"
        assert len(detail["recent_audits"]) >= 1


@pytest.mark.asyncio
async def test_audits_and_findings_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Audits
        resp_audits = await ac.get("/api/v1/audits?limit=10", headers=HEADERS)
        assert resp_audits.status_code == 200
        assert resp_audits.json()["total"] >= 10

        # Findings
        resp_findings = await ac.get("/api/v1/findings?severity=CRITICAL", headers=HEADERS)
        assert resp_findings.status_code == 200
        findings = resp_findings.json()["findings"]
        assert len(findings) >= 1
        assert all(f["severity"] == "CRITICAL" for f in findings)


@pytest.mark.asyncio
async def test_corrective_actions_verify_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post("/api/v1/corrective-actions/CAPA-2026-003/verify", headers=HEADERS)
        assert resp.status_code == 200
        data = resp.json()
        assert data["ca_number"] == "CAPA-2026-003"
        assert data["effectiveness_status"] == "FAILED_RECURRED"


@pytest.mark.asyncio
async def test_memory_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Trigger Sync
        sync_resp = await ac.post("/api/v1/memory/sync", headers=HEADERS)
        assert sync_resp.status_code == 200
        assert sync_resp.json()["status"] == "synchronized"

        # Status
        status_resp = await ac.get("/api/v1/memory/status", headers=HEADERS)
        assert status_resp.status_code == 200
        status_data = status_resp.json()
        assert "bank_id" in status_data
        assert status_data["total_memories"] >= 5

        # Mental models
        mm_resp = await ac.get("/api/v1/memory/mental-models", headers=HEADERS)
        assert mm_resp.status_code == 200
        assert len(mm_resp.json()["mental_models"]) == 6


@pytest.mark.asyncio
async def test_agent_chat_and_events_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Agent Chat
        chat_resp = await ac.post(
            "/api/v1/agent/chat",
            headers=HEADERS,
            json={"message": "Analyze fire safety egress violations across facilities"}
        )
        assert chat_resp.status_code == 200
        chat_data = chat_resp.json()
        assert "response" in chat_data
        assert "1. **Finding**" in chat_data["response"]
        assert "8. **Recommended Next Action**" in chat_data["response"]

        # Agent Events
        events_resp = await ac.get("/api/v1/agent/events?limit=5", headers=HEADERS)
        assert events_resp.status_code == 200
        assert len(events_resp.json()["events"]) >= 1
