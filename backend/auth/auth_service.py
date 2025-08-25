import json
from fastapi import HTTPException, Request, Depends
from .models import RegisterRequest, LoginRequest, Token
from .utils import get_user_by_email, create_access_token, get_current_user
from .config import pwd_context

async def register_service(reg_request: RegisterRequest, request: Request):
    pool = request.app.state.db_pool
    user = await get_user_by_email(pool, reg_request.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(reg_request.password)
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO users (email, password, full_name) VALUES ($1, $2, $3)",
            reg_request.email, hashed_password, reg_request.full_name
        )
    access_token = create_access_token(data={"sub": reg_request.email})
    return {"access_token": access_token, "token_type": "bearer"}

async def login_service(login_request: LoginRequest, request: Request):
    pool = request.app.state.db_pool
    user = await get_user_by_email(pool, login_request.email)
    if not user or not user.get('password') or not pwd_context.verify(login_request.password, user['password']):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": login_request.email})
    return {"access_token": access_token, "token_type": "bearer"}

async def get_me_service(request: Request, current_user: dict = Depends(get_current_user)):
    pool = request.app.state.db_pool
    try:
        async with pool.acquire() as conn:
            # Fetch user_profile from database
            user_profile_raw = await conn.fetchval(
                "SELECT user_profile FROM users WHERE email = $1", 
                current_user['email']
            )
            
            # Parse user_profile JSON
            user_profile = json.loads(user_profile_raw) if user_profile_raw else {}
            
            # Add user_profile to current_user data
            current_user['user_profile'] = user_profile
            
            return current_user
            
    except Exception as e:
        # Note: logger is not imported in original code, so keeping this as is
        # logger.error(f"Error fetching user profile in /auth/me: {e}", exc_info=True)
        # Return current_user without user_profile if there's an error
        current_user['user_profile'] = {}
        return current_user