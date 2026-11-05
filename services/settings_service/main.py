from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
import jwt
import shutil
import os

# ==========================================
# تنظیمات اولیه
# ==========================================
SECRET_KEY = "super-secret-key-change-in-production"
ALGORITHM = "HS256"
DATABASE_URL = "sqlite:///./settings.db"

# ==========================================
# تنظیمات دیتابیس
# ==========================================
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# مدل دیتابیس
# ==========================================
class SiteSetting(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, default="پلتفرم جامع ژنتیک")
    logo_url = Column(String, default="")
    about_us = Column(String, default="متن درباره ما...")
    contact_us = Column(String, default="متن ارتباط با ما...")

Base.metadata.create_all(bind=engine)

# ==========================================
# مدل Pydantic
# ==========================================
class SiteSettingResponse(BaseModel):
    company_name: str
    logo_url: str
    about_us: str
    contact_us: str
    class Config:
        from_attributes = True

# ==========================================
# اپلیکیشن
# ==========================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
app = FastAPI(title="Settings Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# APIهای تنظیمات
# ==========================================
@app.get("/settings", response_model=SiteSettingResponse)
def get_settings(db: Session = Depends(get_db)):
    setting = db.query(SiteSetting).first()
    if not setting:
        setting = SiteSetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@app.put("/settings", response_model=SiteSettingResponse)
def update_settings(
    company_name: str = Form(...),
    about_us: str = Form(...),
    contact_us: str = Form(...),
    logo_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    try:
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    setting = db.query(SiteSetting).first()
    if not setting:
        setting = SiteSetting()

    setting.company_name = company_name
    setting.about_us = about_us
    setting.contact_us = contact_us

    if logo_file:
        os.makedirs("uploads", exist_ok=True)
        logo_filename = f"logo_{logo_file.filename}"
        with open(f"uploads/{logo_filename}", "wb") as buffer:
            shutil.copyfileobj(logo_file.file, buffer)
        setting.logo_url = f"http://127.0.0.1:8005/uploads/{logo_filename}"

    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting

# ==========================================
# سرو کردن فایل‌ها
# ==========================================
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")