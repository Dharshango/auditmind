from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import CorrectiveAction, Finding, Audit, Facility


class VerificationEngine:
    """Deterministic CAPA Durability & Recurrence Verification Engine.
    
    A completed corrective action must never automatically be considered effective.
    This engine deterministically checks post-closure audit history for recurring failure modes.
    """

    RECURRENCE_WINDOW_DAYS = 90

    # Words that describe generic compliance attributes rather than the specific failure mode
    GENERIC_STOP_WORDS = {
        "with", "that", "from", "door", "room", "operator", "operators", "area",
        "and", "the", "in", "for", "secondary", "chemical", "missing", "annual",
        "standard", "safety", "operational", "procedure", "periodic", "review",
        "inspection", "report", "requirements", "general", "equipment"
    }

    async def evaluate_corrective_action(
        self,
        session: AsyncSession,
        organization_id: str,
        ca_identifier: str  # id or ca_number
    ) -> Dict[str, Any]:
        """Evaluates whether a CAPA permanently eliminated the non-conformance."""
        # 1. Fetch CAPA with parent finding and facility
        stmt = (
            select(CorrectiveAction, Finding, Facility)
            .join(Finding, CorrectiveAction.finding_id == Finding.id)
            .join(Facility, Finding.facility_id == Facility.id)
            .where(
                CorrectiveAction.organization_id == organization_id,
                (CorrectiveAction.id == ca_identifier) | (CorrectiveAction.ca_number == ca_identifier)
            )
        )
        row = (await session.execute(stmt)).first()
        if not row:
            return {
                "error": f"Corrective Action '{ca_identifier}' not found in organization."
            }

        ca, parent_finding, facility = row

        # If not marked completed, status is pending
        if ca.status != "COMPLETED" or not ca.completed_date:
            return {
                "ca_number": ca.ca_number,
                "facility": facility.facility_code,
                "current_status": ca.status,
                "effectiveness_status": "PENDING",
                "is_effective": False,
                "reason": "Corrective action has not yet been physically or procedurally completed."
            }

        closure_date = ca.completed_date

        # 2. Query subsequent findings in the same or sibling facilities after closure date
        subsequent_stmt = (
            select(Finding, Audit, Facility)
            .join(Audit, Finding.audit_id == Audit.id)
            .join(Facility, Finding.facility_id == Facility.id)
            .where(
                Finding.organization_id == organization_id,
                Audit.audit_date > closure_date,
                Finding.id != parent_finding.id
            )
            .order_by(Audit.audit_date.asc())
        )
        subsequent_rows = (await session.execute(subsequent_stmt)).all()

        matching_recurrences = []
        parent_words = set(parent_finding.title.lower().replace("[", " ").replace("]", " ").split())
        meaningful_parent_words = {w for w in parent_words if len(w) > 3 and w not in self.GENERIC_STOP_WORDS}

        for sf, sa, sfac in subsequent_rows:
            sub_words = set(sf.title.lower().replace("[", " ").replace("]", " ").split())
            overlap = [w for w in meaningful_parent_words.intersection(sub_words)]

            # High-fidelity recurrence matching:
            # 1. Same facility with root keyword overlap (e.g. interlock, berm, forklift)
            # 2. Same exact regulation reference with root keyword overlap
            # 3. Cross-facility egress pattern
            same_facility_root_match = (sfac.id == facility.id and len(overlap) >= 1)
            same_reg_and_root_match = bool(
                parent_finding.regulation_ref and
                sf.regulation_ref == parent_finding.regulation_ref and
                len(overlap) >= 1
            )
            cross_facility_egress = (
                "egress" in parent_finding.title.lower() and
                "egress" in sf.title.lower() and
                sf.regulation_ref == parent_finding.regulation_ref
            )

            if same_facility_root_match or same_reg_and_root_match or cross_facility_egress:
                days_after = (sa.audit_date - closure_date).days
                matching_recurrences.append({
                    "finding_code": sf.finding_code,
                    "title": sf.title,
                    "facility_code": sfac.facility_code,
                    "audit_number": sa.audit_number,
                    "audit_date": sa.audit_date.isoformat(),
                    "days_post_closure": days_after,
                    "within_window": days_after <= self.RECURRENCE_WINDOW_DAYS
                })

        # Evaluate final verdict
        if matching_recurrences:
            first_rec = matching_recurrences[0]
            verdict = "FAILED_RECURRED"
            is_effective = False
            reason = (
                f"Recurrence detected: Finding {first_rec['finding_code']} ({first_rec['title']}) "
                f"occurred at {first_rec['facility_code']} {first_rec['days_post_closure']} days post-closure. "
                f"Action type '{ca.action_type}' failed to permanently mitigate root cause."
            )
        else:
            days_since_closure = (date.today() - closure_date).days
            if days_since_closure >= self.RECURRENCE_WINDOW_DAYS:
                verdict = "EFFECTIVE"
                is_effective = True
                reason = (
                    f"Verified durable: 0 matching recurrences detected over {days_since_closure} days post-closure "
                    f"(observation window: {self.RECURRENCE_WINDOW_DAYS} days)."
                )
            else:
                verdict = "IMPLEMENTED_PENDING_VERIFICATION"
                is_effective = False
                reason = (
                    f"Observation window active: {days_since_closure} of {self.RECURRENCE_WINDOW_DAYS} days elapsed. "
                    f"No recurrences recorded so far."
                )

        # Update CA effectiveness in database if state evolved
        if ca.effectiveness_status != verdict:
            ca.effectiveness_status = verdict
            ca.recurrence_detected = not is_effective and verdict == "FAILED_RECURRED"
            await session.commit()

        return {
            "ca_number": ca.ca_number,
            "title": ca.title,
            "action_type": ca.action_type,
            "assigned_to": ca.assigned_to,
            "facility_code": facility.facility_code,
            "completed_date": closure_date.isoformat(),
            "effectiveness_status": verdict,
            "is_effective": is_effective,
            "reason": reason,
            "recurrences_detected_count": len(matching_recurrences),
            "recurrence_details": matching_recurrences[:3]
        }


verification_engine = VerificationEngine()
