from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash
import jwt
from datetime import datetime, timedelta, timezone
import shutil
import os

# ==========================================
# ۱. تنظیمات اولیه و امنیتی
# ==========================================
SECRET_KEY = "super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# ==========================================
# ۲. تنظیمات دیتابیس (SQLite)
# ==========================================
DATABASE_URL = "sqlite:///./platform.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==========================================
# ۳. مدل‌های دیتابیس (جداول)
# ==========================================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_supplier = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)

class Annotation(Base):
    __tablename__ = "annotations"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, index=True)
    user_email = Column(String, index=True)
    content = Column(String)
    created_at = Column(String)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    buyer_email = Column(String, index=True)
    product_id = Column(Integer, index=True)
    product_title = Column(String)
    price = Column(String)
    status = Column(String, default="در انتظار پرداخت")
    created_at = Column(String)

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

class SiteSetting(Base):
    __tablename__ = "site_settings"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, default="پلتفرم جامع ژنتیک")
    logo_url = Column(String, default="")
    about_us = Column(String, default="متن درباره ما...")
    contact_us = Column(String, default="متن ارتباط با ما...")

# ساخت جدول‌ها در دیتابیس
Base.metadata.create_all(bind=engine)

# ==========================================
# ۴. مدل‌های Pydantic (برای API)
# ==========================================
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    is_supplier: bool = False

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    is_supplier: bool
    is_admin: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class AnnotationCreate(BaseModel):
    product_id: str
    content: str

class AnnotationResponse(BaseModel):
    id: int
    product_id: str
    user_email: str
    content: str
    created_at: str

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    title: str
    species: str
    description: str
    price: str

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

class OrderCreate(BaseModel):
    product_id: int

class OrderResponse(BaseModel):
    id: int
    buyer_email: str
    product_id: int
    product_title: str
    price: str
    status: str
    created_at: str

    class Config:
        from_attributes = True

class SiteSettingResponse(BaseModel):
    company_name: str
    logo_url: str
    about_us: str
    contact_us: str

    class Config:
        from_attributes = True

# ==========================================
# ۵. ابزارهای امنیتی و اپلیکیشن
# ==========================================
password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="Auth Service", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ==========================================
# ۶. مسیرهای API (Auth)
# ==========================================
@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="این ایمیل قبلاً ثبت شده است")
    
    hashed_pw = password_hash.hash(user.password)
    new_user = User(
        email=user.email, 
        hashed_password=hashed_pw,
        is_supplier=user.is_supplier
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not password_hash.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="ایمیل یا رمز عبور اشتباه است",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "id": user.id, "is_supplier": user.is_supplier})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="توکن نامعتبر است")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="توکن منقضی شده است")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    return user

# ==========================================
# ۷. مسیرهای API (Annotations)
# ==========================================
@app.get("/annotations/{product_id}", response_model=list[AnnotationResponse])
def get_annotations(product_id: str, db: Session = Depends(get_db)):
    annotations = db.query(Annotation).filter(Annotation.product_id == product_id).order_by(Annotation.id.desc()).all()
    return annotations

@app.post("/annotations", response_model=AnnotationResponse)
def create_annotation(note: AnnotationCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    new_note = Annotation(
        product_id=note.product_id,
        user_email=user_email,
        content=note.content,
        created_at=datetime.now().strftime("%Y/%m/%d %H:%M")
    )
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

# ==========================================
# ۸. مسیرهای API (Products)
# ==========================================
@app.get("/products/my", response_model=list[ProductResponse])
def get_my_products(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        supplier_email = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    products = db.query(Product).filter(Product.supplier_email == supplier_email).all()
    return products

@app.post("/products", response_model=ProductResponse)
def create_product(
    title: str = Form(...),
    species: str = Form(...),
    description: str = Form(...),
    price: str = Form(...),
    coa_file: UploadFile = File(None),
    fasta_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload.get("sub")
        is_supplier = payload.get("is_supplier")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    if not is_supplier:
        raise HTTPException(status_code=403, detail="فقط فروشندگان می‌توانند محصول ثبت کنند")

    os.makedirs("uploads", exist_ok=True)
    coa_filename = None
    fasta_filename = None

    if coa_file:
        coa_filename = f"coa_{title}_{coa_file.filename}"
        with open(f"uploads/{coa_filename}", "wb") as buffer:
            shutil.copyfileobj(coa_file.file, buffer)

    if fasta_file:
        fasta_filename = f"fasta_{title}_{fasta_file.filename}"
        with open(f"uploads/{fasta_filename}", "wb") as buffer:
            shutil.copyfileobj(fasta_file.file, buffer)

    new_product = Product(
        title=title,
        species=species,
        description=description,
        price=price,
        supplier_email=user_email,
        coa_filename=coa_filename,
        fasta_filename=fasta_filename
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get("/products", response_model=list[ProductResponse])
def get_all_products(search: str = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if search:
        query = query.filter(
            (Product.title.contains(search)) | 
            (Product.species.contains(search)) |
            (Product.description.contains(search))
        )
    return query.all()

@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد")
    return product

@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        supplier_email = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد")
    
    if product.supplier_email != supplier_email:
        raise HTTPException(status_code=403, detail="شما اجازه حذف این محصول را ندارید")

    db.delete(product)
    db.commit()
    return {"message": "محصول با موفقیت حذف شد"}

# ==========================================
# ۹. مسیرهای API (Orders)
# ==========================================
@app.post("/orders", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        buyer_email = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    product = db.query(Product).filter(Product.id == order.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="محصول یافت نشد")

    new_order = Order(
        buyer_email=buyer_email,
        product_id=product.id,
        product_title=product.title,
        price=product.price,
        created_at=datetime.now().strftime("%Y/%m/%d %H:%M")
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/orders/me", response_model=list[OrderResponse])
def get_my_orders(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        buyer_email = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    orders = db.query(Order).filter(Order.buyer_email == buyer_email).order_by(Order.id.desc()).all()
    return orders

@app.get("/orders/supplier", response_model=list[OrderResponse])
def get_supplier_orders(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        supplier_email = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    my_products = db.query(Product).filter(Product.supplier_email == supplier_email).all()
    my_product_ids = [p.id for p in my_products]
    orders = db.query(Order).filter(Order.product_id.in_(my_product_ids)).order_by(Order.id.desc()).all()
    return orders

# ==========================================
# ۱۰. مسیرهای API (Settings)
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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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
        setting.logo_url = f"http://127.0.0.1:8000/uploads/{logo_filename}"

    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting
    
    # ==========================================
# ۱۲. APIهای مدیریتی (فقط برای ادمین)
# ==========================================
def check_admin(token: str, db: Session):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")
    
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="دسترسی غیرمجاز. فقط مدیر سامانه.")
    return user

@app.get("/admin/users", response_model=list[UserResponse])
def admin_get_users(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    check_admin(token, db)
    return db.query(User).all()

@app.get("/admin/products", response_model=list[ProductResponse])
def admin_get_products(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    check_admin(token, db)
    return db.query(Product).all()

@app.get("/admin/orders", response_model=list[OrderResponse])
def admin_get_orders(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    check_admin(token, db)
    return db.query(Order).all()

# ==========================================
# ۱۱. سرو کردن فایل‌های استاتیک و سلامت
# ==========================================
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "auth"}
    
    @app.post("/make-admin")
def make_admin(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="کاربر یافت نشد")
    user.is_admin = True
    db.commit()
    return {"message": f"کاربر {email} به مدیر ارتقا یافت"}