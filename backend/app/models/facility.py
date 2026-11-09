from datetime import datetime
import uuid
from sqlalchemy import String, DateTime, ForeignKey, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Facility(Base):
    __tablename__ = "facilities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    facility_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    facility_type: Mapped[str] = mapped_column(String(100), nullable=False)  # Manufacturing Plant, Warehouse, Distribution Center
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="facilities")
    audits = relationship("Audit", back_populates="facility", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="facility", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_facilities_org_code", "organization_id", "facility_code", unique=True),
        Index("ix_facilities_org_type", "organization_id", "facility_type"),
    )
