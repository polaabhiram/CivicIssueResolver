import requests
import time
import os
from PIL import Image

print("Starting FULL manual test...")
start = time.time()
try:
    # Create a real, valid image
    img = Image.new('RGB', (224, 224), color = 'red')
    img.save('real_dummy.png')
    
    with open("real_dummy.png", "rb") as f:
        data = {
            "text": "pothole on the road",
            "location": "17.3, 78.4",
            "user_email": "admin@roads"
        }
        files = {
            "image": ("real_dummy.png", f, "image/png")
        }
        
        print("Sending request...")
        response = requests.post("http://localhost:8000/api/complaints", data=data, files=files, timeout=300)
        
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error occurred: {e}")
finally:
    print(f"Total time elapsed: {time.time() - start:.2f} seconds")
    if os.path.exists("real_dummy.png"):
        os.remove("real_dummy.png")
