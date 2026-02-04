import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
db_name = os.environ.get('DB_NAME', 'digital_bazar_test')

if not mongo_url:
    print("Error: MONGO_URL not found in environment variables.")
    exit(1)

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def create_admin():
    username = input("Enter admin username [admin]: ") or "admin"
    email = input("Enter admin email [admin@digitalbazar.com]: ") or "admin@digitalbazar.com"
    password = input("Enter admin password: ")
    full_name = input("Enter admin full name [Administrator]: ") or "Administrator"

    if not password:
        print("Error: Password is required.")
        return

    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": username}, {"email": email}]})
    if existing_user:
        print(f"Error: User with username '{username}' or email '{email}' already exists.")
        return

    user_id = str(uuid.uuid4())
    hashed_password = hash_password(password)

    user_doc = {
        "id": user_id,
        "username": username,
        "email": email,
        "full_name": full_name,
        "is_admin": True,
        "created_at": datetime.now(timezone.utc)
    }

    # Save user and password
    await db.users.insert_one(user_doc)
    await db.user_passwords.insert_one({"user_id": user_id, "password_hash": hashed_password})

    print(f"Successfully created admin user: {username} ({email})")

if __name__ == "__main__":
    asyncio.run(create_admin())
