from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_org_id
from app.models import Facility, Audit, Finding

router = APIRouter(prefix="/facilities", tags=["Facilities"])


@router.get("")
async def list_facilities(
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(
            Facility,
            func.count(Audit.id).label("audit_count")
        )
        .outerjoin(Audit, Facility.id == Audit.facility_id)
        .where(Facility.organization_id == org_id)
        .group_by(Facility.id)
        .order_by(Facility.facility_code.asc())
    )
    rows = (await db.execute(stmt)).all()

    results = []
    for fac, a_count in rows:
        results.append({
            "id": fac.id,
            "facility_code": fac.facility_code,
            "name": fac.name,
            "facility_type": fac.facility_type,
            "location": fac.location,
            "metadata": fac.metadata_json,
            "audit_count": a_count or 0
        })

    return {"facilities": results}


@router.get("/{identifier}")
async def get_facility_detail(
    identifier: str,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Facility)
        .options(
            selectinload(Facility.audits),
            selectinload(Facility.findings)
        )
        .where(
            Facility.organization_id == org_id,
            (Facility.id == identifier) | (Facility.facility_code == identifier)
        )
    )
    fac = (await db.execute(stmt)).scalar_one_or_none()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    recent_audits = [
        {
            "id": a.id,
            "audit_number": a.audit_number,
            "title": a.title,
            "date": a.audit_date.isoformat(),
            "compliance_score": a.compliance_score,
            "status": a.status
        }
        for a in sorted(fac.audits, key=lambda x: x.audit_date, reverse=True)[:5]
    ]

    open_findings = [
        {
            "id": f.id,
            "finding_code": f.finding_code,
            "title": f.title,
            "severity": f.severity,
            "category": f.category,
            "status": f.status,
            "is_recurring": f.is_recurring,
            "recurrence_count": f.recurrence_count
        }
        for f in fac.findings if f.status in ["OPEN", "IN_REMEDIATION"]
    ]

    return {
        "id": fac.id,
        "facility_code": fac.facility_code,
        "name": fac.name,
        "facility_type": fac.facility_type,
        "location": fac.location,
        "metadata": fac.metadata_json,
        "total_audits": len(fac.audits),
        "total_findings": len(fac.findings),
        "open_findings_count": len(open_findings),
        "recent_audits": recent_audits,
        "open_findings": open_findings
    }
