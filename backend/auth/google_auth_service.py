import os
import httpx
from fastapi import HTTPException, Request
from .models import GoogleCallbackRequest, Token
from .utils import get_user_by_email, create_access_token
from .config import REDIRECT_URI

async def google_login_service(request: Request):
    try:
        if not os.getenv('GOOGLE_CLIENT_ID'):
            raise HTTPException(status_code=500, detail="Google Client ID not found in environment variables")

        # Manual Google OAuth URL construction (most reliable)
        client_id = os.getenv('GOOGLE_CLIENT_ID')
        scope = 'openid email profile'
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={client_id}&"
            f"redirect_uri={REDIRECT_URI}&"
            f"scope={scope.replace(' ', '%20')}&"
            f"response_type=code&"
            f"access_type=offline"
        )
        
        print(f"Generated Google OAuth URL: {auth_url}")
        return {"url": auth_url}

    except Exception as e:
        print(f"Error generating Google OAuth URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Google OAuth URL: {str(e)}")

async def google_callback_service(request: Request, body: GoogleCallbackRequest):
    try:
        pool = request.app.state.db_pool
        code = body.code
        if not code:
            print("Google OAuth error: Authorization code is missing")
            raise HTTPException(status_code=422, detail="Missing authorization code")

        print(f"Received authorization code: {code}")
        
        # Direct token exchange without using authlib session
        try:
            async with httpx.AsyncClient() as client:
                # Exchange authorization code for access token
                token_response = await client.post(
                    'https://oauth2.googleapis.com/token',
                    data={
                        'client_id': os.getenv('GOOGLE_CLIENT_ID'),
                        'client_secret': os.getenv('GOOGLE_CLIENT_SECRET'),
                        'code': code,
                        'grant_type': 'authorization_code',
                        'redirect_uri': REDIRECT_URI
                    },
                    headers={'Content-Type': 'application/x-www-form-urlencoded'}
                )
                
                if token_response.status_code != 200:
                    print(f"Token exchange failed: {token_response.text}")
                    raise HTTPException(status_code=422, detail="Failed to exchange code for token")

                token_data = token_response.json()
                access_token = token_data.get('access_token')
                
                if not access_token:
                    raise HTTPException(status_code=422, detail="No access token received from Google")

                # Get user info using the access token
                user_response = await client.get(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                
                if user_response.status_code != 200:
                    print(f"User info request failed: {user_response.text}")
                    raise HTTPException(status_code=422, detail="Failed to get user info from Google")

                user_info = user_response.json()
                print(f"Received user info: {user_info}")

        except httpx.HTTPError as http_err:
            print(f"HTTP error during Google OAuth: {str(http_err)}")
            raise HTTPException(status_code=422, detail="Failed to communicate with Google OAuth servers")
        except Exception as token_err:
            print(f"Unexpected error during token exchange: {str(token_err)}")
            raise HTTPException(status_code=422, detail=f"Token exchange failed: {str(token_err)}")

        # Extract user information
        email = user_info.get('email')
        full_name = user_info.get('name')
        google_id = user_info.get('sub') or user_info.get('id')
        
        if not email or not google_id:
            print(f"Google OAuth error: Invalid user info - email: {email}, google_id: {google_id}")
            raise HTTPException(status_code=400, detail="Invalid Google user info")

        # Check if user exists
        existing_user = await get_user_by_email(pool, email)
        if not existing_user:
            # Create new user
            print(f"Creating new user: {email}")
            async with pool.acquire() as conn:
                await conn.execute(
                    "INSERT INTO users (email, full_name) VALUES ($1, $2)",
                    email, full_name
                )
        else:
            # Update existing user with Google info if needed
            print(f"User already exists: {email}")
            async with pool.acquire() as conn:
                await conn.execute(
                    "UPDATE users SET full_name = COALESCE(full_name, $1) WHERE email = $2",
                    full_name, email
                )

        # Generate JWT token for the user
        access_token = create_access_token(data={"sub": email})
        print(f"Successfully authenticated user: {email}")
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in Google callback: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")