import json
from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from app.core.database import AsyncSessionLocal
from app.models import Audit, Finding, CorrectiveAction, Facility, Evidence
from app.services.hindsight_service import hindsight_service
from app.services.verification_engine import verification_engine

# Tool specifications in standard JSON schema for function calling
AGENT_TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "search_audits",
            "description": "Searches structured database records of enterprise audits by facility, date, or keyword.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Keyword to search in audit title or summary"},
                    "facility_code": {"type": "string", "description": "Filter by facility code (e.g. FAC-001)"},
                    "audit_type": {"type": "string", "description": "Filter by type (Safety, Quality, Environmental, SOP)"},
                    "limit": {"type": "integer", "description": "Max results to return (default: 5)"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_finding_history",
            "description": "Retrieves the complete historical finding timeline for a specific non-conformance category or facility.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Finding category (e.g., 'Fire Safety', 'Machine Safety', 'Chemical Safety')"},
                    "facility_code": {"type": "string", "description": "Optional facility code to narrow down"},
                    "include_remedies": {"type": "boolean", "description": "Include past CAPAs and their effectiveness statuses"}
                },
                "required": ["category"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "recall_organizational_memory",
            "description": "Recalls long-term operational lessons, cross-facility patterns, and experiential observations from Hindsight memory banks.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Natural language query for organizational memory (e.g., 'Why does egress blocking recur during quarter end?')"},
                    "time_horizon": {"type": "string", "description": "Optional time filter (e.g. 'last_6_months', 'last_year')"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "analyze_recurring_failures",
            "description": "Analyzes the database and memory graph to detect non-conformances that recur across facilities despite completed corrective actions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Optional category filter (e.g., 'Fire Safety')"},
                    "threshold_days": {"type": "integer", "description": "Recurrence observation window in days (default: 90)"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "verify_corrective_action",
            "description": "Deterministically evaluates whether a specific CAPA actually prevented the problem from recurring or if the failure re-emerged.",
            "parameters": {
                "type": "object",
                "properties": {
                    "corrective_action_id": {"type": "string", "description": "The CAPA identifier or number (e.g. 'CAPA-2026-003')"}
                },
                "required": ["corrective_action_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_remediation_task",
            "description": "Proposes a new evidence-backed corrective action task. High-consequence action requiring human confirmation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "finding_code": {"type": "string", "description": "The finding code being addressed (e.g. 'FIND-2026-003')"},
                    "proposed_action": {"type": "string", "description": "Detailed remediation procedure or engineering control"},
                    "action_type": {"type": "string", "enum": ["ENGINEERING", "PROCEDURAL", "TRAINING", "ADMINISTRATIVE"]},
                    "priority": {"type": "string", "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"]},
                    "assignee": {"type": "string", "description": "Department or individual responsible for remediation"}
                },
                "required": ["finding_code", "proposed_action", "action_type", "assignee"]
            }
        }
    }
]


class AgentToolDispatcher:
    """Dispatches tool calls with strict organization-level data isolation."""

    async def execute_tool(self, org_id: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if tool_name == "search_audits":
            return await self.tool_search_audits(org_id, **arguments)
        elif tool_name == "get_finding_history":
            return await self.tool_get_finding_history(org_id, **arguments)
        elif tool_name == "recall_organizational_memory":
            return await self.tool_recall_organizational_memory(org_id, **arguments)
        elif tool_name == "analyze_recurring_failures":
            return await self.tool_analyze_recurring_failures(org_id, **arguments)
        elif tool_name == "verify_corrective_action":
            return await self.tool_verify_corrective_action(org_id, **arguments)
        elif tool_name == "create_remediation_task":
            return await self.tool_create_remediation_task(org_id, **arguments)
        else:
            return {"error": f"Unknown tool: {tool_name}"}

    async def tool_search_audits(
        self,
        org_id: str,
        query: Optional[str] = None,
        facility_code: Optional[str] = None,
        audit_type: Optional[str] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        async with AsyncSessionLocal() as session:
            stmt = select(Audit, Facility).join(Facility, Audit.facility_id == Facility.id).where(Audit.organization_id == org_id)

            if facility_code:
                stmt = stmt.where(Facility.facility_code == facility_code)
            if audit_type:
                stmt = stmt.where(Audit.audit_type.ilike(f"%{audit_type}%"))
            if query:
                stmt = stmt.where((Audit.title.ilike(f"%{query}%")) | (Audit.summary.ilike(f"%{query}%")))

            stmt = stmt.order_by(Audit.audit_date.desc()).limit(limit)
            rows = (await session.execute(stmt)).all()

            results = []
            for audit, fac in rows:
                results.append({
                    "audit_number": audit.audit_number,
                    "title": audit.title,
                    "facility_code": fac.facility_code,
                    "facility_name": fac.name,
                    "audit_type": audit.audit_type,
                    "date": audit.audit_date.isoformat(),
                    "compliance_score": audit.compliance_score,
                    "status": audit.status
                })

            return {"total_found": len(results), "audits": results}

    async def tool_get_finding_history(
        self,
        org_id: str,
        category: str,
        facility_code: Optional[str] = None,
        include_remedies: bool = True
    ) -> Dict[str, Any]:
        async with AsyncSessionLocal() as session:
            stmt = (
                select(Finding, Facility, Audit)
                .join(Facility, Finding.facility_id == Facility.id)
                .join(Audit, Finding.audit_id == Audit.id)
                .options(selectinload(Finding.corrective_actions))
                .where(
                    Finding.organization_id == org_id,
                    Finding.category.ilike(f"%{category}%")
                )
            )
            if facility_code:
                stmt = stmt.where(Facility.facility_code == facility_code)

            stmt = stmt.order_by(Audit.audit_date.desc()).limit(10)
            rows = (await session.execute(stmt)).all()

            timeline = []
            for f, fac, a in rows:
                item = {
                    "finding_code": f.finding_code,
                    "title": f.title,
                    "facility": fac.facility_code,
                    "audit_date": a.audit_date.isoformat(),
                    "severity": f.severity,
                    "regulation": f.regulation_ref,
                    "is_recurring": f.is_recurring,
                    "recurrence_count": f.recurrence_count
                }
                if include_remedies:
                    item["corrective_actions"] = [
                        {
                            "ca_number": ca.ca_number,
                            "type": ca.action_type,
                            "status": ca.status,
                            "effectiveness": ca.effectiveness_status,
                            "action": ca.proposed_action
                        }
                        for ca in f.corrective_actions
                    ]
                timeline.append(item)

            return {
                "category": category,
                "facility_filter": facility_code or "ALL",
                "occurrences_count": len(timeline),
                "history": timeline
            }

    async def tool_recall_organizational_memory(
        self,
        org_id: str,
        query: str,
        time_horizon: Optional[str] = None
    ) -> Dict[str, Any]:
        memories = await hindsight_service.arecall(
            org_id=org_id,
            query=query,
            limit=6
        )
        return {
            "query": query,
            "recalled_memories_count": len(memories),
            "memories": [
                {
                    "content": m["content"],
                    "category": m.get("metadata", {}).get("category", "EXPERIENTIAL"),
                    "facility": m.get("metadata", {}).get("facility_code", "CROSS_FACILITY"),
                    "tags": m.get("tags", [])
                }
                for m in memories
            ]
        }

    async def tool_analyze_recurring_failures(
        self,
        org_id: str,
        category: Optional[str] = None,
        threshold_days: int = 90
    ) -> Dict[str, Any]:
        async with AsyncSessionLocal() as session:
            stmt = (
                select(Finding, Facility, Audit)
                .join(Facility, Finding.facility_id == Facility.id)
                .join(Audit, Finding.audit_id == Audit.id)
                .where(
                    Finding.organization_id == org_id,
                    Finding.is_recurring == True
                )
            )
            if category:
                stmt = stmt.where(Finding.category.ilike(f"%{category}%"))

            rows = (await session.execute(stmt)).all()

            recurrence_patterns = {}
            for f, fac, a in rows:
                key = f.category
                if key not in recurrence_patterns:
                    recurrence_patterns[key] = {
                        "category": key,
                        "facilities_affected": set(),
                        "recurring_findings_count": 0,
                        "sample_titles": []
                    }
                recurrence_patterns[key]["facilities_affected"].add(fac.facility_code)
                recurrence_patterns[key]["recurring_findings_count"] += 1
                if len(recurrence_patterns[key]["sample_titles"]) < 2:
                    recurrence_patterns[key]["sample_titles"].append(f.title)

            # Format set to list
            formatted = []
            for p in recurrence_patterns.values():
                p["facilities_affected"] = sorted(list(p["facilities_affected"]))
                formatted.append(p)

            return {
                "threshold_days": threshold_days,
                "categories_with_recurrence": len(formatted),
                "recurrence_clusters": formatted
            }

    async def tool_verify_corrective_action(
        self,
        org_id: str,
        corrective_action_id: str
    ) -> Dict[str, Any]:
        async with AsyncSessionLocal() as session:
            return await verification_engine.evaluate_corrective_action(
                session=session,
                organization_id=org_id,
                ca_identifier=corrective_action_id
            )

    async def tool_create_remediation_task(
        self,
        org_id: str,
        finding_code: str,
        proposed_action: str,
        action_type: str,
        assignee: str,
        priority: str = "HIGH"
    ) -> Dict[str, Any]:
        """Proposes a remediation task. Requires human confirmation before database commit."""
        # Check if finding exists
        async with AsyncSessionLocal() as session:
            stmt = select(Finding).where(
                Finding.organization_id == org_id,
                Finding.finding_code == finding_code
            )
            finding = (await session.execute(stmt)).scalar_one_or_none()
            if not finding:
                return {"error": f"Finding code '{finding_code}' not found."}

            return {
                "status": "PROPOSED_AWAITING_HUMAN_APPROVAL",
                "finding_code": finding_code,
                "finding_title": finding.title,
                "proposed_action": proposed_action,
                "action_type": action_type,
                "priority": priority,
                "assignee": assignee,
                "requires_human_approval": True,
                "safety_guard": "Consequential CAPA modification held for Compliance Officer signature."
            }


agent_tool_dispatcher = AgentToolDispatcher()
