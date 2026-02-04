from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ...db.mongodb import get_database
from ...models.schemas import Product

router = APIRouter()

@router.get("/", response_model=List[Product])
async def get_products(category: Optional[str] = None, db = Depends(get_database)):
    query = {"category": category} if category else {}
    products_cursor = db.products.find(query)
    products = await products_cursor.to_list(1000)
    return [Product(**product) for product in products]

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str, db = Depends(get_database)):
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)
