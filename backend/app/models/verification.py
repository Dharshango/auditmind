from datetime import datetime, date
import uuid
from sqlalchemy import String, DateTime, Date, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Verification(Base):
    __tablename__ = "verifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    corrective_action_id: Mapped[str] = mapped_column(String(36), ForeignKey("corrective_actions.id", ondelete="CASCADE"), nullable=False, index=True)
    verification_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    verified_by: Mapped[str] = mapped_column(String(255), nullable=False)
    verification_date: Mapped[date] = mapped_column(Date, nullable=False)
    result: Mapped[str] = mapped_column(String(50), nullable=False)  # PASS, FAIL, CONDITIONAL
    recurrence_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    corrective_action = relationship("CorrectiveAction", back_populates="verifications")

    __table_args__ = (
        Index("ix_verif_org_code", "organization_id", "verification_code", unique=True),
        Index("ix_verif_ca_date", "corrective_action_id", "verification_date"),
    )
