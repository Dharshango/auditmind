from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_org_id
from app.models import Finding, Facility, Audit, CorrectiveAction, Evidence

router = APIRouter(prefix="/findings", tags=["Findings & Evidence"])


@router.get("")
async def list_findings(
    severity: Optional[str] = None,
    category: Optional[str] = None,
    is_recurring: Optional[bool] = None,
    facility_code: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Finding, Facility, Audit)
        .join(Facility, Finding.facility_id == Facility.id)
        .join(Audit, Finding.audit_id == Audit.id)
        .where(Finding.organization_id == org_id)
    )
    if severity:
        stmt = stmt.where(Finding.severity == severity.upper())
    if category:
        stmt = stmt.where(Finding.category.ilike(f"%{category}%"))
    if is_recurring is not None:
        stmt = stmt.where(Finding.is_recurring == is_recurring)
    if facility_code:
        stmt = stmt.where(Facility.facility_code == facility_code)
    if status:
        stmt = stmt.where(Finding.status == status.upper())

    stmt = stmt.order_by(Audit.audit_date.desc()).offset(offset).limit(limit)
    rows = (await db.execute(stmt)).all()

    findings = []
    for f, fac, a in rows:
        findings.append({
            "id": f.id,
            "finding_code": f.finding_code,
            "title": f.title,
            "description": f.description,
            "category": f.category,
            "severity": f.severity,
            "regulation_ref": f.regulation_ref,
            "facility_code": fac.facility_code,
            "facility_name": fac.name,
            "audit_number": a.audit_number,
            "audit_date": a.audit_date.isoformat(),
            "status": f.status,
            "is_recurring": f.is_recurring,
            "recurrence_count": f.recurrence_count
        })

    return {"total": len(findings), "findings": findings}


@router.get("/{identifier}")
async def get_finding_detail(
    identifier: str,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Finding)
        .options(
            selectinload(Finding.facility),
            selectinload(Finding.audit),
            selectinload(Finding.evidence_items),
            selectinload(Finding.corrective_actions)
        )
        .where(
            Finding.organization_id == org_id,
            (Finding.id == identifier) | (Finding.finding_code == identifier)
        )
    )
    f = (await db.execute(stmt)).scalar_one_or_none()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")

    evidence = [
        {
            "id": e.id,
            "file_name": e.file_name,
            "file_type": e.file_type,
            "file_path": e.file_path,
            "hash_sha256": e.hash_sha256,
            "description": e.description,
            "captured_at": e.captured_at.isoformat()
        }
        for e in f.evidence_items
    ]

    capas = [
        {
            "id": ca.id,
            "ca_number": ca.ca_number,
            "title": ca.title,
            "action_type": ca.action_type,
            "assigned_to": ca.assigned_to,
            "status": ca.status,
            "effectiveness_status": ca.effectiveness_status,
            "recurrence_detected": ca.recurrence_detected,
            "due_date": ca.due_date.isoformat() if ca.due_date else None,
            "completed_date": ca.completed_date.isoformat() if ca.completed_date else None
        }
        for ca in f.corrective_actions
    ]

    return {
        "id": f.id,
        "finding_code": f.finding_code,
        "title": f.title,
        "description": f.description,
        "category": f.category,
        "severity": f.severity,
        "regulation_ref": f.regulation_ref,
        "facility_code": f.facility.facility_code if f.facility else "UNKNOWN",
        "facility_name": f.facility.name if f.facility else "UNKNOWN",
        "audit_number": f.audit.audit_number if f.audit else "UNKNOWN",
        "audit_date": f.audit.audit_date.isoformat() if f.audit else None,
        "status": f.status,
        "is_recurring": f.is_recurring,
        "recurrence_count": f.recurrence_count,
        "evidence": evidence,
        "corrective_actions": capas
    }


@router.get("/{identifier}/evidence")
async def get_finding_evidence(
    identifier: str,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Evidence)
        .join(Finding, Evidence.finding_id == Finding.id)
        .where(
            Evidence.organization_id == org_id,
            (Finding.id == identifier) | (Finding.finding_code == identifier)
        )
    )
    rows = (await db.execute(stmt)).scalars().all()
    return {
        "evidence": [
            {
                "id": e.id,
                "file_name": e.file_name,
                "file_type": e.file_type,
                "file_path": e.file_path,
                "hash_sha256": e.hash_sha256,
                "description": e.description,
                "captured_at": e.captured_at.isoformat()
            }
            for e in rows
        ]
    }
