from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_org_id
from app.models import Audit, Facility, Finding
from app.services.ingestion_service import ingestion_service

router = APIRouter(prefix="/audits", tags=["Audits & Ingestion"])


@router.get("")
async def list_audits(
    facility_code: Optional[str] = None,
    audit_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Audit, Facility)
        .join(Facility, Audit.facility_id == Facility.id)
        .where(Audit.organization_id == org_id)
    )
    if facility_code:
        stmt = stmt.where(Facility.facility_code == facility_code)
    if audit_type:
        stmt = stmt.where(Audit.audit_type.ilike(f"%{audit_type}%"))

    stmt = stmt.order_by(Audit.audit_date.desc()).offset(offset).limit(limit)
    rows = (await db.execute(stmt)).all()

    audits = []
    for a, fac in rows:
        audits.append({
            "id": a.id,
            "audit_number": a.audit_number,
            "title": a.title,
            "facility_code": fac.facility_code,
            "facility_name": fac.name,
            "audit_type": a.audit_type,
            "auditor_name": a.auditor_name,
            "audit_date": a.audit_date.isoformat(),
            "status": a.status,
            "compliance_score": a.compliance_score
        })

    return {"total": len(audits), "audits": audits}


@router.get("/{identifier}")
async def get_audit_detail(
    identifier: str,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Audit)
        .options(
            selectinload(Audit.facility),
            selectinload(Audit.findings).selectinload(Finding.evidence_items),
            selectinload(Audit.findings).selectinload(Finding.corrective_actions)
        )
        .where(
            Audit.organization_id == org_id,
            (Audit.id == identifier) | (Audit.audit_number == identifier)
        )
    )
    audit = (await db.execute(stmt)).scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")

    findings = []
    for f in audit.findings:
        findings.append({
            "id": f.id,
            "finding_code": f.finding_code,
            "title": f.title,
            "description": f.description,
            "category": f.category,
            "severity": f.severity,
            "regulation_ref": f.regulation_ref,
            "status": f.status,
            "is_recurring": f.is_recurring,
            "recurrence_count": f.recurrence_count,
            "evidence_count": len(f.evidence_items),
            "capa_count": len(f.corrective_actions)
        })

    return {
        "id": audit.id,
        "audit_number": audit.audit_number,
        "title": audit.title,
        "facility_code": audit.facility.facility_code if audit.facility else "UNKNOWN",
        "facility_name": audit.facility.name if audit.facility else "UNKNOWN",
        "audit_type": audit.audit_type,
        "auditor_name": audit.auditor_name,
        "audit_date": audit.audit_date.isoformat(),
        "status": audit.status,
        "compliance_score": audit.compliance_score,
        "summary": audit.summary,
        "report_file_path": audit.report_file_path,
        "findings": findings
    }


@router.post("/upload")
async def upload_audit_report_pdf(
    file: UploadFile = File(...),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Uploads, parses, and ingests an audit report PDF into database and Hindsight memory."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for audit report ingestion.")

    content = await file.read()
    try:
        result = await ingestion_service.ingest_audit_pdf(
            session=db,
            organization_id=org_id,
            pdf_bytes=content,
            filename=file.filename
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
