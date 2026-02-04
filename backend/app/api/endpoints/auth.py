from fastapi import APIRouter, Depends, HTTPException, status
from ...models.schemas import UserCreate, User, Token, LoginRequest
from ...core.security import get_password_hash, verify_password, create_access_token
from ...db.mongodb import get_database

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db = Depends(get_database)):
    existing_user = await db.users.find_one({"$or": [{"username": user_in.username}, {"email": user_in.email}]})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
    
    user_dict = user_in.dict()
    password = user_dict.pop("password")
    hashed_password = get_password_hash(password)
    
    user = User(**user_dict)
    await db.users.insert_one(user.dict())
    await db.user_passwords.insert_one({"user_id": user.id, "password_hash": hashed_password})
    
    token = create_access_token({"user_id": user.id})
    return Token(token=token, user=user)

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db = Depends(get_database)):
    user_data = await db.users.find_one({"username": login_data.username})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username or password"
        )
    
    password_data = await db.user_passwords.find_one({"user_id": user_data["id"]})
    if not password_data or not verify_password(login_data.password, password_data["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username or password"
        )
    
    user = User(**user_data)
    token = create_access_token({"user_id": user.id})
    return Token(token=token, user=user)
