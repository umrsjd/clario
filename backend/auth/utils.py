import json
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status, Request, Depends
from .config import JWT_SECRET_KEY, ALGORITHM, oauth2_scheme

# --- Helper Functions ---
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=10080)  # ACCESS_TOKEN_EXPIRE_MINUTES
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)

async def get_user_by_email(pool, email: str):
    async with pool.acquire() as conn:
        user = await conn.fetchrow(
            "SELECT email, full_name, user_mcq_answers, user_profile, password FROM users WHERE email = $1",
            email
        )
        return dict(user) if user else None

# --- Main Authentication Logic ---
async def get_current_user(request: Request, token: str = Depends(oauth2_scheme)):
    pool = request.app.state.db_pool
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_email(pool, email)
    if user is None:
        raise credentials_exception
    return user