import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Body, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_org_id
from app.models import AgentEvent
from app.services.compliance_agent import compliance_agent
from app.services.hindsight_service import hindsight_service
from app.schemas.agent import (
    AgentChatRequest,
    AgentChatResponse,
    AgentRecallRequest,
    AgentRecallResponse,
    AgentReflectRequest,
    AgentReflectResponse,
    RecalledMemoryItem
)

logger = logging.getLogger("auditmind.agent")
router = APIRouter(prefix="/agent", tags=["AUDITMIND Compliance Agent"])


@router.post("/chat", response_model=AgentChatResponse)
async def chat_with_compliance_agent(
    payload: AgentChatRequest = Body(...),
    org_id: str = Depends(get_current_org_id)
):
    """Executes AUDITMIND Compliance Agent with Groq tool calling, Hindsight memory recall, and 8-point structured response."""
    history_dicts = [{"role": m.role, "content": m.content} for m in payload.history]
    result = await compliance_agent.run(
        org_id=org_id,
        user_query=payload.message,
        chat_history=history_dicts
    )
    return result


@router.post("/recall", response_model=AgentRecallResponse)
async def recall_organizational_memories(
    payload: AgentRecallRequest = Body(...),
    org_id: str = Depends(get_current_org_id)
):
    """Direct cognitive recall across persistent compliance memory banks in Hindsight."""
    memories = await hindsight_service.arecall(
        org_id=org_id,
        query=payload.query,
        tags=payload.tags,
        limit=payload.limit
    )

    formatted = [
        RecalledMemoryItem(
            content=m.get("content", ""),
            category=m.get("metadata", {}).get("category", "EXPERIENTIAL"),
            facility=m.get("metadata", {}).get("facility_code", "CROSS_FACILITY"),
            score=round(float(m.get("score", 1.0)), 2),
            tags=m.get("tags", []),
            timestamp=m.get("timestamp")
        )
        for m in memories
    ]

    return AgentRecallResponse(
        query=payload.query,
        count=len(formatted),
        memories=formatted
    )


@router.post("/reflect", response_model=AgentReflectResponse)
async def reflect_organizational_memories(
    payload: AgentReflectRequest = Body(...),
    org_id: str = Depends(get_current_org_id)
):
    """High-order cognitive reflection across multi-event compliance memory streams."""
    res = await hindsight_service.areflect(
        org_id=org_id,
        query=payload.query,
        tags=payload.tags
    )
    reflection_text = res.get("reflection", str(res)) if isinstance(res, dict) else str(res)

    return AgentReflectResponse(
        query=payload.query,
        reflection=reflection_text,
        status="completed"
    )


@router.get("/events")
async def get_agent_events_ledger(
    limit: int = Query(20, ge=1, le=100),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Returns the immutable audit trail of agent reasoning, tool calls, and inputs/outputs."""
    stmt = (
        select(AgentEvent)
        .where(AgentEvent.organization_id == org_id)
        .order_by(AgentEvent.created_at.desc())
        .limit(limit)
    )
    rows = (await db.execute(stmt)).scalars().all()
    return {
        "total_events": len(rows),
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "tool_name": e.tool_name,
                "tool_input": e.tool_input,
                "tool_output": e.tool_output,
                "agent_reasoning": e.agent_reasoning,
                "confidence_score": e.confidence_score,
                "timestamp": e.created_at.isoformat()
            }
            for e in rows
        ]
    }
