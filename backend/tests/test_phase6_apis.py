import io
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.data.seed_meridian import MERIDIAN_ORG_ID
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models import Finding, Evidence

HEADERS = {"X-Organization-Id": MERIDIAN_ORG_ID}


@pytest.mark.asyncio
async def test_health_apis():
    """Verify GET /health, /api/health/database, /api/health/hindsight, /api/health/llm."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. GET /health
        r1 = await ac.get("/health")
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["status"] == "healthy"
        assert "AUDITMIND" in d1["service"]

        # 2. GET /api/health/database
        r2 = await ac.get("/api/health/database")
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["connected"] is True
        assert d2["audit_count"] >= 40
        assert d2["latency_ms"] >= 0

        # 3. GET /api/health/hindsight
        r3 = await ac.get("/api/health/hindsight")
        assert r3.status_code == 200
        d3 = r3.json()
        assert "service" in d3
        assert "bank_id" in d3

        # 4. GET /api/health/llm
        r4 = await ac.get("/api/health/llm")
        assert r4.status_code == 200
        d4 = r4.json()
        assert d4["provider"] == "Groq"
        assert "model" in d4


@pytest.mark.asyncio
async def test_dashboard_api():
    """Verify GET /api/dashboard."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/api/dashboard", headers=HEADERS)
        assert r.status_code == 200
        data = r.json()
        assert data["total_audits"] >= 40
        assert data["total_findings"] >= 120
        assert data["recurrence_rate_percent"] > 0
        assert "facilities_ranking" in data


@pytest.mark.asyncio
async def test_facilities_api():
    """Verify GET /api/facilities."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        r = await ac.get("/api/facilities", headers=HEADERS)
        assert r.status_code == 200
        data = r.json()
        assert "facilities" in data
        assert len(data["facilities"]) == 5
        codes = [f["facility_code"] for f in data["facilities"]]
        assert "FAC-001" in codes


@pytest.mark.asyncio
async def test_audits_api():
    """Verify GET /api/audits and POST /api/audits/upload."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # GET /api/audits
        r = await ac.get("/api/audits?limit=5&offset=0", headers=HEADERS)
        assert r.status_code == 200
        data = r.json()
        assert "audits" in data
        assert len(data["audits"]) <= 5

        # POST /api/audits/upload validation (reject non-pdf)
        txt_file = io.BytesIO(b"Not a PDF content")
        files = {"file": ("report.txt", txt_file, "text/plain")}
        r_upload_fail = await ac.post("/api/audits/upload", headers=HEADERS, files=files)
        assert r_upload_fail.status_code == 400


@pytest.mark.asyncio
async def test_findings_api():
    """Verify GET /api/findings and GET /api/findings/{id}."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # List findings with filter
        r = await ac.get("/api/findings?severity=CRITICAL&limit=10", headers=HEADERS)
        assert r.status_code == 200
        data = r.json()
        assert "findings" in data
        assert len(data["findings"]) >= 1

        # Finding by identifier
        finding_code = data["findings"][0]["finding_code"]
        r_detail = await ac.get(f"/api/findings/{finding_code}", headers=HEADERS)
        assert r_detail.status_code == 200
        detail = r_detail.json()
        assert detail["finding_code"] == finding_code
        assert "evidence" in detail
        assert "corrective_actions" in detail


@pytest.mark.asyncio
async def test_actions_api():
    """Verify GET /api/actions and POST /api/actions."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. GET /api/actions
        r_list = await ac.get("/api/actions?limit=5", headers=HEADERS)
        assert r_list.status_code == 200
        list_data = r_list.json()
        assert "corrective_actions" in list_data
        assert list_data["total"] >= 75

        # 2. POST /api/actions (Create new CAPA)
        new_action_payload = {
            "finding_code": "FIND-2026-001",
            "title": "Automated egress sensor installation",
            "proposed_action": "Install photoelectric laser beam sensors at emergency exit threshold.",
            "action_type": "ENGINEERING",
            "assigned_to": "Chief Safety Engineer",
            "due_date": "2026-12-15",
            "status": "ASSIGNED"
        }
        r_create = await ac.post("/api/actions", headers=HEADERS, json=new_action_payload)
        assert r_create.status_code == 201
        created = r_create.json()
        assert created["title"] == "Automated egress sensor installation"
        assert created["action_type"] == "ENGINEERING"
        assert created["status"] == "ASSIGNED"
        assert "CAPA-2026-" in created["ca_number"]


@pytest.mark.asyncio
async def test_agent_api():
    """Verify POST /api/agent/chat, /api/agent/recall, /api/agent/reflect."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. POST /api/agent/chat
        r_chat = await ac.post(
            "/api/agent/chat",
            headers=HEADERS,
            json={"message": "Investigate recurring exit door blockage across all plants"}
        )
        assert r_chat.status_code == 200
        chat_data = r_chat.json()
        assert "response" in chat_data
        assert len(chat_data["response"]) > 100

        # 2. POST /api/agent/recall
        r_recall = await ac.post(
            "/api/agent/recall",
            headers=HEADERS,
            json={"query": "stamping press guard bypass", "limit": 3}
        )
        assert r_recall.status_code == 200
        recall_data = r_recall.json()
        assert "memories" in recall_data
        assert "count" in recall_data

        # 3. POST /api/agent/reflect
        r_reflect = await ac.post(
            "/api/agent/reflect",
            headers=HEADERS,
            json={"query": "Summarize systemic safety compliance weaknesses"}
        )
        assert r_reflect.status_code == 200
        reflect_data = r_reflect.json()
        assert "reflection" in reflect_data
        assert len(reflect_data["reflection"]) > 20


@pytest.mark.asyncio
async def test_analytics_and_evidence_api():
    """Verify GET /api/analytics/recurrence and GET /api/evidence/{id}."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. GET /api/analytics/recurrence
        r_rec = await ac.get("/api/analytics/recurrence", headers=HEADERS)
        assert r_rec.status_code == 200
        rec_data = r_rec.json()
        assert rec_data["recurring_findings_count"] > 0
        assert len(rec_data["recurrence_clusters"]) >= 1
        assert "facility_breakdowns" in rec_data

        # 2. GET /api/evidence/{id}
        async with AsyncSessionLocal() as session:
            ev = (await session.execute(
                select(Evidence).where(Evidence.organization_id == MERIDIAN_ORG_ID).limit(1)
            )).scalar_one()
            ev_id = ev.id

        r_ev = await ac.get(f"/api/evidence/{ev_id}", headers=HEADERS)
        assert r_ev.status_code == 200
        ev_data = r_ev.json()
        assert ev_data["id"] == ev_id
        assert "hash_sha256" in ev_data
        assert "finding_code" in ev_data


@pytest.mark.asyncio
async def test_authorization_and_error_handling():
    """Verify organization authorization gating and 403 / 404 error handling."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Invalid organization ID must return 403
        bad_headers = {"X-Organization-Id": "00000000-0000-0000-0000-999999999999"}
        r_unauth = await ac.get("/api/dashboard", headers=bad_headers)
        assert r_unauth.status_code == 403
        assert "Forbidden" in r_unauth.json()["detail"]

        # Missing finding detail returns 404
        r_notfound = await ac.get("/api/findings/FIND-NONEXISTENT-999", headers=HEADERS)
        assert r_notfound.status_code == 404

        # Missing evidence returns 404
        r_ev_notfound = await ac.get("/api/evidence/00000000-0000-0000-0000-000000000000", headers=HEADERS)
        assert r_ev_notfound.status_code == 404
