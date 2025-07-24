#!/usr/bin/env python3
"""
Focused chat functionality test
"""

import requests
import json
import uuid

BASE_URL = "https://be4646ca-8dda-4649-93f6-a909b0b4589b.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

def test_chat_flow():
    # Create unique user
    test_email = f"chatuser_{uuid.uuid4().hex[:8]}@example.com"
    
    print("1. Registering user...")
    payload = {
        "email": test_email,
        "password": "TestPassword123!",
        "full_name": "Chat Test User"
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=payload, headers=HEADERS)
    print(f"   Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"   Registration failed: {response.text}")
        return
        
    data = response.json()
    token = data["access_token"]
    auth_headers = HEADERS.copy()
    auth_headers["Authorization"] = f"Bearer {token}"
    
    print("\n2. Testing /auth/me to verify token...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=auth_headers)
    print(f"   Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"   Auth verification failed: {response.text}")
        return
    
    print("\n3. Testing chat send...")
    chat_payload = {"message": "Hello, this is a test message"}
    response = requests.post(f"{BASE_URL}/chat/send", json=chat_payload, headers=auth_headers, timeout=30)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:300]}")
    
    if response.status_code == 200:
        chat_data = response.json()
        conversation_id = chat_data.get("conversation_id")
        
        print("\n4. Testing get conversations...")
        response = requests.get(f"{BASE_URL}/chat/conversations", headers=auth_headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:300]}")
        
        if conversation_id:
            print(f"\n5. Testing get conversation history for {conversation_id}...")
            response = requests.get(f"{BASE_URL}/chat/conversations/{conversation_id}", headers=auth_headers)
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text[:300]}")
    
    print("\n6. Testing unauthorized access (no token)...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=HEADERS)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.text[:200]}")

if __name__ == "__main__":
    test_chat_flow()