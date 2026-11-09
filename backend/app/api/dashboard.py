from fastapi import APIRouter, Depends
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_org_id
from app.models import Audit, Finding, CorrectiveAction, Facility

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])


@router.get("")
@router.get("/")
@router.get("/overview")
async def get_dashboard_overview(
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Computes real executive compliance metrics from structured database."""
    # 1. Audits count & avg score
    audit_stats = (await db.execute(
        select(
            func.count(Audit.id).label("total_audits"),
            func.avg(Audit.compliance_score).label("avg_score")
        ).where(Audit.organization_id == org_id)
    )).first()

    total_audits = audit_stats.total_audits or 0
    avg_compliance_score = round(float(audit_stats.avg_score or 0.0), 1)

    # 2. Findings counts
    total_findings = await db.scalar(
        select(func.count(Finding.id)).where(Finding.organization_id == org_id)
    ) or 0

    open_findings = await db.scalar(
        select(func.count(Finding.id)).where(
            Finding.organization_id == org_id,
            Finding.status.in_(["OPEN", "IN_REMEDIATION"])
        )
    ) or 0

    recurring_findings = await db.scalar(
        select(func.count(Finding.id)).where(
            Finding.organization_id == org_id,
            Finding.is_recurring == True
        )
    ) or 0

    recurrence_rate = round((recurring_findings / total_findings * 100), 1) if total_findings > 0 else 0.0

    # 3. CAPA stats
    total_capas = await db.scalar(
        select(func.count(CorrectiveAction.id)).where(CorrectiveAction.organization_id == org_id)
    ) or 0

    effective_capas = await db.scalar(
        select(func.count(CorrectiveAction.id)).where(
            CorrectiveAction.organization_id == org_id,
            CorrectiveAction.effectiveness_status == "EFFECTIVE"
        )
    ) or 0

    failed_capas = await db.scalar(
        select(func.count(CorrectiveAction.id)).where(
            CorrectiveAction.organization_id == org_id,
            CorrectiveAction.effectiveness_status == "FAILED_RECURRED"
        )
    ) or 0

    completed_capas = await db.scalar(
        select(func.count(CorrectiveAction.id)).where(
            CorrectiveAction.organization_id == org_id,
            CorrectiveAction.status == "COMPLETED"
        )
    ) or 0

    # The central metric: Effectiveness rate
    effectiveness_rate = round((effective_capas / completed_capas * 100), 1) if completed_capas > 0 else 0.0

    # 4. Facility Risk Rankings
    fac_stmt = (
        select(
            Facility.facility_code,
            Facility.name,
            Facility.facility_type,
            func.count(Finding.id).label("findings_count"),
            func.sum(case((Finding.severity == "CRITICAL", 1), else_=0)).label("critical_count"),
            func.sum(case((Finding.is_recurring == True, 1), else_=0)).label("recurring_count")
        )
        .outerjoin(Finding, Facility.id == Finding.facility_id)
        .where(Facility.organization_id == org_id)
        .group_by(Facility.id)
    )
    fac_rows = (await db.execute(fac_stmt)).all()

    facilities_ranked = []
    for r in fac_rows:
        f_count = r.findings_count or 0
        crit = r.critical_count or 0
        rec = r.recurring_count or 0
        # Risk score formula
        risk_score = round((crit * 3.0) + (rec * 2.0) + (f_count * 0.5), 1)

        facilities_ranked.append({
            "facility_code": r.facility_code,
            "name": r.name,
            "facility_type": r.facility_type,
            "findings_count": f_count,
            "critical_count": crit,
            "recurring_count": rec,
            "risk_score": risk_score
        })

    facilities_ranked.sort(key=lambda x: x["risk_score"], reverse=True)

    return {
        "organization_id": org_id,
        "total_audits": total_audits,
        "avg_compliance_score": avg_compliance_score,
        "total_findings": total_findings,
        "open_findings": open_findings,
        "recurring_findings": recurring_findings,
        "recurrence_rate_percent": recurrence_rate,
        "total_capas": total_capas,
        "completed_capas": completed_capas,
        "effective_capas": effective_capas,
        "failed_recurred_capas": failed_capas,
        "effectiveness_rate_percent": effectiveness_rate,
        "facilities_ranking": facilities_ranked
    }


@router.get("/drift-matrix")
async def get_compliance_drift_matrix(
    org_id: str = Depends(get_current_org_id),
    db: AsyncSession = Depends(get_db)
):
    """Returns compliance drift heatmap aggregated by category and facility."""
    stmt = (
        select(
            Finding.category,
            Facility.facility_code,
            func.count(Finding.id).label("findings_count"),
            func.sum(case((Finding.is_recurring == True, 1), else_=0)).label("recurrences")
        )
        .join(Facility, Finding.facility_id == Facility.id)
        .where(Finding.organization_id == org_id)
        .group_by(Finding.category, Facility.facility_code)
    )
    rows = (await db.execute(stmt)).all()

    matrix = {}
    for r in rows:
        cat = r.category
        if cat not in matrix:
            matrix[cat] = {"category": cat, "facilities": {}, "total_findings": 0, "total_recurrences": 0}
        matrix[cat]["facilities"][r.facility_code] = {
            "count": r.findings_count,
            "recurrences": r.recurrences or 0
        }
        matrix[cat]["total_findings"] += r.findings_count
        matrix[cat]["total_recurrences"] += (r.recurrences or 0)

    # Convert to list sorted by highest recurrence
    result = list(matrix.values())
    result.sort(key=lambda x: x["total_recurrences"], reverse=True)
    return {"drift_matrix": result}
