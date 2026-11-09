from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field


class CorrectiveActionBase(BaseModel):
    title: str = Field(..., description="Short summary of corrective action")
    proposed_action: str = Field(..., description="Detailed technical or procedural remedy")
    action_type: str = Field(default="PROCEDURAL", description="PROCEDURAL, ENGINEERING, TRAINING, ADMINISTRATIVE")
    assigned_to: str = Field(..., description="Person, role, or team responsible")
    due_date: date = Field(..., description="Target completion date")
    status: str = Field(default="OPEN", description="OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, AWAITING_VERIFICATION, VERIFIED_EFFECTIVE, FAILED_VERIFICATION, RECURRENCE_DETECTED")


class CorrectiveActionCreate(CorrectiveActionBase):
    finding_code: Optional[str] = Field(None, description="Target finding code (e.g. FIND-2026-001)")
    finding_id: Optional[str] = Field(None, description="Target finding UUID")


class CorrectiveActionResponse(CorrectiveActionBase):
    id: str
    organization_id: str
    finding_id: str
    ca_number: str
    completed_date: Optional[date] = None
    effectiveness_status: str
    recurrence_detected: bool = False
    outcome_notes: Optional[str] = None
    created_at: datetime
    finding_code: Optional[str] = None
    facility_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CorrectiveActionListResponse(BaseModel):
    total: int
    offset: int
    limit: int
    corrective_actions: List[CorrectiveActionResponse]


class CorrectiveActionVerifyResponse(BaseModel):
    ca_number: str
    title: str
    action_type: str
    assigned_to: str
    facility_code: str
    completed_date: Optional[str] = None
    effectiveness_status: str
    is_effective: bool
    reason: str
    recurrences_detected_count: int
    recurrence_details: List[dict] = []
