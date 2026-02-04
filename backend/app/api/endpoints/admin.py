from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ...db.mongodb import get_database
from ...models.schemas import Order, Product, ProductCreate, User
from ..deps import get_current_admin

router = APIRouter()

@router.get("/orders", response_model=List[Order])
async def get_all_orders(admin: User = Depends(get_current_admin), db = Depends(get_database)):
    orders = await db.orders.find().to_list(1000)
    return [Order(**order) for order in orders]

@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str, 
    status: str, 
    admin: User = Depends(get_current_admin), 
    db = Depends(get_database)
):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order status updated"}

@router.post("/products", response_model=Product)
async def create_product(
    product_in: ProductCreate, 
    admin: User = Depends(get_current_admin), 
    db = Depends(get_database)
):
    product = Product(**product_in.dict())
    await db.products.insert_one(product.dict())
    return product

@router.post("/init-products")
async def initialize_products(db = Depends(get_database)):
    existing_products = await db.products.count_documents({})
    if existing_products > 0:
        return {"message": "Products already initialized"}
    
    sample_products = [
        {"name": "Wireless Headphones", "description": "High-quality wireless headphones with noise cancellation", "price": 199.99, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661", "stock": 50},
        {"name": "Smart Circuit Board", "description": "Advanced circuit board for electronics projects", "price": 89.99, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1562408590-e32931084e23", "stock": 25},
        {"name": "Premium Headset", "description": "Professional gaming and work headset", "price": 149.99, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1550009158-9ebf69173e03", "stock": 30},
        {"name": "Electronic Components Kit", "description": "Complete kit for electronic prototyping", "price": 79.99, "category": "Electronics", "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475", "stock": 40},
        {"name": "Colorful T-Shirt Collection", "description": "Premium cotton t-shirts in various colors", "price": 29.99, "category": "Clothing", "image_url": "https://images.unsplash.com/photo-1562157873-818bc0726f68", "stock": 100},
        {"name": "Fashion Store Collection", "description": "Curated fashion pieces for modern lifestyle", "price": 79.99, "category": "Clothing", "image_url": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04", "stock": 75},
        {"name": "Modern Home Decor Set", "description": "Elegant home decor for contemporary living spaces", "price": 129.99, "category": "Home Decor", "image_url": "https://images.unsplash.com/photo-1616046229478-9901c5536a45", "stock": 35},
        {"name": "Wooden Plant Pots", "description": "Handcrafted wooden pots for indoor plants", "price": 39.99, "category": "Home Decor", "image_url": "https://images.unsplash.com/photo-1582131503261-fca1d1c0589f", "stock": 60}
    ]
    
    products = [Product(**p) for p in sample_products]
    await db.products.insert_many([p.dict() for p in products])
    return {"message": f"Initialized {len(products)} sample products"}
