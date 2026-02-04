from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from ...db.mongodb import get_database
from ...models.schemas import Product

router = APIRouter()

@router.get("/", response_model=List[Product])
async def get_products(category: Optional[str] = None, db = Depends(get_database)):
    try:
        query = {"category": category} if category else {}
        products_cursor = db.products.find(query)
        products = await products_cursor.to_list(1000)
        return [Product(**product) for product in products]
    except Exception as e:
        print(f"ERROR in get_products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")

@router.get("/{product_id}", response_model=Product)
async def get_product(product_id: str, db = Depends(get_database)):
    try:
        product = await db.products.find_one({"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return Product(**product)
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR in get_product: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch product: {str(e)}")
