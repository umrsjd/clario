from fastapi import APIRouter, Depends, Request
from .models import (
    Token, OTPRequest, OTPVerifyRequest, GoogleCallbackRequest,
    RegisterRequest, LoginRequest
)
from .otp_service import send_otp_service, verify_otp_service
from .auth_service import register_service, login_service, get_me_service
from .google_auth_service import google_login_service, google_callback_service
from .utils import get_current_user

# --- Setup ---
router = APIRouter(tags=["authentication"])

# --- API Endpoints ---
@router.post("/auth/send-otp")
async def send_otp(otp_request: OTPRequest, request: Request):
    return await send_otp_service(otp_request, request)

@router.post("/auth/verify-otp", response_model=Token)
async def verify_otp(otp_request: OTPVerifyRequest, request: Request):
    return await verify_otp_service(otp_request, request)

@router.post("/auth/register", response_model=Token)
async def register(reg_request: RegisterRequest, request: Request):
    return await register_service(reg_request, request)

@router.post("/auth/login", response_model=Token)
async def login(login_request: LoginRequest, request: Request):
    return await login_service(login_request, request)
    
@router.get("/auth/me")
async def get_me(request: Request, current_user: dict = Depends(get_current_user)):
    return await get_me_service(request, current_user)

@router.get("/auth/google/url")
async def google_login(request: Request):
    return await google_login_service(request)

@router.post("/auth/google", response_model=Token)
async def google_callback(request: Request, body: GoogleCallbackRequest):
    return await google_callback_service(request, body)