from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class FindingBase(BaseModel):
    finding_code: str
    title: str
    description: str
    category: str
    severity: str
    regulation_ref: Optional[str] = None
    status: str = "OPEN"
    is_recurring: bool = False
    recurrence_count: int = 0


class FindingCreate(FindingBase):
    audit_id: str
    facility_id: str
    organization_id: str


class FindingResponse(FindingBase):
    id: str
    organization_id: str
    audit_id: str
    facility_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
