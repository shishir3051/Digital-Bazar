# Deployment Version: 2026-02-04-V6 (Final Fixes)
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from .api.api import api_router
from .core.config import settings
from .db.mongodb import connect_to_mongo
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

# Robust CORS settings
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://digitalbazar-com.vercel.app",
    "https://digitalbazar.vercel.app", # Direct domain seen in logs
    "https://digital-bazar-adwa.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True, # We can use True with specific origins
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
    try:
        return await call_next(request)
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"CRITICAL ERROR: {str(e)}\n{error_details}")
        # Return the error details temporarily so we can debug live
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": str(e),
                "trace": error_details if not settings.VERSION.startswith("1") else "hidden"
            }
        )

# Include the router at BOTH /api and / (for compatibility)
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router) # Support calls without /api prefix

@app.get("/health")
@app.get(f"{settings.API_V1_STR}/health") # Health check at both locations
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
