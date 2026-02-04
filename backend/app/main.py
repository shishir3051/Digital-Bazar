# Deployment Version: 2026-02-04-V5 (Ultra Stable)
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from .api.api import api_router
from .core.config import settings
from .db.mongodb import connect_to_mongo, close_mongo_connection
import logging
import sys

# Immediate log to confirm file is loaded
print("STARTUP: Loading main.py V5...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Simplified "Allow All" CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("STARTUP: Entering startup_event")
    try:
        await connect_to_mongo()
        print("STARTUP: MongoDB connected successfully")
    except Exception as e:
        print(f"STARTUP ERROR: MongoDB connection failed: {str(e)}")
        # Don't re-raise, let the app start so we can see health check
        pass

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Request {request.method} {request.url}")
    return await call_next(request)

# Include the router at BOTH /api and / (for compatibility)
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router) # Support calls without /api prefix

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health") # Health check at both locations
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
