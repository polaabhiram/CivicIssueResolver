import sqlite3
import uuid
import datetime
import hashlib

DB_PATH = "complaints.db"

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Complaints schema
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            text TEXT,
            image_path TEXT,
            location TEXT,
            assigned_sector TEXT,
            status TEXT,
            text_prediction TEXT,
            image_prediction TEXT,
            created_at TEXT,
            proof_image_path TEXT,
            user_email TEXT
        )
    """)
    # Attempt graceful additions
    try:
        cursor.execute("ALTER TABLE complaints ADD COLUMN proof_image_path TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE complaints ADD COLUMN user_email TEXT")
    except sqlite3.OperationalError:
        pass

    # Users schema
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            password_hash TEXT,
            role TEXT,
            managed_sector TEXT
        )
    """)
    
    conn.commit()

    # Seed Admin Acccounts
    seed_users = [
        ("admin@all", "admin@all", "superadmin", "all"),
        ("admin@roads", "roads", "sector_admin", "roads"),
        ("admin@water", "water", "sector_admin", "water"),
        ("admin@sanitation", "sanitation", "sector_admin", "sanitation"),
        ("admin@electricity", "electricity", "sector_admin", "electricity"),
        ("admin@drainage", "drainage", "sector_admin", "drainage"),
        ("admin@infrastructure", "infrastructure", "sector_admin", "infrastructure")
    ]
    
    for email, pw, role, sector in seed_users:
        cursor.execute("INSERT OR IGNORE INTO users (email, password_hash, role, managed_sector) VALUES (?, ?, ?, ?)", 
                      (email, hash_password(pw), role, sector))
    
    conn.commit()
    conn.close()

# User Auth Functions
def register_user(email, password):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (email, password_hash, role, managed_sector) VALUES (?, ?, ?, ?)",
                      (email, hash_password(password), "user", None))
        conn.commit()
        success = True
    except sqlite3.IntegrityError:
        success = False # Email exists
    conn.close()
    return success

def verify_login(email, password):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ? AND password_hash = ?", (email, hash_password(password)))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def update_user_password(email, new_password):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password_hash = ? WHERE email = ? AND role = 'user'", (hash_password(new_password), email))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def check_is_admin(email):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT role FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()
    return user and user[0] != "user"

# Complaint Functions
def insert_complaint(text, image_path, location, assigned_sector, text_prediction, image_prediction, user_email):
    complaint_id = "CMP-" + str(uuid.uuid4())[:8].upper()
    created_at = datetime.datetime.now().isoformat()
    status = "Pending"
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO complaints 
        (id, text, image_path, location, assigned_sector, status, text_prediction, image_prediction, created_at, user_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (complaint_id, text, image_path, location, assigned_sector, status, text_prediction, image_prediction, created_at, user_email))
    conn.commit()
    conn.close()
    return {
        "id": complaint_id,
        "status": status,
        "created_at": created_at
    }

def get_all_complaints():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_complaints_by_user(user_email):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE user_email = ? ORDER BY created_at DESC", (user_email,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_complaints_by_sector(sector):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE assigned_sector = ? ORDER BY created_at DESC", (sector,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_complaint_status(complaint_id, status, proof_image_path=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if proof_image_path:
        cursor.execute("UPDATE complaints SET status = ?, proof_image_path = ? WHERE id = ?", (status, proof_image_path, complaint_id))
    else:
        cursor.execute("UPDATE complaints SET status = ? WHERE id = ?", (status, complaint_id))
    conn.commit()
    changes = conn.total_changes
    conn.close()
    return changes > 0

def delete_complaint(complaint_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM complaints WHERE id = ?", (complaint_id,))
    conn.commit()
    changes = cursor.rowcount
    conn.close()
    return changes > 0
