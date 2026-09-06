from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import shutil

from utils.text_predict import predict_text
from utils.image_predict import predict_image
from utils.combine import combine_predictions
from database import init_db, insert_complaint, get_all_complaints, get_complaints_by_sector, update_complaint_status, register_user, verify_login, update_user_password, get_complaints_by_user, check_is_admin, delete_complaint
from pydantic import BaseModel

app = FastAPI(title="CivicIssue Resolver API")

# Setup CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Mount the static folder to serve uploaded images directly to the frontend
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.on_event("startup")
def startup_event():
    init_db()

class AuthForm(BaseModel):
    email: str
    password: str

@app.post("/api/auth/register")
async def register(form: AuthForm):
    success = register_user(form.email, form.password)
    if not success:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
    return {"message": "Registration successful"}

@app.post("/api/auth/login")
async def login(form: AuthForm):
    user = verify_login(form.email, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"message": "Login successful", "user": user}

@app.post("/api/auth/reset")
async def reset_password(form: AuthForm):
    if check_is_admin(form.email):
        # Master/Sector Admins
        return {"message": "Reset request sent to master administrator at ramaraghavag@gmail.com"}
    else:
        # Standard Citizen direct reset
        success = update_user_password(form.email, form.password)
        if not success:
            raise HTTPException(status_code=404, detail="User account not found.")
        return {"message": "Password successfully updated."}

@app.post("/api/complaints")
async def submit_complaint(
    text: str = Form(...),
    location: str = Form("Unknown"),
    user_email: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        # Save image securely using async read to prevent ASGI upload stream deadlock
        image_path = os.path.join(UPLOAD_FOLDER, image.filename)
        img_data = await image.read()
        with open(image_path, "wb") as buffer:
            buffer.write(img_data)
        
        text_label, text_conf = predict_text(text)
        img_label, img_conf = predict_image(image_path)
        
        final_label = combine_predictions(text_label, text_conf, img_label, img_conf)
        
        # Save to DB
        result = insert_complaint(
            text=text,
            image_path=f"/{UPLOAD_FOLDER}/{image.filename}",
            location=location,
            assigned_sector=final_label,
            text_prediction=text_label,
            image_prediction=img_label,
            user_email=user_email
        )
        
        return {
            "message": "Complaint submitted successfully",
            "complaint": result,
            "predictions": {
                "final_prediction": final_label,
                "text_prediction": text_label,
                "image_prediction": img_label
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/complaints")
async def fetch_all_complaints():
    return get_all_complaints()

@app.get("/api/complaints/user/{email}")
async def fetch_user_complaints(email: str):
    return get_complaints_by_user(email)

@app.delete("/api/complaints/{id}")
async def remove_complaint(id: str):
    success = delete_complaint(id)
    if not success:
        raise HTTPException(status_code=404, detail="Complaint not found or already deleted.")
    return {"message": "Success"}

@app.get("/api/complaints/sector/{sector}")
async def fetch_sector_complaints(sector: str):
    return get_complaints_by_sector(sector)

class StatusUpdate(BaseModel):
    status: str

@app.patch("/api/complaints/{complaint_id}/status")
async def update_status(complaint_id: str, update: StatusUpdate):
    if update.status not in ["Pending", "Completed", "Fake"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    success = update_complaint_status(complaint_id, update.status)
    if not success:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    return {"message": f"Status updated to {update.status}"}

@app.post("/api/complaints/{complaint_id}/resolve")
async def resolve_complaint(complaint_id: str, proof_image: UploadFile = File(...)):
    try:
        # Save proof image securely
        proof_path = os.path.join(UPLOAD_FOLDER, f"proof_{proof_image.filename}")
        with open(proof_path, "wb") as buffer:
            shutil.copyfileobj(proof_image.file, buffer)
            
        success = update_complaint_status(complaint_id, "Completed", f"/{UPLOAD_FOLDER}/proof_{proof_image.filename}")
        if not success:
            raise HTTPException(status_code=404, detail="Complaint not found")
            
        return {"message": "Status updated to Completed with Proof."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)