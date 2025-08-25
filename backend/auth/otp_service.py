import random
import resend
from datetime import datetime, timedelta
from fastapi import HTTPException, Request
from .models import OTPRequest, OTPVerifyRequest, Token
from .utils import get_user_by_email, create_access_token
from .config import from_email

async def send_otp_service(otp_request: OTPRequest, request: Request):
    pool = request.app.state.db_pool
    otp_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3) "
                "ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3",
                otp_request.email, otp_code, expires_at
            )
        resend.Emails.send({
            "from": from_email,
            "to": otp_request.email,
            "subject": "Your Clario OTP Code",
            "html": f"<p>Your OTP code is <strong>{otp_code}</strong>. It expires in 10 minutes.</p>"
        })
        return {"message": "OTP sent successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send OTP")

async def verify_otp_service(otp_request: OTPVerifyRequest, request: Request):
    pool = request.app.state.db_pool
    async with pool.acquire() as conn:
        result = await conn.fetchrow(
            "SELECT code, expires_at FROM otp_codes WHERE email = $1", otp_request.email
        )
        if not result or result['expires_at'] < datetime.utcnow() or result['code'] != otp_request.code:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        await conn.execute("DELETE FROM otp_codes WHERE email = $1", otp_request.email)
        
        user = await get_user_by_email(pool, otp_request.email)
        if not user:
            await conn.execute(
                "INSERT INTO users (email, full_name) VALUES ($1, $2)",
                otp_request.email, otp_request.email.split('@')[0]
            )
            
    access_token = create_access_token(data={"sub": otp_request.email})
    return {"access_token": access_token, "token_type": "bearer"}