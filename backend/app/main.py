from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, tasks
from .database import Base, engine

# Creates tables on startup if they don't exist.
# For real projects, prefer Alembic migrations instead.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Manager API")

origins = [
    "http://localhost:3000"
]

app.include_router(auth.router)
app.include_router(tasks.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok"}