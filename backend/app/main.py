from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.models import Organization
from app.data.seed_meridian import MERIDIAN_ORG_ID
from app.services.hindsight_service import hindsight_service
from app.api import api_router, api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    print(f"[*] AUDITMIND Backend starting in {settings.ENVIRONMENT} mode")
    print(f"[*] Initializing database schema...")
    await init_db()

    # Check if benchmark tenant exists; seed if missing
    async with AsyncSessionLocal() as session:
        org = await session.get(Organization, MERIDIAN_ORG_ID)
        if not org:
            print("[*] Benchmark tenant not found. Auto-seeding Meridian Industrial Group...")
            from app.data.seed_meridian import seed_meridian_data
            await seed_meridian_data()
            print("[*] Meridian Industrial Group benchmark dataset seeded successfully.")

    print(f"[*] Hindsight Service configured (Base URL: {settings.HINDSIGHT_BASE_URL})")
    yield
    # Shutdown actions
    print("[*] AUDITMIND Backend shutting down")


app = FastAPI(
    title="AUDITMIND API",
    description="The Self-Learning Operational Compliance Intelligence Agent API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers (/api and /api/v1)
app.include_router(api_router)
app.include_router(api_v1_router)


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": "AUDITMIND Operational Compliance Intelligence",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": settings.DATABASE_URL.split("///")[0],
        "hindsight_configured": bool(settings.HINDSIGHT_API_KEY),
        "groq_configured": bool(settings.GROQ_API_KEY)
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "name": "AUDITMIND",
        "tagline": "Remembering failures. Understanding patterns. Preventing recurrence.",
        "category": "Compliance & Audit Agent",
        "docs_url": "/docs",
        "api_v1": "/api/v1"
    }
