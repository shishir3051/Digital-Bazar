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

# Set all CORS enabled origins
# We allow localhost for development and the specific Vercel frontend domain
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://digitalbazar-com.vercel.app",
    "https://digital-bazar-adwa.onrender.com"
]

# If settings.CORS_ORIGINS contains more, add them
if settings.CORS_ORIGINS and settings.CORS_ORIGINS != "*":
    env_origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    for o in env_origins:
        if o not in origins:
            origins.append(o)

print(f"Allowed CORS Origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Request {request.method} {request.url}")
    response = await call_next(request)
    print(f"DEBUG: Response status: {response.status_code}")
    return response

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
