import pytest
from sqlalchemy import select, func
from app.core.database import AsyncSessionLocal
from app.models import AgentEvent
from app.services.agent_tools import agent_tool_dispatcher
from app.services.verification_engine import verification_engine
from app.services.compliance_agent import compliance_agent
from app.services.hindsight_service import hindsight_service
from app.data.seed_meridian import MERIDIAN_ORG_ID


@pytest.mark.asyncio
async def test_tool_search_audits():
    res = await agent_tool_dispatcher.execute_tool(
        org_id=MERIDIAN_ORG_ID,
        tool_name="search_audits",
        arguments={"facility_code": "FAC-001", "limit": 3}
    )
    assert res["total_found"] >= 1
    assert res["audits"][0]["facility_code"] == "FAC-001"


@pytest.mark.asyncio
async def test_tool_get_finding_history():
    res = await agent_tool_dispatcher.execute_tool(
        org_id=MERIDIAN_ORG_ID,
        tool_name="get_finding_history",
        arguments={"category": "Fire Safety", "include_remedies": True}
    )
    assert res["occurrences_count"] >= 1
    assert "history" in res
    assert "corrective_actions" in res["history"][0]


@pytest.mark.asyncio
async def test_tool_recall_organizational_memory():
    """Verify tool_recall_organizational_memory recalls long-term lessons."""
    await hindsight_service.aretain(
        org_id=MERIDIAN_ORG_ID,
        content="Historical lesson: Emergency exit door blocked at Plant A due to staging overflow.",
        metadata={"category": "LESSON_LEARNED", "facility_code": "FAC-001"}
    )
    res = await agent_tool_dispatcher.execute_tool(
        org_id=MERIDIAN_ORG_ID,
        tool_name="recall_organizational_memory",
        arguments={"query": "exit door blocked"}
    )
    assert "memories" in res
    assert res["recalled_memories_count"] >= 1
    assert any("exit door" in m["content"].lower() for m in res["memories"])


@pytest.mark.asyncio
async def test_tool_analyze_recurring_failures():
    """Verify tool_analyze_recurring_failures identifies multi-site clusters."""
    res = await agent_tool_dispatcher.execute_tool(
        org_id=MERIDIAN_ORG_ID,
        tool_name="analyze_recurring_failures",
        arguments={"category": "Fire Safety"}
    )
    assert res["categories_with_recurrence"] >= 1
    assert "recurrence_clusters" in res
    assert len(res["recurrence_clusters"]) >= 1
    assert "Fire Safety" in res["recurrence_clusters"][0]["category"]


@pytest.mark.asyncio
async def test_tool_verify_corrective_action():
    # Machine guarding CAPA (Scenario B) -> must be FAILED_RECURRED
    res_b = await agent_tool_dispatcher.execute_tool(
        org_id=MERIDIAN_ORG_ID,
        tool_name="verify_corrective_action",
        arguments={"corrective_action_id": "CAPA-2026-003"}
    )
    assert res_b["effectiveness_status"] == "FAILED_RECURRED"
    assert res_b["is_effective"] is False
    assert "Recurrence detected" in res_b["reason"]

    # Chemical containment CAPA (Scenario D) -> must be EFFECTIVE
    res_d = await agent_tool_dispatcher.execute_tool(
        org_id=MERIDIAN_ORG_ID,
        tool_name="verify_corrective_action",
        arguments={"corrective_action_id": "CAPA-2026-005"}
    )
    assert res_d["effectiveness_status"] == "EFFECTIVE"
    assert res_d["is_effective"] is True


@pytest.mark.asyncio
async def test_tool_create_remediation_task_human_approval():
    res = await agent_tool_dispatcher.execute_tool(
        org_id=MERIDIAN_ORG_ID,
        tool_name="create_remediation_task",
        arguments={
            "finding_code": "FIND-2026-003",
            "proposed_action": "Install dual-channel safety relay interlock",
            "action_type": "ENGINEERING",
            "priority": "CRITICAL",
            "assignee": "Plant A Maintenance Lead"
        }
    )
    assert res["status"] == "PROPOSED_AWAITING_HUMAN_APPROVAL"
    assert res["requires_human_approval"] is True


@pytest.mark.asyncio
async def test_agent_run_8_point_structured_contract():
    query = "Investigate the recurring interlock switch bypass on stamping presses at Plant A"
    result = await compliance_agent.run(MERIDIAN_ORG_ID, query)

    assert "response" in result
    resp = result["response"]

    # Verify all 8 required sections are present
    assert "1. **Finding**" in resp
    assert "2. **Historical Context**" in resp
    assert "3. **Relevant Records**" in resp
    assert "4. **Evidence References**" in resp
    assert "5. **Recurring Pattern**" in resp
    assert "6. **Possible Explanation**" in resp
    assert "7. **Confidence and Limitations**" in resp
    assert "8. **Recommended Next Action**" in resp

    # Verify content insights
    assert "FAILED_RECURRED" in resp or "recur" in resp.lower()
    assert "Human Approval" in resp

    # Verify event logged in DB
    async with AsyncSessionLocal() as session:
        count = await session.scalar(
            select(func.count(AgentEvent.id)).where(AgentEvent.organization_id == MERIDIAN_ORG_ID)
        )
        assert count >= 1
