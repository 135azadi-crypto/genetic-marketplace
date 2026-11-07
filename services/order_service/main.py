from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "super-secret-key-change-in-production"
ALGORITHM = "HS256"
DATABASE_URL = "sqlite:///./order.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    buyer_email = Column(String)
    product_id = Column(Integer)
    product_title = Column(String)
    price = Column(String)
    status = Column(String, default="در انتظار پرداخت")
    created_at = Column(String)

Base.metadata.create_all(bind=engine)

class OrderCreate(BaseModel):
    product_id: int
    product_title: str
    price: str

class OrderResponse(BaseModel):
    id: int
    buyer_email: str
    product_title: str
    price: str
    status: str
    created_at: str
    class Config:
        from_attributes = True

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
app = FastAPI(title="Order Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # ← این خط باید False باشد
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/orders", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except: raise HTTPException(status_code=401)
    
    new_o = Order(buyer_email=email, product_id=order.product_id, product_title=order.product_title, price=order.price, created_at=datetime.now().strftime("%Y/%m/%d %H:%M"))
    db.add(new_o)
    db.commit()
    db.refresh(new_o)
    return new_o

@app.get("/orders/me", response_model=list[OrderResponse])
def my_orders(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try: email = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]).get("sub")
    except: raise HTTPException(status_code=401)
    return db.query(Order).filter(Order.buyer_email == email).all()
    
    # ==========================================
# API مدیریت سفارشات (فقط برای ادمین)
# ==========================================
def check_admin(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("is_admin"):
            raise HTTPException(status_code=403, detail="دسترسی غیرمجاز. فقط مدیر سامانه.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

@app.get("/admin/orders", response_model=list[OrderResponse])
def admin_get_orders(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    check_admin(token)
    return db.query(Order).all()
    
    from pydantic import BaseModel

class OrderStatusUpdate(BaseModel):
    status: str

@app.put("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_update: OrderStatusUpdate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        supplier_email = payload.get("sub")
        if not payload.get("is_supplier"):
            raise HTTPException(status_code=403, detail="فقط فروشندگان می‌توانند وضعیت را تغییر دهند")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توکن نامعتبر است")

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="سفارش یافت نشد")

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order
