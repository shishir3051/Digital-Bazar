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
    """Establishes a connection to MongoDB if not already connected."""
    if db_instance.client is not None:
        try:
            # Test if connection is still alive
            await db_instance.client.admin.command('ping')
            return
        except Exception:
            # Connection dead, reconnect
            db_instance.client = None
            db_instance.db = None
        
    try:
        url = normalize_mongo_url(settings.MONGO_URL)
        log_url = url.split("@")[1] if "@" in url else "cluster-info"
        print(f"DATABASE: Connecting to {log_url}")
        
        db_instance.client = AsyncIOMotorClient(
            url,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            maxPoolSize=10,
            minPoolSize=1
        )
        db_instance.db = db_instance.client[settings.DB_NAME]
        
        # Immediate check with timeout
        await db_instance.client.admin.command('ping')
        print("DATABASE: Connected successfully")
    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        db_instance.client = None
        db_instance.db = None
        raise e

async def get_database():
    """Dependency that ensures a database connection exists before providing it."""
    if db_instance.db is None:
        try:
            await connect_to_mongo()
        except Exception as e:
            print(f"WARNING: Database connection failed on request: {str(e)}")
            # Return db_instance anyway, so the error is handled at endpoint level
    return db_instance.db
