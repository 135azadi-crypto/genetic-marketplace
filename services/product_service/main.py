from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
import jwt, shutil, os
from datetime import datetime, timedelta, timezone

SECRET_KEY = "super-secret-key-change-in-production"
ALGORITHM = "HS256"
DATABASE_URL = "sqlite:///./product.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# مدل‌های دیتابیس
# ==========================================
class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    species = Column(String)
    description = Column(String)
    supplier_email = Column(String)
    price = Column(String)
    coa_filename = Column(String, nullable=True)
    fasta_filename = Column(String, nullable=True)

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String)
    user_email = Column(String)
    details = Column(String)
    created_at = Column(String)

Base.metadata.create_all(bind=engine)

# ==========================================
# مدل‌های Pydantic
# ==========================================
class ProductResponse(BaseModel):
    id: int
    title: str
    species: str
    description: str
    supplier_email: str
    price: str
    coa_filename: str | None = None
    fasta_filename: str | None = None
    class Config:
        from_attributes = True

class LogResponse(BaseModel):
    id: int
    action: str
    user_email: str
    details: str
    created_at: str
    class Config:
        from_attributes = True

# ==========================================
# ابزارهای امنیتی و اپلیکیشن
# ==========================================
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
app = FastAPI(title="Product Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ==========================================
# APIهای محصولات
# ==========================================
@app.get("/products", response_model=list[ProductResponse])
def get_all(search: str = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if search:
        query = query.filter((Product.title.contains(search)) | (Product.species.contains(search)))
    return query.all()

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_one(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p: raise HTTPException(status_code=404)
    return p

@app.post("/products", response_model=ProductResponse)
def create(title: str = Form(...), species: str = Form(...), description: str = Form(...), price: str = Form(...), coa_file: UploadFile = File(None), fasta_file: UploadFile = File(None), db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not payload.get("is_supplier"): raise HTTPException(status_code=403)
    except: raise HTTPException(status_code=401)
    
    os.makedirs("uploads", exist_ok=True)
    coa_fn, fasta_fn = None, None
    if coa_file:
        coa_fn = f"coa_{title}_{coa_file.filename}"
        with open(f"uploads/{coa_fn}", "wb") as b: shutil.copyfileobj(coa_file.file, b)
    if fasta_file:
        fasta_fn = f"fasta_{title}_{fasta_file.filename}"
        with open(f"uploads/{fasta_fn}", "wb") as b: shutil.copyfileobj(fasta_file.file, b)

    new_p = Product(title=title, species=species, description=description, price=price, supplier_email=email, coa_filename=coa_fn, fasta_filename=fasta_fn)
    db.add(new_p)
    db.commit()
    db.refresh(new_p)

    # ثبت لاگ برای این عملیات
    new_log = Log(action="افزودن محصول", user_email=email, details=f"محصول {title} با موفقیت ثبت شد.", created_at=datetime.now().strftime("%Y/%m/%d %H:%M"))
    db.add(new_log)
    db.commit()

    return new_p

# ==========================================
# APIهای ادمین
# ==========================================
def check_admin(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="دسترسی غیرمجاز. فقط مدیر سامانه.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

@app.get("/admin/products", response_model=list[ProductResponse])
def admin_get_products(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    check_admin(token)
    return db.query(Product).all()

@app.get("/admin/logs", response_model=list[LogResponse])
def admin_get_logs(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    check_admin(token)
    return db.query(Log).order_by(Log.id.desc()).all()

# ==========================================
# سرو کردن فایل‌ها
# ==========================================
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")