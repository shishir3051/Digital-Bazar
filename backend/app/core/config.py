import os
from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Bazar API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    MONGO_URL: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "digital_bazar_test")
    
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    # Currency conversion (USD -> BDT). Override in .env with live rate if desired.
    USD_TO_BDT_RATE: float = float(os.getenv("USD_TO_BDT_RATE", "108.0"))

    # bKash configuration (sandbox)
    BKASH_BASE_URL: str = os.getenv("BKASH_BASE_URL", "https://token.sandbox.bkash.com")
    BKASH_APP_KEY: str = os.getenv("BKASH_APP_KEY", "")
    BKASH_APP_SECRET: str = os.getenv("BKASH_APP_SECRET", "")

    class Config:
        case_sensitive = True

settings = Settings()
