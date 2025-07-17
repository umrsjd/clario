#!/usr/bin/env python3
"""
Debug authentication issue
"""

import requests
import json
import uuid

BASE_URL = "https://e7d3af4d-0a50-408f-96b8-805e419349eb.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def debug_auth():
    # Create unique user
    test_email = f"debuguser_{uuid.uuid4().hex[:8]}@example.com"
    
    print("1. Registering user...")
    payload = {
        "email": test_email,
        "password": "TestPassword123!",
        "full_name": "Debug User"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload, headers=HEADERS)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        token = data["access_token"]
        print(f"   Token received: {token[:50]}...")
        
        # Test immediate auth
        auth_headers = HEADERS.copy()
        auth_headers["Authorization"] = f"Bearer {token}"
        
        print("\n2. Testing immediate /auth/me...")
        response = requests.get(f"{BASE_URL}/auth/me", headers=auth_headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
        print("\n3. Testing second /auth/me call...")
        response = requests.get(f"{BASE_URL}/auth/me", headers=auth_headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
        print("\n4. Testing chat endpoint...")
        chat_payload = {"message": "Hello"}
        response = requests.post(f"{BASE_URL}/chat/send", json=chat_payload, headers=auth_headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}")
        
    else:
        print(f"   Registration failed: {response.text}")

if __name__ == "__main__":
    debug_auth()