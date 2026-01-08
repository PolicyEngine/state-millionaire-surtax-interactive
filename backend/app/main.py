"""
State Millionaire Surtax Calculator API

FastAPI application for calculating millionaire surtax impacts.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .api.routes import health, household, aggregate

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan (startup/shutdown)."""
    logger.info("Starting State Millionaire Surtax Calculator API...")
    logger.info("API ready to accept requests")
    yield
    logger.info("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="Calculate millionaire surtax impacts for various states",
    lifespan=lifespan,
)

# Configure CORS
cors_origins = settings.cors_origins.copy()
if settings.frontend_url:
    cors_origins.append(settings.frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(household.router, prefix="/api", tags=["household"])
app.include_router(aggregate.router, prefix="/api", tags=["aggregate"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "State Millionaire Surtax Calculator API",
        "version": settings.api_version,
        "docs": "/docs",
    }
