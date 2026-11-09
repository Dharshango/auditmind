import logging
from typing import Optional, Dict, Any, List
from app.memory.hindsight_client import get_hindsight_client
from app.memory.bank_manager import DEFAULT_BANK_ID

logger = logging.getLogger("auditmind.memory.retrieval")


class MemoryRetrievalEngine:
    """Manages asynchronous memory recall and cognitive reflection across Hindsight memory banks."""

    def __init__(self):
        self.wrapper = get_hindsight_client()

    async def recall_memories(
        self,
        query: str,
        bank_id: str = DEFAULT_BANK_ID,
        limit: int = 5,
        types: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """Recalls relevant historical compliance memories matching natural language query."""
        if self.wrapper.client:
            try:
                cloud_response = await self.wrapper.client.arecall(
                    bank_id=bank_id,
                    query=query,
                    types=types,
                    tags=tags
                )
                if hasattr(cloud_response, "memories") and cloud_response.memories:
                    return [
                        {
                            "content": getattr(m, "content", str(m)),
                            "metadata": getattr(m, "metadata", {}),
                            "tags": getattr(m, "tags", []),
                            "source": "hindsight_cloud"
                        }
                        for m in cloud_response.memories[:limit]
                    ]
            except Exception as e:
                logger.warning("Cloud recall call encountered warning: %s. Falling back to local ledger.", e)

        # Fallback local retrieval: filter and rank stored events
        stored = self.wrapper._fallback_store.get(bank_id, [])
        query_words = set(query.lower().split())

        scored = []
        for entry in stored:
            content_str = entry.get("content") or ""
            context_str = entry.get("context") or ""
            tags_str = " ".join(entry.get("tags") or [])
            text = f"{content_str} {context_str} {tags_str}".lower()
            score = sum(1 for w in query_words if len(w) > 2 and w in text)
            if score > 0 or not query.strip():
                scored.append((score, entry))

        # Sort by score descending
        scored.sort(key=lambda x: x[0], reverse=True)
        results = [item[1] for item in scored[:limit]]

        # If zero match on query words, return recent memories to maintain context
        if not results and stored:
            results = stored[-limit:]

        return results

    async def reflect_over_memories(
        self,
        query: str,
        bank_id: str = DEFAULT_BANK_ID,
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Synthesizes high-level reflections and operational lessons across multiple historical events."""
        if self.wrapper.client:
            try:
                cloud_reflection = await self.wrapper.client.areflect(
                    bank_id=bank_id,
                    query=query,
                    context=context
                )
                return {
                    "bank_id": bank_id,
                    "query": query,
                    "reflection": getattr(cloud_reflection, "response", str(cloud_reflection)),
                    "source": "hindsight_cloud"
                }
            except Exception as e:
                logger.warning("Cloud reflect call encountered warning: %s. Generating local reflection.", e)

        # Local cognitive reflection over accumulated memories
        stored = self.wrapper._fallback_store.get(bank_id, [])
        findings = [m for m in stored if m.get("metadata", {}).get("category") == "FINDING" or "finding" in m.get("content", "").lower()]
        capas = [m for m in stored if m.get("metadata", {}).get("category") == "CORRECTIVE_ACTION" or "corrective action" in m.get("content", "").lower()]
        verifications = [m for m in stored if m.get("metadata", {}).get("category") == "VERIFICATION" or "verification" in m.get("content", "").lower()]

        synthesis_lines = [
            f"Cognitive Reflection over Hindsight Bank '{bank_id}':",
            f"- Total Recorded Memory Units: {len(stored)}",
            f"- Non-Conformances Analyzed: {len(findings)}",
            f"- Remediation Actions Reviewed: {len(capas)}",
            f"- Post-Implementation Verifications: {len(verifications)}",
            "",
            "Synthesized Pattern & Durability Insight:",
        ]

        if any("recur" in m.get("content", "").lower() for m in verifications):
            synthesis_lines.append(
                "CRITICAL PATTERN DETECTED: Corrective action failed post-completion observation. "
                "Procedural reminders failed to prevent defect recurrence. "
                "Recommendation: Transition from administrative controls to engineered physical interlocks."
            )
        else:
            synthesis_lines.append(
                "Compliance trend indicates active observation window with no immediate repeat violations detected."
            )

        return {
            "bank_id": bank_id,
            "query": query,
            "reflection": "\n".join(synthesis_lines),
            "source": "hindsight_cognitive_engine",
            "events_analyzed": len(stored)
        }


retrieval_engine = MemoryRetrievalEngine()
