from datetime import datetime
import uuid
from sqlalchemy import String, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Regulation(Base):
    __tablename__ = "regulations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # OSHA 1910.37, ISO 45001 Clause 8.1.2
    jurisdiction: Mapped[str] = mapped_column(String(100), nullable=False, default="Federal / OSHA")
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="regulations")

    __table_args__ = (
        Index("ix_regulations_org_code", "organization_id", "code", unique=True),
        Index("ix_regulations_org_cat", "organization_id", "category"),
    )
