# test_resend.py
import resend
resend.api_key = "re_Lus9Cuzm_PKHaBGcwfKLr34UPvczQTjPJ"
try:
    response = resend.Emails.send({
        "from": "onboarding@resend.dev",  # Test email provided by Resend
        "to": ["umrsjd123@gmail.com"],  # Replace with your email
        "subject": "Test Email",
        "html": "<p>Test email from Resend</p>"
    })
    print("Resend API response:", response)
except Exception as e:
    print("Resend error:", str(e))