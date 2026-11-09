from datetime import datetime, date
import uuid
from sqlalchemy import String, DateTime, Date, Float, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Audit(Base):
    __tablename__ = "audits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    facility_id: Mapped[str] = mapped_column(String(36), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    audit_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    audit_type: Mapped[str] = mapped_column(String(100), nullable=False)  # Safety, Environmental, Quality, SOP
    auditor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    audit_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="COMPLETED")  # DRAFT, IN_PROGRESS, COMPLETED, REVIEWED
    compliance_score: Mapped[float] = mapped_column(Float, default=100.0)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    report_file_path: Mapped[str] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="audits")
    facility = relationship("Facility", back_populates="audits")
    findings = relationship("Finding", back_populates="audit", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_audits_org_number", "organization_id", "audit_number", unique=True),
        Index("ix_audits_org_date", "organization_id", "audit_date"),
        Index("ix_audits_facility_status", "facility_id", "status"),
    )
