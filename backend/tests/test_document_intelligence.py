import pytest
import pymupdf as fitz
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.models import Audit, Finding, Evidence
from app.services.document_parser import document_parser
from app.services.ingestion_service import ingestion_service
from app.services.hindsight_service import hindsight_service
from app.data.seed_meridian import MERIDIAN_ORG_ID

TEST_AUDIT_NUM = "AUD-2026-TEST-INGEST-01"
TEST_FINDING_1 = "FIND-2026-TEST-01"
TEST_FINDING_2 = "FIND-2026-TEST-02"


def generate_test_audit_pdf_bytes() -> bytes:
    """Generates an in-memory PDF with structured audit content using PyMuPDF."""
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)  # A4
    rect = fitz.Rect(40, 40, 555, 800)

    text = f"""MERIDIAN INDUSTRIAL GROUP - PERIODIC SAFETY AUDIT REPORT
Audit Number: {TEST_AUDIT_NUM}
Facility Code: FAC-001
Title: Apex Plant A Fall Semi-Annual Compliance Review
Audit Type: Safety & OSHA Compliance
Auditor Name: Marcus Vance, Lead Auditor
Date: 2026-10-25
Compliance Score: 88.5
Summary: Semi-annual inspection of manufacturing floors, stamping presses, and fire safety systems.

==================================================
FINDINGS AND OBSERVATIONS
==================================================

[FINDING 1]
Finding Code: {TEST_FINDING_1}
Title: Blocked primary emergency exit door in Bay 7
Severity: CRITICAL
Category: Fire Safety
Regulation Ref: OSHA 1910.37
Description: Emergency egress door 7B was completely obstructed by two wooden skids loaded with heavy casting parts. Exit signage partially obscured. Prior finding noted in previous inspection.
Evidence: Digital photograph DSC_0492.JPG showing pallet obstruction in door radius.

[FINDING 2]
Finding Code: {TEST_FINDING_2}
Title: Missing arc flash warning label on 480V distribution switchboard
Severity: MAJOR
Category: Electrical Safety
Regulation Ref: NFPA 70E / OSHA 1910.303
Description: Main power feed panel in mechanical mezzanine lacked standard bilingual arc flash boundary danger label and PPE requirement placard.
Evidence: Inspection observation log entry page 4.
"""
    page.insert_textbox(rect, text, fontsize=9)
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes


def test_pdf_parsing_unit():
    pdf_bytes = generate_test_audit_pdf_bytes()
    parsed = document_parser.parse_audit_pdf(pdf_bytes)

    assert parsed.audit_number == TEST_AUDIT_NUM
    assert parsed.facility_code == "FAC-001"
    assert parsed.compliance_score == 88.5
    assert len(parsed.findings) == 2

    f1 = parsed.findings[0]
    assert f1.finding_code == TEST_FINDING_1
    assert f1.severity == "CRITICAL"
    assert f1.category == "Fire Safety"
    assert f1.is_recurring is True  # "Prior finding" detected
    assert f1.source_page == 1

    f2 = parsed.findings[1]
    assert f2.finding_code == TEST_FINDING_2
    assert f2.severity == "MAJOR"
    assert f2.category == "Electrical Safety"
    assert f2.source_page == 1


def test_pdf_validation_guards():
    """Verify that file validation rejects invalid or malicious files."""
    # Invalid extension
    with pytest.raises(ValueError, match="Invalid file extension"):
        ingestion_service.validate_pdf_file(b"%PDF-1.4 test", "malicious.exe")

    # Empty bytes
    with pytest.raises(ValueError, match="empty"):
        ingestion_service.validate_pdf_file(b"", "empty.pdf")

    # Missing PDF magic header
    with pytest.raises(ValueError, match="Missing standard %PDF"):
        ingestion_service.validate_pdf_file(b"This is not a real PDF file", "fake.pdf")


@pytest.mark.asyncio
async def test_audit_pdf_ingestion_pipeline():
    pdf_bytes = generate_test_audit_pdf_bytes()

    # Clean up prior test data if present
    async with AsyncSessionLocal() as session:
        await session.execute(
            delete(Finding).where(Finding.finding_code.in_([TEST_FINDING_1, TEST_FINDING_2]))
        )
        await session.execute(
            delete(Audit).where(Audit.audit_number == TEST_AUDIT_NUM)
        )
        await session.commit()

    async with AsyncSessionLocal() as session:
        result = await ingestion_service.ingest_audit_pdf(
            session=session,
            organization_id=MERIDIAN_ORG_ID,
            pdf_bytes=pdf_bytes,
            filename="Test_Audit_Report.pdf"
        )

        assert result["status"] == "success"
        assert result["audit_number"] == TEST_AUDIT_NUM
        assert result["findings_count"] == 2

        # Verify DB records
        stmt_audit = select(Audit).where(
            Audit.organization_id == MERIDIAN_ORG_ID,
            Audit.audit_number == TEST_AUDIT_NUM
        )
        audit = (await session.execute(stmt_audit)).scalar_one_or_none()
        assert audit is not None
        assert audit.compliance_score == 88.5

        stmt_f1 = select(Finding).where(
            Finding.organization_id == MERIDIAN_ORG_ID,
            Finding.finding_code == TEST_FINDING_1
        )
        f1 = (await session.execute(stmt_f1)).scalar_one_or_none()
        assert f1 is not None
        assert f1.severity == "CRITICAL"

    # Verify Hindsight memory retention and recall
    recalled = await hindsight_service.arecall(
        org_id=MERIDIAN_ORG_ID,
        query="emergency exit door obstructed Bay 7",
        tags=["fire_safety"],
        limit=50
    )
    assert len(recalled) >= 1
    assert any("Bay 7" in r["content"] for r in recalled)
