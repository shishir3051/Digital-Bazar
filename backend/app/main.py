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

import logging

# Configure logging to see errors in Render logs
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("uvicorn.error")

# Set all CORS enabled origins
# We use regex to allow all Vercel subdomains (including previews)
# and explicit strings for localhost and the main domain.
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://digitalbazar-com.vercel.app",
    "https://digital-bazar-adwa.onrender.com"
]

# regex to allow: https://digital-bazar-*.vercel.app and https://digitalbazar-*.vercel.app
origin_regex = r"https?://(localhost|digital-?bazar-.*\.vercel\.app|digitalbazar-.*\.vercel\.app)"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.debug(f"Incoming request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.debug(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Error handling request: {str(e)}", exc_info=True)
        # Re-raise to let FastAPI handle it or return a 500
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
