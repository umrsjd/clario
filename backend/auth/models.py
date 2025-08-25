from pydantic import BaseModel

# --- Pydantic Models ---
class User(BaseModel):
    email: str
    password: str | None = None
    full_name: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class OTPRequest(BaseModel):
    email: str

class OTPVerifyRequest(BaseModel):
    email: str
    code: str
    
class GoogleCallbackRequest(BaseModel):
    code: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str

class LoginRequest(BaseModel):
    email: str
    password: str