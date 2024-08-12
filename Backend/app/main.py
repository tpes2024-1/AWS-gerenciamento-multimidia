from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import auth, users, images, media
from .database import SessionLocal, engine, Base

Base.metadata.create_all(bind=engine)
app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(images.router)
app.include_router(media.router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000, reload=True)
