from fastapi import FastAPI
from .routes import auth, users
from .database import SessionLocal, engine, Base

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.include_router(auth.router)
app.include_router(users.router)

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
