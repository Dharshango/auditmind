import logging
from typing import Optional, Dict, Any, List
from hindsight_client import Hindsight
from app.core.config import settings

logger = logging.getLogger("auditmind.memory.client")


class HindsightClientWrapper:
    """Manages the lifecycle of the official Vectorize Hindsight client with graceful offline fallback."""

    def __init__(self):
        self.api_url = settings.HINDSIGHT_API_URL or "https://api.hindsight.vectorize.io"
        self.api_key = settings.HINDSIGHT_API_KEY
        self.client: Optional[Hindsight] = None
        self._fallback_store: Dict[str, List[Dict[str, Any]]] = {}
        self._retained_hashes: set[str] = set()
        self._init_client()

    def _init_client(self):
        if self.api_key and self.api_key.strip() and self.api_key != "your_hindsight_api_key_here":
            try:
                self.client = Hindsight(
                    base_url=self.api_url,
                    api_key=self.api_key
                )
                logger.info("Initialized live Hindsight client connecting to %s", self.api_url)
            except Exception as e:
                logger.warning("Failed to initialize live Hindsight client: %s. Using local memory bank.", e)
                self.client = None
        else:
            logger.info("No active HINDSIGHT_API_KEY provided. Operating in high-fidelity local memory mode.")
            self.client = None

    @property
    def is_cloud_connected(self) -> bool:
        return self.client is not None

    async def check_health(self) -> Dict[str, Any]:
        """Performs a health check on the Hindsight integration."""
        status = {
            "status": "healthy",
            "api_url": self.api_url,
            "cloud_connected": self.is_cloud_connected,
            "engine": "Hindsight SDK v1.2.0",
            "active_banks_tracked": len(self._fallback_store),
            "retained_events_count": len(self._retained_hashes)
        }

        if self.client:
            try:
                version_info = await self.client.aget_version()
                status["hindsight_version"] = str(version_info)
            except Exception as e:
                status["cloud_check_warning"] = str(e)

        return status


_client_wrapper: Optional[HindsightClientWrapper] = None


def get_hindsight_client() -> HindsightClientWrapper:
    global _client_wrapper
    if _client_wrapper is None:
        _client_wrapper = HindsightClientWrapper()
    return _client_wrapper
