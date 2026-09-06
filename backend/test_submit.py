import requests
import time
import os

print("Starting manual test to localhost:8000/api/complaints...")
start = time.time()
try:
    # Create a dummy image
    with open("dummy.png", "wb") as f:
        f.write(b"fake image data")
        
    with open("dummy.png", "rb") as f:
        data = {
            "text": "testing the pipeline",
            "location": "17.3, 78.4",
            "user_email": "test@admin.com"
        }
        files = {
            "image": ("dummy.png", f, "image/png")
        }
        
        response = requests.post("http://localhost:8000/api/complaints", data=data, files=files, timeout=120)
        
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error occurred: {e}")
finally:
    print(f"Total time elapsed: {time.time() - start:.2f} seconds")
    if os.path.exists("dummy.png"):
        os.remove("dummy.png")
