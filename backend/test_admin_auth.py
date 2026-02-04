import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000/api"

async def test_admin_auth():
    print("Starting Admin Auth Verification...")
    
    # 1. Register a regular user
    user_data = {
        "username": "testuser_verif",
        "email": "testuser_verif@example.com",
        "full_name": "Test User",
        "password": "password123"
    }
    
    async with httpx.AsyncClient() as client:
        print("\n1. Testing Regular User Registration...")
        try:
            resp = await client.post(f"{BASE_URL}/auth/register", json=user_data)
            if resp.status_code == 200:
                print("✓ Regular user registered.")
                token = resp.json()["token"]
            elif resp.status_code == 400 and "already exists" in resp.text:
                print("! User already exists, attempting login...")
                login_resp = await client.post(f"{BASE_URL}/auth/login", json={"username": user_data["username"], "password": user_data["password"]})
                token = login_resp.json()["token"]
                print("✓ Logged in existing user.")
            else:
                print(f"✗ Registration failed: {resp.status_code} - {resp.text}")
                return

            # 2. Test /auth/me for regular user
            print("\n2. Testing /auth/me for regular user...")
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.get(f"{BASE_URL}/auth/me", headers=headers)
            user = resp.json()
            print(f"✓ Profile fetched: {user['username']} (is_admin: {user['is_admin']})")
            if user['is_admin']:
                print("✗ Error: Regular user should not be admin.")
                return

            # 3. Test /admin/stats for regular user (should fail)
            print("\n3. Testing /admin/stats for regular user (expecting 403)...")
            resp = await client.get(f"{BASE_URL}/admin/stats", headers=headers)
            if resp.status_code == 403:
                print("✓ Access forbidden as expected.")
            else:
                print(f"✗ Unexpected behavior: {resp.status_code}")

        except Exception as e:
            print(f"✗ Connection error: {e}. Is the server running?")

if __name__ == "__main__":
    asyncio.run(test_admin_auth())
