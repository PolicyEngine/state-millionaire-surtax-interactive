from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""

    # API
    api_title: str = "State Millionaire Surtax Calculator API"
    api_version: str = "0.1.0"

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    frontend_url: str | None = None

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
