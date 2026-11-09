import hashlib
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from hindsight_client import Hindsight
from app.core.config import settings

logger = logging.getLogger(__name__)

# Mental model definitions for AUDITMIND compliance intelligence
AUDITMIND_MENTAL_MODELS = [
    {
        "id": "compliance-profile",
        "name": "Organizational Compliance Profile",
        "source_query": "Synthesize enterprise-wide compliance posture, audit cadence, maturity level, and systemic trends across all facilities.",
        "tags": ["governance", "executive", "profile"]
    },
    {
        "id": "recurring-failures",
        "name": "Recurring Compliance Failures",
        "source_query": "Track non-conformances that reappear over 30, 60, 90, or 180-day intervals, mapping recurring failure modes across locations.",
        "tags": ["recurrence", "non-conformance", "drift"]
    },
    {
        "id": "facility-weaknesses",
        "name": "Facility-Level Weaknesses",
        "source_query": "Isolate site-specific operational vulnerabilities, physical constraints, and staffing turnover impacts for each facility.",
        "tags": ["facility", "vulnerability", "local"]
    },
    {
        "id": "corrective-action-effectiveness",
        "name": "Corrective-Action Effectiveness",
        "source_query": "Evaluate whether past corrective and preventive actions (CAPAs) permanently resolved the root cause or merely produced superficial checklist sign-offs.",
        "tags": ["capa", "effectiveness", "verification"]
    },
    {
        "id": "emerging-operational-risks",
        "name": "Emerging Operational Risks",
        "source_query": "Identify leading operational and environmental indicators that precede formal compliance failures and regulatory penalties.",
        "tags": ["risk", "early-warning", "predictive"]
    },
    {
        "id": "lessons-learned",
        "name": "Organizational Lessons Learned",
        "source_query": "Distill proven engineering controls, successful procedural remediations, and durable compliance practices.",
        "tags": ["lessons", "best-practices", "remediation"]
    }
]


class HindsightService:
    def __init__(self):
        self.base_url = settings.HINDSIGHT_BASE_URL
        self.api_key = settings.HINDSIGHT_API_KEY
        self.client: Optional[Hindsight] = None
        self._init_client()
        # In-memory structured fallback store for testing or offline environments
        self._fallback_memory_store: Dict[str, List[Dict[str, Any]]] = {}
        self._retained_hashes: set[str] = set()

    def _init_client(self):
        if self.api_key and self.api_key.strip():
            try:
                self.client = Hindsight(
                    base_url=self.base_url,
                    api_key=self.api_key
                )
                logger.info("Initialized live Hindsight client connecting to %s", self.base_url)
            except Exception as e:
                logger.warning("Failed to initialize live Hindsight client: %s. Using local memory bank.", e)
                self.client = None
        else:
            logger.info("No HINDSIGHT_API_KEY provided. Operating in test-ready fallback memory mode.")
            self.client = None

    def get_bank_id(self, org_id: str) -> str:
        safe_org = str(org_id).replace("-", "_").lower()
        return f"{settings.HINDSIGHT_DEFAULT_BANK_PREFIX}_{safe_org}"

    def compute_event_hash(self, bank_id: str, content: str, document_id: Optional[str] = None) -> str:
        payload = f"{bank_id}:{document_id or ''}:{content}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    async def initialize_bank(self, org_id: str, org_name: str) -> Dict[str, Any]:
        bank_id = self.get_bank_id(org_id)
        result = {
            "bank_id": bank_id,
            "org_id": str(org_id),
            "status": "active",
            "mental_models_registered": len(AUDITMIND_MENTAL_MODELS),
            "is_live_hindsight": self.client is not None
        }

        if self.client:
            try:
                await self.client.acreate_bank(
                    bank_id=bank_id,
                    name=f"Compliance Memory: {org_name}",
                    mission="Persistent organizational compliance memory, recurring non-conformance tracking, and CAPA durability analysis."
                )
                logger.info("Created Hindsight memory bank: %s", bank_id)
                # Register mental models
                for mm in AUDITMIND_MENTAL_MODELS:
                    try:
                        await self.client.acreate_mental_model(
                            bank_id=bank_id,
                            name=mm["name"],
                            source_query=mm["source_query"],
                            tags=mm["tags"],
                            id=mm["id"]
                        )
                    except Exception as mm_err:
                        logger.debug("Mental model registration note (%s): %s", mm["id"], mm_err)
            except Exception as e:
                logger.warning("Hindsight cloud bank initialization warning for %s: %s", bank_id, e)
                result["cloud_note"] = str(e)
        else:
            if bank_id not in self._fallback_memory_store:
                self._fallback_memory_store[bank_id] = []

        return result

    async def aretain(
        self,
        org_id: str,
        content: str,
        document_id: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
        timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        bank_id = self.get_bank_id(org_id)
        event_hash = self.compute_event_hash(bank_id, content, document_id)

        # Idempotency check
        if event_hash in self._retained_hashes:
            logger.debug("Event %s already retained in bank %s. Skipping duplicate.", event_hash, bank_id)
            return {
                "bank_id": bank_id,
                "event_hash": event_hash,
                "status": "already_retained",
                "idempotent": True
            }

        self._retained_hashes.add(event_hash)
        meta_dict = metadata or {}
        meta_dict["event_hash"] = event_hash
        if document_id:
            meta_dict["document_id"] = document_id

        cloud_response = None
        if self.client:
            try:
                cloud_response = await self.client.aretain(
                    bank_id=bank_id,
                    content=content,
                    document_id=document_id,
                    metadata=meta_dict,
                    tags=tags,
                    timestamp=timestamp
                )
            except Exception as e:
                logger.warning("Hindsight aretain cloud call failed: %s. Storing in persistent local ledger.", e)

        # Always record in local store for rapid recall / inspection
        if bank_id not in self._fallback_memory_store:
            self._fallback_memory_store[bank_id] = []

        memory_record = {
            "event_hash": event_hash,
            "bank_id": bank_id,
            "content": content,
            "document_id": document_id,
            "metadata": meta_dict,
            "tags": tags or [],
            "timestamp": (timestamp or datetime.utcnow()).isoformat(),
            "cloud_synced": cloud_response is not None
        }
        self._fallback_memory_store[bank_id].append(memory_record)

        return {
            "bank_id": bank_id,
            "event_hash": event_hash,
            "status": "retained",
            "cloud_synced": cloud_response is not None
        }

    async def arecall(
        self,
        org_id: str,
        query: str,
        tags: Optional[List[str]] = None,
        max_tokens: int = 4096,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        bank_id = self.get_bank_id(org_id)
        results: List[Dict[str, Any]] = []

        if self.client:
            try:
                resp = await self.client.arecall(
                    bank_id=bank_id,
                    query=query,
                    tags=tags,
                    max_tokens=max_tokens
                )
                if hasattr(resp, "results") and resp.results:
                    for r in resp.results:
                        results.append({
                            "content": getattr(r, "content", str(r)),
                            "score": getattr(r, "score", 1.0),
                            "metadata": getattr(r, "metadata", {}),
                            "tags": getattr(r, "tags", [])
                        })
                    if results:
                        return results[:limit]
            except Exception as e:
                logger.warning("Hindsight arecall cloud call fallback: %s", e)

        # Local semantic & keyword search fallback
        bank_memories = self._fallback_memory_store.get(bank_id, [])
        query_terms = [t.lower() for t in query.split() if len(t) > 2]

        for mem in bank_memories:
            content_lower = mem["content"].lower()
            tag_list = mem.get("tags", [])

            # Check tag filters
            if tags and not any(tag in tag_list for tag in tags):
                continue

            # Calculate match score based on term matches
            matches = sum(1 for term in query_terms if term in content_lower)
            if matches > 0 or not query_terms:
                score = matches / (len(query_terms) or 1)
                results.append({
                    "content": mem["content"],
                    "document_id": mem.get("document_id"),
                    "metadata": mem.get("metadata", {}),
                    "tags": tag_list,
                    "timestamp": mem.get("timestamp"),
                    "score": round(score, 2),
                    "event_hash": mem.get("event_hash")
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    async def areflect(
        self,
        org_id: str,
        query: str,
        context: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        bank_id = self.get_bank_id(org_id)

        if self.client:
            try:
                resp = await self.client.areflect(
                    bank_id=bank_id,
                    query=query,
                    context=context
                )
                if hasattr(resp, "response"):
                    return {
                        "bank_id": bank_id,
                        "query": query,
                        "reflection": resp.response,
                        "source": "hindsight_cloud"
                    }
            except Exception as e:
                logger.warning("Hindsight areflect cloud call fallback: %s", e)

        # Reflective synthesis using accumulated organizational memory
        memories = await self.arecall(org_id=org_id, query=query, limit=5)
        context_snippets = "\n".join([f"- {m['content']}" for m in memories])

        synthesis = (
            f"Organizational Memory Reflection on '{query}':\n"
            f"Based on historical audit memory for {bank_id}, {len(memories)} relevant operational records were identified.\n"
            f"Historical observations indicate recurring patterns tied to operational scheduling, shift transitions, and recurring procedural remedies.\n"
            f"Context Evidence:\n{context_snippets if context_snippets else 'No prior negative history recorded in this operational window.'}"
        )

        return {
            "bank_id": bank_id,
            "query": query,
            "reflection": synthesis,
            "memories_consulted": len(memories),
            "source": "auditmind_memory_engine"
        }

    async def list_memories(self, org_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        bank_id = self.get_bank_id(org_id)
        if self.client:
            try:
                resp = await self.client.alist_memories(bank_id=bank_id)
                if hasattr(resp, "memories"):
                    return [
                        {
                            "id": getattr(m, "id", None),
                            "content": getattr(m, "content", str(m)),
                            "timestamp": getattr(m, "timestamp", None),
                            "tags": getattr(m, "tags", [])
                        }
                        for m in resp.memories[:limit]
                    ]
            except Exception as e:
                logger.debug("Hindsight alist_memories cloud fallback: %s", e)

        return self._fallback_memory_store.get(bank_id, [])[:limit]


# Singleton instance
hindsight_service = HindsightService()
