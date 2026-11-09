from datetime import datetime
import uuid
from sqlalchemy import String, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Finding(Base):
    __tablename__ = "findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    audit_id: Mapped[str] = mapped_column(String(36), ForeignKey("audits.id", ondelete="CASCADE"), nullable=False, index=True)
    facility_id: Mapped[str] = mapped_column(String(36), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    finding_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # Fire Safety, Machine Guarding, Chemical Storage, Training, PPE, Electrical
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # CRITICAL, MAJOR, MINOR, OBSERVATION
    regulation_ref: Mapped[str] = mapped_column(String(100), nullable=True)  # e.g., OSHA 1910.37, ISO 45001:2018
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="OPEN")  # OPEN, IN_REMEDIATION, CLOSED, VERIFIED
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    recurring_parent_id: Mapped[str] = mapped_column(String(36), ForeignKey("findings.id", ondelete="SET NULL"), nullable=True)
    recurrence_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    audit = relationship("Audit", back_populates="findings")
    facility = relationship("Facility", back_populates="findings")
    evidence_items = relationship("Evidence", back_populates="finding", cascade="all, delete-orphan")
    corrective_actions = relationship("CorrectiveAction", back_populates="finding", cascade="all, delete-orphan")
    recurring_children = relationship("Finding", backref="recurring_parent", remote_side=[id])

    __table_args__ = (
        Index("ix_findings_org_code", "organization_id", "finding_code", unique=True),
        Index("ix_findings_org_category", "organization_id", "category"),
        Index("ix_findings_org_severity", "organization_id", "severity"),
        Index("ix_findings_facility_recurring", "facility_id", "is_recurring"),
    )
