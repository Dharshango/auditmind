from typing import Optional, Dict, Any
from pydantic import BaseModel


class SystemHealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    database: str
    hindsight_configured: bool
    groq_configured: bool


class DatabaseHealthResponse(BaseModel):
    status: str
    database_type: str
    connected: bool
    latency_ms: float
    organization_count: int
    facility_count: int
    audit_count: int
    finding_count: int


class HindsightHealthResponse(BaseModel):
    status: str
    service: str
    bank_id: str
    base_url: str
    cloud_connected: bool
    fallback_store_active: bool
    retained_memories_count: int


class LLMHealthResponse(BaseModel):
    status: str
    provider: str
    model: str
    configured: bool
    fallback_available: bool
    latency_ms: Optional[float] = None
