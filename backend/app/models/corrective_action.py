from datetime import datetime, date
from enum import Enum
import uuid
from sqlalchemy import String, DateTime, Date, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class CAPAStatus(str, Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    AWAITING_VERIFICATION = "AWAITING_VERIFICATION"
    VERIFIED_EFFECTIVE = "VERIFIED_EFFECTIVE"
    FAILED_VERIFICATION = "FAILED_VERIFICATION"
    RECURRENCE_DETECTED = "RECURRENCE_DETECTED"


class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    finding_id: Mapped[str] = mapped_column(String(36), ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, index=True)
    ca_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    proposed_action: Mapped[str] = mapped_column(Text, nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False, default="PROCEDURAL")  # PROCEDURAL, ENGINEERING, TRAINING, ADMINISTRATIVE
    assigned_to: Mapped[str] = mapped_column(String(255), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    completed_date: Mapped[date] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="OPEN")  # OPEN, IN_PROGRESS, COMPLETED
    effectiveness_status: Mapped[str] = mapped_column(String(50), nullable=False, default="PENDING")  # PENDING, IMPLEMENTED_PENDING_VERIFICATION, EFFECTIVE, FAILED_RECURRED
    recurrence_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    outcome_notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    finding = relationship("Finding", back_populates="corrective_actions")
    verifications = relationship("Verification", back_populates="corrective_action", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_ca_org_number", "organization_id", "ca_number", unique=True),
        Index("ix_ca_org_effectiveness", "organization_id", "effectiveness_status"),
        Index("ix_ca_finding_status", "finding_id", "status"),
    )
