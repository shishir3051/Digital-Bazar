import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
import uuid
from datetime import datetime, timezone

# Build a minimal fake async collection / db to satisfy our endpoints
class FakeCollection:
    def __init__(self, initial=None):
        self._items = list(initial or [])

    def find(self, filter):
        # return an object with to_list (sync find returns a cursor-like object)
        class Finder:
            def __init__(self, items, filter):
                self.items = items
                self.filter = filter
            async def to_list(self, _):
                if not self.filter:
                    return self.items
                key, val = next(iter(self.filter.items()))
                return [i for i in self.items if i.get(key) == val]
        return Finder(self._items, filter)

    async def find_one(self, filter):
        if not filter:
            return None
        for i in self._items:
            ok = True
            for k, v in filter.items():
                if i.get(k) != v:
                    ok = False
                    break
            if ok:
                return i
        return None

    async def insert_one(self, doc):
        self._items.append(doc)
        class Res:
            inserted_id = doc.get('id')
        return Res()

    async def delete_many(self, filter):
        key, val = next(iter(filter.items())) if filter else (None, None)
        before = len(self._items)
        self._items = [i for i in self._items if i.get(key) != val]
        class Res:
            deleted_count = before - len(self._items)
        return Res()

    async def update_one(self, filter, update):
        doc = await self.find_one(filter)
        if not doc:
            return None
        if '$set' in update:
            doc.update(update['$set'])
        class Res:
            matched_count = 1
        return Res()

class FakeDB:
    def __init__(self):
        self.users = FakeCollection([])
        self.products = FakeCollection([])
        self.cart_items = FakeCollection([])
        self.orders = FakeCollection([])

# monkeypatch get_database dependency
from app.db.mongodb import get_database

@pytest.fixture
def client(monkeypatch):
    fake = FakeDB()

    # populate with a user and product
    user = {"id": "user-1", "username": "test", "email": "t@t.com", "full_name": "Test User"}
    product = {"id": "prod-1", "name": "Widget", "price": 10.0}
    fake.users._items.append(user)
    fake.products._items.append(product)

    # add a cart item for user
    cart_item = {"id": "cart-1", "user_id": user["id"], "product_id": product["id"], "quantity": 2}
    fake.cart_items._items.append(cart_item)

    async def _fake_db():
        return fake

    monkeypatch.setattr('app.api.endpoints.payments.get_database', _fake_db)
    monkeypatch.setattr('app.api.deps.get_database', _fake_db)

    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_headers():
    token = create_access_token({"user_id": "user-1"})
    return {"Authorization": f"Bearer {token}"}

def test_bkash_create_and_execute_flow(client, auth_headers):
    # Create payment
    r = client.post('/api/payments/bkash/create-payment', headers=auth_headers)
    assert r.status_code == 200
    data = r.json()
    assert 'order_id' in data
    order_id = data['order_id']

    # verify order saved as pending
    r2 = client.get('/api/orders', headers=auth_headers)
    assert r2.status_code == 200
    orders = r2.json()
    found = [o for o in orders if o['id'] == order_id]
    assert found and found[0]['status'] == 'pending'

    # Execute payment (mock)
    payload = {"paymentId": f"mock_{uuid.uuid4().hex}", "payerReference": "PR-1", "orderId": order_id}
    r3 = client.post('/api/payments/bkash/execute-payment', json=payload)
    assert r3.status_code == 200
    assert r3.json().get('order_id') == order_id

    # After execution, order should be marked paid
    r4 = client.get('/api/orders', headers=auth_headers)
    orders = r4.json()
    found = [o for o in orders if o['id'] == order_id]
    assert found and found[0]['status'] == 'paid'

    # Cart should be cleared
    # fetch cart
    r5 = client.get('/api/cart', headers=auth_headers)
    assert r5.status_code == 200
    assert r5.json() == []

def test_bkash_webhook_marks_order_paid(client, auth_headers):
    # Create a payment first
    r = client.post('/api/payments/bkash/create-payment', headers=auth_headers)
    data = r.json()
    order_id = data['order_id']
    merchant_invoice = data['merchant_invoice']

    # simulate webhook payload
    payload = {"event": "payment.success", "paymentID": f"mock_{uuid.uuid4().hex}", "merchantInvoiceNumber": merchant_invoice, "status": "success"}
    r2 = client.post('/api/payments/bkash/webhook', json=payload)
    assert r2.status_code == 200

    # verify order marked paid
    r3 = client.get('/api/orders', headers=auth_headers)
    orders = r3.json()
    found = [o for o in orders if o['id'] == order_id]
    assert found and found[0]['status'] == 'paid'
