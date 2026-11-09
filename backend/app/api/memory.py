from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from app.api.deps import get_current_org_id
from app.services.memory_manager import memory_manager
from app.services.hindsight_service import hindsight_service

router = APIRouter(prefix="/memory", tags=["Organizational Memory Explorer"])


@router.get("/status")
async def get_memory_bank_status(org_id: str = Depends(get_current_org_id)):
    """Returns the live status, memory counts, and health of the tenant's Hindsight memory bank."""
    return await memory_manager.get_memory_status(org_id)


@router.get("/search")
async def recall_compliance_memory(
    query: str = Query(..., description="Semantic search query across organizational compliance memory"),
    category: Optional[str] = Query(None, description="Optional category filter (AUDIT_FACT, LESSON, etc.)"),
    limit: int = Query(10, description="Max memories to return"),
    org_id: str = Depends(get_current_org_id)
):
    """Executes asynchronous Hindsight arecall for long-term operational patterns and lessons."""
    tags = [category.lower()] if category else None
    memories = await hindsight_service.arecall(
        org_id=org_id,
        query=query,
        tags=tags,
        limit=limit
    )
    return {
        "query": query,
        "category_filter": category,
        "count": len(memories),
        "results": memories
    }


@router.get("/mental-models")
async def get_all_mental_models(org_id: str = Depends(get_current_org_id)):
    """Retrieves high-level reflections across all 6 core compliance mental models."""
    models = await memory_manager.get_all_mental_models(org_id)
    return {"mental_models": models}


@router.get("/mental-models/{model_id}")
async def get_single_mental_model(
    model_id: str,
    org_id: str = Depends(get_current_org_id)
):
    """Synthesizes or retrieves a specific mental model (e.g. 'recurring-failures', 'compliance-profile')."""
    return await memory_manager.synthesize_mental_model(org_id, model_id)


@router.post("/sync")
async def sync_organization_history(org_id: str = Depends(get_current_org_id)):
    """Triggers complete synchronization of structured database history into Hindsight memory banks."""
    return await memory_manager.sync_organization_history_to_hindsight(org_id)
