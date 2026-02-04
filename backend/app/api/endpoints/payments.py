from fastapi import APIRouter, Depends, HTTPException, Request, Response
from ...core.config import settings
from ...db.mongodb import get_database
from ...models.schemas import User, Order
from ..deps import get_current_user
import httpx
import uuid
from datetime import datetime, timezone

router = APIRouter()

@router.get('/exchange-rate')
async def get_exchange_rate():
    """Return USD -> BDT exchange rate from settings (fallback to 108.0)."""
    rate = float(getattr(settings, 'USD_TO_BDT_RATE', 108.0))
    return {"usd_to_bdt": rate}

# ----- bKash integration (sandbox-friendly) -----

async def get_bkash_token():
    """Obtain bKash token from configured sandbox/prod endpoint.
    This attempts a real call when BKASH_BASE_URL and credentials are set, otherwise returns a mock token for local testing."""
    base = settings.BKASH_BASE_URL
    if not base or not settings.BKASH_APP_KEY or not settings.BKASH_APP_SECRET:
        # return a mocked token for local development
        return {"id_token": "mock-id-token", "statusCode": "0000"}

    token_url = f"{base.rstrip('/')}/token/grant"
    payload = {"app_key": settings.BKASH_APP_KEY, "app_secret": settings.BKASH_APP_SECRET}

    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, json=payload, timeout=10.0)
        resp.raise_for_status()
        return resp.json()

@router.post('/bkash/create-payment')
async def bkash_create_payment(current_user: User = Depends(get_current_user), db = Depends(get_database)):
    """Create a bKash payment for the current user's cart. Returns a payment id and approval URL (if available).

    This also creates a pending `Order` document in DB and returns the `order_id` so subsequent webhook/execute can reconcile.
    Note: This implementation is sandbox-friendly. You should configure BKASH_BASE_URL, BKASH_APP_KEY, BKASH_APP_SECRET in your .env for real sandbox calls.
    """
    cart_items = await db.cart_items.find({"user_id": current_user.id}).to_list(1000)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    usd_total = 0
    order_items = []
    for item in cart_items:
        product = await db.products.find_one({"id": item["product_id"]})
        if product:
            item_total = product["price"] * item["quantity"]
            usd_total += item_total
            order_items.append({
                "product_id": item["product_id"],
                "product_name": product["name"],
                "quantity": item["quantity"],
                "price": product["price"],
                "total": item_total
            })

    rate = float(getattr(settings, 'USD_TO_BDT_RATE', 108.0))
    bdt_total = round(usd_total * rate, 2)

    # create pending order in DB so we can reconcile later in webhook/execute
    merchant_invoice = str(uuid.uuid4())
    order_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user.id,
        "items": order_items,
        "total_amount": round(usd_total, 2),
        "total_amount_bdt": bdt_total,
        "status": "pending",
        "payment_method": "bKash",
        "merchant_invoice": merchant_invoice,
    }
    await db.orders.insert_one(order_doc)

    token = await get_bkash_token()
    if token.get('id_token') == 'mock-id-token':
        # Return a mocked approval URL for development
        payment_id = f"mock_{uuid.uuid4().hex}"
        approval_url = f"https://sandbox.bkash.com/mock/approve/{payment_id}"
        return {"paymentId": payment_id, "approvalUrl": approval_url, "amount_bdt": bdt_total, "order_id": order_doc["id"], "merchant_invoice": merchant_invoice}

    # Real bKash Payment creation (simplified sketch — adapt to bKash API docs)
    headers = {
        'authorization': token.get('id_token'),
        'x-app-key': settings.BKASH_APP_KEY,
        'Content-Type': 'application/json'
    }
    create_url = f"{settings.BKASH_BASE_URL.rstrip('/')}/checkout/payment/create"
    payload = {
        "amount": str(bdt_total),
        "currency": "BDT",
        "merchantInvoiceNumber": merchant_invoice
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(create_url, json=payload, headers=headers, timeout=10.0)
        resp.raise_for_status()
        data = resp.json()
        # Response shape differs by bkash version; return important bits
        return {"paymentId": data.get('paymentID') or data.get('paymentID'), "approvalUrl": data.get('bkashURL') or data.get('approvalUrl'), "amount_bdt": bdt_total, "order_id": order_doc["id"], "merchant_invoice": merchant_invoice}

@router.post('/bkash/execute-payment')
async def bkash_execute_payment(request: Request, db = Depends(get_database)):
    """Execute/verify a bKash payment after user approval.
    Expected body: { paymentId: str, payerReference: str, orderId?: str, merchantInvoice?: str }
    """
    body = await request.json()
    payment_id = body.get('paymentId')
    payer_ref = body.get('payerReference')
    order_id = body.get('orderId')
    merchant_invoice = body.get('merchantInvoice')

    if not payment_id or not payer_ref:
        raise HTTPException(status_code=400, detail='Missing paymentId or payerReference')

    # find order by id or merchant_invoice
    order = None
    if order_id:
        order = await db.orders.find_one({"id": order_id})
    if not order and merchant_invoice:
        order = await db.orders.find_one({"merchant_invoice": merchant_invoice})

    token = await get_bkash_token()

    if token.get('id_token') == 'mock-id-token':
        # simulate success: mark order paid and clear cart
        if order:
            await db.orders.update_one({"id": order["id"]}, {"$set": {"status": "paid", "payment_id": payment_id, "payment_info": {"payerReference": payer_ref}, "payment_confirmed_at": datetime.now(timezone.utc)}})
            # clear user's cart
            await db.cart_items.delete_many({"user_id": order["user_id"]})
            return {"status": "success", "order_id": order["id"]}
        # fallback: create generic order (if no order is present, this is unexpected in real flow)
        await _create_order_from_cart(db, payer_ref=payer_ref, payment_method='bKash', payment_info={'payment_id': payment_id})
        return {"status": "success", "paymentId": payment_id}
    headers = {
        'authorization': token.get('id_token'),
        'x-app-key': settings.BKASH_APP_KEY,
        'Content-Type': 'application/json'
    }
    execute_url = f"{settings.BKASH_BASE_URL.rstrip('/')}/checkout/payment/execute/{payment_id}"
    async with httpx.AsyncClient() as client:
        resp = await client.post(execute_url, headers=headers, json={"payerReference": payer_ref}, timeout=10.0)
        resp.raise_for_status()
        data = resp.json()
        if data.get('paymentExecuteStatus') in ('Completed', 'SUCCESS', '0000') or data.get('paymentID'):
            if order:
                await db.orders.update_one({"id": order["id"]}, {"$set": {"status": "paid", "payment_id": payment_id, "payment_info": data}})
                await db.cart_items.delete_many({"user_id": order["user_id"]})
                return {"status": "success", "order_id": order["id"]}
            # If we couldn't find the order, still return success but log
            print('Payment executed but no matching order found for payment', payment_id)
            return {"status": "success", "data": data}
        raise HTTPException(status_code=400, detail='Payment execution failed')

@router.post('/bkash/webhook')
async def bkash_webhook(request: Request, db = Depends(get_database)):
    """Receive notifications from bKash (configure your webhook URL in bKash dashboard).
    For sandbox testing, the webhook payload will be accepted and used to reconcile orders.
    Expected payload (example): { "event": "payment.success", "paymentID": "...", "merchantInvoiceNumber": "...", "paymentInfo": { ... } }
    """
    payload = await request.json()
    print("Received bKash webhook payload:", payload)

    event = payload.get('event') or payload
    payment_id = payload.get('paymentID') or payload.get('paymentId') or event.get('paymentID') if isinstance(event, dict) else None
    merchant_invoice = payload.get('merchantInvoiceNumber') or event.get('merchantInvoiceNumber') if isinstance(event, dict) else None

    # Basic handling: mark matching order as paid
    order = None
    if merchant_invoice:
        order = await db.orders.find_one({"merchant_invoice": merchant_invoice})
    if not order and payment_id:
        order = await db.orders.find_one({"payment_id": payment_id})

    if order and (payload.get('event') in ('payment.success', 'payment.completed', 'payment.succeeded') or payload.get('status') in ('success', 'completed')):
        await db.orders.update_one({"id": order["id"]}, {"$set": {"status": "paid", "payment_id": payment_id, "payment_info": payload, "payment_confirmed_at": datetime.now(timezone.utc)}})
        await db.cart_items.delete_many({"user_id": order["user_id"]})
        print('Order marked paid by webhook:', order["id"])
        return Response(status_code=200)

    print('Webhook received but no matching order was updated')
    return Response(status_code=200)

async def _create_order_from_cart(db, payer_ref: str, payment_method: str, payment_info: dict):
    # Inlined helper to create an order from the current cart items.
    # This function assumes you will pass user id in payment_info or set in metadata in real world.
    # For demo, we will not have access to user; adapt this to your webhook's metadata.
    # If you have metadata with user_id, fetch cart and create order similarly to orders.create_order
    print("Creating order from cart (stub). Payment info:", payment_info)
    # TODO: implement according to your webhook metadata and security needs
    return
