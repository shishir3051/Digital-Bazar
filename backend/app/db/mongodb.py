from motor.motor_asyncio import AsyncIOMotorClient
from ..core.config import settings
from fastapi import HTTPException, status
import urllib.parse

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

def normalize_mongo_url(url: str) -> str:
    """Defensively encode the password parts of a MongoDB URL if they contain special characters."""
    if not url.startswith("mongodb"):
        return url
        
    try:
        # Check if URL is already likely encoded (contains %)
        if "%" in url:
            return url
            
        # Example: mongodb+srv://user:pass/word@cluster
        # We need to encode 'pass/word'
        parts = url.split("://")
        if len(parts) < 2: return url
        
        prefix = parts[0]
        rest = parts[1]
        
        user_pass_part = rest.split("@")[0] if "@" in rest else ""
        if ":" in user_pass_part:
            user, password = user_pass_part.split(":", 1)
            # Encode password but keep the rest
            encoded_pass = urllib.parse.quote_plus(password)
            new_user_pass = f"{user}:{encoded_pass}"
            return f"{prefix}://{new_user_pass}@{rest.split('@', 1)[1]}"
            
        return url
    except:
        return url

async def connect_to_mongo():
    try:
        url = normalize_mongo_url(settings.MONGO_URL)
        # Mask password in logs
        log_url = url.split("@")[1] if "@" in url else "invalid-url"
        print(f"DATABASE: Connecting to cluster: {log_url}")
        
        db_instance.client = AsyncIOMotorClient(url)
        db_instance.db = db_instance.client[settings.DB_NAME]
        
        # Verify connection
        await db_instance.client.admin.command('ping')
        print("DATABASE: Successfully connected and pinged MongoDB")
    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        db_instance.db = None
        raise e

async def close_mongo_connection():
    if db_instance.client:
        db_instance.client.close()

def get_database():
    if db_instance.db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not established. Please check server logs."
        )
    return db_instance.db
