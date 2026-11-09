import asyncio
import hashlib
from datetime import datetime, date, timedelta
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, init_db
from app.models import (
    Organization, User, Facility, Audit, Finding,
    Evidence, CorrectiveAction, Verification, Regulation
)
from app.services.hindsight_service import hindsight_service

MERIDIAN_ORG_ID = "00000000-0000-0000-0000-000000000001"

FACILITY_DATA = [
    {
        "code": "FAC-001",
        "name": "Apex Manufacturing Plant A",
        "type": "Manufacturing Plant",
        "location": "Detroit, MI",
        "metadata": {"sqft": 450000, "shifts": 3, "primary_ops": "Heavy stamping, CNC machining, chemical surface finishing"}
    },
    {
        "code": "FAC-002",
        "name": "Vanguard Manufacturing Plant B",
        "type": "Manufacturing Plant",
        "location": "Austin, TX",
        "metadata": {"sqft": 280000, "shifts": 2, "primary_ops": "Electronics assembly, cleanroom robotics, packaging"}
    },
    {
        "code": "FAC-003",
        "name": "Keystone Warehouse A",
        "type": "Warehouse",
        "location": "Columbus, OH",
        "metadata": {"sqft": 600000, "shifts": 2, "primary_ops": "High-bay bulk pallet storage, cold storage, AGV fleet"}
    },
    {
        "code": "FAC-004",
        "name": "Summit Warehouse B",
        "type": "Warehouse",
        "location": "Reno, NV",
        "metadata": {"sqft": 520000, "shifts": 2, "primary_ops": "Hazmat storage, forklift cross-docking, battery charging bays"}
    },
    {
        "code": "FAC-005",
        "name": "Metro Distribution Center C",
        "type": "Distribution Center",
        "location": "Atlanta, GA",
        "metadata": {"sqft": 750000, "shifts": 3, "primary_ops": "High-speed conveyor sorting, parcel fulfillment, high agency labor"}
    }
]

REGULATION_DATA = [
    {
        "code": "OSHA 1910.37",
        "jurisdiction": "US Federal OSHA",
        "title": "Maintenance, safeguards, and operational features for exit routes",
        "category": "Fire Safety",
        "description": "Exit routes must be free and unobstructed. No materials or equipment may be placed, either permanently or temporarily, within the exit route."
    },
    {
        "code": "OSHA 1910.212",
        "jurisdiction": "US Federal OSHA",
        "title": "General requirements for all machines (Machine Guarding)",
        "category": "Machine Safety",
        "description": "One or more methods of machine guarding shall be provided to protect the operator and other employees in the machine area from hazards such as those created by point of operation, ingoing nip points, rotating parts, and flying chips."
    },
    {
        "code": "OSHA 1910.178",
        "jurisdiction": "US Federal OSHA",
        "title": "Powered industrial trucks (Forklift Operations & Training)",
        "category": "Training & Certification",
        "description": "The employer shall ensure that each powered industrial truck operator is competent to operate a powered industrial truck safely, as demonstrated by the successful completion of the training and evaluation."
    },
    {
        "code": "EPA 40 CFR 264.175",
        "jurisdiction": "US EPA",
        "title": "Containment for hazardous waste storage areas",
        "category": "Chemical Safety",
        "description": "Container storage areas must have a containment system that is designed and operated to contain liquid leaks and spills."
    },
    {
        "code": "OSHA 1910.94",
        "jurisdiction": "US Federal OSHA",
        "title": "Occupational health and environmental control - Ventilation",
        "category": "Ventilation",
        "description": "Ventilation systems must remove toxic air contaminants and prevent explosive concentrations of flammable vapors or gases."
    },
    {
        "code": "ISO 45001:2018",
        "jurisdiction": "International ISO",
        "title": "Occupational health and safety management systems",
        "category": "Management System",
        "description": "Clause 8.1.2: Hierarchy of controls for eliminating hazards and reducing OH&S risks."
    }
]


async def seed_meridian_data():
    print("[*] Initializing Meridian Industrial Group synthetic database...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        q = await session.execute(select(Organization).where(Organization.id == MERIDIAN_ORG_ID))
        existing_org = q.scalar_one_or_none()
        if existing_org:
            print("[INFO] Meridian Industrial Group already seeded.")
            return

        # 1. Create Organization
        org = Organization(
            id=MERIDIAN_ORG_ID,
            name="Meridian Industrial Group",
            slug="meridian-industrial",
            industry="Manufacturing & Industrial Logistics",
            settings={
                "compliance_target": 95.0,
                "audit_frequency_days": 30,
                "capa_recurrence_window_days": 90,
                "facilities_count": 5
            }
        )
        session.add(org)

        # 2. Create Users
        users = [
            User(
                organization_id=MERIDIAN_ORG_ID,
                email="compliance@meridianindustrial.com",
                full_name="Sarah Jenkins, VP Operational Compliance",
                role="compliance_officer",
                hashed_password="scrypt$hash$demo$compliance123"
            ),
            User(
                organization_id=MERIDIAN_ORG_ID,
                email="auditor.north@meridianindustrial.com",
                full_name="Marcus Vance, Senior Lead Auditor",
                role="facility_auditor",
                hashed_password="scrypt$hash$demo$auditor123"
            ),
            User(
                organization_id=MERIDIAN_ORG_ID,
                email="plant.mgr@meridianindustrial.com",
                full_name="Elena Rostova, General Manager Plant A",
                role="operations_manager",
                hashed_password="scrypt$hash$demo$operations123"
            )
        ]
        session.add_all(users)

        # 3. Create Regulations
        reg_map = {}
        for r_data in REGULATION_DATA:
            reg = Regulation(
                organization_id=MERIDIAN_ORG_ID,
                code=r_data["code"],
                jurisdiction=r_data["jurisdiction"],
                title=r_data["title"],
                category=r_data["category"],
                description=r_data["description"]
            )
            session.add(reg)
            reg_map[r_data["code"]] = reg

        # 4. Create Facilities
        fac_objs = {}
        for f_data in FACILITY_DATA:
            fac = Facility(
                organization_id=MERIDIAN_ORG_ID,
                facility_code=f_data["code"],
                name=f_data["name"],
                facility_type=f_data["type"],
                location=f_data["location"],
                metadata_json=f_data["metadata"]
            )
            session.add(fac)
            fac_objs[f_data["code"]] = fac

        await session.flush()

        # 5. Generate 40 Audits, 120 Findings, 75 CAPAs, 25 Verifications
        # Chronological timeline: November 2025 to November 2026 (12 months)
        start_date = date(2025, 11, 10)
        auditors = ["Marcus Vance", "Elena Rostova", "David K. Sterling", "Rachel Alpert", "Global Quality Assessors Inc."]
        audit_types = ["Safety & OSHA Compliance", "Quality Management (ISO 9001)", "Environmental & Hazmat (EPA)", "Operational SOP & 5S"]

        audits_list = []
        findings_list = []
        ca_list = []
        verif_list = []
        evidence_list = []

        audit_counter = 1
        finding_counter = 1
        ca_counter = 1
        verif_counter = 1

        # We will distribute 40 audits across the 5 facilities (8 per facility)
        # 8 audits * 5 facilities = 40 audits.
        # Average 3 findings per audit = 120 findings!
        facility_codes = ["FAC-001", "FAC-002", "FAC-003", "FAC-004", "FAC-005"]

        for month_idx in range(8):
            audit_base_date = start_date + timedelta(days=month_idx * 45)
            for f_code in facility_codes:
                fac = fac_objs[f_code]
                a_type = audit_types[(audit_counter + month_idx) % len(audit_types)]
                auditor = auditors[audit_counter % len(auditors)]
                a_num = f"AUD-2026-{audit_counter:03d}"

                audit = Audit(
                    organization_id=MERIDIAN_ORG_ID,
                    facility_id=fac.id,
                    audit_number=a_num,
                    title=f"{fac.name} - Periodic {a_type} Inspection",
                    audit_type=a_type,
                    auditor_name=auditor,
                    audit_date=audit_base_date + timedelta(days=(audit_counter % 7)),
                    status="COMPLETED",
                    compliance_score=round(82.0 + ((audit_counter * 3) % 17), 1),
                    summary=f"Comprehensive evaluation of operational conformance at {fac.name}. Multiple areas inspected including physical guarding, emergency egress, chemical storage, and staff training records."
                )
                session.add(audit)
                audits_list.append(audit)
                audit_counter += 1

        await session.flush()

        # Detailed finding blueprints embodying the 6 Core Demonstration Scenarios:
        # Scenario A: Fire safety egress recurrent across Plant A (FAC-001), Warehouse B (FAC-004), Distro Center C (FAC-005)
        # Scenario B: Plant A machine guarding CAPA completed but recurred 110 days later
        # Scenario C: Forklift certification gaps in Warehouse A & B
        # Scenario D: Plant B chemical containment CAPA engineered and 100% effective (0 recurrence)
        # Scenario E: "Improper Ventilation" in Plant A (toxic vapor exhaust) vs Warehouse B (battery charging hydrogen gas)
        # Scenario F: Contradictory evidence (calibration date before audit)

        # Generate exactly 120 findings across the 40 audits (3 findings per audit)
        scenarios_catalog = [
            # Scenario A findings (Fire Safety recurrent)
            {
                "code": "FS-EGRESS",
                "title": "Emergency exit route obstructed by staging pallets",
                "desc": "Main emergency exit door in high-traffic bay blocked by wooden pallets and shrink-wrapped overflow stock. Path clearance reduced to under 18 inches.",
                "cat": "Fire Safety",
                "sev": "CRITICAL",
                "reg": "OSHA 1910.37",
                "scenario": "A"
            },
            {
                "code": "FS-EXTINGUISH",
                "title": "Fire extinguisher annual inspection tag expired",
                "desc": "Fire extinguishers located in production corridor showed last inspection tag dated over 14 months prior without documented hydrostatic testing.",
                "cat": "Fire Safety",
                "sev": "MAJOR",
                "reg": "OSHA 1910.37",
                "scenario": "A"
            },
            # Scenario B findings (Machine Guarding recurred)
            {
                "code": "MG-INTERLOCK",
                "title": "Interlock bypass switch engaged on mechanical stamping press",
                "desc": "Safety interlock gate on primary stamping press was manually overridden with zip ties to allow continuous feeding during shift ramp-up.",
                "cat": "Machine Safety",
                "sev": "CRITICAL",
                "reg": "OSHA 1910.212",
                "scenario": "B"
            },
            # Scenario C findings (Forklift training gap)
            {
                "code": "TR-FORKLIFT",
                "title": "Forklift operators missing mandatory 3-year recertification",
                "desc": "Audit of active equipment logs identified four warehouse operators operating Class IV powered industrial trucks with expired training credentials.",
                "cat": "Training & Certification",
                "sev": "MAJOR",
                "reg": "OSHA 1910.178",
                "scenario": "C"
            },
            # Scenario D findings (Chemical containment - successfully resolved)
            {
                "code": "CH-CONTAIN",
                "title": "Secondary chemical containment berm cracked and leaking",
                "desc": "Liquid collection sump in plating washroom showed concrete fissure. Sump capacity compromised below 110% of largest vessel requirement.",
                "cat": "Chemical Safety",
                "sev": "CRITICAL",
                "reg": "EPA 40 CFR 264.175",
                "scenario": "D"
            },
            # Scenario E findings (Improper Ventilation - two distinct causes)
            {
                "code": "VT-VAPOR",
                "title": "Improper ventilation in solvent degreasing station",
                "desc": "Local exhaust ventilation face velocity measured at 45 FPM (required: 100 FPM minimum) creating volatile organic solvent vapor accumulation.",
                "cat": "Ventilation",
                "sev": "CRITICAL",
                "reg": "OSHA 1910.94",
                "scenario": "E"
            },
            {
                "code": "VT-HYDROGEN",
                "title": "Improper ventilation in battery charging bay",
                "desc": "Hydrogen gas detection sensor triggered intermittent alerts during concurrent charging of 12 electric forklift battery packs.",
                "cat": "Ventilation",
                "sev": "CRITICAL",
                "reg": "OSHA 1910.94",
                "scenario": "E"
            },
            # Scenario F findings (Contradictory evidence)
            {
                "code": "EV-MISMATCH",
                "title": "Calibration record date precedes non-conformance event",
                "desc": "Resolution claim submitted for torque-wrench calibration failure included calibration certificate dated three weeks before the finding was logged.",
                "cat": "Quality Management",
                "sev": "MAJOR",
                "reg": "ISO 45001:2018",
                "scenario": "F"
            },
            # Standard Operational Findings
            {
                "code": "PPE-EYE",
                "title": "Operators not wearing required Z87+ impact goggles",
                "desc": "Employees in metal deburring cell observed wearing prescription glasses without certified side shields.",
                "cat": "PPE Conformance",
                "sev": "MINOR",
                "reg": "OSHA 1910.133",
                "scenario": "STANDARD"
            },
            {
                "code": "EL-PANEL",
                "title": "36-inch electrical panel clearance violated",
                "desc": "Distribution panel 4B obstructed by rolling maintenance tool carts and cardboard bin containers.",
                "cat": "Electrical Safety",
                "sev": "MAJOR",
                "reg": "OSHA 1910.303",
                "scenario": "STANDARD"
            },
            {
                "code": "HAZ-LABEL",
                "title": "Secondary chemical transfer bottles missing GHS labels",
                "desc": "Plastic spray bottles containing isopropyl alcohol lacked GHS hazard pictograms and chemical identifier labels.",
                "cat": "Chemical Safety",
                "sev": "MINOR",
                "reg": "OSHA 1910.1200",
                "scenario": "STANDARD"
            },
            {
                "code": "SOP-LOCKOUT",
                "title": "Machine-specific LOTO procedure placard faded and illegible",
                "desc": "Conveyor drive motor lockout placard degraded by ultraviolet exposure and machine oil, rendering energy isolation points unreadable.",
                "cat": "Machine Safety",
                "sev": "MAJOR",
                "reg": "OSHA 1910.147",
                "scenario": "STANDARD"
            }
        ]

        # Scenario B parent tracking
        scenario_b_parent_finding = None

        for a_idx, audit in enumerate(audits_list):
            for f_offset in range(3):
                f_num = f"FIND-2026-{finding_counter:03d}"
                # Select scenario template cyclically
                t_idx = (a_idx * 3 + f_offset) % len(scenarios_catalog)
                template = scenarios_catalog[t_idx]

                # Specific scenario overrides to enforce scenario relationships
                is_rec = False
                p_id = None
                rec_count = 0

                # Scenario D: Genuinely successful corrective action at Plant B (FAC-002)
                # Once resolved in the first audit cycle, it NEVER recurs (0 recurrences)
                if template["scenario"] == "D" and finding_counter > 5:
                    template = scenarios_catalog[-2]  # HAZ-LABEL standard non-conformance

                # Scenario A: Repeat fire safety egress across multiple facilities
                if template["scenario"] == "A" and finding_counter > 12:
                    is_rec = True
                    rec_count = (finding_counter % 3) + 1

                # Scenario B: Machine guard recurrence at Plant A
                if template["scenario"] == "B":
                    if scenario_b_parent_finding is None:
                        scenario_b_parent_finding = f_num
                    else:
                        is_rec = True
                        rec_count = 2

                finding = Finding(
                    organization_id=MERIDIAN_ORG_ID,
                    audit_id=audit.id,
                    facility_id=audit.facility_id,
                    finding_code=f_num,
                    title=f"[{template['code']}] {template['title']}",
                    description=template["desc"],
                    category=template["cat"],
                    severity=template["sev"],
                    regulation_ref=template["reg"],
                    status="CLOSED" if finding_counter <= 75 else ("IN_REMEDIATION" if finding_counter <= 100 else "OPEN"),
                    is_recurring=is_rec,
                    recurrence_count=rec_count
                )
                session.add(finding)
                findings_list.append(finding)
                finding_counter += 1

        await session.flush()

        # 6. Generate 75 Corrective Actions
        # Corrective action types: PROCEDURAL, TRAINING, ENGINEERING, ADMINISTRATIVE
        # Scenarios reflected:
        # - Scenario A: Procedural reminders failed, leading to recurrence
        # - Scenario B: Training completed, marked "COMPLETED", but recurred 110 days later -> FAILED_RECURRED
        # - Scenario C: HR reminder sent, recurred due to temp agency turnover -> FAILED_RECURRED
        # - Scenario D: Plant B engineering overhaul with electronic sensor -> EFFECTIVE
        for idx in range(75):
            finding = findings_list[idx]
            ca_num = f"CAPA-2026-{ca_counter:03d}"

            # Determine action attributes based on scenario
            if "MG-INTERLOCK" in finding.title:
                # Scenario B: The completed but ineffective CAPA!
                ca_title = "Operator refresher training on interlock switch protocols"
                ca_action = "Conducted mandatory 15-minute tailgate training with stamping operators reminding them not to bypass safety interlocks."
                ca_type = "TRAINING"
                ca_status = "COMPLETED"
                eff_status = "FAILED_RECURRED"
                rec_det = True
                notes = "Initial training completed and signed off. However, identical interlock bypass recurred on Stamping Press #4 110 days later during Q3 quota surge. Procedural training failed to prevent recurrence; engineering control needed."
            elif "CH-CONTAIN" in finding.title:
                # Scenario D: Genuinely effective engineering control!
                ca_title = "Installation of high-density polyethylene secondary berm with ultrasonic level telemetry"
                ca_action = "Rebuilt physical concrete containment with dual chemical-resistant liner and integrated SCADA float sensor for instantaneous leak detection."
                ca_type = "ENGINEERING"
                ca_status = "COMPLETED"
                eff_status = "EFFECTIVE"
                rec_det = False
                notes = "Permanent engineered solution implemented. Zero recurrences detected over 270 days of subsequent operating cycles."
            elif "FS-EGRESS" in finding.title:
                # Scenario A: Procedural reminder that failed
                ca_title = "Floor demarcation repainting and staging reminder"
                ca_action = "Repainted yellow egress boundary lines and issued memo to shift leads."
                ca_type = "PROCEDURAL"
                ca_status = "COMPLETED"
                eff_status = "FAILED_RECURRED"
                rec_det = True
                notes = "Pallet staging overflow returned within 45 days due to absence of designated buffer staging racks."
            elif "TR-FORKLIFT" in finding.title:
                # Scenario C: Training lapse
                ca_title = "Agency temporary staffing certification audit"
                ca_action = "Requested staffing vendor provide pre-assignment forklift operator certificates."
                ca_type = "ADMINISTRATIVE"
                ca_status = "COMPLETED"
                eff_status = "FAILED_RECURRED"
                rec_det = True
                notes = "Turnover in 3rd shift temp labor caused ongoing gaps in documented evaluation."
            else:
                ca_title = f"Remediation action for {finding.finding_code}"
                ca_action = f"Implemented standard corrective remediation procedure to resolve {finding.title}."
                ca_type = "PROCEDURAL" if idx % 2 == 0 else "ENGINEERING"
                ca_status = "COMPLETED" if idx < 55 else "IN_PROGRESS"
                eff_status = "EFFECTIVE" if idx < 40 else ("FAILED_RECURRED" if idx < 55 else "IMPLEMENTED_PENDING_VERIFICATION")
                rec_det = eff_status == "FAILED_RECURRED"
                notes = "Standard corrective action lifecycle."

            ca = CorrectiveAction(
                organization_id=MERIDIAN_ORG_ID,
                finding_id=finding.id,
                ca_number=ca_num,
                title=ca_title,
                proposed_action=ca_action,
                action_type=ca_type,
                assigned_to=f"Maintenance Lead {(ca_counter % 5) + 1}",
                due_date=date(2026, 3, 1) + timedelta(days=ca_counter * 3),
                completed_date=date(2026, 3, 15) + timedelta(days=ca_counter * 3) if ca_status == "COMPLETED" else None,
                status=ca_status,
                effectiveness_status=eff_status,
                recurrence_detected=rec_det,
                outcome_notes=notes
            )
            session.add(ca)
            ca_list.append(ca)
            ca_counter += 1

        await session.flush()

        # 7. Generate 25 Verification Records
        for v_idx in range(25):
            ca = ca_list[v_idx]
            v_code = f"VERIF-2026-{verif_counter:03d}"
            is_fail = ca.effectiveness_status == "FAILED_RECURRED"

            verif = Verification(
                organization_id=MERIDIAN_ORG_ID,
                corrective_action_id=ca.id,
                verification_code=v_code,
                verified_by=auditors[v_idx % len(auditors)],
                verification_date=date(2026, 5, 1) + timedelta(days=v_idx * 6),
                result="FAIL" if is_fail else "PASS",
                recurrence_detected=is_fail,
                notes=f"Post-remediation inspection on {ca.ca_number}. Result: {'Recurrence observed during walk-through' if is_fail else 'Remediation physically verified intact and effective'}."
            )
            session.add(verif)
            verif_list.append(verif)
            verif_counter += 1

        # 8. Generate Evidence attachments
        for e_idx in range(40):
            finding = findings_list[e_idx]
            evidence = Evidence(
                organization_id=MERIDIAN_ORG_ID,
                finding_id=finding.id,
                file_name=f"EVID-{finding.finding_code}-photo-01.jpg",
                file_type="image/jpeg",
                file_path=f"/evidence/meridian/{finding.finding_code}_photo_01.jpg",
                hash_sha256=hashlib.sha256(f"{finding.finding_code}-evidence".encode()).hexdigest(),
                description=f"High-resolution photographic evidence captured during inspection of {finding.finding_code}."
            )
            session.add(evidence)
            evidence_list.append(evidence)

        await session.commit()
        print("[SUCCESS] Meridian Industrial Group seeded successfully:")
        print("   - 1 Organization (Meridian Industrial Group)")
        print("   - 3 Users (Compliance Officer, Auditor, Ops Manager)")
        print(f"   - {len(FACILITY_DATA)} Facilities (FAC-001 to FAC-005)")
        print(f"   - {len(REGULATION_DATA)} Regulations (OSHA, EPA, ISO)")
        print(f"   - {len(audits_list)} Audits (Target: 40)")
        print(f"   - {len(findings_list)} Findings (Target: 120)")
        print(f"   - {len(ca_list)} Corrective Actions (Target: 75)")
        print(f"   - {len(verif_list)} Verification Records (Target: 25)")
        print(f"   - {len(evidence_list)} Evidence Records")

    # Ingest baseline memories into Hindsight Memory Bank
    print("[*] Ingesting Meridian baseline compliance memories into Hindsight...")
    await hindsight_service.initialize_bank(MERIDIAN_ORG_ID, "Meridian Industrial Group")

    # Retain the key scenario learnings
    memories_to_retain = [
        {
            "content": "FAC-001 Apex Plant A: Recurring machine guard interlock bypass on Stamping Press #4. Procedural training refresher (CAPA-2026-003) failed to prevent recurrence. Problem returned 110 days later during peak production quota. Permanent mechanical interlock redesign required.",
            "doc_id": "FIND-2026-003",
            "tags": ["machine_guarding", "recurrence", "FAC-001", "stamping", "capa_failure"]
        },
        {
            "content": "FAC-002 Vanguard Plant B: Secondary chemical containment concrete fissure resolved via high-density polyethylene liner and electronic float telemetry (CAPA-2026-005). Highly effective engineering control with 0 recurrences over 9 months.",
            "doc_id": "FIND-2026-005",
            "tags": ["chemical_safety", "effective_capa", "FAC-002", "engineering_control"]
        },
        {
            "content": "Systemic cross-facility hazard: Emergency fire egress doors repeatedly obstructed by staging pallets across FAC-001 (Plant A), FAC-004 (Warehouse B), and FAC-005 (Distribution Center C) during month-end inventory rushes. Procedural reminders ineffective.",
            "doc_id": "DRIFT-FIRE-EGRESS",
            "tags": ["fire_safety", "cross_facility", "drift", "egress", "seasonal_rush"]
        },
        {
            "content": "FAC-003 and FAC-004: Forklift operator certification lapses consistently correlate with seasonal temp agency staffing onboarding without prior OSHA 1910.178 evaluation.",
            "doc_id": "DRIFT-TRAINING-FORKLIFT",
            "tags": ["training", "forklift", "temp_agency", "turnover", "FAC-003", "FAC-004"]
        },
        {
            "content": "Ventilation distinction: FAC-001 Plant A improper ventilation is toxic VOC vapor extraction in solvent degreasing. FAC-004 Warehouse B improper ventilation is flammable hydrogen gas buildup during battery charging. Do not confuse root regulations.",
            "doc_id": "DRIFT-VENTILATION-DIFF",
            "tags": ["ventilation", "root_cause_distinction", "FAC-001", "FAC-004"]
        }
    ]

    for m in memories_to_retain:
        await hindsight_service.aretain(
            org_id=MERIDIAN_ORG_ID,
            content=m["content"],
            document_id=m["doc_id"],
            tags=m["tags"]
        )
    print("[SUCCESS] Baseline Hindsight memories retained.")


if __name__ == "__main__":
    asyncio.run(seed_meridian_data())
