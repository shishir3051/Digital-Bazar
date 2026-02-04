from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ...db.mongodb import get_database
from ...models.schemas import WishlistItem, WishlistItemCreate, User, Product
from ..deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_wishlist(current_user: User = Depends(get_current_user), db = Depends(get_database)):
    wishlist_items = await db.wishlist_items.find({"user_id": current_user.id}).to_list(1000)
    
    # Enrich with product details
    enriched_wishlist = []
    for item in wishlist_items:
        product = await db.products.find_one({"id": item["product_id"]})
        if product:
            enriched_wishlist.append({
                "wishlist_item": WishlistItem(**item),
                "product": Product(**product)
            })
    return enriched_wishlist

@router.post("/toggle", response_model=dict)
async def toggle_wishlist(
    item_in: WishlistItemCreate, 
    current_user: User = Depends(get_current_user), 
    db = Depends(get_database)
):
    # Check if product exists
    product = await db.products.find_one({"id": item_in.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in wishlist
    existing_item = await db.wishlist_items.find_one({
        "user_id": current_user.id,
        "product_id": item_in.product_id
    })
    
    if existing_item:
        await db.wishlist_items.delete_one({"id": existing_item["id"]})
        return {"status": "removed", "message": "Product removed from wishlist"}
    else:
        wishlist_item = WishlistItem(
            user_id=current_user.id,
            product_id=item_in.product_id
        )
        await db.wishlist_items.insert_one(wishlist_item.dict())
        return {"status": "added", "message": "Product added to wishlist"}

@router.delete("/{item_id}")
async def remove_from_wishlist(
    item_id: str, 
    current_user: User = Depends(get_current_user), 
    db = Depends(get_database)
):
    result = await db.wishlist_items.delete_one({"id": item_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return {"message": "Item removed from wishlist"}
