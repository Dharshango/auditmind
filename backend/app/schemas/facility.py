from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, ConfigDict


class FacilityBase(BaseModel):
    facility_code: str
    name: str
    facility_type: str
    location: str
    metadata_json: Optional[Dict[str, Any]] = None


class FacilityResponse(FacilityBase):
    id: str
    organization_id: str
    created_at: datetime
    audit_count: int = 0
    open_findings_count: int = 0
    risk_score: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class FacilityListResponse(BaseModel):
    facilities: List[FacilityResponse]
