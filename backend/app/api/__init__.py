from fastapi import APIRouter
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.facilities import router as facilities_router
from app.api.audits import router as audits_router
from app.api.findings import router as findings_router
from app.api.corrective_actions import router as corrective_actions_router
from app.api.memory import router as memory_router
from app.api.agent import router as agent_router
from app.api.analytics import router as analytics_router
from app.api.evidence import router as evidence_router

def build_api_routes() -> APIRouter:
    r = APIRouter()
    r.include_router(health_router)
    r.include_router(auth_router)
    r.include_router(dashboard_router)
    r.include_router(facilities_router)
    r.include_router(audits_router)
    r.include_router(findings_router)
    r.include_router(corrective_actions_router, prefix="/actions")
    r.include_router(corrective_actions_router, prefix="/corrective-actions")
    r.include_router(memory_router)
    r.include_router(agent_router)
    r.include_router(analytics_router)
    r.include_router(evidence_router)
    return r

# API routers for /api and /api/v1 prefixes
api_router = APIRouter(prefix="/api")
api_router.include_router(build_api_routes())

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(build_api_routes())

__all__ = ["api_router", "api_v1_router"]
