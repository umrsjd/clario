#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Calmi Application
Tests all authentication, chat, and utility endpoints
"""

import requests
import json
import time
from datetime import datetime
import uuid

# Configuration
BASE_URL = "https://be4646ca-8dda-4649-93f6-a909b0b4589b.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class CalmiAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.auth_token = None
        self.test_user_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
        self.test_user_password = "SecurePassword123!"
        self.test_user_name = "Test User"
        self.conversation_id = None
        self.results = {
            "passed": 0,
            "failed": 0,
            "errors": []
        }

    def log_result(self, test_name, success, message="", response=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if response and not success:
            print(f"   Response: {response.status_code} - {response.text[:200]}")
        
        if success:
            self.results["passed"] += 1
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {message}")
        print()

    def set_auth_header(self, token):
        """Set authorization header"""
        self.auth_token = token
        self.headers["Authorization"] = f"Bearer {token}"

    def clear_auth_header(self):
        """Clear authorization header"""
        self.auth_token = None
        if "Authorization" in self.headers:
            del self.headers["Authorization"]

    def test_health_endpoint(self):
        """Test GET /api/health"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "status" in data and data["status"] == "healthy":
                    self.log_result("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_result("Health Check", False, "Invalid health response format", response)
            else:
                self.log_result("Health Check", False, f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("Health Check", False, f"Exception: {str(e)}")
        return False

    def test_root_endpoint(self):
        """Test GET /api/"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Root Endpoint", True, f"Message: {data['message']}")
                    return True
                else:
                    self.log_result("Root Endpoint", False, "No message in response", response)
            else:
                self.log_result("Root Endpoint", False, f"Unexpected status code: {response.status_code}", response)
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Exception: {str(e)}")
        return False

    def test_user_registration(self):
        """Test POST /api/auth/register"""
        try:
            payload = {
                "email": self.test_user_email,
                "password": self.test_user_password,
                "full_name": self.test_user_name
            }
            response = requests.post(f"{self.base_url}/auth/register", 
                                   json=payload, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.set_auth_header(data["access_token"])
                    self.log_result("User Registration", True, f"User registered successfully")
                    return True
                else:
                    self.log_result("User Registration", False, "Missing token in response", response)
            else:
                self.log_result("User Registration", False, f"Registration failed: {response.status_code}", response)
        except Exception as e:
            self.log_result("User Registration", False, f"Exception: {str(e)}")
        return False

    def test_user_login(self):
        """Test POST /api/auth/login"""
        try:
            payload = {
                "email": self.test_user_email,
                "password": self.test_user_password
            }
            response = requests.post(f"{self.base_url}/auth/login", 
                                   json=payload, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "token_type" in data:
                    self.set_auth_header(data["access_token"])
                    self.log_result("User Login", True, "Login successful")
                    return True
                else:
                    self.log_result("User Login", False, "Missing token in response", response)
            else:
                self.log_result("User Login", False, f"Login failed: {response.status_code}", response)
        except Exception as e:
            self.log_result("User Login", False, f"Exception: {str(e)}")
        return False

    def test_get_current_user(self):
        """Test GET /api/auth/me"""
        try:
            response = requests.get(f"{self.base_url}/auth/me", 
                                  headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "email" in data and data["email"] == self.test_user_email:
                    self.log_result("Get Current User", True, f"User info retrieved: {data['email']}")
                    return True
                else:
                    self.log_result("Get Current User", False, "Invalid user data", response)
            else:
                self.log_result("Get Current User", False, f"Failed to get user: {response.status_code}", response)
        except Exception as e:
            self.log_result("Get Current User", False, f"Exception: {str(e)}")
        return False

    def test_google_auth_url(self):
        """Test GET /api/auth/google/url"""
        try:
            response = requests.get(f"{self.base_url}/auth/google/url", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "auth_url" in data and "accounts.google.com" in data["auth_url"]:
                    self.log_result("Google Auth URL", True, "Google OAuth URL generated")
                    return True
                else:
                    self.log_result("Google Auth URL", False, "Invalid auth URL", response)
            else:
                self.log_result("Google Auth URL", False, f"Failed to get auth URL: {response.status_code}", response)
        except Exception as e:
            self.log_result("Google Auth URL", False, f"Exception: {str(e)}")
        return False

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without authentication"""
        self.clear_auth_header()
        
        try:
            response = requests.get(f"{self.base_url}/auth/me", headers=HEADERS, timeout=10)
            if response.status_code == 401:
                self.log_result("Unauthorized Access Protection", True, "Correctly blocked unauthorized access")
                return True
            else:
                self.log_result("Unauthorized Access Protection", False, f"Should return 401, got {response.status_code}", response)
        except Exception as e:
            self.log_result("Unauthorized Access Protection", False, f"Exception: {str(e)}")
        return False

    def test_send_chat_message(self):
        """Test POST /api/chat/send"""
        try:
            payload = {
                "message": "Hello, I'm feeling a bit anxious today. Can you help me process these feelings?"
            }
            response = requests.post(f"{self.base_url}/chat/send", 
                                   json=payload, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "conversation_id" in data and "message_id" in data:
                    self.conversation_id = data["conversation_id"]
                    self.log_result("Send Chat Message", True, f"Chat response received, conversation: {self.conversation_id}")
                    return True
                else:
                    self.log_result("Send Chat Message", False, "Invalid chat response format", response)
            else:
                self.log_result("Send Chat Message", False, f"Chat failed: {response.status_code}", response)
        except Exception as e:
            self.log_result("Send Chat Message", False, f"Exception: {str(e)}")
        return False

    def test_get_conversations(self):
        """Test GET /api/chat/conversations"""
        try:
            response = requests.get(f"{self.base_url}/chat/conversations", 
                                  headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Conversations", True, f"Retrieved {len(data)} conversations")
                    return True
                else:
                    self.log_result("Get Conversations", False, "Response is not a list", response)
            else:
                self.log_result("Get Conversations", False, f"Failed to get conversations: {response.status_code}", response)
        except Exception as e:
            self.log_result("Get Conversations", False, f"Exception: {str(e)}")
        return False

    def test_get_conversation_history(self):
        """Test GET /api/chat/conversations/{id}"""
        if not self.conversation_id:
            self.log_result("Get Conversation History", False, "No conversation ID available")
            return False
            
        try:
            response = requests.get(f"{self.base_url}/chat/conversations/{self.conversation_id}", 
                                  headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "conversation_id" in data and "messages" in data:
                    self.log_result("Get Conversation History", True, f"Retrieved {len(data['messages'])} messages")
                    return True
                else:
                    self.log_result("Get Conversation History", False, "Invalid conversation history format", response)
            else:
                self.log_result("Get Conversation History", False, f"Failed to get history: {response.status_code}", response)
        except Exception as e:
            self.log_result("Get Conversation History", False, f"Exception: {str(e)}")
        return False

    def test_status_endpoints(self):
        """Test POST /api/status and GET /api/status"""
        # Test POST /api/status
        try:
            payload = {
                "client_name": f"test_client_{uuid.uuid4().hex[:8]}"
            }
            response = requests.post(f"{self.base_url}/status", 
                                   json=payload, headers=HEADERS, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "client_name" in data and "timestamp" in data:
                    self.log_result("Create Status Check", True, f"Status check created: {data['id']}")
                    status_created = True
                else:
                    self.log_result("Create Status Check", False, "Invalid status response format", response)
                    status_created = False
            else:
                self.log_result("Create Status Check", False, f"Status creation failed: {response.status_code}", response)
                status_created = False
        except Exception as e:
            self.log_result("Create Status Check", False, f"Exception: {str(e)}")
            status_created = False

        # Test GET /api/status
        try:
            response = requests.get(f"{self.base_url}/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Status Checks", True, f"Retrieved {len(data)} status checks")
                    return status_created and True
                else:
                    self.log_result("Get Status Checks", False, "Response is not a list", response)
            else:
                self.log_result("Get Status Checks", False, f"Failed to get status checks: {response.status_code}", response)
        except Exception as e:
            self.log_result("Get Status Checks", False, f"Exception: {str(e)}")
        
        return status_created

    def test_invalid_requests(self):
        """Test error handling for invalid requests"""
        # Test invalid login
        try:
            payload = {
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
            response = requests.post(f"{self.base_url}/auth/login", 
                                   json=payload, headers=HEADERS, timeout=10)
            
            if response.status_code == 401:
                self.log_result("Invalid Login Handling", True, "Correctly rejected invalid credentials")
            else:
                self.log_result("Invalid Login Handling", False, f"Should return 401, got {response.status_code}", response)
        except Exception as e:
            self.log_result("Invalid Login Handling", False, f"Exception: {str(e)}")

        # Test duplicate registration
        try:
            payload = {
                "email": self.test_user_email,
                "password": self.test_user_password,
                "full_name": self.test_user_name
            }
            response = requests.post(f"{self.base_url}/auth/register", 
                                   json=payload, headers=HEADERS, timeout=10)
            
            if response.status_code == 400:
                self.log_result("Duplicate Registration Handling", True, "Correctly rejected duplicate email")
                return True
            else:
                self.log_result("Duplicate Registration Handling", False, f"Should return 400, got {response.status_code}", response)
        except Exception as e:
            self.log_result("Duplicate Registration Handling", False, f"Exception: {str(e)}")
        
        return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("CALMI BACKEND API COMPREHENSIVE TESTING")
        print("=" * 60)
        print(f"Testing API at: {self.base_url}")
        print(f"Test started at: {datetime.now()}")
        print()

        # Basic endpoint tests
        print("🔍 TESTING BASIC ENDPOINTS")
        print("-" * 30)
        self.test_health_endpoint()
        self.test_root_endpoint()

        # Authentication flow tests
        print("🔐 TESTING AUTHENTICATION FLOW")
        print("-" * 30)
        self.test_user_registration()
        self.test_user_login()
        self.test_get_current_user()
        self.test_google_auth_url()
        self.test_unauthorized_access()

        # Chat functionality tests
        print("💬 TESTING CHAT FUNCTIONALITY")
        print("-" * 30)
        self.test_send_chat_message()
        self.test_get_conversations()
        self.test_get_conversation_history()

        # Status endpoints tests
        print("📊 TESTING STATUS ENDPOINTS")
        print("-" * 30)
        self.test_status_endpoints()

        # Error handling tests
        print("⚠️  TESTING ERROR HANDLING")
        print("-" * 30)
        self.test_invalid_requests()

        # Final results
        print("=" * 60)
        print("TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        print(f"📊 Total: {self.results['passed'] + self.results['failed']}")
        
        if self.results['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   • {error}")
        
        success_rate = (self.results['passed'] / (self.results['passed'] + self.results['failed'])) * 100
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 OVERALL STATUS: GOOD - Most functionality working")
        elif success_rate >= 60:
            print("⚠️  OVERALL STATUS: MODERATE - Some issues need attention")
        else:
            print("🚨 OVERALL STATUS: POOR - Significant issues found")
        
        print(f"\nTest completed at: {datetime.now()}")
        print("=" * 60)

        return success_rate >= 80

if __name__ == "__main__":
    tester = CalmiAPITester()
    tester.run_all_tests()