import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_org_id
from app.models import Evidence, Finding, Facility
from app.schemas.evidence import EvidenceResponse

logger = logging.getLogger("auditmind.evidence")
router = APIRouter(prefix="/evidence", tags=["Evidence & Chain-of-Custody"])


@router.get("/{evidence_id}", response_model=EvidenceResponse)
async def get_evidence_detail(
    evidence_id: str,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves immutable evidence item and its cryptographic hash within the tenant organization."""
    stmt = (
        select(Evidence, Finding, Facility)
        .join(Finding, Evidence.finding_id == Finding.id)
        .join(Facility, Finding.facility_id == Facility.id)
        .where(
            Evidence.organization_id == org_id,
            Evidence.id == evidence_id
        )
    )
    row = (await db.execute(stmt)).first()
    if not row:
        logger.info("Evidence item %s not found in org %s", evidence_id, org_id)
        raise HTTPException(status_code=404, detail=f"Evidence record '{evidence_id}' not found.")

    evidence, finding, facility = row
    return EvidenceResponse(
        id=evidence.id,
        organization_id=evidence.organization_id,
        finding_id=evidence.finding_id,
        file_name=evidence.file_name,
        file_type=evidence.file_type,
        file_path=evidence.file_path,
        hash_sha256=evidence.hash_sha256,
        file_size_bytes=getattr(evidence, "file_size_bytes", 0) or 0,
        description=evidence.description,
        captured_at=evidence.captured_at,
        finding_code=finding.finding_code,
        finding_title=finding.title,
        facility_code=facility.facility_code
    )
