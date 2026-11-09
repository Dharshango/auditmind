from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class EvidenceResponse(BaseModel):
    id: str
    organization_id: str
    finding_id: str
    file_name: str
    file_type: str
    file_path: str
    hash_sha256: str
    file_size_bytes: int = 0
    description: Optional[str] = None
    captured_at: datetime
    finding_code: Optional[str] = None
    finding_title: Optional[str] = None
    facility_code: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
