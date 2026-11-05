from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
import jwt
from datetime import datetime

SECRET_KEY = "super-secret-key-change-in-production"
ALGORITHM = "HS256"
DATABASE_URL = "sqlite:///./annotation.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Annotation(Base):
    __tablename__ = "annotations"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, index=True)
    user_email = Column(String, index=True)
    content = Column(String)
    created_at = Column(String)

Base.metadata.create_all(bind=engine)

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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
app = FastAPI(title="Annotation Service", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/annotations/{product_id}", response_model=list[AnnotationResponse])
def get_annotations(product_id: str, db: Session = Depends(get_db)):
    return db.query(Annotation).filter(Annotation.product_id == product_id).order_by(Annotation.id.desc()).all()

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