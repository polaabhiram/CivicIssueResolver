# CivicIssue Resolver

An AI-assisted platform where citizens report civic problems (potholes, water leaks, garbage, drainage, electricity faults) with a **photo, a text description and a map location**. Two machine-learning models read the report, decide which municipal department it belongs to, and route it to that department's dashboard. Department staff resolve the ticket by uploading **proof-of-work photos**, and citizens track progress in real time.

---

## Features

**Citizens**
- Register / log in / reset password
- Report an issue with text, a photo and a map pin (browser geolocation or click on the map)
- "My Complaints" dashboard showing predicted department, status, issue photo and proof-of-work photo

**Department (sector) admins**
- Dashboard limited to their own department (roads, water, sanitation, electricity, drainage, infrastructure)
- Mark a complaint **Resolved** (requires uploading a proof photo) or **Fake**
- Delete closed tickets

**Super admin**
- Global overview: totals for Pending / Completed / Fake, plus what each AI engine predicted per complaint

**AI routing**
- Text model: fine-tuned **DistilBERT** classifier
- Image model: fine-tuned **ResNet-18** classifier
- A rule-based combiner picks the final department

---

## Architecture

```
┌────────────────────────┐        HTTP / JSON + multipart        ┌─────────────────────────────┐
│  React 19 + Vite SPA   │ ───────────────────────────────────▶ │   FastAPI (Python 3.13)     │
│  React Router, Leaflet │ ◀─────────────────────────────────── │   uvicorn on :8000          │
│  (http://localhost:5173)│                                      │                             │
└────────────────────────┘                                       │  ┌───────────────────────┐  │
                                                                 │  │ utils/text_predict.py │  │  DistilBERT (HF)
                                                                 │  │ utils/image_predict.py│  │  ResNet-18 (PyTorch)
                                                                 │  │ utils/combine.py      │  │
                                                                 │  └───────────────────────┘  │
                                                                 │  database.py ──▶ SQLite     │
                                                                 │  /uploads  (static images)  │
                                                                 └─────────────────────────────┘
```

### Complaint flow
1. Citizen submits the form → `POST /api/complaints` (multipart: `text`, `image`, `location`, `user_email`).
2. Backend saves the image to `uploads/`.
3. `predict_text()` → (label, confidence); `predict_image()` → (label, confidence).
4. `combine_predictions()` picks the final department.
5. Row inserted into SQLite with status `Pending`.
6. The department admin sees it under `GET /api/complaints/sector/{sector}`.
7. Admin uploads a proof photo → `POST /api/complaints/{id}/resolve` → status `Completed`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router 7, Leaflet / react-leaflet, plain CSS |
| Backend | FastAPI, Uvicorn, Pydantic |
| Database | SQLite (via Python `sqlite3`) |
| Text model | DistilBERT (`distilbert-base-uncased`) fine-tuned, Hugging Face Transformers |
| Image model | ResNet-18 (torchvision), fine-tuned, 4 classes |
| Label handling | scikit-learn `LabelEncoder` (pickled) |
| Maps | OpenStreetMap tiles |

---

## Project structure

```
Civic_Issues/
├── backend/
│   ├── main.py                 # FastAPI app and all routes
│   ├── database.py             # SQLite schema + data-access functions
│   ├── utils/
│   │   ├── text_predict.py     # DistilBERT inference
│   │   ├── image_predict.py    # ResNet-18 inference
│   │   └── combine.py          # merges the two predictions
│   ├── models/
│   │   ├── text_model/         # config.json, model.safetensors, tokenizer files
│   │   ├── complaint_model.pth # ResNet-18 checkpoint (state dict + class list)
│   │   └── label_encoder.pkl   # maps DistilBERT output index → department name
│   ├── uploads/                # user and proof images (served at /uploads)
│   ├── complaints.db           # SQLite database (created on first run)
│   ├── test_submit.py          # manual API smoke test (invalid image)
│   └── test_submit2.py         # manual API smoke test (valid image)
└── frontend/
    └── src/
        ├── App.jsx             # routes
        ├── pages/              # Login, Home (report), UserDashboard, AdminDashboard, SectorDashboard
        └── components/         # layouts, ProtectedRoute, Sidebar, ImageModal
```

---

## Getting started

### Prerequisites
- Python 3.13, Node.js 20+
- Internet on first run (the tokenizer `distilbert-base-uncased` is downloaded from Hugging Face)
- The model files in `backend/models/` (they are large: ~268 MB and ~45 MB; use Git LFS if you store them in Git)

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install "fastapi[standard]" torch torchvision transformers scikit-learn pillow requests
python main.py                       # or: uvicorn main:app --reload --port 8000
```
API docs (auto-generated): http://localhost:8000/docs

> `pyproject.toml` currently lists only FastAPI. The extra packages above are required by the AI code.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
```
The frontend calls `http://localhost:8000` (hard-coded), so start the backend first.

### Seeded accounts (created on first start)

| Email | Password | Role | Sector |
|---|---|---|---|
| admin@all | admin@all | superadmin | all |
| admin@roads | roads | sector_admin | roads |
| admin@water | water | sector_admin | water |
| admin@sanitation | sanitation | sector_admin | sanitation |
| admin@electricity | electricity | sector_admin | electricity |
| admin@drainage | drainage | sector_admin | drainage |
| admin@infrastructure | infrastructure | sector_admin | infrastructure |

Citizens register themselves from the login page. **Change these demo credentials before any real deployment.**

---

## API reference

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | `{email, password}` | Create citizen account |
| POST | `/api/auth/login` | `{email, password}` | Returns user (email, role, managed_sector) |
| POST | `/api/auth/reset` | `{email, password}` | Citizen: set new password. Admin: sends reset request message |
| POST | `/api/complaints` | multipart: `text`, `location`, `user_email`, `image` | Submit + classify complaint |
| GET | `/api/complaints` | – | All complaints (super admin view) |
| GET | `/api/complaints/user/{email}` | – | A citizen's complaints |
| GET | `/api/complaints/sector/{sector}` | – | Complaints assigned to a department |
| PATCH | `/api/complaints/{id}/status` | `{status}` (`Pending`/`Completed`/`Fake`) | Change status |
| POST | `/api/complaints/{id}/resolve` | multipart: `proof_image` | Mark Completed with proof photo |
| DELETE | `/api/complaints/{id}` | – | Delete a complaint |
| GET | `/uploads/{file}` | – | Static image serving |

### Database schema

```sql
users(email PK, password_hash, role, managed_sector)
complaints(id PK, text, image_path, location, assigned_sector, status,
           text_prediction, image_prediction, created_at,
           proof_image_path, user_email)
```
Roles: `user`, `sector_admin`, `superadmin`. Complaint IDs look like `CMP-1A2B3C4D`.

---

## Testing

The repo contains two **manual smoke tests** (they need the server running):

```bash
cd backend
python main.py &                 # terminal 1
python test_submit2.py           # terminal 2: submits a valid 224x224 image + "pothole on the road"
```
A successful run prints status `200` and a JSON body with `final_prediction`, `text_prediction`, `image_prediction`.

You can also test interactively with Swagger UI at `/docs`, or with curl:

```bash
curl -X POST http://localhost:8000/api/complaints \
  -F "text=Large pothole near the bus stop" \
  -F "location=17.385, 78.486" \
  -F "user_email=test@mail.com" \
  -F "image=@./uploads/pothole.jfif"
```

---

## Known limitations / roadmap

- **No real authentication on API routes.** Roles are stored in browser `localStorage`; the API trusts any caller. Add JWT/session auth and role checks on every route.
- **Passwords are hashed with unsalted SHA-256.** Use bcrypt/argon2.
- **Password reset has no verification** for citizen accounts.
- **Label mismatch:** the text model outputs `road` while the image model and the admin accounts use `roads`; the text model also has a stray `label` class. Align class names and retrain/clean the label encoder.
- The image model knows only 4 classes (drainage, electricity, roads, water), so `sanitation` and `infrastructure` come only from the text model.
- Uploaded filenames are used as-is (collisions and path-traversal risk). Use generated UUID filenames and validate file type/size.
- Add automated tests (pytest + FastAPI `TestClient`), Dockerfile, `.env` based config for API URL and CORS origins.
- Inference runs synchronously inside an `async` endpoint; move it to a thread pool or worker queue.
- Several unused files from an earlier prototype remain in `frontend/src` (`Navbar`, `ComplainForm`, `ComplaintTable`, `CitizenPage`, `GlobalDashboard`).

---
