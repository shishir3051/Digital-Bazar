from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ...db.mongodb import get_database
from ...models.schemas import Order, OrderCreate, User
from ..deps import get_current_user

router = APIRouter()

@router.post("/", response_model=Order)
async def create_order(
    order_in: OrderCreate, 
    current_user: User = Depends(get_current_user), 
    db = Depends(get_database)
):
    cart_items = await db.cart_items.find({"user_id": current_user.id}).to_list(1000)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
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
    
    order = Order(
        user_id=current_user.id,
        items=order_items,
        total_amount=total_amount,
        shipping_address=order_in.shipping_address,
        payment_method=order_in.payment_method
    )
    
    await db.orders.insert_one(order.dict())
    await db.cart_items.delete_many({"user_id": current_user.id})
    
    return order

@router.get("/", response_model=List[Order])
async def get_my_orders(current_user: User = Depends(get_current_user), db = Depends(get_database)):
    orders = await db.orders.find({"user_id": current_user.id}).to_list(1000)
    return [Order(**order) for order in orders]

@router.get("/{order_id}", response_model=Order)
async def get_order(
    order_id: str, 
    current_user: User = Depends(get_current_user), 
    db = Depends(get_database)
):
    order = await db.orders.find_one({"id": order_id, "user_id": current_user.id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)
