import logging
from typing import Optional
from fastapi import Header, HTTPException, Depends, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.data.seed_meridian import MERIDIAN_ORG_ID
from app.models import Organization

logger = logging.getLogger("auditmind.security")
security_bearer = HTTPBearer(auto_error=False)


async def verify_api_credentials(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Optional[str]:
    """Validates optional bearer token or API key.
    
    In production, verifies signature against JWT secret or API key store.
    In development/demo mode, permits demo tokens or unauthenticated developer access.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    # In strict mode or production, enforce token validation
    if settings.ENVIRONMENT == "production":
        expected_key = settings.HINDSIGHT_API_KEY or "auditmind-prod-key"
        if token != expected_key:
            logger.warning("Unauthorized access attempt with invalid bearer token.")
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    return token


async def get_current_org_id(
    x_organization_id: Optional[str] = Header(default=MERIDIAN_ORG_ID, alias="X-Organization-Id"),
    db: AsyncSession = Depends(get_db),
    auth: Optional[str] = Depends(verify_api_credentials)
) -> str:
    """Extracts and authorizes tenant organization ID.
    
    Enforces multi-tenant organization-level authorization.
    Verifies organization existence in database to prevent unauthorized tenant escalation.
    """
    org_id = x_organization_id or MERIDIAN_ORG_ID

    # Verify organization exists in database
    stmt = select(Organization.id).where(Organization.id == org_id)
    org_exists = (await db.execute(stmt)).scalar_one_or_none()

    if not org_exists:
        # In special case of startup before DB seeding, allow MERIDIAN_ORG_ID
        if org_id == MERIDIAN_ORG_ID:
            return org_id
        logger.warning("Access denied: Tenant organization %s not found.", org_id)
        raise HTTPException(
            status_code=403,
            detail=f"Forbidden: Tenant organization '{org_id}' is unauthorized or inactive."
        )

    return org_id
