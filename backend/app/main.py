# Deployment Version: 2026-02-04-V6 (Final Fixes)
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from .api.api import api_router
from .core.config import settings
from .db.mongodb import connect_to_mongo, db_instance
import logging
import sys

# Immediate log to confirm file is loaded
print("STARTUP: Loading main.py V6...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    redirect_slashes=False # Prevent 307 redirects which break CORS
)

# CORS settings - allow all origins for development/production flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("STARTUP: Entering startup_event")
    # Don't block on database connection - connect lazily when needed
    print("STARTUP: Skipping immediate MongoDB connection (will connect on first request)")

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Request {request.method} {request.url}")
    try:
        response = await call_next(request)
        return response
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"MIDDLEWARE ERROR: {str(e)}\n{error_details}")
        # Let FastAPI handle the error, don't catch it here
        raise

# Include the router at BOTH /api and / (for compatibility)
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router) # Support calls without /api prefix

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health") # Health check at both locations
async def health_check():
    try:
        # Try to ping the database
        if db_instance.db is None:
            await connect_to_mongo()
        await db_instance.client.admin.command('ping')
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": db_status
    }
