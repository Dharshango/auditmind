import os
import hashlib
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Facility, Audit, Finding, Evidence
from app.services.document_parser import document_parser
from app.services.hindsight_service import hindsight_service

logger = logging.getLogger("auditmind.ingestion")

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


class IngestionService:
    """Manages secure file validation, storage, PyMuPDF extraction, DB persistence, and Hindsight memory retention."""

    def __init__(self, upload_dir: str = "data/reports"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def validate_pdf_file(self, pdf_bytes: bytes, filename: str) -> None:
        """Validates that uploaded file is an authentic, non-empty PDF within acceptable size bounds."""
        if not filename.lower().endswith(".pdf"):
            raise ValueError(f"Invalid file extension: '{filename}'. Only .pdf documents are accepted.")

        if len(pdf_bytes) == 0:
            raise ValueError("Uploaded file is empty (0 bytes).")

        if len(pdf_bytes) > MAX_FILE_SIZE:
            raise ValueError(f"File exceeds maximum allowed size of 25MB (Size: {len(pdf_bytes)/(1024*1024):.2f}MB).")

        # Magic byte validation for PDF (%PDF-)
        if not pdf_bytes.startswith(b"%PDF"):
            raise ValueError("Invalid PDF format: Missing standard %PDF magic header.")

    async def ingest_audit_pdf(
        self,
        session: AsyncSession,
        organization_id: str,
        pdf_bytes: bytes,
        filename: str
    ) -> Dict[str, Any]:
        """Parses an audit report PDF, stores structured records in DB, preserves source pages, and retains memories in Hindsight."""
        # 1. File validation
        self.validate_pdf_file(pdf_bytes, filename)

        # 2. Parse document with PyMuPDF
        parsed = document_parser.parse_audit_pdf(pdf_bytes)

        # 3. Match Facility
        stmt = select(Facility).where(
            Facility.organization_id == organization_id,
            Facility.facility_code == parsed.facility_code
        )
        facility = (await session.execute(stmt)).scalar_one_or_none()
        if not facility:
            # Fallback to first facility of organization
            stmt_fallback = select(Facility).where(Facility.organization_id == organization_id)
            facility = (await session.execute(stmt_fallback)).scalars().first()
            if not facility:
                raise ValueError(f"No facility found for organization {organization_id}")

        # 4. Save raw file archive with sanitized name
        safe_filename = f"{organization_id}_{parsed.audit_number}_{filename}"
        file_path = os.path.join(self.upload_dir, safe_filename)
        with open(file_path, "wb") as f:
            f.write(pdf_bytes)

        file_hash = hashlib.sha256(pdf_bytes).hexdigest()

        # 5. Check if audit already exists (idempotency)
        existing_audit_stmt = select(Audit).where(
            Audit.organization_id == organization_id,
            Audit.audit_number == parsed.audit_number
        )
        audit = (await session.execute(existing_audit_stmt)).scalar_one_or_none()

        if not audit:
            audit = Audit(
                organization_id=organization_id,
                facility_id=facility.id,
                audit_number=parsed.audit_number,
                title=parsed.title,
                audit_type=parsed.audit_type,
                auditor_name=parsed.auditor_name,
                audit_date=parsed.audit_date,
                status="COMPLETED",
                compliance_score=parsed.compliance_score,
                summary=parsed.summary,
                report_file_path=file_path
            )
            session.add(audit)
            await session.flush()

        # 6. Insert Findings, preserve source-page evidence & retain Hindsight memory
        ingested_findings = []
        for pf in parsed.findings:
            # Check if finding code exists
            existing_f_stmt = select(Finding).where(
                Finding.organization_id == organization_id,
                Finding.finding_code == pf.finding_code
            )
            finding = (await session.execute(existing_f_stmt)).scalar_one_or_none()

            if not finding:
                finding = Finding(
                    organization_id=organization_id,
                    audit_id=audit.id,
                    facility_id=facility.id,
                    finding_code=pf.finding_code,
                    title=pf.title,
                    description=pf.description,
                    category=pf.category,
                    severity=pf.severity,
                    regulation_ref=pf.regulation_ref,
                    status="OPEN",
                    is_recurring=pf.is_recurring,
                    recurrence_count=1 if pf.is_recurring else 0
                )
                session.add(finding)
                await session.flush()

                # Preserve source-page reference in Evidence table
                evidence_desc = (
                    f"Source: Page {pf.source_page} of '{filename}'. "
                    f"Observation notes: {pf.evidence_notes or 'Digital PDF non-conformance extraction.'}"
                )
                ev = Evidence(
                    organization_id=organization_id,
                    finding_id=finding.id,
                    file_name=f"{pf.finding_code}_page_{pf.source_page}.pdf",
                    file_type="application/pdf",
                    file_path=file_path,
                    hash_sha256=file_hash,
                    description=evidence_desc
                )
                session.add(ev)

                # Retain into Hindsight Memory Bank
                content = (
                    f"Audit {parsed.audit_number} (Page {pf.source_page}) at {facility.name} ({facility.facility_code}): "
                    f"[{pf.severity}] {pf.title}. Category: {pf.category}. Regulation: {pf.regulation_ref}. "
                    f"Details: {pf.description}"
                )
                await hindsight_service.aretain(
                    org_id=organization_id,
                    content=content,
                    document_id=pf.finding_code,
                    metadata={
                        "audit_number": parsed.audit_number,
                        "facility_code": facility.facility_code,
                        "severity": pf.severity,
                        "category": pf.category,
                        "source_page": str(pf.source_page)
                    },
                    tags=[facility.facility_code.lower(), pf.category.lower().replace(" ", "_"), pf.severity.lower()]
                )

            ingested_findings.append({
                "finding_code": finding.finding_code,
                "title": finding.title,
                "severity": finding.severity,
                "category": finding.category,
                "source_page": pf.source_page,
                "is_recurring": finding.is_recurring
            })

        await session.commit()

        return {
            "status": "success",
            "audit_number": audit.audit_number,
            "facility_code": facility.facility_code,
            "findings_count": len(ingested_findings),
            "findings": ingested_findings,
            "report_file_path": file_path,
            "file_sha256": file_hash,
            "validation_status": parsed.validation_status,
            "scanned_pages_detected": parsed.scanned_pages_detected,
            "ocr_applied": parsed.ocr_applied
        }


ingestion_service = IngestionService()
