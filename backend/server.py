from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
from passlib.context import CryptContext
import json
import random
import string


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT and Password settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="E-Commerce API", description="Full-featured e-commerce API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_jwt_token(data: dict):
    return jwt.encode(data, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_jwt_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("user_id")
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return User(**user)


# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    full_name: str
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: str
    stock: int

class CartItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    quantity: int
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CartItemCreate(BaseModel):
    product_id: str
    quantity: int

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[dict]
    total_amount: float
    status: str = "pending"
    shipping_address: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    shipping_address: str

class LoginResponse(BaseModel):
    token: str
    user: User

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


# Authentication Routes
@api_router.post("/auth/register", response_model=LoginResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create new user
    user_dict = user_data.dict()
    hashed_password = hash_password(user_dict.pop("password"))
    user = User(**user_dict)
    
    # Save user and password separately
    await db.users.insert_one(user.dict())
    await db.user_passwords.insert_one({"user_id": user.id, "password_hash": hashed_password})
    
    # Create token
    token = create_jwt_token({"user_id": user.id})
    
    return LoginResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"username": login_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    # Check password
    user_password = await db.user_passwords.find_one({"user_id": user["id"]})
    if not user_password or not verify_password(login_data.password, user_password["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    # Create token
    user_obj = User(**user)
    token = create_jwt_token({"user_id": user_obj.id})
    
    return LoginResponse(token=token, user=user_obj)


@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        # We return success even if user doesn't exist for security (avoid email enumeration)
        # But for this demo, we can be more explicit or just log it.
        return {"message": "If an account exists with this email, an OTP has been sent."}
    
    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    expiry = datetime.now(timezone.utc).timestamp() + 600 # 10 minutes
    
    # Store OTP (we could hash it, but for simplicity we store it plain in a temp collection)
    await db.password_resets.update_one(
        {"email": request.email},
        {"$set": {"otp": otp, "expiry": expiry}},
        upsert=True
    )
    
    # "Send" email (mock)
    print(f"\n[EMAIL MOCK] To: {request.email}")
    print(f"[EMAIL MOCK] Subject: Your Digital Bazar OTP")
    print(f"[EMAIL MOCK] Body: Your OTP is {otp}. It expires in 10 minutes.\n")
    
    return {"message": "OTP sent successfully"}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    reset_session = await db.password_resets.find_one({"email": request.email})
    
    if not reset_session:
        raise HTTPException(status_code=400, detail="Invalid request")
    
    if reset_session["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if datetime.now(timezone.utc).timestamp() > reset_session["expiry"]:
        await db.password_resets.delete_one({"email": request.email})
        raise HTTPException(status_code=400, detail="OTP expired")
    
    # Find user to get ID
    user = await db.users.find_one({"email": request.email})
    if not user:
         raise HTTPException(status_code=404, detail="User not found")
         
    # Update password
    hashed_password = hash_password(request.new_password)
    await db.user_passwords.update_one(
        {"user_id": user["id"]},
        {"$set": {"password_hash": hashed_password}}
    )
    
    # Clean up reset session
    await db.password_resets.delete_one({"email": request.email})
    
    return {"message": "Password reset successfully"}


# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {"category": category} if category else {}
    products = await db.products.find(query).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    product = Product(**product_data.dict())
    await db.products.insert_one(product.dict())
    return product


# Cart Routes
@api_router.get("/cart", response_model=List[dict])
async def get_cart(current_user: User = Depends(get_current_user)):
    cart_items = await db.cart_items.find({"user_id": current_user.id}).to_list(1000)
    
    # Enrich with product details
    enriched_cart = []
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]})
        if product:
            enriched_cart.append({
                "cart_item": CartItem(**item),
                "product": Product(**product)
            })
    
    return enriched_cart

@api_router.post("/cart/add", response_model=CartItem)
async def add_to_cart(item_data: CartItemCreate, current_user: User = Depends(get_current_user)):
    # Check if product exists
    product = await db.products.find_one({"id": item_data.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = await db.cart_items.find_one({
        "user_id": current_user.id,
        "product_id": item_data.product_id
    })
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item["quantity"] + item_data.quantity
        await db.cart_items.update_one(
            {"id": existing_item["id"]},
            {"$set": {"quantity": new_quantity}}
        )
        updated_item = await db.cart_items.find_one({"id": existing_item["id"]})
        return CartItem(**updated_item)
    else:
        # Create new cart item
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        await db.cart_items.insert_one(cart_item.dict())
        return cart_item

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, current_user: User = Depends(get_current_user)):
    result = await db.cart_items.delete_one({"id": item_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

@api_router.delete("/cart")
async def clear_cart(current_user: User = Depends(get_current_user)):
    await db.cart_items.delete_many({"user_id": current_user.id})
    return {"message": "Cart cleared"}


# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate, current_user: User = Depends(get_current_user)):
    # Get cart items
    cart_items = await db.cart_items.find({"user_id": current_user.id}).to_list(1000)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and prepare order items
    total_amount = 0
    order_items = []
    
    for cart_item in cart_items:
        product = await db.products.find_one({"id": cart_item["product_id"]})
        if product:
            item_total = product["price"] * cart_item["quantity"]
            total_amount += item_total
            order_items.append({
                "product_id": cart_item["product_id"],
                "product_name": product["name"],
                "quantity": cart_item["quantity"],
                "price": product["price"],
                "total": item_total
            })
    
    # Create order
    order = Order(
        user_id=current_user.id,
        items=order_items,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address
    )
    
    await db.orders.insert_one(order.dict())
    
    # Clear cart
    await db.cart_items.delete_many({"user_id": current_user.id})
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user.id}).to_list(1000)
    return [Order(**order) for order in orders]

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: User = Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user.id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)


# Admin Routes
@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    orders = await db.orders.find().to_list(1000)
    return [Order(**order) for order in orders]

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated"}


@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    
    # Calculate total revenue
    pipeline = [
        {"$match": {"status": {"$ne": "cancelled"}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    revenue_result = await db.orders.aggregate(pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Get recent orders
    recent_orders = await db.orders.find().sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "products_count": total_products,
        "orders_count": total_orders,
        "total_revenue": total_revenue,
        "recent_orders": [Order(**order).dict() for order in recent_orders]
    }


# Initialize sample products
@api_router.post("/admin/init-products")
async def initialize_products():
    # Check if products already exist
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Products already initialized"}
    
    sample_products = [
        {
            "name": "Wireless Headphones",
            "description": "High-quality wireless headphones with noise cancellation",
            "price": 199.99,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljc3xlbnwwfHx8fDE3NTkzMTQ0MDd8MA&ixlib=rb-4.1.0&q=85",
            "stock": 50
        },
        {
            "name": "Smart Circuit Board",
            "description": "Advanced circuit board for electronics projects",
            "price": 89.99,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1562408590-e32931084e23?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxlbGVjdHJvbmljc3xlbnwwfHx8fDE3NTkzMTQ0MDd8MA&ixlib=rb-4.1.0&q=85",
            "stock": 25
        },
        {
            "name": "Premium Headset",
            "description": "Professional gaming and work headset",
            "price": 149.99,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1550009158-9ebf69173e03?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxlbGVjdHJvbmljc3xlbnwwfHx8fDE3NTkzMTQ0MDd8MA&ixlib=rb-4.1.0&q=85",
            "stock": 30
        },
        {
            "name": "Electronic Components Kit",
            "description": "Complete kit for electronic prototyping",
            "price": 79.99,
            "category": "Electronics",
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxlbGVjdHJvbmljc3xlbnwwfHx8fDE3NTkzMTQ0MDd8MA&ixlib=rb-4.1.0&q=85",
            "stock": 40
        },
        {
            "name": "Colorful T-Shirt Collection",
            "description": "Premium cotton t-shirts in various colors",
            "price": 29.99,
            "category": "Clothing",
            "image_url": "https://images.unsplash.com/photo-1562157873-818bc0726f68?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwzfHxjbG90aGluZ3xlbnwwfHx8fDE3NTkzMTU5NDZ8MA&ixlib=rb-4.1.0&q=85",
            "stock": 100
        },
        {
            "name": "Fashion Store Collection",
            "description": "Curated fashion pieces for modern lifestyle",
            "price": 79.99,
            "category": "Clothing",
            "image_url": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwyfHxjbG90aGluZ3xlbnwwfHx8fDE3NTkzMTU5NDZ8MA&ixlib=rb-4.1.0&q=85",
            "stock": 75
        },
        {
            "name": "Modern Home Decor Set",
            "description": "Elegant home decor for contemporary living spaces",
            "price": 129.99,
            "category": "Home Decor",
            "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxob21lJTIwZGVjb3J8ZW58MHx8fHwxNzU5MjIyNjg4fDA&ixlib=rb-4.1.0&q=85",
            "stock": 35
        },
        {
            "name": "Wooden Plant Pots",
            "description": "Handcrafted wooden pots for indoor plants",
            "price": 39.99,
            "category": "Home Decor",
            "image_url": "https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHw0fHxob21lJTIwZGVjb3J8ZW58MHx8fHwxNzU5MjIyNjg4fDA&ixlib=rb-4.1.0&q=85",
            "stock": 60
        }
    ]
    
    products = [Product(**product_data) for product_data in sample_products]
    product_dicts = [product.dict() for product in products]
    
    await db.products.insert_many(product_dicts)
    
    return {"message": f"Initialized {len(products)} sample products"}


# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "E-Commerce API"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
