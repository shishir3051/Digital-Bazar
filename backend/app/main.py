# Deployment Version: 2026-02-04-V5 (Ultra Stable)
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

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
