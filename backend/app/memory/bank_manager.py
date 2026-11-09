import logging
from typing import Optional, Dict, Any
from app.memory.hindsight_client import get_hindsight_client

logger = logging.getLogger("auditmind.memory.bank_manager")

DEFAULT_BANK_ID = "meridian-industrial-demo"
DEFAULT_BANK_NAME = "Meridian Industrial Group Compliance Bank"
DEFAULT_BANK_MISSION = (
    "Maintain persistent organizational compliance memory, including historical audit findings, "
    "corrective actions, verification outcomes and operational experiences."
)


class MemoryBankManager:
    """Manages creation, verification, and configuration of Hindsight memory banks."""

    def __init__(self):
        self.wrapper = get_hindsight_client()

    async def ensure_memory_bank(
        self,
        bank_id: str = DEFAULT_BANK_ID,
        name: Optional[str] = None,
        mission: Optional[str] = None
    ) -> Dict[str, Any]:
        """Creates a memory bank or confirms its existing state with proper mission configuration."""
        bank_name = name or DEFAULT_BANK_NAME
        bank_mission = mission or DEFAULT_BANK_MISSION

        result: Dict[str, Any] = {
            "bank_id": bank_id,
            "name": bank_name,
            "mission": bank_mission,
            "status": "ready"
        }

        # Cloud bank creation
        if self.wrapper.client:
            try:
                response = await self.wrapper.client.acreate_bank(
                    bank_id=bank_id,
                    name=bank_name,
                    mission=bank_mission,
                    enable_observations=True,
                    enable_text_search=True,
                    enable_temporal_retrieval=True
                )
                result["cloud_profile"] = str(response)
                result["status"] = "created_cloud"
                logger.info("Successfully created/configured Hindsight cloud bank: %s", bank_id)
            except Exception as e:
                # Handle existing bank gracefully
                err_str = str(e).lower()
                if "already exists" in err_str or "conflict" in err_str or "409" in err_str:
                    logger.info("Hindsight bank '%s' already exists in cloud. Reusing.", bank_id)
                    result["status"] = "existing_cloud"
                else:
                    logger.warning("Cloud bank creation warning for '%s': %s. Active in fallback store.", bank_id, e)
                    result["cloud_warning"] = str(e)
                    result["status"] = "fallback_active"

        # Local fallback store initialization
        if bank_id not in self.wrapper._fallback_store:
            self.wrapper._fallback_store[bank_id] = []
            if result["status"] == "ready":
                result["status"] = "created_local"

        return result

    async def get_bank_status(self, bank_id: str = DEFAULT_BANK_ID) -> Dict[str, Any]:
        """Returns the current state and event counts for the specified bank."""
        local_events = self.wrapper._fallback_store.get(bank_id, [])
        return {
            "bank_id": bank_id,
            "cloud_connected": self.wrapper.is_cloud_connected,
            "tracked_events_count": len(local_events),
            "mission": DEFAULT_BANK_MISSION
        }


bank_manager = MemoryBankManager()
