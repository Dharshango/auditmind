from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.finding import FindingBase, FindingResponse


class ParsedFinding(FindingBase):
    evidence_notes: Optional[str] = None
    source_page: Optional[int] = 1


class ParsedAuditReport(BaseModel):
    audit_number: str
    facility_code: str
    title: str
    audit_type: str
    auditor_name: str
    audit_date: date
    compliance_score: float = 100.0
    summary: Optional[str] = None
    findings: List[ParsedFinding] = []
    scanned_pages_detected: List[int] = []
    ocr_applied: bool = False
    validation_status: str = "VALIDATED"


class AuditResponse(BaseModel):
    id: str
    organization_id: str
    facility_id: str
    audit_number: str
    title: str
    audit_type: str
    auditor_name: str
    audit_date: date
    status: str
    compliance_score: float
    summary: Optional[str] = None
    report_file_path: Optional[str] = None
    created_at: datetime
    findings: List[FindingResponse] = []

    model_config = ConfigDict(from_attributes=True)
