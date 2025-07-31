# test.py
import resend
import os
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv("RESEND_API_KEY")
try:
    response = resend.Emails.send({
        "from": "onboarding@resend.dev",
        "to": ["umrsjd123@gmail.com"],
        "subject": "Test Email",
        "html": "<p>Test email from Resend</p>"
    })
    print("Resend API response:", response)
except resend.exceptions.ResendError as e:
    error_message = getattr(e, 'message', str(e))
    print("Resend error details:", error_message)
except Exception as e:
    print("General error:", str(e))