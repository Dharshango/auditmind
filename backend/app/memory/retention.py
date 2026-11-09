import hashlib
import logging
from datetime import datetime
from typing import Optional, Dict, Any, List
from app.memory.hindsight_client import get_hindsight_client
from app.memory.bank_manager import DEFAULT_BANK_ID

logger = logging.getLogger("auditmind.memory.retention")


class MemoryRetentionEngine:
    """Manages asynchronous, idempotent event retention into Hindsight memory banks."""

    def __init__(self):
        self.wrapper = get_hindsight_client()

    def compute_event_hash(self, bank_id: str, content: str, document_id: Optional[str] = None) -> str:
        """Computes a deterministic SHA-256 hash for idempotency checking."""
        payload = f"{bank_id}:{document_id or ''}:{content.strip()}"
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    async def retain_event(
        self,
        content: str,
        bank_id: str = DEFAULT_BANK_ID,
        context: Optional[str] = None,
        document_id: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None,
        tags: Optional[List[str]] = None,
        timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Retains an operational compliance event with idempotency verification and metadata tracking."""
        event_hash = self.compute_event_hash(bank_id, content, document_id)

        # Idempotency check: skip duplicates
        if event_hash in self.wrapper._retained_hashes:
            logger.debug("Event '%s' already retained in bank '%s'. Skipping duplicate.", event_hash[:10], bank_id)
            return {
                "bank_id": bank_id,
                "event_hash": event_hash,
                "status": "already_retained",
                "idempotent": True
            }

        self.wrapper._retained_hashes.add(event_hash)

        # Prepare metadata
        meta_dict = metadata or {}
        meta_dict["event_hash"] = event_hash
        if document_id:
            meta_dict["document_id"] = document_id

        # Cloud retention
        cloud_res = None
        if self.wrapper.client:
            try:
                cloud_res = await self.wrapper.client.aretain(
                    bank_id=bank_id,
                    content=content,
                    context=context,
                    document_id=document_id,
                    metadata=meta_dict,
                    tags=tags,
                    timestamp=timestamp
                )
                logger.info("Retained event in Hindsight cloud bank %s (hash: %s...)", bank_id, event_hash[:8])
            except Exception as e:
                logger.warning("Cloud retain call failed: %s. Storing in local ledger.", e)

        # Local fallback ledger
        if bank_id not in self.wrapper._fallback_store:
            self.wrapper._fallback_store[bank_id] = []

        local_entry = {
            "bank_id": bank_id,
            "content": content,
            "context": context,
            "document_id": document_id,
            "metadata": meta_dict,
            "tags": tags or [],
            "timestamp": timestamp.isoformat() if timestamp else datetime.utcnow().isoformat(),
            "event_hash": event_hash
        }
        self.wrapper._fallback_store[bank_id].append(local_entry)

        return {
            "bank_id": bank_id,
            "status": "retained",
            "event_hash": event_hash,
            "document_id": document_id,
            "cloud_response": str(cloud_res) if cloud_res else None
        }


retention_engine = MemoryRetentionEngine()
