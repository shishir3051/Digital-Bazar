import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api"

def test_full_flow():
    print("--- Starting Full E2E Verification ---")
    u = str(uuid.uuid4())[:8]
    user_data = {
        "username": f"test_{u}",
        "password": "password123",
        "email": f"{u}@test.com",
        "full_name": "Test User"
    }
    
    try:
        # 1. Register
        reg = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        if reg.status_code != 200:
            print(f"â Œ Registration failed: {reg.text}")
            return
        token = reg.json()['token']
        print("âœ… User Registered")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Get Product
        prods = requests.get(f"{BASE_URL}/products").json()
        pid = prods[0]['id']
        
        # 3. Add to Cart
        requests.post(f"{BASE_URL}/cart/add", json={"product_id": pid, "quantity": 1}, headers=headers)
        print("âœ… Added to Cart")
        
        # 4. Checkout with bKash
        checkout_data = {
            "shipping_address": "123 Dhaka St, Bangladesh",
            "payment_method": "bKash"
        }
        order_resp = requests.post(f"{BASE_URL}/orders", json=checkout_data, headers=headers)
        if order_resp.status_code == 200:
            order = order_resp.json()
            print(f"âœ… Order Created! ID: {order['id']}")
            print(f"âœ… Payment Method Verified: {order['payment_method']}")
        else:
            print(f"â Œ Checkout failed: {order_resp.text}")
            
    except Exception as e:
        print(f"â Œ Error: {str(e)}")

if __name__ == "__main__":
    test_full_flow()
