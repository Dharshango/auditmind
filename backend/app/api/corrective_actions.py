import logging
from typing import Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_org_id
from app.models import CorrectiveAction, Finding, Facility, Verification
from app.services.verification_engine import verification_engine
from app.services.hindsight_service import hindsight_service
from app.schemas.corrective_action import (
    CorrectiveActionCreate,
    CorrectiveActionResponse,
    CorrectiveActionListResponse,
    CorrectiveActionVerifyResponse
)

logger = logging.getLogger("auditmind.actions")
router = APIRouter(tags=["Corrective Actions & Verifications"])


@router.get("", response_model=CorrectiveActionListResponse)
@router.get("/", response_model=CorrectiveActionListResponse)
async def list_corrective_actions(
    effectiveness: Optional[str] = Query(None, description="Filter by effectiveness status (e.g. EFFECTIVE, FAILED_RECURRED, PENDING)"),
    action_type: Optional[str] = Query(None, description="Filter by action type (ENGINEERING, PROCEDURAL, TRAINING, ADMINISTRATIVE)"),
    status: Optional[str] = Query(None, description="Filter by status (OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, AWAITING_VERIFICATION, VERIFIED_EFFECTIVE, FAILED_VERIFICATION, RECURRENCE_DETECTED)"),
    facility_code: Optional[str] = Query(None, description="Filter by facility code (e.g. FAC-001)"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Lists corrective actions with multi-field filtering and pagination."""
    stmt = (
        select(CorrectiveAction, Finding, Facility)
        .join(Finding, CorrectiveAction.finding_id == Finding.id)
        .join(Facility, Finding.facility_id == Facility.id)
        .where(CorrectiveAction.organization_id == org_id)
    )
    if effectiveness:
        stmt = stmt.where(CorrectiveAction.effectiveness_status == effectiveness.upper())
    if action_type:
        stmt = stmt.where(CorrectiveAction.action_type == action_type.upper())
    if status:
        stmt = stmt.where(CorrectiveAction.status == status.upper())
    if facility_code:
        stmt = stmt.where(Facility.facility_code == facility_code.upper())

    total = await db.scalar(
        select(func.count(CorrectiveAction.id)).where(CorrectiveAction.organization_id == org_id)
    ) or 0

    stmt = stmt.order_by(CorrectiveAction.created_at.desc()).offset(offset).limit(limit)
    rows = (await db.execute(stmt)).all()

    capas = []
    for ca, f, fac in rows:
        capas.append(
            CorrectiveActionResponse(
                id=ca.id,
                organization_id=ca.organization_id,
                finding_id=ca.finding_id,
                ca_number=ca.ca_number,
                title=ca.title,
                proposed_action=ca.proposed_action,
                action_type=ca.action_type,
                assigned_to=ca.assigned_to,
                due_date=ca.due_date,
                completed_date=ca.completed_date,
                status=ca.status,
                effectiveness_status=ca.effectiveness_status,
                recurrence_detected=ca.recurrence_detected,
                outcome_notes=ca.outcome_notes,
                created_at=ca.created_at,
                finding_code=f.finding_code,
                facility_code=fac.facility_code
            )
        )

    return CorrectiveActionListResponse(
        total=total,
        offset=offset,
        limit=limit,
        corrective_actions=capas
    )


@router.post("", response_model=CorrectiveActionResponse, status_code=201)
@router.post("/", response_model=CorrectiveActionResponse, status_code=201)
async def create_corrective_action(
    payload: CorrectiveActionCreate,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Creates a new corrective action with request validation and retains into Hindsight memory."""
    # Resolve target finding
    finding = None
    if payload.finding_code:
        stmt = select(Finding).options(selectinload(Finding.facility)).where(
            Finding.organization_id == org_id,
            Finding.finding_code == payload.finding_code
        )
        finding = (await db.execute(stmt)).scalar_one_or_none()
    elif payload.finding_id:
        stmt = select(Finding).options(selectinload(Finding.facility)).where(
            Finding.organization_id == org_id,
            Finding.id == payload.finding_id
        )
        finding = (await db.execute(stmt)).scalar_one_or_none()

    if not finding:
        raise HTTPException(
            status_code=404,
            detail=f"Target finding '{payload.finding_code or payload.finding_id}' not found in organization."
        )

    # Generate guaranteed unique sequential ca_number
    ca_count = await db.scalar(
        select(func.count(CorrectiveAction.id)).where(CorrectiveAction.organization_id == org_id)
    ) or 0
    idx = ca_count + 1
    while True:
        candidate_num = f"CAPA-2026-{idx:03d}"
        exists = await db.scalar(
            select(func.count(CorrectiveAction.id)).where(
                CorrectiveAction.organization_id == org_id,
                CorrectiveAction.ca_number == candidate_num
            )
        )
        if not exists:
            ca_number = candidate_num
            break
        idx += 1

    new_ca = CorrectiveAction(
        organization_id=org_id,
        finding_id=finding.id,
        ca_number=ca_number,
        title=payload.title,
        proposed_action=payload.proposed_action,
        action_type=payload.action_type.upper(),
        assigned_to=payload.assigned_to,
        due_date=payload.due_date,
        status=payload.status.upper(),
        effectiveness_status="PENDING",
        recurrence_detected=False,
        outcome_notes=f"Created via AUDITMIND Compliance API for finding {finding.finding_code}."
    )
    db.add(new_ca)
    await db.commit()
    await db.refresh(new_ca)

    # Retain CAPA decision into Hindsight memory bank
    try:
        await hindsight_service.aretain(
            org_id=org_id,
            content=(
                f"Corrective Action Decision {ca_number}: '{new_ca.title}' "
                f"assigned to {new_ca.assigned_to} for {finding.finding_code}. "
                f"Action type: {new_ca.action_type}. Proposed: {new_ca.proposed_action}"
            ),
            document_id=ca_number,
            metadata={
                "category": "CAPA_DECISION",
                "finding_code": finding.finding_code,
                "action_type": new_ca.action_type,
                "ca_number": ca_number
            },
            tags=["capa", new_ca.action_type.lower(), "remediation"]
        )
    except Exception as e:
        logger.warning("Hindsight memory retention note for %s: %s", ca_number, e)

    return CorrectiveActionResponse(
        id=new_ca.id,
        organization_id=new_ca.organization_id,
        finding_id=new_ca.finding_id,
        ca_number=new_ca.ca_number,
        title=new_ca.title,
        proposed_action=new_ca.proposed_action,
        action_type=new_ca.action_type,
        assigned_to=new_ca.assigned_to,
        due_date=new_ca.due_date,
        completed_date=new_ca.completed_date,
        status=new_ca.status,
        effectiveness_status=new_ca.effectiveness_status,
        recurrence_detected=new_ca.recurrence_detected,
        outcome_notes=new_ca.outcome_notes,
        created_at=new_ca.created_at,
        finding_code=finding.finding_code,
        facility_code=finding.facility.facility_code if finding.facility else None
    )


@router.post("/{identifier}/verify", response_model=CorrectiveActionVerifyResponse)
async def verify_corrective_action_durability(
    identifier: str,
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Deterministically verifies if a completed CAPA prevented recurrence or failed."""
    result = await verification_engine.evaluate_corrective_action(
        session=db,
        organization_id=org_id,
        ca_identifier=identifier
    )
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/approve-task")
async def approve_remediation_task(
    payload: dict = Body(...),
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Human-in-the-loop approval confirmation to commit a proposed remediation task."""
    finding_code = payload.get("finding_code")
    proposed_action = payload.get("proposed_action")
    action_type = payload.get("action_type", "ENGINEERING")
    assignee = payload.get("assignee", "Compliance Officer")
    approver = payload.get("approver", "Authorized Compliance Lead")

    stmt = select(Finding).where(Finding.organization_id == org_id, Finding.finding_code == finding_code)
    finding = (await db.execute(stmt)).scalar_one_or_none()
    if not finding:
        raise HTTPException(status_code=404, detail=f"Finding '{finding_code}' not found.")

    ca_count = await db.scalar(select(func.count(CorrectiveAction.id)).where(CorrectiveAction.organization_id == org_id)) or 0
    new_ca_num = f"CAPA-2026-{(ca_count + 1):03d}"

    new_ca = CorrectiveAction(
        organization_id=org_id,
        finding_id=finding.id,
        ca_number=new_ca_num,
        title=f"Approved Remediation for {finding.finding_code}",
        proposed_action=proposed_action,
        action_type=action_type,
        assigned_to=assignee,
        due_date=date.today(),
        status="OPEN",
        effectiveness_status="PENDING",
        outcome_notes=f"Human approval granted by {approver} on {date.today().isoformat()}."
    )
    db.add(new_ca)
    await db.commit()

    return {
        "status": "APPROVED_AND_CREATED",
        "ca_number": new_ca.ca_number,
        "finding_code": finding.finding_code,
        "action_type": new_ca.action_type,
        "assigned_to": new_ca.assigned_to,
        "approver": approver
    }
