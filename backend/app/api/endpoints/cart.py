from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ...db.mongodb import get_database
from ...models.schemas import CartItem, CartItemCreate, User, Product
from ..deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[dict])
async def get_cart(current_user: User = Depends(get_current_user), db = Depends(get_database)):
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

@router.post("/add", response_model=CartItem)
async def add_to_cart(
    item_in: CartItemCreate, 
    current_user: User = Depends(get_current_user), 
    db = Depends(get_database)
):
    # Check if product exists
    product = await db.products.find_one({"id": item_in.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    existing_item = await db.cart_items.find_one({
        "user_id": current_user.id,
        "product_id": item_in.product_id
    })
    
    if existing_item:
        new_quantity = existing_item["quantity"] + item_in.quantity
        await db.cart_items.update_one(
            {"id": existing_item["id"]},
            {"$set": {"quantity": new_quantity}}
        )
        updated_item = await db.cart_items.find_one({"id": existing_item["id"]})
        return CartItem(**updated_item)
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        await db.cart_items.insert_one(cart_item.dict())
        return cart_item

@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: str, 
    current_user: User = Depends(get_current_user), 
    db = Depends(get_database)
):
    result = await db.cart_items.delete_one({"id": item_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}

@router.delete("/")
async def clear_cart(current_user: User = Depends(get_current_user), db = Depends(get_database)):
    await db.cart_items.delete_many({"user_id": current_user.id})
    return {"message": "Cart cleared"}
