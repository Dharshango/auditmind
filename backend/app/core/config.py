from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "auditmind-dev-secret-key-change-in-production-1234567890"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./auditmind.db"

    # Hindsight Memory
    HINDSIGHT_API_KEY: str = Field(default="", description="API key for Hindsight Cloud")
    HINDSIGHT_API_URL: str = Field(
        default="https://api.hindsight.vectorize.io",
        validation_alias=AliasChoices("HINDSIGHT_API_URL", "HINDSIGHT_BASE_URL"),
        description="Hindsight API Base URL"
    )
    HINDSIGHT_BASE_URL: str = Field(
        default="https://api.hindsight.vectorize.io",
        validation_alias=AliasChoices("HINDSIGHT_BASE_URL", "HINDSIGHT_API_URL"),
        description="Hindsight API Base URL alias"
    )
    HINDSIGHT_INFERENCE_URL: str = Field(
        default="https://inference.hindsight.vectorize.io/v1",
        validation_alias=AliasChoices("HINDSIGHT_INFERENCE_URL", "HINDSIGHT_INFERENCE_BASE_URL"),
        description="Hindsight Inference API Base URL (embeddings & reranking)"
    )
    HINDSIGHT_DEFAULT_BANK_PREFIX: str = "auditmind-org"

    # Groq / LLM
    GROQ_API_KEY: str = Field(default="", description="Groq API key for tool calling & inference")
    GROQ_MODEL: str = Field(
        default="openai/gpt-oss-120b",
        validation_alias=AliasChoices("GROQ_MODEL", "LLM_MODEL"),
        description="LLM model name"
    )
    LLM_MODEL: str = Field(
        default="openai/gpt-oss-120b",
        validation_alias=AliasChoices("LLM_MODEL", "GROQ_MODEL"),
        description="LLM model alias"
    )

    # Server, URLs & CORS
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origin_list(self) -> List[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        return origins

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
