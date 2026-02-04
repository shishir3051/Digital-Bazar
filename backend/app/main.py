from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from .api.api import api_router
from .core.config import settings
from .db.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Simplified "Allow All" CORS
# This is the most stable configuration for Render + Vercel
# Using allow_credentials=False allows allow_origins=["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Request {request.method} {request.url}")
    try:
        response = await call_next(request)
        print(f"DEBUG: Response status: {response.status_code}")
        return response
    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise e

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
