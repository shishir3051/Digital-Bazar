#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for E-Commerce Application
Tests all backend endpoints including authentication, products, cart, orders, and admin functions.
"""

import requests
import json
import uuid
from datetime import datetime
import sys

# Backend URL from environment
BACKEND_URL = "https://digital-bazaar-120.preview.emergentagent.com/api"

class ECommerceAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.user_token = None
        self.admin_token = None
        self.test_user_id = None
        self.test_admin_id = None
        self.test_product_id = None
        self.test_order_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }
    
    def log_result(self, test_name, success, message="", error_details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if error_details:
            print(f"   Error: {error_details}")
            self.results["errors"].append(f"{test_name}: {error_details}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
        print()
    
    def test_health_check(self):
        """Test API health endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_result("Health Check", False, "API not healthy", str(data))
                    return False
            else:
                self.log_result("Health Check", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Health Check", False, "Connection failed", str(e))
            return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        try:
            # Generate unique test data
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            test_user = {
                "username": f"testuser_{timestamp}",
                "email": f"testuser_{timestamp}@example.com",
                "full_name": "John Doe",
                "password": "TestPass123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/register", json=test_user)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.user_token = data["token"]
                    self.test_user_id = data["user"]["id"]
                    self.log_result("User Registration", True, f"User registered: {test_user['username']}")
                    return True
                else:
                    self.log_result("User Registration", False, "Missing token or user in response", str(data))
                    return False
            else:
                self.log_result("User Registration", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("User Registration", False, "Request failed", str(e))
            return False
    
    def test_user_login(self):
        """Test user login endpoint"""
        try:
            # Use the registered user credentials
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            login_data = {
                "username": f"testuser_{timestamp}",
                "password": "TestPass123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    # Update token (should be same as registration)
                    self.user_token = data["token"]
                    self.log_result("User Login", True, f"Login successful for: {login_data['username']}")
                    return True
                else:
                    self.log_result("User Login", False, "Missing token or user in response", str(data))
                    return False
            else:
                self.log_result("User Login", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("User Login", False, "Request failed", str(e))
            return False
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        try:
            invalid_login = {
                "username": "nonexistent_user",
                "password": "wrongpassword"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=invalid_login)
            
            if response.status_code == 400:
                self.log_result("Invalid Login Test", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.log_result("Invalid Login Test", False, f"Expected 400, got {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Invalid Login Test", False, "Request failed", str(e))
            return False
    
    def test_initialize_products(self):
        """Test product initialization endpoint"""
        try:
            response = self.session.post(f"{self.base_url}/admin/init-products")
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Initialize Products", True, data.get("message", "Products initialized"))
                return True
            else:
                self.log_result("Initialize Products", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Initialize Products", False, "Request failed", str(e))
            return False
    
    def test_get_products(self):
        """Test getting all products"""
        try:
            response = self.session.get(f"{self.base_url}/products")
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list) and len(products) > 0:
                    self.test_product_id = products[0]["id"]  # Store for later tests
                    self.log_result("Get Products", True, f"Retrieved {len(products)} products")
                    return True
                else:
                    self.log_result("Get Products", False, "No products returned", str(products))
                    return False
            else:
                self.log_result("Get Products", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Get Products", False, "Request failed", str(e))
            return False
    
    def test_get_products_by_category(self):
        """Test getting products by category"""
        try:
            response = self.session.get(f"{self.base_url}/products?category=Electronics")
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list):
                    electronics_count = len([p for p in products if p.get("category") == "Electronics"])
                    self.log_result("Get Products by Category", True, f"Retrieved {electronics_count} Electronics products")
                    return True
                else:
                    self.log_result("Get Products by Category", False, "Invalid response format", str(products))
                    return False
            else:
                self.log_result("Get Products by Category", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Get Products by Category", False, "Request failed", str(e))
            return False
    
    def test_get_single_product(self):
        """Test getting a single product by ID"""
        if not self.test_product_id:
            self.log_result("Get Single Product", False, "No product ID available", "Need to run get_products test first")
            return False
        
        try:
            response = self.session.get(f"{self.base_url}/products/{self.test_product_id}")
            
            if response.status_code == 200:
                product = response.json()
                if product.get("id") == self.test_product_id:
                    self.log_result("Get Single Product", True, f"Retrieved product: {product.get('name')}")
                    return True
                else:
                    self.log_result("Get Single Product", False, "Product ID mismatch", str(product))
                    return False
            else:
                self.log_result("Get Single Product", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Get Single Product", False, "Request failed", str(e))
            return False
    
    def test_add_to_cart(self):
        """Test adding items to cart (requires authentication)"""
        if not self.user_token or not self.test_product_id:
            self.log_result("Add to Cart", False, "Missing auth token or product ID", "Need authentication and product data")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            cart_item = {
                "product_id": self.test_product_id,
                "quantity": 2
            }
            
            response = self.session.post(f"{self.base_url}/cart/add", json=cart_item, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("product_id") == self.test_product_id:
                    self.log_result("Add to Cart", True, f"Added {cart_item['quantity']} items to cart")
                    return True
                else:
                    self.log_result("Add to Cart", False, "Product ID mismatch in response", str(data))
                    return False
            else:
                self.log_result("Add to Cart", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Add to Cart", False, "Request failed", str(e))
            return False
    
    def test_get_cart(self):
        """Test viewing cart contents"""
        if not self.user_token:
            self.log_result("Get Cart", False, "Missing auth token", "Need authentication")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{self.base_url}/cart", headers=headers)
            
            if response.status_code == 200:
                cart = response.json()
                if isinstance(cart, list):
                    self.log_result("Get Cart", True, f"Cart contains {len(cart)} items")
                    return True
                else:
                    self.log_result("Get Cart", False, "Invalid cart format", str(cart))
                    return False
            else:
                self.log_result("Get Cart", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Get Cart", False, "Request failed", str(e))
            return False
    
    def test_create_order(self):
        """Test creating an order from cart items"""
        if not self.user_token:
            self.log_result("Create Order", False, "Missing auth token", "Need authentication")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            order_data = {
                "shipping_address": "123 Main St, Anytown, ST 12345"
            }
            
            response = self.session.post(f"{self.base_url}/orders", json=order_data, headers=headers)
            
            if response.status_code == 200:
                order = response.json()
                if order.get("id") and order.get("total_amount"):
                    self.test_order_id = order["id"]
                    self.log_result("Create Order", True, f"Order created with total: ${order['total_amount']}")
                    return True
                else:
                    self.log_result("Create Order", False, "Missing order ID or total", str(order))
                    return False
            else:
                self.log_result("Create Order", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Create Order", False, "Request failed", str(e))
            return False
    
    def test_get_orders(self):
        """Test getting order history"""
        if not self.user_token:
            self.log_result("Get Orders", False, "Missing auth token", "Need authentication")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{self.base_url}/orders", headers=headers)
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    self.log_result("Get Orders", True, f"Retrieved {len(orders)} orders")
                    return True
                else:
                    self.log_result("Get Orders", False, "Invalid orders format", str(orders))
                    return False
            else:
                self.log_result("Get Orders", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Get Orders", False, "Request failed", str(e))
            return False
    
    def test_get_single_order(self):
        """Test getting a single order by ID"""
        if not self.user_token or not self.test_order_id:
            self.log_result("Get Single Order", False, "Missing auth token or order ID", "Need authentication and order data")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{self.base_url}/orders/{self.test_order_id}", headers=headers)
            
            if response.status_code == 200:
                order = response.json()
                if order.get("id") == self.test_order_id:
                    self.log_result("Get Single Order", True, f"Retrieved order: {order['id']}")
                    return True
                else:
                    self.log_result("Get Single Order", False, "Order ID mismatch", str(order))
                    return False
            else:
                self.log_result("Get Single Order", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Get Single Order", False, "Request failed", str(e))
            return False
    
    def test_unauthorized_access(self):
        """Test accessing protected endpoints without authentication"""
        try:
            # Test cart access without token
            response = self.session.get(f"{self.base_url}/cart")
            
            if response.status_code == 401:
                self.log_result("Unauthorized Access Test", True, "Correctly rejected unauthenticated request")
                return True
            else:
                self.log_result("Unauthorized Access Test", False, f"Expected 401, got {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Unauthorized Access Test", False, "Request failed", str(e))
            return False
    
    def test_clear_cart(self):
        """Test clearing cart (after order creation, cart should already be empty)"""
        if not self.user_token:
            self.log_result("Clear Cart", False, "Missing auth token", "Need authentication")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.delete(f"{self.base_url}/cart", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Clear Cart", True, data.get("message", "Cart cleared"))
                return True
            else:
                self.log_result("Clear Cart", False, f"Status code: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_result("Clear Cart", False, "Request failed", str(e))
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting E-Commerce Backend API Tests")
        print("=" * 50)
        
        # Health check first
        if not self.test_health_check():
            print("❌ Health check failed - aborting tests")
            return False
        
        # Authentication tests
        print("\n🔐 Authentication Tests")
        print("-" * 30)
        self.test_user_registration()
        self.test_user_login()
        self.test_invalid_login()
        self.test_unauthorized_access()
        
        # Product management tests
        print("\n📦 Product Management Tests")
        print("-" * 30)
        self.test_initialize_products()
        self.test_get_products()
        self.test_get_products_by_category()
        self.test_get_single_product()
        
        # Shopping cart tests
        print("\n🛒 Shopping Cart Tests")
        print("-" * 30)
        self.test_add_to_cart()
        self.test_get_cart()
        
        # Order management tests
        print("\n📋 Order Management Tests")
        print("-" * 30)
        self.test_create_order()
        self.test_get_orders()
        self.test_get_single_order()
        
        # Cleanup tests
        print("\n🧹 Cleanup Tests")
        print("-" * 30)
        self.test_clear_cart()
        
        # Summary
        print("\n📊 Test Summary")
        print("=" * 50)
        total_tests = self.results["passed"] + self.results["failed"]
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        
        if self.results["failed"] > 0:
            print(f"\n🔍 Failed Tests Details:")
            for error in self.results["errors"]:
                print(f"   • {error}")
        
        success_rate = (self.results["passed"] / total_tests * 100) if total_tests > 0 else 0
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        return self.results["failed"] == 0

if __name__ == "__main__":
    tester = ECommerceAPITester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print("\n⚠️  Some tests failed!")
        sys.exit(1)